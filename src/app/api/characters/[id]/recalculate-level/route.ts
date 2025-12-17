import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { calculateLevel } from "@/lib/xp-levels";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterId = params.id;

    // Buscar personagem
    const [character] = await db
      .select()
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId));

    if (!character) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    // Calcular nível correto baseado no XP
    const currentXP = character.experiencePoints || 0;
    const calculatedLevel = calculateLevel(currentXP);
    const currentLevel = character.level || 1;

    console.log(`[Recalculate Level] Personagem: ${character.name}`);
    console.log(`  - Nível atual: ${currentLevel}`);
    console.log(`  - XP total: ${currentXP}`);
    console.log(`  - Nível calculado: ${calculatedLevel}`);

    // Se o nível está correto, não fazer nada
    if (currentLevel === calculatedLevel) {
      return NextResponse.json({
        message: "O nível já está correto",
        character: {
          name: character.name,
          currentLevel,
          xp: currentXP,
          calculatedLevel,
        },
      });
    }

    // Se o nível calculado é maior, marcar para level up
    if (calculatedLevel > currentLevel) {
      await db
        .update(schema.characters)
        .set({
          needsLevelUp: true,
        })
        .where(eq(schema.characters.id, characterId));

      return NextResponse.json({
        message: `Personagem marcado para level up. Nível atual: ${currentLevel}, pode subir até: ${calculatedLevel}`,
        character: {
          name: character.name,
          currentLevel,
          xp: currentXP,
          calculatedLevel,
          levelsToGain: calculatedLevel - currentLevel,
        },
      });
    }

    // Se o nível calculado é menor (personagem está com nível a mais), corrigir
    if (calculatedLevel < currentLevel) {
      await db
        .update(schema.characters)
        .set({
          level: calculatedLevel,
          needsLevelUp: false,
        })
        .where(eq(schema.characters.id, characterId));

      return NextResponse.json({
        message: `Nível corrigido de ${currentLevel} para ${calculatedLevel}`,
        character: {
          name: character.name,
          oldLevel: currentLevel,
          newLevel: calculatedLevel,
          xp: currentXP,
        },
      });
    }

    return NextResponse.json({
      message: "Nenhuma alteração necessária",
      character: {
        name: character.name,
        currentLevel,
        xp: currentXP,
      },
    });
  } catch (error: any) {
    console.error("Error recalculating level:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

