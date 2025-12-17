/**
 * Helper para processar armaduras e atualizar CA automaticamente
 */

import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { calculateAC } from "@/lib/ac-calculator";
import { getUnarmoredDefenseType } from "@/lib/class-ac-helper";

const DND_API_BASE = "https://www.dnd5eapi.co";

interface InventoryItem {
  index: string;
  name: string;
  quantity?: number;
  cost?: number;
}

interface ArmorDetail {
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  equipment_category?: {
    index: string;
    name: string;
  };
}

/**
 * Busca detalhes de uma armadura da API D&D
 */
async function fetchArmorDetails(armorIndex: string): Promise<ArmorDetail | null> {
  try {
    const res = await fetch(`${DND_API_BASE}/api/2014/equipment/${armorIndex}`);
    if (!res.ok) {
      console.warn(`Failed to fetch armor ${armorIndex}: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching armor details for ${armorIndex}:`, error);
    return null;
  }
}

/**
 * Calcula o bônus de CA de uma armadura
 */
function calculateACBonus(armorDetail: ArmorDetail | null): number {
  if (!armorDetail?.armor_class) return 0;
  
  // O CA base da armadura substitui o CA base (10), então o bônus é a diferença
  // Ex: Armadura de couro tem CA base 11, então bônus = 11 - 10 = 1
  // Mas na verdade, armaduras têm CA base que substitui o 10 + DEX
  // Então o bônus real é: armor_base - 10
  const baseAC = armorDetail.armor_class.base || 0;
  
  // Se a armadura permite bônus de DEX, o bônus é apenas a diferença
  // Se não permite, o bônus é o CA base completo menos 10
  if (armorDetail.armor_class.dex_bonus) {
    // Armaduras leves/médias: CA base + DEX (máx. limitado)
    return baseAC - 10; // Bônus sobre o CA base de 10
  } else {
    // Armaduras pesadas: CA fixo, sem DEX
    return baseAC - 10; // Bônus sobre o CA base de 10
  }
}

/**
 * Processa inventário e cria itens para armaduras, equipando automaticamente a primeira
 */
export async function processArmorFromInventory(
  characterId: string,
  campaignId: string,
  ownerId: string,
  inventory: InventoryItem[],
  characterAttributes: any
): Promise<{ acUpdated: boolean; newAC?: number }> {
  if (!inventory || inventory.length === 0) {
    return { acUpdated: false };
  }

  // Buscar armaduras no inventário verificando pela API D&D
  const armorItems: InventoryItem[] = [];
  
  for (const item of inventory) {
    try {
      const details = await fetchArmorDetails(item.index);
      if (details?.equipment_category?.index === "armor" || details?.armor_class) {
        armorItems.push(item);
      }
    } catch (error) {
      // Se falhar, tentar verificar pelo nome/index como fallback
      const armorKeywords = [
        "armor",
        "armadura",
        "leather",
        "studded",
        "chain",
        "plate",
        "scale",
        "splint",
        "half",
        "breastplate",
        "padded",
        "hide",
      ];
      if (armorKeywords.some(
        (keyword) =>
          item.name.toLowerCase().includes(keyword) ||
          item.index.toLowerCase().includes(keyword)
      )) {
        armorItems.push(item);
      }
    }
  }

  if (armorItems.length === 0) {
    return { acUpdated: false };
  }

  // Processar primeira armadura encontrada
  const firstArmor = armorItems[0];
  
  try {
    // Buscar detalhes da armadura
    const armorDetail = await fetchArmorDetails(firstArmor.index);
    
    if (!armorDetail) {
      console.warn(`Could not fetch armor details for ${firstArmor.index}`);
      return { acUpdated: false };
    }

    // Criar descrição com informações de CA
    const baseAC = armorDetail.armor_class?.base || 10;
    const allowsDex = armorDetail.armor_class?.dex_bonus ?? true;
    const maxDex = armorDetail.armor_class?.max_bonus;
    
    let description = `CA base: ${baseAC}`;
    if (allowsDex) {
      if (maxDex !== undefined) {
        description += ` + DEX (máx. +${maxDex})`;
      } else {
        description += ` + DEX`;
      }
    }
    description += `\n\nCA: +${baseAC - 10}`; // Bônus sobre CA base de 10
    
    const [createdItem] = await db
      .insert(schema.items)
      .values({
        campaignId,
        ownerId,
        name: firstArmor.name,
        type: "Armor",
        rarity: "Common", // Padrão, pode ser ajustado depois
        weight: 1, // Padrão, pode ser ajustado depois
        quantity: firstArmor.quantity || 1,
        description,
        equipped: true, // Equipar automaticamente
      } as any)
      .returning();

    // Buscar classe do personagem para verificar Unarmored Defense
    const [characterData] = await db
      .select({
        characterClass: schema.characters.characterClass,
      })
      .from(schema.characters)
      .where(eq(schema.characters.id, characterId))
      .limit(1);

    // Verificar se o personagem tem Unarmored Defense da classe
    const unarmoredDefense = getUnarmoredDefenseType(characterData?.characterClass);

    // Buscar escudo equipado (se houver)
    const equippedShields = await db
      .select()
      .from(schema.items)
      .where(
        and(
          eq(schema.items.ownerId, ownerId),
          eq(schema.items.campaignId, campaignId),
          eq(schema.items.equipped, true)
        )
      );

    const hasShield = equippedShields.some((item) => {
      const nameLower = item.name.toLowerCase();
      return nameLower.includes("shield") || nameLower.includes("escudo");
    });

    // Calcular CA usando a função auxiliar
    const armorInfo = {
      baseAC,
      allowsDex,
      maxDex,
    };

    const attributes = characterAttributes || {};
    const newAC = calculateAC({
      characterAttributes: attributes,
      unarmoredDefense,
      equippedArmor: armorInfo,
      equippedShield: hasShield,
    });

    // Atualizar CA do personagem
    await db
      .update(schema.characters)
      .set({ armorClass: newAC })
      .where(eq(schema.characters.id, characterId));

    return {
      acUpdated: true,
      newAC,
    };
  } catch (error) {
    console.error("Error processing armor from inventory:", error);
    return { acUpdated: false };
  }
}

