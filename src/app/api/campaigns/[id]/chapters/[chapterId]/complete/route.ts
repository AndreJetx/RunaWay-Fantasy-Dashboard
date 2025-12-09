import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { calculateLevel } from "@/lib/xp-levels";

const completeChapterSchema = z.object({
  // XP individual por personagem
  characterXP: z
    .array(
      z.object({
        characterId: z.string().uuid(),
        experiencePoints: z.number().int().min(0),
      })
    )
    .optional(),
  // XP igual para todos (mantido para compatibilidade)
  experiencePoints: z.number().int().min(0).optional(),
  items: z
    .array(
      z.object({
        characterId: z.string().uuid(),
        itemId: z.string().uuid().optional(),
        itemName: z.string(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  spells: z
    .array(
      z.object({
        characterId: z.string().uuid(),
        spellIndex: z.string(), // Índice da magia na API D&D 5e (ex: "fireball", "magic-missile")
      })
    )
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId, chapterId } = params;
    const body = await request.json();
    const parsed = completeChapterSchema.parse(body);

    // Verify user is DM
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign || campaign.dmId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update chapter as completed
    const [chapter] = await db
      .update(schema.campaignChapters)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.campaignChapters.id, chapterId),
          eq(schema.campaignChapters.campaignId, campaignId)
        )
      )
      .returning();

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Distribute XP if provided
    const levelUps: Array<{ characterId: string; oldLevel: number; newLevel: number; characterName: string }> = [];
    
    if (parsed.characterXP && parsed.characterXP.length > 0) {
      // XP individual por personagem
      console.log(`📊 Distribuindo XP individual para ${parsed.characterXP.length} personagem(ns)`);
      
      for (const xpData of parsed.characterXP) {
        const [character] = await db
          .select()
          .from(schema.characters)
          .where(eq(schema.characters.id, xpData.characterId))
          .limit(1);
        
        if (!character) continue;
        
        const currentXp = character.experiencePoints || 0;
        const currentLevel = character.level || 1;
        const newXp = currentXp + xpData.experiencePoints;
        const newLevel = calculateLevel(newXp);
        
        // Verificar se subiu de nível
        if (newLevel > currentLevel) {
          levelUps.push({
            characterId: character.id,
            oldLevel: currentLevel,
            newLevel: newLevel,
            characterName: character.name,
          });
        }
        
        const updateData: any = {
          experiencePoints: newXp,
          level: newLevel,
        };
        
        // Marcar que precisa rolar dado de vida se subiu de nível
        if (newLevel > currentLevel) {
          updateData.needsLevelUp = true;
        }
        
        await db
          .update(schema.characters)
          .set(updateData)
          .where(eq(schema.characters.id, character.id));
        
        console.log(`  ✅ ${character.name}: ${currentXp} → ${newXp} XP (Nível ${currentLevel} → ${newLevel})`);
      }
    } else if (parsed.experiencePoints && parsed.experiencePoints > 0) {
      // XP igual para todos (compatibilidade)
      const characters = await db
        .select()
        .from(schema.characters)
        .where(eq(schema.characters.campaignId, campaignId));

      console.log(`📊 Distribuindo ${parsed.experiencePoints} XP para ${characters.length} personagem(ns)`);

      for (const character of characters) {
        const currentXp = character.experiencePoints || 0;
        const currentLevel = character.level || 1;
        const newXp = currentXp + parsed.experiencePoints;
        const newLevel = calculateLevel(newXp);
        
        // Verificar se subiu de nível
        if (newLevel > currentLevel) {
          levelUps.push({
            characterId: character.id,
            oldLevel: currentLevel,
            newLevel: newLevel,
            characterName: character.name,
          });
        }
        
        const updateData: any = {
          experiencePoints: newXp,
          level: newLevel,
        };
        
        // Marcar que precisa rolar dado de vida se subiu de nível
        if (newLevel > currentLevel) {
          updateData.needsLevelUp = true;
        }
        
        await db
          .update(schema.characters)
          .set(updateData)
          .where(eq(schema.characters.id, character.id));
        
        console.log(`  ✅ ${character.name}: ${currentXp} → ${newXp} XP (Nível ${currentLevel} → ${newLevel})`);
      }
    }

    // Distribute items if provided
    if (parsed.items && parsed.items.length > 0) {
      for (const itemData of parsed.items) {
        // Verificar se o item já existe ou criar novo
        if (itemData.itemId) {
          // Atualizar quantidade do item existente
          const [existingItem] = await db
            .select()
            .from(schema.items)
            .where(eq(schema.items.id, itemData.itemId))
            .limit(1);

          if (existingItem) {
            await db
              .update(schema.items)
              .set({
                quantity: existingItem.quantity + itemData.quantity,
              })
              .where(eq(schema.items.id, itemData.itemId));
          }
        } else {
          // Criar novo item
          await db.insert(schema.items).values({
            campaignId,
            ownerId: itemData.characterId,
            name: itemData.itemName,
            type: "Other",
            rarity: "Common",
            quantity: itemData.quantity,
            weight: "1",
          });
        }
      }
    }

    // Distribute spells if provided
    if (parsed.spells && parsed.spells.length > 0) {
      console.log(`📜 Distribuindo ${parsed.spells.length} magia(s)`);
      
      for (const spellData of parsed.spells) {
        const [character] = await db
          .select()
          .from(schema.characters)
          .where(eq(schema.characters.id, spellData.characterId))
          .limit(1);
        
        if (!character) continue;
        
        const currentSpellcasting = character.spellcasting || {};
        const knownSpells = currentSpellcasting.knownSpells || [];
        
        // Verificar se a magia já está na lista
        if (!knownSpells.includes(spellData.spellIndex)) {
          const updatedSpellcasting = {
            ...currentSpellcasting,
            knownSpells: [...knownSpells, spellData.spellIndex],
          };
          
          await db
            .update(schema.characters)
            .set({ spellcasting: updatedSpellcasting })
            .where(eq(schema.characters.id, character.id));
          
          console.log(`  ✅ ${character.name}: Aprendeu ${spellData.spellIndex}`);
        } else {
          console.log(`  ⚠️ ${character.name}: Já conhece ${spellData.spellIndex}`);
        }
      }
    }

    // Update campaign progress
    const totalChapters = await db
      .select()
      .from(schema.campaignChapters)
      .where(eq(schema.campaignChapters.campaignId, campaignId));

    const completedChapters = totalChapters.filter((ch) => ch.isCompleted).length;
    const totalChaptersCount = campaign.totalChapters || totalChapters.length || 10;
    const progress = Math.round((completedChapters / totalChaptersCount) * 100);

    await db
      .update(schema.campaigns)
      .set({ progress })
      .where(eq(schema.campaigns.id, campaignId));

    return NextResponse.json({
      chapter,
      message: "Chapter completed successfully",
      xpDistributed: parsed.experiencePoints || 0,
      itemsDistributed: parsed.items?.length || 0,
      spellsDistributed: parsed.spells?.length || 0,
      levelUps: levelUps,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error completing chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

