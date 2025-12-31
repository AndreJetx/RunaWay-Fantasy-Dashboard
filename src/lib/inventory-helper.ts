/**
 * Helper para processar inventário do personagem e criar itens na tabela items
 */

import { db, schema } from "@/lib/db";
import { eq, desc, and, inArray } from "drizzle-orm";
import { calculateAC } from "@/lib/ac-calculator";
import { getUnarmoredDefenseType } from "@/lib/class-ac-helper";

const DND_API_BASE = "https://www.dnd5eapi.co";

interface InventoryItem {
  index: string;
  name: string;
  quantity?: number;
  cost?: number;
}

interface EquipmentDetail {
  equipment_category?: {
    index: string;
    name: string;
  };
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc?: string[];
}

/**
 * Busca detalhes de um item da API D&D
 */
async function fetchItemDetails(itemIndex: string): Promise<EquipmentDetail | null> {
  try {
    const res = await fetch(`${DND_API_BASE}/api/2014/equipment/${itemIndex}`);
    if (!res.ok) {
      console.warn(`Failed to fetch item ${itemIndex}: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching item details for ${itemIndex}:`, error);
    return null;
  }
}

/**
 * Determina o tipo do item baseado na categoria
 */
function getItemType(details: EquipmentDetail | null, itemName: string): string {
  if (!details) {
    // Fallback: tentar determinar pelo nome
    const nameLower = itemName.toLowerCase();
    if (nameLower.includes("armor") || nameLower.includes("armadura")) return "Armor";
    if (nameLower.includes("sword") || nameLower.includes("weapon") || nameLower.includes("arma")) return "Weapon";
    if (nameLower.includes("potion") || nameLower.includes("poção")) return "Consumable";
    return "Other";
  }

  const category = details.equipment_category?.index || "";

  if (category === "armor" || details.armor_class) return "Armor";
  if (category === "weapon" || category.includes("weapon")) return "Weapon";
  if (category === "adventuring-gear" || category === "tools") return "Other";
  if (category === "consumable") return "Consumable";

  return "Other";
}

/**
 * Processa todos os itens do inventário e cria na tabela items
 */
export async function processInventoryToItems(
  characterId: string,
  campaignId: string | null, // Allow null for standalone characters
  ownerId: string,
  inventory: InventoryItem[],
  characterAttributes: any
): Promise<{ itemsCreated: number; acUpdated: boolean; newAC?: number; duplicatesRemoved?: number }> {
  console.log("processInventoryToItems called:", {
    characterId,
    campaignId,
    ownerId,
    inventoryLength: inventory?.length || 0,
    inventorySample: inventory?.slice(0, 2),
  });

  if (!inventory || inventory.length === 0) {
    console.log("Inventory is empty or null");
    return { itemsCreated: 0, acUpdated: false };
  }

  // Limpar duplicatas existentes antes de processar
  // Agrupar itens existentes por nome (case-insensitive) e manter apenas o mais recente (ou o equipado)
  const existingItems = await db
    .select()
    .from(schema.items)
    .where(
      campaignId
        ? and(
          eq(schema.items.campaignId, campaignId),
          eq(schema.items.ownerId, ownerId)
        )
        : eq(schema.items.ownerId, ownerId) // For standalone characters, only filter by owner
    );

  // Ordenar manualmente para priorizar equipados e depois por data de criação
  existingItems.sort((a, b) => {
    if (a.equipped && !b.equipped) return -1;
    if (!a.equipped && b.equipped) return 1;
    // Se ambos têm mesmo status de equipado, manter o mais recente
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Mais recente primeiro
  });

  const itemsByName = new Map<string, typeof existingItems[0]>();
  const duplicatesToDelete: string[] = [];

  for (const item of existingItems) {
    const key = item.name.toLowerCase().trim();
    if (itemsByName.has(key)) {
      const existing = itemsByName.get(key)!;
      // Se o item atual está equipado e o existente não, trocar
      if (item.equipped && !existing.equipped) {
        duplicatesToDelete.push(existing.id);
        itemsByName.set(key, item);
      } else {
        // Se o existente está equipado ou ambos não estão, manter o existente e deletar o atual
        duplicatesToDelete.push(item.id);
      }
    } else {
      itemsByName.set(key, item);
    }
  }

  // Deletar duplicatas
  let duplicatesRemoved = 0;
  if (duplicatesToDelete.length > 0) {
    // Deletar em lotes para evitar problemas com muitos IDs
    const batchSize = 100;
    for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
      const batch = duplicatesToDelete.slice(i, i + batchSize);
      if (batch.length === 1) {
        await db
          .delete(schema.items)
          .where(eq(schema.items.id, batch[0]));
      } else {
        await db
          .delete(schema.items)
          .where(inArray(schema.items.id, batch));
      }
      duplicatesRemoved += batch.length;
    }
    console.log(`Removidas ${duplicatesRemoved} duplicatas existentes`);
  }

  let itemsCreated = 0;
  let firstArmor: { item: InventoryItem; details: EquipmentDetail } | null = null;

  // Agrupar itens por nome para evitar duplicatas
  const itemsMap = new Map<string, InventoryItem>();
  for (const item of inventory) {
    const key = item.name.toLowerCase().trim();
    if (itemsMap.has(key)) {
      // Se já existe, somar a quantidade
      const existing = itemsMap.get(key)!;
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
      // Criar nova entrada
      itemsMap.set(key, { ...item, quantity: item.quantity || 1 });
    }
  }

  const uniqueItems = Array.from(itemsMap.values());
  console.log(`Agrupados ${inventory.length} itens em ${uniqueItems.length} itens únicos`);

  // Processar todos os itens únicos
  for (const item of uniqueItems) {
    try {
      // Verificar se o item tem index (necessário para buscar na API)
      if (!item.index) {
        console.warn(`Item "${item.name}" não tem campo 'index', criando sem detalhes da API`);
        // Criar item sem buscar detalhes da API
        const itemType = getItemType(null, item.name);

        // Verificar se já existe (buscar todos e comparar case-insensitive)
        const allExistingItems = campaignId
          ? await db
            .select()
            .from(schema.items)
            .where(
              and(
                eq(schema.items.campaignId, campaignId),
                eq(schema.items.ownerId, ownerId)
              )
            )
          : await db
            .select()
            .from(schema.items)
            .where(eq(schema.items.ownerId, ownerId));

        const existing = allExistingItems.find(
          (i) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (existing) {
          // Atualizar quantidade se já existe
          await db
            .update(schema.items)
            .set({ quantity: existing.quantity + (item.quantity || 1) })
            .where(eq(schema.items.id, existing.id));
          console.log(`Item "${item.name}" já existe, quantidade atualizada`);
          itemsCreated++;
          continue;
        }

        // Criar item sem detalhes da API
        await db
          .insert(schema.items)
          .values({
            campaignId,
            ownerId,
            name: item.name,
            type: itemType,
            rarity: "Common",
            weight: "1",
            quantity: item.quantity || 1,
            description: null,
            equipped: false,
          } as any);

        console.log(`Item criado sem index: ${item.name} (${itemType})`);
        itemsCreated++;
        continue;
      }

      // Buscar detalhes do item
      const details = await fetchItemDetails(item.index);

      const itemType = getItemType(details, item.name);
      const weight = details?.weight ? details.weight.toString() : "1";

      // Criar descrição
      let description = "";
      if (details?.desc && details.desc.length > 0) {
        description = details.desc.join("\n\n");
      }

      // Se for armadura, adicionar informações de CA
      if (itemType === "Armor" && details?.armor_class) {
        const baseAC = details.armor_class.base || 10;
        const allowsDex = details.armor_class.dex_bonus ?? true;
        const maxDex = details.armor_class.max_bonus;

        let acInfo = `CA base: ${baseAC}`;
        if (allowsDex) {
          if (maxDex !== undefined) {
            acInfo += ` + DEX (máx. +${maxDex})`;
          } else {
            acInfo += ` + DEX`;
          }
        }
        acInfo += `\n\nCA: +${baseAC - 10}`;

        description = description
          ? `${description}\n\n${acInfo}`
          : acInfo;

        // Guardar primeira armadura para equipar depois
        if (!firstArmor) {
          firstArmor = { item, details };
        }
      }

      // Verificar se o item já existe antes de criar (comparação case-insensitive)
      const existingItems = campaignId
        ? await db
          .select()
          .from(schema.items)
          .where(
            and(
              eq(schema.items.campaignId, campaignId),
              eq(schema.items.ownerId, ownerId)
            )
          )
        : await db
          .select()
          .from(schema.items)
          .where(eq(schema.items.ownerId, ownerId));

      // Buscar item com mesmo nome (case-insensitive)
      const existing = existingItems.find(
        (i) => i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
      );

      if (existing) {
        // Atualizar quantidade se já existe
        await db
          .update(schema.items)
          .set({ quantity: existing.quantity + (item.quantity || 1) })
          .where(eq(schema.items.id, existing.id));
        console.log(`Item "${item.name}" já existe, quantidade atualizada de ${existing.quantity} para ${existing.quantity + (item.quantity || 1)}`);
        itemsCreated++;
        continue;
      }

      // Criar item no banco de dados
      await db
        .insert(schema.items)
        .values({
          campaignId,
          ownerId,
          name: item.name,
          type: itemType,
          rarity: "Common", // Padrão
          weight,
          quantity: item.quantity || 1,
          description: description || null,
          equipped: false, // Será equipado depois se for armadura
        } as any);

      console.log(`Item criado: ${item.name} (${itemType})`);
      itemsCreated++;
    } catch (error) {
      console.error(`Error processing item ${item.name}:`, error);
      // Continuar processando outros itens
    }
  }

  // Se encontrou uma armadura, equipar automaticamente e atualizar CA
  let acUpdated = false;
  let newAC: number | undefined = undefined;

  if (firstArmor) {
    try {
      // Primeiro, desequipar todas as armaduras existentes deste personagem
      if (campaignId) {
        await db
          .update(schema.items)
          .set({ equipped: false })
          .where(
            and(
              eq(schema.items.ownerId, ownerId),
              eq(schema.items.campaignId, campaignId),
              eq(schema.items.type, "Armor")
            )
          );
      } else {
        await db
          .update(schema.items)
          .set({ equipped: false })
          .where(
            and(
              eq(schema.items.ownerId, ownerId),
              eq(schema.items.type, "Armor")
            )
          );
      }

      // Buscar o item criado (primeira armadura) - buscar pelo nome (case-insensitive)
      const allArmorItems = campaignId
        ? await db
          .select()
          .from(schema.items)
          .where(
            and(
              eq(schema.items.ownerId, ownerId),
              eq(schema.items.campaignId, campaignId),
              eq(schema.items.type, "Armor")
            )
          )
        : await db
          .select()
          .from(schema.items)
          .where(
            and(
              eq(schema.items.ownerId, ownerId),
              eq(schema.items.type, "Armor")
            )
          );

      // Encontrar a armadura pelo nome (case-insensitive)
      const armorItem = allArmorItems.find(
        (i) => i.name.toLowerCase().trim() === firstArmor.item.name.toLowerCase().trim()
      );

      if (armorItem && armorItem.type === "Armor") {
        // Equipar apenas esta armadura
        await db
          .update(schema.items)
          .set({ equipped: true })
          .where(eq(schema.items.id, armorItem.id));

        // Buscar escudo equipado (se houver)
        const equippedShields = campaignId
          ? await db
            .select()
            .from(schema.items)
            .where(
              and(
                eq(schema.items.ownerId, ownerId),
                eq(schema.items.campaignId, campaignId),
                eq(schema.items.equipped, true)
              )
            )
          : await db
            .select()
            .from(schema.items)
            .where(
              and(
                eq(schema.items.ownerId, ownerId),
                eq(schema.items.equipped, true)
              )
            );

        const hasShield = equippedShields.some((item) => {
          const nameLower = item.name.toLowerCase();
          return nameLower.includes("shield") || nameLower.includes("escudo");
        });

        // Calcular CA usando a função auxiliar
        // Tentar buscar detalhes da armadura para obter informações de AC
        const armDetails = await fetchItemDetails(firstArmor.item.index);
        const armorInfo = armDetails?.armor_class ? {
          baseAC: armDetails.armor_class.base || 10,
          allowsDex: armDetails.armor_class.dex_bonus ?? true,
          maxDex: armDetails.armor_class.max_bonus,
        } : undefined;

        // Buscar personagem para verificar Unarmored Defense (se houver)
        const [characterData] = await db
          .select({
            characterClass: schema.characters.characterClass,
          })
          .from(schema.characters)
          .where(eq(schema.characters.id, characterId))
          .limit(1);

        // Verificar se o personagem tem Unarmored Defense da classe
        const unarmoredDefense = getUnarmoredDefenseType(characterData?.characterClass);

        console.log("Sync inventory - Character data:", {
          characterClass: characterData?.characterClass,
          unarmoredDefense,
          characterAttributes,
          armorInfo,
          hasShield,
        });

        newAC = calculateAC({
          characterAttributes: characterAttributes || {},
          unarmoredDefense,
          equippedArmor: armorInfo,
          equippedShield: hasShield,
        });

        // Atualizar CA do personagem
        await db
          .update(schema.characters)
          .set({ armorClass: newAC })
          .where(eq(schema.characters.id, characterId));

        acUpdated = true;
        console.log(`Armadura "${firstArmor.item.name}" equipada:`, {
          armorBaseAC: armorInfo?.baseAC || 10,
          allowsDex: armorInfo?.allowsDex ?? true,
          maxDex: armorInfo?.maxDex,
          hasShield,
          finalAC: newAC,
        });
      }
    } catch (error) {
      console.error("Error equipping armor:", error);
    }
  }

  console.log("processInventoryToItems completed:", {
    itemsCreated,
    acUpdated,
    newAC,
    duplicatesRemoved,
    firstArmorFound: !!firstArmor,
  });

  return { itemsCreated, acUpdated, newAC, duplicatesRemoved };
}

