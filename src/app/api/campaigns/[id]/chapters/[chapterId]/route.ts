import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, chapterId } = params;
    const body = await request.json();
    const parsed = updateChapterSchema.parse(body);

    // Verify user is DM
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign || campaign.dmId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };
    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.isCompleted !== undefined) {
      updateData.isCompleted = parsed.isCompleted;
      if (parsed.isCompleted) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const [chapter] = await db
      .update(schema.campaignChapters)
      .set(updateData)
      .where(
        and(
          eq(schema.campaignChapters.id, chapterId),
          eq(schema.campaignChapters.campaignId, campaignId)
        )
      )
      .returning();

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Atualizar progresso da campanha baseado em capítulos concluídos
    const totalChapters = await db
      .select()
      .from(schema.campaignChapters)
      .where(eq(schema.campaignChapters.campaignId, campaignId));

    const completedChapters = totalChapters.filter((ch) => ch.isCompleted).length;
    const totalChaptersCount = campaign.totalChapters || totalChapters.length || 10;
    const progress = Math.round((completedChapters / totalChaptersCount) * 100);

    await db
      .update(schema.campaigns)
      .set({ progress })
      .where(eq(schema.campaigns.id, campaignId));

    return NextResponse.json({ chapter });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, chapterId } = params;

    // Verify user is DM
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign || campaign.dmId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db
      .delete(schema.campaignChapters)
      .where(
        and(
          eq(schema.campaignChapters.id, chapterId),
          eq(schema.campaignChapters.campaignId, campaignId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

