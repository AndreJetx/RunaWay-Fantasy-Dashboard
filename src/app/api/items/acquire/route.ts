import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const acquireItemSchema = z.object({
  itemId: z.string().uuid(),
  characterId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = acquireItemSchema.parse(payload);

    // Buscar item original
    const [originalItem] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, parsed.itemId))
      .limit(1);

    if (!originalItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verificar se o item é de recompensa (ownerId é o DM)
    if (!originalItem.campaignId) {
      return NextResponse.json({ error: "Item is not part of a campaign" }, { status: 400 });
    }

    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, originalItem.campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se o usuário é membro da campanha
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDM = campaign.dmId === user.id || campaign.dmId === dbUser[0].id;
    const isMember = await db
      .select()
      .from(schema.campaignMembers)
      .where(
        and(
          eq(schema.campaignMembers.campaignId, campaign.id),
          eq(schema.campaignMembers.userId, user.id)
        )
      )
      .limit(1);

    if (!isDM && isMember.length === 0) {
      return NextResponse.json(
        { error: "You are not a member of this campaign" },
        { status: 403 }
      );
    }

    // Se o item já pertence ao usuário, não precisa adquirir
    if (originalItem.ownerId === user.id || originalItem.ownerId === dbUser[0].id) {
      return NextResponse.json(
        { error: "You already own this item" },
        { status: 400 }
      );
    }

    // Criar cópia do item para o jogador
    const [acquiredItem] = await db
      .insert(schema.items)
      .values({
        campaignId: originalItem.campaignId,
        ownerId: user.id,
        name: originalItem.name,
        type: originalItem.type,
        rarity: originalItem.rarity,
        weight: originalItem.weight,
        quantity: originalItem.quantity,
        image: originalItem.image,
        description: originalItem.description,
        attunementRequired: originalItem.attunementRequired,
        equipped: false,
      })
      .returning();

    return NextResponse.json({
      item: acquiredItem,
      message: "Item acquired successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error acquiring item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

