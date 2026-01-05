import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";

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

    const characterId = params.id;

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Buscar usuário no banco de dados
    let dbUser = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      if (userByEmail.length > 0) {
        dbUser = userByEmail;
      }
    }

    // Buscar campanha para verificar se é DM (apenas se tiver campaignId)
    let campaign = null;
    let isDM = false;

    if (character.campaignId) {
      [campaign] = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, character.campaignId))
        .limit(1);

      if (campaign) {
        // Verificar se é DM
        const dmIdStr = String(campaign.dmId || "");
        const userIdStr = String(user.id || "");
        const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";

        isDM = dmIdStr === userIdStr || dmIdStr === dbUserIdStr;
      }
    }

    // Verificar se é o dono do personagem (usar dbUserId se disponível)
    const characterPlayerIdStr = String(character.playerId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";
    const isOwner = characterPlayerIdStr === dbUserIdStr || characterPlayerIdStr === userIdStr;

    // Se não for DM e não for o dono, negar acesso
    if (!isDM && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      character,
      isOwner,
      isDM,
    });
  } catch (error) {
    console.error("Error fetching character:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const characterId = params.id;
    const body = await request.json();

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Buscar usuário no banco de dados
    let dbUser = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      if (userByEmail.length > 0) {
        dbUser = userByEmail;
      }
    }

    // Buscar campanha para verificar se é DM (apenas se tiver campaignId)
    let campaign = null;

    if (character.campaignId) {
      [campaign] = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, character.campaignId))
        .limit(1);

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }
    }

    // Verificar se é DM (apenas se tiver campanha)
    let isDM = false;
    if (campaign) {
      const dmIdStr = String(campaign.dmId || "");
      const userIdStr = String(user.id || "");
      const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";

      isDM = dmIdStr === userIdStr || dmIdStr === dbUserIdStr;
    }

    // Verificar se é o dono do personagem (usar dbUserId se disponível)
    const characterPlayerIdStr = String(character.playerId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";
    const isOwner = characterPlayerIdStr === dbUserIdStr || characterPlayerIdStr === userIdStr;

    // Se não for DM e não for o dono, negar acesso
    if (!isDM && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Preparar dados para atualização
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Campos que podem ser atualizados
    if (body.name !== undefined) updateData.name = body.name;
    if (body.race !== undefined) updateData.race = body.race;
    if (body.characterClass !== undefined) updateData.characterClass = body.characterClass;
    if (body.subclass !== undefined) updateData.subclass = body.subclass;
    if (body.pact !== undefined) updateData.pact = body.pact;
    if (body.dragonType !== undefined) updateData.dragonType = body.dragonType;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.experiencePoints !== undefined) updateData.experiencePoints = body.experiencePoints;
    if (body.background !== undefined) updateData.background = body.background;
    if (body.alignment !== undefined) updateData.alignment = body.alignment;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.armorClass !== undefined) updateData.armorClass = body.armorClass;
    if (body.initiative !== undefined) updateData.initiative = body.initiative;
    if (body.speed !== undefined) updateData.speed = body.speed;
    if (body.currentHp !== undefined) updateData.currentHp = body.currentHp;
    if (body.maxHp !== undefined) updateData.maxHp = body.maxHp;
    if (body.tempHp !== undefined) updateData.tempHp = body.tempHp;
    if (body.hitDice !== undefined) updateData.hitDice = body.hitDice;
    if (body.attributes !== undefined) updateData.attributes = body.attributes;
    if (body.savingThrows !== undefined) updateData.savingThrows = body.savingThrows;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.proficiencyBonus !== undefined) updateData.proficiencyBonus = body.proficiencyBonus;
    if (body.proficiencies !== undefined) updateData.proficiencies = body.proficiencies;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.equipment !== undefined) updateData.equipment = body.equipment;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.spellcasting !== undefined) updateData.spellcasting = body.spellcasting;
    if (body.mana !== undefined) updateData.mana = body.mana;
    if (body.maxMana !== undefined) updateData.maxMana = body.maxMana;
    if (body.divindade !== undefined) updateData.divindade = body.divindade;
    if (body.origem !== undefined) updateData.origem = body.origem;
    if (body.poderes !== undefined) updateData.poderes = body.poderes;
    if (body.personalityTraits !== undefined) updateData.personalityTraits = body.personalityTraits;
    if (body.ideals !== undefined) updateData.ideals = body.ideals;
    if (body.bonds !== undefined) updateData.bonds = body.bonds;
    if (body.flaws !== undefined) updateData.flaws = body.flaws;
    if (body.backstory !== undefined) updateData.backstory = body.backstory;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.feats !== undefined) updateData.feats = body.feats;
    if (body.needsLevelUp !== undefined) updateData.needsLevelUp = body.needsLevelUp;
    if (body.pendingHitDiceRoll !== undefined) updateData.pendingHitDiceRoll = body.pendingHitDiceRoll;
    if (body.inventory !== undefined) updateData.inventory = body.inventory;
    if (body.preparedSpells !== undefined) updateData.preparedSpells = body.preparedSpells;
    if (body.lastSpellPrepDate !== undefined) updateData.lastSpellPrepDate = body.lastSpellPrepDate;
    if (body.usedSpellSlots !== undefined) updateData.usedSpellSlots = body.usedSpellSlots;
    if (body.createdSpellSlots !== undefined) updateData.createdSpellSlots = body.createdSpellSlots;
    if (body.eldritchInvocations !== undefined) updateData.eldritchInvocations = body.eldritchInvocations;
    if (body.bookOfShadowsCantrips !== undefined) updateData.bookOfShadowsCantrips = body.bookOfShadowsCantrips;
    if (body.mysticArcanum !== undefined) updateData.mysticArcanum = body.mysticArcanum;
    if (body.metamagics !== undefined) updateData.metamagics = body.metamagics;
    if (body.sorceryPoints !== undefined) updateData.sorceryPoints = body.sorceryPoints;
    if (body.maxSorceryPoints !== undefined) updateData.maxSorceryPoints = body.maxSorceryPoints;
    if (body.fightingStyle !== undefined) updateData.fightingStyle = body.fightingStyle;
    if (body.hpBonusPerLevel !== undefined) updateData.hpBonusPerLevel = body.hpBonusPerLevel;


    const [updatedCharacter] = await db
      .update(schema.characters)
      .set(updateData)
      .where(eq(schema.characters.id, characterId))
      .returning();

    return NextResponse.json({ character: updatedCharacter });
  } catch (error) {
    console.error("Error updating character:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const characterId = params.id;

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Buscar usuário no banco de dados
    let dbUser = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      if (userByEmail.length > 0) {
        dbUser = userByEmail;
      }
    }

    // Verificar se é o dono do personagem (usar dbUserId se disponível)
    const characterPlayerIdStr = String(character.playerId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";
    const isOwner = characterPlayerIdStr === dbUserIdStr || characterPlayerIdStr === userIdStr;

    // Verificar se é DM (se tiver role)
    const isDM = dbUser.length > 0 && dbUser[0].role === "dm";

    // Se não for DM e não for o dono, negar acesso
    if (!isDM && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verificar se o personagem está vinculado a uma campanha
    if (character.campaignId) {
      return NextResponse.json(
        { error: "Cannot delete a character that is part of a campaign. Remove it from the campaign first." },
        { status: 400 }
      );
    }

    // Deletar o personagem
    await db
      .delete(schema.characters)
      .where(eq(schema.characters.id, characterId));

    return NextResponse.json({
      success: true,
      message: "Character deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting character:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
