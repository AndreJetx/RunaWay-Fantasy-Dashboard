import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";
import { convertMonsterToNpc } from "@/lib/npc-helpers";

// POST - Criar NPC a partir de template JSON
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
    const { monsterData, chapterId, npcType } = payload;

    if (!monsterData || !monsterData.name) {
      return NextResponse.json(
        { error: "monsterData with name is required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Only DM can create NPCs" },
        { status: 403 }
      );
    }

    // Converter dados JSON para formato do schema
    const npcData = convertMonsterToNpc(monsterData, campaignId, chapterId, npcType);

    // Criar NPC - npcData já está no formato correto
    const [npc] = await db
      .insert(schema.campaignNpcs)
      .values(npcData)
      .returning();

    return NextResponse.json(npc, { status: 201 });
  } catch (error) {
    console.error("Error creating NPC from template:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

