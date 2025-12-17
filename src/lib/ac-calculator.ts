/**
 * Calcula o CA (Armor Class) seguindo as regras de D&D 5e:
 * - Armaduras SUBSTITUEM o CA natural, não somam
 * - Escudos SOMAM +2 ao CA escolhido
 * - Sempre usar o maior CA disponível (natural vs armadura)
 */

interface CharacterAttributes {
  dexterity?: number;
  constitution?: number;
  wisdom?: number;
}

interface ArmorDetails {
  base: number;
  dex_bonus?: boolean;
  max_bonus?: number;
}

interface CalculateACOptions {
  characterAttributes: CharacterAttributes;
  unarmoredDefense?: {
    type: "CON" | "WIS";
  };
  equippedArmor?: {
    baseAC: number;
    allowsDex: boolean;
    maxDex?: number;
  };
  equippedShield?: boolean;
}

/**
 * Calcula o CA natural do personagem (sem armadura)
 */
function calculateNaturalAC(
  attributes: CharacterAttributes,
  unarmoredDefense?: { type: "CON" | "WIS" }
): number {
  const dexterity = attributes.dexterity || 10;
  const dexModifier = Math.floor((dexterity - 10) / 2);

  // Se tem Unarmored Defense (Monge/Bárbaro)
  if (unarmoredDefense) {
    if (unarmoredDefense.type === "CON") {
      const constitution = attributes.constitution || 10;
      const conModifier = Math.floor((constitution - 10) / 2);
      return 10 + dexModifier + conModifier;
    } else if (unarmoredDefense.type === "WIS") {
      const wisdom = attributes.wisdom || 10;
      const wisModifier = Math.floor((wisdom - 10) / 2);
      return 10 + dexModifier + wisModifier;
    }
  }

  // CA natural padrão: 10 + DEX
  return 10 + dexModifier;
}

/**
 * Calcula o CA com armadura equipada
 */
function calculateArmorAC(
  armorBaseAC: number,
  attributes: CharacterAttributes,
  allowsDex: boolean,
  maxDex?: number
): number {
  const dexterity = attributes.dexterity || 10;
  const dexModifier = Math.floor((dexterity - 10) / 2);

  if (allowsDex) {
    // Armaduras leves/médias: CA base + DEX (limitado se houver max)
    const dexBonus = maxDex !== undefined
      ? Math.min(dexModifier, maxDex)
      : dexModifier;
    return armorBaseAC + dexBonus;
  } else {
    // Armaduras pesadas: CA fixo, sem DEX
    return armorBaseAC;
  }
}

/**
 * Calcula o CA final do personagem
 */
export function calculateAC(options: CalculateACOptions): number {
  const {
    characterAttributes,
    unarmoredDefense,
    equippedArmor,
    equippedShield,
  } = options;

  // Calcular CA natural
  const naturalAC = calculateNaturalAC(characterAttributes, unarmoredDefense);

  // Calcular CA com armadura (se houver)
  let armorAC: number | null = null;
  if (equippedArmor) {
    armorAC = calculateArmorAC(
      equippedArmor.baseAC,
      characterAttributes,
      equippedArmor.allowsDex,
      equippedArmor.maxDex
    );
  }

  // Escolher o maior CA (natural ou armadura)
  const baseAC = armorAC !== null ? Math.max(naturalAC, armorAC) : naturalAC;

  // Adicionar bônus de escudo (+2)
  const shieldBonus = equippedShield ? 2 : 0;

  const finalAC = baseAC + shieldBonus;

  // Log para debug
  console.log("calculateAC debug:", {
    characterAttributes,
    unarmoredDefense,
    naturalAC,
    armorAC,
    baseAC,
    shieldBonus,
    finalAC,
  });

  return finalAC;
}

/**
 * Extrai informações de armadura da descrição do item
 */
export function parseArmorDescription(description: string | null): {
  baseAC: number;
  allowsDex: boolean;
  maxDex?: number;
} | null {
  if (!description) return null;

  // Procurar por "CA base: X"
  const baseMatch = description.match(/CA\s*base[:\s]+(\d+)/i);
  if (!baseMatch) return null;

  const baseAC = parseInt(baseMatch[1], 10);

  // Verificar se permite DEX
  const allowsDex = description.includes("+ DEX");
  
  // Verificar limite de DEX
  let maxDex: number | undefined = undefined;
  const maxDexMatch = description.match(/máx\.\s*\+(\d+)/i);
  if (maxDexMatch) {
    maxDex = parseInt(maxDexMatch[1], 10);
  }

  return { baseAC, allowsDex, maxDex };
}

/**
 * Verifica se um item é um escudo baseado no nome
 */
export function isShield(itemName: string): boolean {
  const nameLower = itemName.toLowerCase();
  return nameLower.includes("shield") || 
         nameLower.includes("escudo") ||
         nameLower === "shield" ||
         nameLower === "escudo";
}

