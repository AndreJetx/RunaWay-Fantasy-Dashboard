import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";

const markersSchema = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    x: z.number(),
    y: z.number(),
    color: z.string().optional(),
  }),
);

const createMapSchema = z.object({
  campaignId: z.string().uuid(),
  dmId: z.string().uuid(),
  title: z.string().min(1),
  imageUrl: z.string().url(),
  markers: markersSchema.optional(),
  notes: z.string().optional(),
  visibleToPlayers: z.boolean().optional(),
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

    // Buscar mapas - jogadores só veem mapas visíveis
    const maps = isDM
      ? await db
          .select({
            id: schema.maps.id,
            campaignId: schema.maps.campaignId,
            title: schema.maps.title,
            imageUrl: schema.maps.imageUrl,
            visibleToPlayers: schema.maps.visibleToPlayers,
          })
          .from(schema.maps)
          .where(eq(schema.maps.campaignId, campaignId))
          .limit(100)
      : await db
          .select({
            id: schema.maps.id,
            campaignId: schema.maps.campaignId,
            title: schema.maps.title,
            imageUrl: schema.maps.imageUrl,
            visibleToPlayers: schema.maps.visibleToPlayers,
          })
          .from(schema.maps)
          .where(
            and(
              eq(schema.maps.campaignId, campaignId),
              eq(schema.maps.visibleToPlayers, true)
            )
          )
          .limit(100);

    return NextResponse.json(maps);
  } catch (error) {
    console.error("Error fetching maps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = createMapSchema.parse(payload);

    const [map] = await db
      .insert(schema.maps)
      .values({
        campaignId: parsed.campaignId,
        dmId: parsed.dmId,
        title: parsed.title,
        imageUrl: parsed.imageUrl,
        markers: parsed.markers,
        notes: parsed.notes,
        visibleToPlayers: parsed.visibleToPlayers ?? false,
      })
      .returning();

    return NextResponse.json(map, { status: 201 });
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

