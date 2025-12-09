// Tabela de slots de magia por classe e nível - D&D 5e

export type SpellcastingClass = 
  | "Bardo" 
  | "Bruxo" 
  | "Clérigo" 
  | "Druida" 
  | "Feiticeiro" 
  | "Mago" 
  | "Paladino" 
  | "Patrulheiro";

export interface SpellSlots {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

// Tabela completa de slots de magia para classes full caster (Bardo, Clérigo, Druida, Feiticeiro, Mago)
const FULL_CASTER_SLOTS: Record<number, SpellSlots> = {
  1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 1, level7: 1, level8: 1, level9: 1 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 1, level8: 1, level9: 1 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 2, level8: 1, level9: 1 },
};

// Tabela para half caster (Paladino, Patrulheiro)
const HALF_CASTER_SLOTS: Record<number, SpellSlots> = {
  1: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
};

// Bruxo usa pact magic (slots diferentes)
const WARLOCK_SLOTS: Record<number, SpellSlots> = {
  1: { level1: 1, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 0, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 0, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 0, level2: 0, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 0, level2: 0, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 0, level2: 0, level3: 0, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 0, level2: 0, level3: 0, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  12: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  13: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  14: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  15: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  16: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 3, level6: 0, level7: 0, level8: 0, level9: 0 },
  17: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  18: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  19: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
  20: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 4, level6: 0, level7: 0, level8: 0, level9: 0 },
};

/**
 * Retorna os slots de magia para uma classe e nível específicos
 */
export function getSpellSlots(className: string, level: number): SpellSlots | null {
  const normalizedLevel = Math.max(1, Math.min(20, level));
  
  // Classes que não conjuram magias
  const nonSpellcasters = ["Bárbaro", "Guerreiro", "Ladino", "Monge"];
  if (nonSpellcasters.includes(className)) {
    return null;
  }
  
  // Bruxo usa pact magic
  if (className === "Bruxo") {
    return WARLOCK_SLOTS[normalizedLevel] || WARLOCK_SLOTS[1];
  }
  
  // Half casters (Paladino, Patrulheiro)
  if (className === "Paladino" || className === "Patrulheiro") {
    return HALF_CASTER_SLOTS[normalizedLevel] || HALF_CASTER_SLOTS[1];
  }
  
  // Full casters (Bardo, Clérigo, Druida, Feiticeiro, Mago)
  if (["Bardo", "Clérigo", "Druida", "Feiticeiro", "Mago"].includes(className)) {
    return FULL_CASTER_SLOTS[normalizedLevel] || FULL_CASTER_SLOTS[1];
  }
  
  return null;
}

/**
 * Retorna o nível de conjuração para uma classe e nível específicos
 */
export function getSpellcastingLevel(className: string, level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, level));
  
  // Bruxo sempre usa o nível do personagem
  if (className === "Bruxo") {
    return normalizedLevel;
  }
  
  // Half casters usam metade do nível (arredondado para cima)
  if (className === "Paladino" || className === "Patrulheiro") {
    return Math.ceil(normalizedLevel / 2);
  }
  
  // Full casters usam o nível completo
  if (["Bardo", "Clérigo", "Druida", "Feiticeiro", "Mago"].includes(className)) {
    return normalizedLevel;
  }
  
  return 0;
}

/**
 * Verifica se uma classe pode conjurar magias
 */
export function canCastSpells(className: string): boolean {
  return !["Bárbaro", "Guerreiro", "Ladino", "Monge"].includes(className);
}

/**
 * Retorna a quantidade de truques (cantrips) para uma classe no nível 1
 */
export function getCantripsCount(className: string, level: number = 1): number {
  if (level < 1) return 0;
  
  const cantripsTable: Record<string, number> = {
    "Bardo": 2,
    "Clérigo": 3,
    "Druida": 2,
    "Mago": 3,
    "Bruxo": 2,
    "Paladino": 0,
    "Patrulheiro": 0,
    "Feiticeiro": 2, // Assumindo 2 para Feiticeiro (não estava na tabela)
  };
  
  return cantripsTable[className] || 0;
}

/**
 * Retorna a quantidade de magias para uma classe no nível 1
 * Retorna um número ou uma string com fórmula (ex: "1 + WIS_mod")
 */
export function getSpellsCount(className: string, level: number = 1, wisdomModifier?: number): number | string {
  if (level < 1) return 0;
  
  const spellsTable: Record<string, number | string> = {
    "Bardo": 4,
    "Clérigo": "1 + WIS_mod",
    "Druida": "1 + WIS_mod",
    "Mago": 6,
    "Bruxo": 2,
    "Paladino": 0,
    "Patrulheiro": 0,
    "Feiticeiro": 2, // Assumindo 2 para Feiticeiro (não estava na tabela)
  };
  
  const spellsValue = spellsTable[className] || 0;
  
  // Se for uma fórmula, calcular
  if (typeof spellsValue === "string" && spellsValue.includes("WIS_mod")) {
    if (wisdomModifier === undefined) {
      return spellsValue; // Retorna a fórmula se não tiver modificador
    }
    return 1 + wisdomModifier;
  }
  
  return spellsValue as number;
}

/**
 * Retorna o tipo de sistema de magias para uma classe
 */
export function getSpellType(className: string): "known" | "prepared" | "spellbook" | "pact" | "none" {
  const typeTable: Record<string, "known" | "prepared" | "spellbook" | "pact" | "none"> = {
    "Bardo": "known",
    "Clérigo": "prepared",
    "Druida": "prepared",
    "Mago": "spellbook",
    "Bruxo": "pact",
    "Paladino": "none",
    "Patrulheiro": "none",
    "Feiticeiro": "known", // Assumindo known para Feiticeiro
  };
  
  return typeTable[className] || "none";
}

