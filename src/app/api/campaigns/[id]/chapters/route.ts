import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createChapterSchema = z.object({
  chapterNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
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

    // Verify user has access - similar to overview endpoint
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      
      if (userByEmail.length > 0) {
        dbUser = userByEmail;
      }
    }

    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é DM
    const dmIdStr = String(campaign.dmId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";
    
    const isDM = dmIdStr === userIdStr || dmIdStr === dbUserIdStr;

    // Verificar se é membro
    const userIdToCheck = dbUser.length > 0 ? dbUser[0].id : user.id;
    
    const memberBySupabaseId = await db
      .select()
      .from(schema.campaignMembers)
      .where(
        and(
          eq(schema.campaignMembers.campaignId, campaignId),
          eq(schema.campaignMembers.userId, user.id)
        )
      )
      .limit(1);

    const memberByDbId = userIdToCheck !== user.id
      ? await db
          .select()
          .from(schema.campaignMembers)
          .where(
            and(
              eq(schema.campaignMembers.campaignId, campaignId),
              eq(schema.campaignMembers.userId, userIdToCheck)
            )
          )
          .limit(1)
      : [];

    const member = memberBySupabaseId.length > 0 ? memberBySupabaseId[0] : 
                   memberByDbId.length > 0 ? memberByDbId[0] : null;

    // Se não for DM e não for membro, negar acesso
    if (!isDM && !member) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const chapters = await db
      .select()
      .from(schema.campaignChapters)
      .where(eq(schema.campaignChapters.campaignId, campaignId))
      .orderBy(schema.campaignChapters.chapterNumber);

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const parsed = createChapterSchema.parse(body);

    // Verify user is DM - similar to overview endpoint
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      
      if (userByEmail.length > 0) {
        dbUser = userByEmail;
      }
    }

    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se o usuário é o DM - comparar com ambos os IDs possíveis
    const dmIdStr = String(campaign.dmId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser.length > 0 ? String(dbUser[0].id || "") : "";
    
    const isDM = dmIdStr === userIdStr || dmIdStr === dbUserIdStr;

    if (!isDM) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verificar número total de capítulos
    const existingChapters = await db
      .select()
      .from(schema.campaignChapters)
      .where(eq(schema.campaignChapters.campaignId, campaignId));

    const totalChapters = campaign.totalChapters || 10;
    if (existingChapters.length >= totalChapters) {
      return NextResponse.json(
        { error: `Você já criou o número máximo de capítulos (${totalChapters}). Edite o número total de capítulos na campanha para criar mais.` },
        { status: 400 }
      );
    }

    const [chapter] = await db
      .insert(schema.campaignChapters)
      .values({
        campaignId,
        chapterNumber: parsed.chapterNumber,
        title: parsed.title,
        description: parsed.description,
      })
      .returning();

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

