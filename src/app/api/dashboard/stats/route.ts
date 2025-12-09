import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq, inArray } from "drizzle-orm";
import { getDbUser } from "@/lib/user-helper";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database otimizado
    const dbUser = await getDbUser(user.id, user.email);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDM = dbUser.role === "dm" || dbUser.role === "admin";

    let stats: any = {};

    if (isDM) {
      // DM Stats - Get campaigns and related data in parallel
      const campaigns = await db
        .select({
          id: schema.campaigns.id,
        })
        .from(schema.campaigns)
        .where(eq(schema.campaigns.dmId, dbUser.id));

      const campaignIds = campaigns.map((c) => c.id);

      // Fetch all related data in parallel - apenas contagens
      const [members, characters, items] = await Promise.all([
        campaignIds.length > 0
          ? db
              .select({
                userId: schema.campaignMembers.userId,
              })
              .from(schema.campaignMembers)
              .where(inArray(schema.campaignMembers.campaignId, campaignIds))
          : Promise.resolve([]),
        campaignIds.length > 0
          ? db
              .select({
                id: schema.characters.id,
              })
              .from(schema.characters)
              .where(inArray(schema.characters.campaignId, campaignIds))
          : Promise.resolve([]),
        campaignIds.length > 0
          ? db
              .select({
                id: schema.items.id,
              })
              .from(schema.items)
              .where(inArray(schema.items.campaignId, campaignIds))
          : Promise.resolve([]),
      ]);

      stats = {
        activePlayers: new Set(members.map((m) => m.userId)).size,
        campaigns: campaigns.length,
        characters: characters.length,
        items: items.length,
      };
    } else {
      // Player Stats - Fetch in parallel
      const [campaigns, characters, items] = await Promise.all([
        db
          .select()
          .from(schema.campaignMembers)
          .where(eq(schema.campaignMembers.userId, dbUser.id)),
        db
          .select()
          .from(schema.characters)
          .where(eq(schema.characters.playerId, dbUser.id)),
        db
          .select()
          .from(schema.items)
          .where(eq(schema.items.ownerId, dbUser.id)),
      ]);

      stats = {
        campaigns: campaigns.length,
        characters: characters.length,
        items: items.length,
      };
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
      },
      stats,
      isDM,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

