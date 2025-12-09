import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq, sql, inArray } from "drizzle-orm";
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

    let classDistribution: any[] = [];
    let rarityDistribution: any[] = [];

    if (isDM) {
      // Get DM's campaigns - apenas IDs
      const campaigns = await db
        .select({
          id: schema.campaigns.id,
        })
        .from(schema.campaigns)
        .where(eq(schema.campaigns.dmId, dbUser.id));

      const campaignIds = campaigns.map((c) => c.id);

      if (campaignIds.length > 0) {
        // Buscar distribuições em paralelo
        const [classData, rarityData] = await Promise.all([
          db
            .select({
              characterClass: schema.characters.characterClass,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.characters)
            .where(inArray(schema.characters.campaignId, campaignIds))
            .groupBy(schema.characters.characterClass),
          db
            .select({
              rarity: schema.items.rarity,
              count: sql<number>`count(*)::int`,
            })
            .from(schema.items)
            .where(inArray(schema.items.campaignId, campaignIds))
            .groupBy(schema.items.rarity),
        ]);

        classDistribution = classData;
        rarityDistribution = rarityData;
      }
    } else {
      // Player's own characters and items - buscar em paralelo
      const [classData, rarityData] = await Promise.all([
        db
          .select({
            characterClass: schema.characters.characterClass,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.characters)
          .where(eq(schema.characters.playerId, dbUser.id))
          .groupBy(schema.characters.characterClass),
        db
          .select({
            rarity: schema.items.rarity,
            count: sql<number>`count(*)::int`,
          })
          .from(schema.items)
          .where(eq(schema.items.ownerId, dbUser.id))
          .groupBy(schema.items.rarity),
      ]);

      classDistribution = classData;
      rarityDistribution = rarityData;
    }

    return NextResponse.json({
      classDistribution: classDistribution.map((item) => ({
        name: item.characterClass || "Unknown",
        value: item.count,
      })),
      rarityDistribution: rarityDistribution.map((item) => ({
        name: item.rarity || "Unknown",
        amount: item.count,
      })),
    });
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

