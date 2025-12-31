/**
 * API Route: Sincronizar inventário do personagem com tabela items
 * POST /api/characters/[id]/sync-inventory
 */

import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { processInventoryToItems } from "@/lib/inventory-helper";
import { getDbUser } from "@/lib/user-helper";

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

    const characterId = params.id;

    // Buscar usuário no banco de dados
    const dbUser = await getDbUser(user.id, user.email);

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Verificar permissões
    if (!character.campaignId) {
      return NextResponse.json({ error: "Character is not part of a campaign" }, { status: 400 });
    }

    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, character.campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é DM (comparar com ambos os IDs)
    const dmIdStr = String(campaign.dmId || "");
    const userIdStr = String(user.id || "");
    const dbUserIdStr = dbUser ? String(dbUser.id || "") : "";

    const isDM = dmIdStr === userIdStr || dmIdStr === dbUserIdStr;

    // Verificar se é o dono do personagem (comparar com ambos os IDs)
    const characterPlayerIdStr = String(character.playerId || "");
    const isOwner = characterPlayerIdStr === userIdStr || characterPlayerIdStr === dbUserIdStr;

    if (!isDM && !isOwner) {
      console.error("Access denied:", {
        characterId,
        characterPlayerId: character.playerId,
        userId: user.id,
        dbUserId: dbUser?.id,
        campaignDmId: campaign.dmId,
        isDM,
        isOwner,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Buscar inventário do personagem
    const inventory = (character.inventory as any) || [];

    console.log("Syncing inventory:", {
      characterId: character.id,
      characterName: character.name,
      inventoryLength: inventory.length,
      inventorySample: inventory.slice(0, 3),
      playerId: character.playerId,
      dbUserId: dbUser?.id,
    });

    if (inventory.length === 0) {
      return NextResponse.json({
        message: "No items in inventory to sync",
        itemsCreated: 0,
      });
    }

    // Usar o ID do banco de dados se disponível, senão usar o playerId
    const ownerId = dbUser?.id || character.playerId;

    // Processar inventário
    const result = await processInventoryToItems(
      character.id,
      character.campaignId,
      ownerId,
      inventory,
      character.attributes
    );

    console.log("Sync result:", result);

    return NextResponse.json({
      message: "Inventory synced successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error syncing inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

