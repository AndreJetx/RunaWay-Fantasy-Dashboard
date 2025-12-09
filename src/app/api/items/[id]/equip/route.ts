import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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

    // Verificar se o item pertence ao usuário
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (item.ownerId !== user.id && item.ownerId !== dbUser[0].id) {
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

    // Verificar se o personagem pertence ao usuário
    if (character.playerId !== user.id && character.playerId !== dbUser[0].id) {
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

    // Se for armadura e estiver equipando, atualizar CA do personagem
    if (parsed.equipped && item.type === "Armor") {
      // Extrair CA adicional da descrição (formato: "CA: +X")
      let acBonus = 0;
      if (item.description) {
        const acMatch = item.description.match(/CA:\s*\+(\d+)/i);
        if (acMatch) {
          acBonus = parseInt(acMatch[1], 10);
        }
      }

      // Calcular novo CA (CA base + bônus da armadura)
      // CA base geralmente é 10 + modificador de Destreza
      const attributes = (character.attributes as any) || {};
      const dexterity = attributes.dexterity || 10;
      const dexModifier = Math.floor((dexterity - 10) / 2);
      const baseAC = 10 + dexModifier;
      const newAC = baseAC + acBonus;

      await db
        .update(schema.characters)
        .set({ armorClass: newAC })
        .where(eq(schema.characters.id, parsed.characterId));

      return NextResponse.json({
        item: updatedItem,
        characterAC: newAC,
        message: "Item equipped and armor class updated",
      });
    }

    // Se estiver desequipando armadura, recalcular CA sem o bônus
    if (!parsed.equipped && item.type === "Armor") {
      const attributes = (character.attributes as any) || {};
      const dexterity = attributes.dexterity || 10;
      const dexModifier = Math.floor((dexterity - 10) / 2);
      const baseAC = 10 + dexModifier;

      await db
        .update(schema.characters)
        .set({ armorClass: baseAC })
        .where(eq(schema.characters.id, parsed.characterId));

      return NextResponse.json({
        item: updatedItem,
        characterAC: baseAC,
        message: "Item unequipped and armor class updated",
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

