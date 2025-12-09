import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { noteCategoryEnum } from "@shared/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";

const noteCategoryValues = noteCategoryEnum.enumValues as [string, ...string[]];

const createNoteSchema = z.object({
  campaignId: z.string().uuid(),
  dmId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().optional(),
  category: z.enum(noteCategoryValues),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
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

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    // Buscar usuário e verificar acesso em paralelo
    const [dbUser, campaign] = await Promise.all([
      db
        .select({
          id: schema.users.id,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
    ]);

    if (!campaign[0]) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isDM = campaign[0].dmId === user.id || (dbUser[0] && campaign[0].dmId === dbUser[0].id);
    
    // Se for jogador, verificar se é membro
    if (!isDM) {
      const member = await db
        .select()
        .from(schema.campaignMembers)
        .where(
          and(
            eq(schema.campaignMembers.campaignId, campaignId),
            eq(schema.campaignMembers.userId, user.id)
          )
        )
        .limit(1);

      if (member.length === 0) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Buscar notas - apenas campos necessários
    const notes = await db
      .select({
        id: schema.notes.id,
        title: schema.notes.title,
        content: schema.notes.content,
        category: schema.notes.category,
        tags: schema.notes.tags,
        isPrivate: schema.notes.isPrivate,
        createdAt: schema.notes.createdAt,
      })
      .from(schema.notes)
      .where(eq(schema.notes.campaignId, campaignId))
      .limit(100);

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createNoteSchema.parse(payload);

    const [note] = await db
      .insert(schema.notes)
      .values({
        campaignId: parsed.campaignId,
        dmId: parsed.dmId,
        title: parsed.title,
        content: parsed.content,
        category: parsed.category,
        tags: parsed.tags,
        isPrivate: parsed.isPrivate ?? true,
      })
      .returning();

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

