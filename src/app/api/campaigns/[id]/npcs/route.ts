import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";
import { z } from "zod";

// Schema para criar NPC a partir dos dados JSON
const createNpcSchema = z.object({
  name: z.string().min(1),
  challengeRating: z.string().optional(),
  type: z.string().optional(),
  size: z.string().optional(),
  alignment: z.string().optional(),
  armorClass: z.coerce.number().int().optional(),
  maxHp: z.coerce.number().int().optional(),
  currentHp: z.coerce.number().int().optional(),
  speed: z.coerce.number().int().optional(),
  hitDice: z.string().optional(),
  abilities: z.record(z.number()).optional(),
  savingThrows: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  damageVulnerabilities: z.array(z.string()).optional(),
  damageResistances: z.array(z.string()).optional(),
  damageImmunities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: z.string().optional(),
  languages: z.string().optional(),
  actions: z.array(z.any()).optional(),
  specialTraits: z.array(z.any()).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  chapterId: z.string().uuid().optional().nullable(),
  isHostile: z.boolean().optional(),
});

// GET - Listar NPCs da campanha
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = params.id;

    // Buscar usuário e campanha em paralelo
    const [dbUser, campaignResult] = await Promise.all([
      getDbUser(user.id, user.email),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
    ]);

    const [campaign] = campaignResult;
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar acesso (DM ou membro)
    const userIdToCheck = dbUser?.id || user.id;
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);

    if (!userIsDM) {
      // Verificar se é membro
      const member = await db
        .select()
        .from(schema.campaignMembers)
        .where(
          and(
            eq(schema.campaignMembers.campaignId, campaignId),
            eq(schema.campaignMembers.userId, userIdToCheck)
          )
        )
        .limit(1);

      if (member.length === 0) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Buscar NPCs - DM vê tudo, jogador só nome e tipo básico
    const npcs = await db
      .select({
        id: schema.campaignNpcs.id,
        name: schema.campaignNpcs.name,
        type: schema.campaignNpcs.type,
        challengeRating: schema.campaignNpcs.challengeRating,
        alignment: schema.campaignNpcs.alignment,
        image: schema.campaignNpcs.image,
        isHostile: schema.campaignNpcs.isHostile,
        // Campos completos apenas para DM
        ...(userIsDM && {
          race: schema.campaignNpcs.race,
          characterClass: schema.campaignNpcs.characterClass,
          level: schema.campaignNpcs.level,
          armorClass: schema.campaignNpcs.armorClass,
          initiative: schema.campaignNpcs.initiative,
          speed: schema.campaignNpcs.speed,
          currentHp: schema.campaignNpcs.currentHp,
          maxHp: schema.campaignNpcs.maxHp,
          tempHp: schema.campaignNpcs.tempHp,
          hitDice: schema.campaignNpcs.hitDice,
          attributes: schema.campaignNpcs.attributes,
          savingThrows: schema.campaignNpcs.savingThrows,
          skills: schema.campaignNpcs.skills,
          proficiencyBonus: schema.campaignNpcs.proficiencyBonus,
          attacks: schema.campaignNpcs.attacks,
          abilities: schema.campaignNpcs.abilities,
          resistances: schema.campaignNpcs.resistances,
          immunities: schema.campaignNpcs.immunities,
          vulnerabilities: schema.campaignNpcs.vulnerabilities,
          description: schema.campaignNpcs.description,
          backstory: schema.campaignNpcs.backstory,
          notes: schema.campaignNpcs.notes,
          chapterId: schema.campaignNpcs.chapterId,
          createdAt: schema.campaignNpcs.createdAt,
          updatedAt: schema.campaignNpcs.updatedAt,
        }),
      })
      .from(schema.campaignNpcs)
      .where(eq(schema.campaignNpcs.campaignId, campaignId));

    return NextResponse.json({
      npcs,
      isDM: userIsDM,
    });
  } catch (error) {
    console.error("Error fetching NPCs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Criar novo NPC (apenas DM)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignId = params.id;
    const payload = await request.json();
    const parsed = createNpcSchema.parse(payload);

    // Buscar campanha e usuário
    const [dbUser, campaignResult] = await Promise.all([
      getDbUser(user.id, user.email),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
    ]);

    const [campaign] = campaignResult;
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é DM
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);
    if (!userIsDM) {
      return NextResponse.json({ error: "Only DM can create NPCs" }, { status: 403 });
    }

    // Converter dados JSON para o formato do schema
    // Se parsed.abilities já estiver no formato correto (objeto), usar diretamente
    // Se for do formato JSON (str, dex, etc), converter
    let attributesObj = {};
    if (parsed.abilities) {
      if (parsed.abilities.str !== undefined) {
        // Formato JSON de monstro
        attributesObj = {
          strength: parsed.abilities.str || 10,
          dexterity: parsed.abilities.dex || 10,
          constitution: parsed.abilities.con || 10,
          intelligence: parsed.abilities.int || 10,
          wisdom: parsed.abilities.wis || 10,
          charisma: parsed.abilities.cha || 10,
        };
      } else {
        // Já está no formato correto
        attributesObj = parsed.abilities;
      }
    }

    const npcData = {
      campaignId,
      name: parsed.name,
      challengeRating: parsed.challengeRating || null,
      type: parsed.type || null,
      alignment: parsed.alignment || null,
      armorClass: parsed.armorClass || 10,
      maxHp: parsed.maxHp || parsed.currentHp || 10,
      currentHp: parsed.currentHp || parsed.maxHp || 10,
      speed: parsed.speed || 30,
      hitDice: parsed.hitDice || null,
      attributes: attributesObj,
      savingThrows: parsed.savingThrows || {},
      skills: parsed.skills ? (Array.isArray(parsed.skills) ? parsed.skills.reduce((acc, skill) => {
        const match = skill.match(/(.+?)\s*\+?\s*(\d+)/);
        if (match) {
          acc[match[1].trim()] = parseInt(match[2], 10);
        } else {
          acc[skill] = 0;
        }
        return acc;
      }, {} as Record<string, number>) : parsed.skills) : {},
      attacks: parsed.actions || [],
      abilities: parsed.specialTraits || [],
      resistances: parsed.damageResistances || [],
      immunities: [
        ...(parsed.damageImmunities || []),
        ...(parsed.conditionImmunities || []),
      ],
      vulnerabilities: parsed.damageVulnerabilities || [],
      description: parsed.description || null,
      image: parsed.image || null,
      chapterId: parsed.chapterId || null,
      isHostile: parsed.isHostile ?? false,
    };

    const [npc] = await db
      .insert(schema.campaignNpcs)
      .values(npcData)
      .returning();

    return NextResponse.json(npc, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error creating NPC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
