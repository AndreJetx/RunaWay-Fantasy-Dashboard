import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { itemRarityEnum, itemTypeEnum } from "@shared/schema";

const itemTypeValues = itemTypeEnum.enumValues as [string, ...string[]];
const itemRarityValues = itemRarityEnum.enumValues as [string, ...string[]];

const createRewardItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(itemTypeValues),
  rarity: z.enum(itemRarityValues),
  weight: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(1).optional(),
  image: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  attunementRequired: z.boolean().optional(),
  armorClass: z.coerce.number().int().min(0).optional(), // CA adicional para armaduras
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

    // Buscar campanha
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é DM
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDM = campaign.dmId === user.id || campaign.dmId === dbUser[0].id;

    // Buscar itens de recompensa (ownerId = dmId)
    const rewardItems = await db
      .select()
      .from(schema.items)
      .where(
        eq(schema.items.campaignId, campaignId)
      );

    // Filtrar apenas itens onde ownerId é o DM (itens de recompensa)
    const dmItems = rewardItems.filter(
      (item) => item.ownerId === campaign.dmId || item.ownerId === dbUser[0].id
    );

    // Se for jogador, também retornar itens disponíveis
    if (!isDM) {
      return NextResponse.json({
        rewardItems: dmItems,
        canManage: false,
      });
    }

    return NextResponse.json({
      rewardItems: dmItems,
      canManage: true,
    });
  } catch (error) {
    console.error("Error fetching reward items:", error);
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

    // Buscar campanha
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é DM
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDM = campaign.dmId === user.id || campaign.dmId === dbUser[0].id;
    if (!isDM) {
      return NextResponse.json(
        { error: "Only the DM can create reward items" },
        { status: 403 }
      );
    }

    const payload = await request.json();
    const parsed = createRewardItemSchema.parse(payload);

    // Criar item de recompensa (ownerId = dmId)
    const [item] = await db
      .insert(schema.items)
      .values({
        campaignId: campaignId,
        ownerId: campaign.dmId, // Item de recompensa pertence ao DM
        name: parsed.name,
        type: parsed.type,
        rarity: parsed.rarity,
        weight: parsed.weight ?? 1,
        quantity: parsed.quantity ?? 1,
        image: parsed.image || null,
        description: parsed.description || null,
        attunementRequired: parsed.attunementRequired ?? false,
        equipped: false,
      })
      .returning();

    // Armazenar CA adicional em description se for armadura
    if (parsed.type === "Armor" && parsed.armorClass) {
      const description = parsed.description 
        ? `${parsed.description}\n\nCA: +${parsed.armorClass}`
        : `CA: +${parsed.armorClass}`;
      
      await db
        .update(schema.items)
        .set({ description })
        .where(eq(schema.items.id, item.id));
      
      item.description = description;
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error creating reward item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

