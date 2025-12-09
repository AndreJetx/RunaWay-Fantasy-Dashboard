import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";
import { z } from "zod";

const updateCampaignSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["Active", "Paused", "Completed", "Archived"]).optional(),
  image: z.string().url().optional().nullable(),
  totalChapters: z.number().int().min(1).optional(),
});

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

    // Verificar se é membro
    const [memberBySupabaseId, memberByDbId] = await Promise.all([
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
      // Verificar se é membro por DB User ID (se diferente)
      dbUser && dbUser.id !== user.id
        ? db
            .select()
            .from(schema.campaignMembers)
            .where(
              and(
                eq(schema.campaignMembers.campaignId, campaignId),
                eq(schema.campaignMembers.userId, dbUser.id)
              )
            )
            .limit(1)
        : Promise.resolve([]),
    ]);

    const isMember = memberBySupabaseId.length > 0 || memberByDbId.length > 0;

    if (!userIsDM && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
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

    const campaignId = params.id;
    const body = await request.json();
    const parsed = updateCampaignSchema.parse(body);

    // Verify user is DM
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.dmId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updateData: any = {};
    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.status !== undefined) updateData.status = parsed.status;
    if (parsed.image !== undefined) updateData.image = parsed.image;
    if (parsed.totalChapters !== undefined) {
      // Verificar se não há mais capítulos criados que o novo total
      const existingChapters = await db
        .select()
        .from(schema.campaignChapters)
        .where(eq(schema.campaignChapters.campaignId, campaignId));

      if (existingChapters.length > parsed.totalChapters) {
        return NextResponse.json(
          { error: `Você já criou ${existingChapters.length} capítulo(s). O número total de capítulos não pode ser menor que o número de capítulos já criados.` },
          { status: 400 }
        );
      }
      updateData.totalChapters = parsed.totalChapters;
      
      // Recalcular progresso se totalChapters mudou
      const completedChapters = existingChapters.filter((ch) => ch.isCompleted).length;
      const progress = Math.round((completedChapters / parsed.totalChapters) * 100);
      updateData.progress = progress;
    }

    const [updatedCampaign] = await db
      .update(schema.campaigns)
      .set(updateData)
      .where(eq(schema.campaigns.id, campaignId))
      .returning();

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error updating campaign:", error);
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

    const campaignId = params.id;

    // Buscar campanha
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se o usuário é o DM da campanha
    const dbUser = await getDbUser(user.id, user.email);
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);

    if (!userIsDM) {
      return NextResponse.json({ error: "Access denied. Only the DM can delete a campaign." }, { status: 403 });
    }

    // Deletar a campanha (cascade deletará automaticamente todos os dados relacionados)
    await db
      .delete(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId));

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

