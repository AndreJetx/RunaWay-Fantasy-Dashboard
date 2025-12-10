import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { itemRarityEnum, itemTypeEnum } from "@shared/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { getDbUser } from "@/lib/user-helper";

const itemTypeValues = itemTypeEnum.enumValues as [string, ...string[]];
const itemRarityValues = itemRarityEnum.enumValues as [string, ...string[]];

const createItemSchema = z.object({
  campaignId: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(itemTypeValues),
  rarity: z.enum(itemRarityValues),
  weight: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0).optional(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  attunementRequired: z.boolean().optional(),
  equipped: z.boolean().optional(),
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

    // Buscar usuário otimizado
    const dbUser = await db
      .select({
        id: schema.users.id,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    const isDM = dbUser[0]?.role === "dm" || dbUser[0]?.role === "admin";

    // Se for DM e tem campaignId, mostrar todos os itens da campanha
    // Se for jogador, mostrar apenas seus itens
    if (isDM && campaignId) {
      const items = await db
        .select({
          id: schema.items.id,
          name: schema.items.name,
          type: schema.items.type,
          rarity: schema.items.rarity,
          campaignId: schema.items.campaignId,
          ownerId: schema.items.ownerId,
          quantity: schema.items.quantity,
          equipped: schema.items.equipped,
          image: schema.items.image,
        })
        .from(schema.items)
        .where(eq(schema.items.campaignId, campaignId))
        .limit(100);
      return NextResponse.json(items);
    }

    // Jogador: apenas seus itens
    const items = await db
      .select({
        id: schema.items.id,
        name: schema.items.name,
        type: schema.items.type,
        rarity: schema.items.rarity,
        campaignId: schema.items.campaignId,
        ownerId: schema.items.ownerId,
        quantity: schema.items.quantity,
        equipped: schema.items.equipped,
        image: schema.items.image,
      })
      .from(schema.items)
      .where(eq(schema.items.ownerId, user.id))
      .limit(100);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = createItemSchema.parse(payload);

    // Buscar usuário otimizado
    const dbUser = await getDbUser(user.id, user.email);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar se o ownerId corresponde ao usuário autenticado
    if (parsed.ownerId !== user.id && parsed.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "You can only create items for yourself" },
        { status: 403 }
      );
    }

    // Verificar acesso à campanha em paralelo
    const [campaign, memberBySupabaseId, memberByDbId] = await Promise.all([
      db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.id, parsed.campaignId))
        .limit(1),
      db
        .select()
        .from(schema.campaignMembers)
        .where(
          and(
            eq(schema.campaignMembers.campaignId, parsed.campaignId),
            eq(schema.campaignMembers.userId, user.id)
          )
        )
        .limit(1),
      dbUser.id !== user.id
        ? db
            .select()
            .from(schema.campaignMembers)
            .where(
              and(
                eq(schema.campaignMembers.campaignId, parsed.campaignId),
                eq(schema.campaignMembers.userId, dbUser.id)
              )
            )
            .limit(1)
        : Promise.resolve([]),
    ]);

    if (!campaign[0]) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isDM = campaign[0].dmId === user.id || campaign[0].dmId === dbUser.id;
    const member = memberBySupabaseId[0] || (memberByDbId.length > 0 ? memberByDbId[0] : null);

    if (!isDM && !member) {
      return NextResponse.json(
        { error: "You are not a member of this campaign" },
        { status: 403 }
      );
    }

    // Extrair CA adicional se for armadura
    let description = parsed.description || "";
    let acBonus = 0;
    if (parsed.type === "Armor" && parsed.description) {
      const acMatch = parsed.description.match(/CA:\s*\+(\d+)/i);
      if (acMatch) {
        acBonus = parseInt(acMatch[1], 10);
        if (!description.includes("CA:")) {
          description = description ? `${description}\n\nCA: +${acBonus}` : `CA: +${acBonus}`;
        }
      }
    }

    const itemData = {
      campaignId: parsed.campaignId,
      ownerId: user.id, // Sempre usar o ID do usuário autenticado
      name: parsed.name,
      type: parsed.type,
      rarity: parsed.rarity,
      weight: parsed.weight ?? 1,
      quantity: parsed.quantity ?? 1,
      image: parsed.image,
      description: description || null,
      attunementRequired: parsed.attunementRequired ?? false,
      equipped: parsed.equipped ?? false,
    };

    const [item] = await db
      .insert(schema.items)
      .values(itemData as any)
      .returning();

    return NextResponse.json(item, { status: 201 });
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

