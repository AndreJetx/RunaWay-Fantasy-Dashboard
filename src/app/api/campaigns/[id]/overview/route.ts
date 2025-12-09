import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";

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

    // Buscar tudo em paralelo após verificar acesso básico
    const [memberBySupabaseId, memberByDbId, charactersResult, itemsResult, mapsResult, notesResult, membersResult] = await Promise.all([
      // Verificar se é membro por Supabase ID
      db
        .select()
        .from(schema.campaignMembers)
        .where(
          and(
            eq(schema.campaignMembers.campaignId, campaignId),
            eq(schema.campaignMembers.userId, user.id)
          )
        )
        .limit(1),
      // Verificar se é membro por DB ID (se diferente)
      userIdToCheck !== user.id
        ? db
            .select()
            .from(schema.campaignMembers)
            .where(
              and(
                eq(schema.campaignMembers.campaignId, campaignId),
                eq(schema.campaignMembers.userId, userIdToCheck)
              )
            )
            .limit(1)
        : Promise.resolve([]),
      // Fetch characters - apenas campos necessários
      db
        .select({
          id: schema.characters.id,
          name: schema.characters.name,
          race: schema.characters.race,
          characterClass: schema.characters.characterClass,
          level: schema.characters.level,
          currentHp: schema.characters.currentHp,
          maxHp: schema.characters.maxHp,
          armorClass: schema.characters.armorClass,
          playerId: schema.characters.playerId,
          image: schema.characters.image,
        })
        .from(schema.characters)
        .where(eq(schema.characters.campaignId, campaignId)),
      // Fetch items - apenas campos necessários
      db
        .select({
          id: schema.items.id,
          name: schema.items.name,
          type: schema.items.type,
          rarity: schema.items.rarity,
          ownerId: schema.items.ownerId,
        })
        .from(schema.items)
        .where(eq(schema.items.campaignId, campaignId)),
      // Fetch maps - apenas campos necessários
      db
        .select({
          id: schema.maps.id,
          title: schema.maps.title,
          imageUrl: schema.maps.imageUrl,
        })
        .from(schema.maps)
        .where(eq(schema.maps.campaignId, campaignId)),
      // Fetch notes - apenas campos necessários
      db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          category: schema.notes.category,
        })
        .from(schema.notes)
        .where(eq(schema.notes.campaignId, campaignId)),
      // Fetch members
      db
        .select({
          id: schema.campaignMembers.id,
          userId: schema.campaignMembers.userId,
          role: schema.campaignMembers.role,
          username: schema.users.username,
        })
        .from(schema.campaignMembers)
        .leftJoin(schema.users, eq(schema.campaignMembers.userId, schema.users.id))
        .where(eq(schema.campaignMembers.campaignId, campaignId)),
    ]);

    const member = memberBySupabaseId[0] || (memberByDbId.length > 0 ? memberByDbId[0] : null);

    // Se não for DM e não for membro, negar acesso
    if (!userIsDM && !member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const members = membersResult.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role || "player",
      username: m.username || "Unknown",
    }));

    return NextResponse.json({
      campaign,
      members,
      characters: charactersResult,
      items: itemsResult,
      maps: mapsResult,
      notes: notesResult,
      isDM: userIsDM,
    });
  } catch (error) {
    console.error("Error fetching campaign overview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
