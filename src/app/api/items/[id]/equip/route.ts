import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { calculateAC, parseArmorDescription, isShield } from "@/lib/ac-calculator";
import { getUnarmoredDefenseType } from "@/lib/class-ac-helper";
import { getDbUser } from "@/lib/user-helper";

const equipItemSchema = z.object({
  characterId: z.string().uuid(),
  equipped: z.boolean(),
});

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

    const itemId = params.id;
    const payload = await request.json();
    const parsed = equipItemSchema.parse(payload);

    // Buscar item
    const [item] = await db
      .select()
      .from(schema.items)
      .where(eq(schema.items.id, itemId))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Buscar usuário no banco de dados (tenta por ID e depois por email)
    let dbUser = await getDbUser(user.id, user.email);

    // Se não encontrou, criar usuário automaticamente
    if (!dbUser) {
      if (!user.email) {
        return NextResponse.json({ error: "User email not found" }, { status: 400 });
      }

      // Criar usuário no banco de dados
      const [newUser] = await db
        .insert(schema.users)
        .values({
          id: user.id,
          email: user.email,
          username: user.email.split("@")[0],
          role: "player",
        } as any)
        .returning();

      dbUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      };
    }

    // Verificar se o item pertence ao usuário (comparar com ambos os IDs)
    const userIds = [user.id];
    if (dbUser && dbUser.id !== user.id) {
      userIds.push(dbUser.id);
    }

    if (!userIds.includes(item.ownerId)) {
      return NextResponse.json(
        { error: "You don't own this item" },
        { status: 403 }
      );
    }

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, parsed.characterId))
      .limit(1);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    // Verificar se o personagem pertence ao usuário (comparar com ambos os IDs)
    if (!userIds.includes(character.playerId)) {
      return NextResponse.json(
        { error: "This character doesn't belong to you" },
        { status: 403 }
      );
    }

    // Atualizar item
    const [updatedItem] = await db
      .update(schema.items)
      .set({ equipped: parsed.equipped })
      .where(eq(schema.items.id, itemId))
      .returning();

    // Se for armadura ou escudo, recalcular CA
    if (item.type === "Armor" || isShield(item.name)) {
      const attributes = (character.attributes as any) || {};

      // Buscar todos os itens equipados do personagem
      const equippedItems = await db
        .select()
        .from(schema.items)
        .where(
          and(
            eq(schema.items.ownerId, item.ownerId),
            eq(schema.items.campaignId, item.campaignId),
            eq(schema.items.equipped, true)
          )
        );

      // Encontrar armadura equipada (se houver)
      const equippedArmor = equippedItems.find((i) => i.type === "Armor");
      const armorInfo = equippedArmor
        ? parseArmorDescription(equippedArmor.description)
        : undefined;

      // Verificar se há escudo equipado
      const hasShield = equippedItems.some((i) => isShield(i.name));

      // Verificar se o personagem tem Unarmored Defense da classe
      const unarmoredDefense = getUnarmoredDefenseType(character.characterClass);

      console.log("Equip item - Character data:", {
        characterClass: character.characterClass,
        unarmoredDefense,
        attributes,
        armorInfo,
        hasShield,
      });

      // Calcular CA usando a função auxiliar
      const newAC = calculateAC({
        characterAttributes: attributes,
        unarmoredDefense,
        equippedArmor: armorInfo || undefined,
        equippedShield: hasShield,
      });

      await db
        .update(schema.characters)
        .set({ armorClass: newAC })
        .where(eq(schema.characters.id, parsed.characterId));

      return NextResponse.json({
        item: updatedItem,
        characterAC: newAC,
        message: parsed.equipped
          ? "Item equipped and armor class updated"
          : "Item unequipped and armor class updated",
      });
    }

    return NextResponse.json({
      item: updatedItem,
      message: parsed.equipped ? "Item equipped" : "Item unequipped",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error equipping item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

