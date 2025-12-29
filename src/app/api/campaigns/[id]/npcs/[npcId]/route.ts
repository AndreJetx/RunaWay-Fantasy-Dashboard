import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";
import { z } from "zod";

const updateNpcSchema = z.object({
  name: z.string().min(1).optional(),
  currentHp: z.coerce.number().int().optional(),
  maxHp: z.coerce.number().int().optional(),
  tempHp: z.coerce.number().int().optional(),
  armorClass: z.coerce.number().int().optional(),
  initiative: z.coerce.number().int().optional(),
  notes: z.string().optional(),
  isHostile: z.boolean().optional(),
  image: z.string().url().optional().or(z.literal("")),
  // Permite atualizar qualquer campo
}).passthrough();

// GET - Obter NPC específico (DM vê tudo, jogador só nome)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; npcId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, npcId } = params;

    // Buscar usuário e verificar acesso
    const [dbUser, campaignResult, npcResult] = await Promise.all([
      getDbUser(user.id, user.email),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
      db
        .select()
        .from(schema.campaignNpcs)
        .where(eq(schema.campaignNpcs.id, npcId))
        .limit(1),
    ]);

    const [campaign] = campaignResult;
    const [npc] = npcResult;

    if (!campaign || !npc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (npc.campaignId !== campaignId) {
      return NextResponse.json({ error: "NPC not in campaign" }, { status: 400 });
    }

    // Verificar acesso
    const userIdToCheck = dbUser?.id || user.id;
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);

    if (!userIsDM) {
      const member = await db
        .select()
        .from(schema.campaignMembers)
        .where(
          and(
            eq(schema.campaignMembers.campaignId, campaignId),
            eq(schema.campaignMembers.userId, userIdToCheck)
          )
        )
        .limit(1);

      if (member.length === 0) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Retornar dados completos ou limitados
    if (userIsDM) {
      return NextResponse.json(npc);
    } else {
      return NextResponse.json({
        id: npc.id,
        name: npc.name,
        type: npc.type,
        challengeRating: npc.challengeRating,
        alignment: npc.alignment,
        image: npc.image,
        isHostile: npc.isHostile,
      });
    }
  } catch (error) {
    console.error("Error fetching NPC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar NPC (apenas DM)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; npcId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, npcId } = params;
    const payload = await request.json();
    const parsed = updateNpcSchema.parse(payload);

    // Buscar e verificar acesso
    const [dbUser, campaignResult, npcResult] = await Promise.all([
      getDbUser(user.id, user.email),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
      db
        .select()
        .from(schema.campaignNpcs)
        .where(eq(schema.campaignNpcs.id, npcId))
        .limit(1),
    ]);

    const [campaign] = campaignResult;
    const [npc] = npcResult;

    if (!campaign || !npc || npc.campaignId !== campaignId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Apenas DM pode atualizar
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);
    if (!userIsDM) {
      return NextResponse.json({ error: "Only DM can update NPCs" }, { status: 403 });
    }

    // Atualizar NPC
    const [updatedNpc] = await db
      .update(schema.campaignNpcs)
      .set({
        ...parsed,
        updatedAt: new Date(),
      })
      .where(eq(schema.campaignNpcs.id, npcId))
      .returning();

    return NextResponse.json(updatedNpc);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error updating NPC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar NPC (apenas DM)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; npcId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, npcId } = params;

    // Buscar e verificar acesso
    const [dbUser, campaignResult, npcResult] = await Promise.all([
      getDbUser(user.id, user.email),
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, campaignId))
        .limit(1),
      db
        .select()
        .from(schema.campaignNpcs)
        .where(eq(schema.campaignNpcs.id, npcId))
        .limit(1),
    ]);

    const [campaign] = campaignResult;
    const [npc] = npcResult;

    if (!campaign || !npc || npc.campaignId !== campaignId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Apenas DM pode deletar
    const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);
    if (!userIsDM) {
      return NextResponse.json({ error: "Only DM can delete NPCs" }, { status: 403 });
    }

    await db
      .delete(schema.campaignNpcs)
      .where(eq(schema.campaignNpcs.id, npcId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting NPC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

