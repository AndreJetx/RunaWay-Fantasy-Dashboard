import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { getDbUser } from "@/lib/user-helper";
import { getXPForLevel, shouldEnableLevelUp } from "@/lib/xp-helper";

const jsonSchema = z.record(z.string(), z.any()).or(z.array(z.any()));

const createCharacterSchema = z.object({
  campaignId: z.string().uuid().nullable().optional(), // Allow null for standalone characters
  playerId: z.string().uuid(),
  system: z.string().optional(),
  name: z.string().min(1),
  race: z.string().optional(),
  characterClass: z.string().min(1),
  subclass: z.string().optional(),
  pact: z.string().optional().transform(val => val === "" ? undefined : val),
  dragonType: z.string().optional().transform(val => val === "" ? undefined : val),
  fightingStyle: z.string().optional().transform(val => val === "" ? undefined : val),
  level: z.coerce.number().int().min(1).max(20).optional(),
  experiencePoints: z.coerce.number().int().min(0).optional(),
  background: z.string().optional(),
  alignment: z.string().optional(),
  image: z.union([z.string().url(), z.string().length(0), z.undefined()]).optional(),
  armorClass: z.coerce.number().int().min(0).optional(),
  initiative: z.coerce.number().int().optional(),
  speed: z.coerce.number().int().min(0).optional(),
  currentHp: z.coerce.number().int().min(0).optional(),
  maxHp: z.coerce.number().int().min(0).optional(),
  tempHp: z.coerce.number().int().min(0).optional(),
  hitDice: z.string().optional(),
  attributes: jsonSchema.optional(),
  savingThrows: jsonSchema.optional(),
  skills: jsonSchema.optional(),
  proficiencyBonus: z.coerce.number().int().optional(),
  proficiencies: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  equipment: jsonSchema.optional(),
  currency: jsonSchema.optional(),
  inventory: z.array(z.any()).optional(),
  features: jsonSchema.optional(),
  spellcasting: jsonSchema.optional(),
  mana: z.coerce.number().int().min(0).optional(),
  maxMana: z.coerce.number().int().min(0).optional(),
  divindade: z.string().optional(),
  origem: z.string().optional(),
  poderes: jsonSchema.optional(),
  personalityTraits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  backstory: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar role do usuário otimizado
    const dbUser = await getDbUser(user.id, user.email);
    const isDM = dbUser?.role === "dm" || dbUser?.role === "admin";

    // Buscar personagens - apenas campos necessários
    if (!isDM) {
      // Use dbUserId if available, otherwise use Supabase user.id
      const playerIdToSearch = dbUser?.id || user.id;

      console.log("🔍 GET /api/characters - Player request:", {
        userId: user.id,
        email: user.email,
        dbUserId: dbUser?.id,
        searchingWith: playerIdToSearch
      });

      const characters = await db
        .select({
          id: schema.characters.id,
          name: schema.characters.name,
          race: schema.characters.race,
          characterClass: schema.characters.characterClass,
          level: schema.characters.level,
          currentHp: schema.characters.currentHp,
          maxHp: schema.characters.maxHp,
          armorClass: schema.characters.armorClass,
          alignment: schema.characters.alignment,
          image: schema.characters.image,
          attributes: schema.characters.attributes,
          campaignId: schema.characters.campaignId,
          playerId: schema.characters.playerId,
        })
        .from(schema.characters)
        .where(eq(schema.characters.playerId, playerIdToSearch))
        .limit(50);

      console.log("📦 Characters found:", characters.length, characters.map(c => ({
        id: c.id,
        name: c.name,
        campaignId: c.campaignId,
        playerId: c.playerId
      })));

      return NextResponse.json({ characters });
    }

    // Se for DM, mostrar todos os personagens
    const characters = await db
      .select({
        id: schema.characters.id,
        name: schema.characters.name,
        race: schema.characters.race,
        characterClass: schema.characters.characterClass,
        level: schema.characters.level,
        currentHp: schema.characters.currentHp,
        maxHp: schema.characters.maxHp,
        armorClass: schema.characters.armorClass,
        alignment: schema.characters.alignment,
        image: schema.characters.image,
        attributes: schema.characters.attributes,
        campaignId: schema.characters.campaignId,
        playerId: schema.characters.playerId,
      })
      .from(schema.characters)
      .limit(50);

    return NextResponse.json({ characters });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createCharacterSchema.parse(payload);

    // Get DB user
    const dbUser = await getDbUser(user.id, user.email);
    const finalPlayerId = dbUser?.id || user.id;

    // If campaignId is provided, validate campaign and membership
    let campaign = null;
    let isDM = false;

    if (parsed.campaignId) {
      const [campaignResult] = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, parsed.campaignId))
        .limit(1);

      campaign = campaignResult;
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      // Verificar acesso à campanha
      const [memberBySupabaseId, memberByDbId] = await Promise.all([
        db
          .select()
          .from(schema.campaignMembers)
          .where(
            and(
              eq(schema.campaignMembers.campaignId, parsed.campaignId),
              eq(schema.campaignMembers.userId, user.id)
            )
          )
          .limit(1),
        dbUser && dbUser.id !== user.id
          ? db
            .select()
            .from(schema.campaignMembers)
            .where(
              and(
                eq(schema.campaignMembers.campaignId, parsed.campaignId),
                eq(schema.campaignMembers.userId, dbUser.id)
              )
            )
            .limit(1)
          : Promise.resolve([]),
      ]);

      isDM = !!(campaign.dmId === user.id || (dbUser && campaign.dmId === dbUser.id));
      const member = memberBySupabaseId[0] || (memberByDbId.length > 0 ? memberByDbId[0] : null);

      if (!isDM && !member) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Verificar se o playerId corresponde ao usuário autenticado
    if (parsed.playerId !== user.id && parsed.playerId !== finalPlayerId) {
      return NextResponse.json({ error: "Player ID must match authenticated user" }, { status: 403 });
    }

    // Only check for existing characters if campaignId is provided
    if (parsed.campaignId) {
      const [existingCharactersBySupabaseId, existingCharactersByDbId] = await Promise.all([
        db
          .select()
          .from(schema.characters)
          .where(
            and(
              eq(schema.characters.campaignId, parsed.campaignId),
              eq(schema.characters.playerId, user.id)
            )
          )
          .limit(10),
        finalPlayerId !== user.id
          ? db
            .select()
            .from(schema.characters)
            .where(
              and(
                eq(schema.characters.campaignId, parsed.campaignId),
                eq(schema.characters.playerId, finalPlayerId)
              )
            )
            .limit(10)
          : Promise.resolve([]),
      ]);

      const allExistingCharacters = [...existingCharactersBySupabaseId, ...existingCharactersByDbId];
      const existingCharacters = Array.from(
        new Map(allExistingCharacters.map((c) => [c.id, c])).values()
      );

      // Se for jogador, só pode ter um personagem vivo por campanha
      if (!isDM && existingCharacters.length > 0) {
        const aliveCharacters = existingCharacters.filter(
          (char) => (char.currentHp ?? 0) > 0
        );

        if (aliveCharacters.length > 0) {
          return NextResponse.json(
            {
              error: "Você já possui um personagem vivo nesta campanha.",
              existingCharacter: {
                id: aliveCharacters[0].id,
                name: aliveCharacters[0].name,
                currentHp: aliveCharacters[0].currentHp,
              }
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate XP and needsLevelUp for starting level
    // Always create characters at level 1, but with XP for their target level
    // This forces gradual level-ups (1→2, 2→3, etc.)
    const targetLevel = parsed.level ?? 1;
    const calculatedXP = getXPForLevel(targetLevel);
    const startingLevel = 1; // Always start at level 1
    const needsLevelUp = targetLevel > 1; // Enable level-up if target > 1

    // Debug: log values before insert
    console.log("🔍 Backend DEBUG - Character creation:", {
      targetLevel,
      startingLevel,
      calculatedXP,
      needsLevelUp,
      campaignId: parsed.campaignId,
      finalCampaignId: parsed.campaignId || null
    });

    const [character] = await db
      .insert(schema.characters)
      .values({
        campaignId: parsed.campaignId || null, // null for standalone characters
        playerId: finalPlayerId,
        system: parsed.system ?? "dnd5e",
        name: parsed.name,
        race: parsed.race,
        characterClass: parsed.characterClass,
        subclass: parsed.subclass,
        pact: parsed.pact,
        dragonType: parsed.dragonType,
        fightingStyle: parsed.fightingStyle,
        level: startingLevel,
        experiencePoints: calculatedXP, // Auto-assign XP based on level
        needsLevelUp: needsLevelUp || false, // Enable level-up for characters starting above level 1
        background: parsed.background,
        alignment: parsed.alignment,
        image: parsed.image,
        armorClass: parsed.armorClass ?? 10,
        initiative: parsed.initiative ?? 0,
        speed: parsed.speed ?? 30,
        currentHp: parsed.currentHp ?? 10,
        maxHp: parsed.maxHp ?? 10,
        tempHp: parsed.tempHp ?? 0,
        hitDice: parsed.hitDice,
        attributes: parsed.attributes,
        savingThrows: parsed.savingThrows,
        skills: parsed.skills,
        proficiencyBonus: parsed.proficiencyBonus ?? 2,
        proficiencies: parsed.proficiencies,
        languages: parsed.languages,
        equipment: parsed.equipment,
        currency: parsed.currency,
        inventory: parsed.inventory || [],
        features: parsed.features,
        spellcasting: parsed.spellcasting,
        mana: parsed.mana ?? 0,
        maxMana: parsed.maxMana ?? 0,
        divindade: parsed.divindade,
        origem: parsed.origem,
        poderes: parsed.poderes,
        personalityTraits: parsed.personalityTraits,
        ideals: parsed.ideals,
        bonds: parsed.bonds,
        flaws: parsed.flaws,
        backstory: parsed.backstory,
        notes: parsed.notes,
      })
      .returning();

    // Processar todos os itens do inventário e criar na tabela items
    if (parsed.inventory && parsed.inventory.length > 0) {
      const { processInventoryToItems } = await import("@/lib/inventory-helper");
      await processInventoryToItems(
        character.id,
        parsed.campaignId || null, // Use null instead of empty string for standalone characters
        finalPlayerId,
        parsed.inventory,
        parsed.attributes
      );

      // Recarregar personagem para pegar CA atualizado
      const [updatedCharacter] = await db
        .select()
        .from(schema.characters)
        .where(eq(schema.characters.id, character.id))
        .limit(1);

      return NextResponse.json(updatedCharacter || character, { status: 201 });
    }

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", message: "Validation failed", issues: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

