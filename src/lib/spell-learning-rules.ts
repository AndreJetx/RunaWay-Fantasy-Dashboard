// Regras de aprendizado de magias por classe - D&D 5e

export type SpellcastingClass = 
  | "Bardo" 
  | "Bruxo" 
  | "Clérigo" 
  | "Druida" 
  | "Feiticeiro" 
  | "Mago" 
  | "Paladino" 
  | "Patrulheiro";

/**
 * Tabela de truques conhecidos por classe e nível
 */
const CANTRIPS_KNOWN: Record<string, Record<number, number>> = {
  "Bardo": {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  "Clérigo": {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  },
  "Druida": {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  "Feiticeiro": {
    1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6
  },
  "Mago": {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  },
  "Bruxo": {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  "Paladino": {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
  },
  "Patrulheiro": {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
    11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0
  },
};

/**
 * Tabela de magias conhecidas por classe e nível
 * Para classes que usam "spells known" (não prepared)
 */
const SPELLS_KNOWN: Record<string, Record<number, number>> = {
  "Bardo": {
    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
  },
  "Feiticeiro": {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
    11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15
  },
  "Bruxo": {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15
  },
  "Patrulheiro": {
    1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11
  },
  "Paladino": {
    1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11
  },
};

/**
 * Retorna o total de truques conhecidos em um nível específico
 */
export function getTotalCantripsKnown(className: string, level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, level));
  return CANTRIPS_KNOWN[className]?.[normalizedLevel] || 0;
}

/**
 * Retorna o total de magias conhecidas em um nível específico
 * Retorna 0 para classes que usam "prepared spells" (Clérigo, Druida, Mago)
 */
export function getTotalSpellsKnown(className: string, level: number): number {
  const normalizedLevel = Math.max(1, Math.min(20, level));
  
  // Clérigo, Druida e Mago usam prepared spells, não spells known
  if (["Clérigo", "Druida", "Mago"].includes(className)) {
    return 0; // Eles preparam magias, não têm limite de conhecidas
  }
  
  return SPELLS_KNOWN[className]?.[normalizedLevel] || 0;
}

/**
 * Calcula quantos truques NOVOS podem ser aprendidos ao subir de nível
 */
export function getNewCantripsToLearn(className: string, currentLevel: number, previousLevel: number): number {
  const currentCantrips = getTotalCantripsKnown(className, currentLevel);
  const previousCantrips = getTotalCantripsKnown(className, previousLevel);
  return Math.max(0, currentCantrips - previousCantrips);
}

/**
 * Calcula quantas magias NOVAS podem ser aprendidas ao subir de nível
 */
export function getNewSpellsToLearn(className: string, currentLevel: number, previousLevel: number): number {
  const currentSpells = getTotalSpellsKnown(className, currentLevel);
  const previousSpells = getTotalSpellsKnown(className, previousLevel);
  
  // Classes que usam prepared spells não têm limite de spells known
  if (["Clérigo", "Druida", "Mago"].includes(className)) {
    // Para essas classes, usar regra simplificada:
    // Nível 1: 6 magias, outros níveis: 2 magias
    if (currentLevel === 1) return 6;
    return 2;
  }
  
  return Math.max(0, currentSpells - previousSpells);
}

/**
 * Verifica se a classe permite trocar magias ao subir de nível
 * No D&D 5e, algumas classes podem trocar uma magia conhecida por outra ao subir de nível
 */
export function canSwapSpells(className: string): boolean {
  // Bardo, Feiticeiro, Bruxo, Paladino e Patrulheiro podem trocar magias
  return ["Bardo", "Feiticeiro", "Bruxo", "Paladino", "Patrulheiro"].includes(className);
}

/**
 * Verifica se a classe usa "spells known" (vs prepared spells)
 */
export function usesSpellsKnown(className: string): boolean {
  return !["Clérigo", "Druida", "Mago"].includes(className);
}

/**
 * Retorna informações completas sobre aprendizado de magias para um level up
 */
export interface SpellLearningInfo {
  newCantrips: number;
  newSpells: number;
  totalCantrips: number;
  totalSpells: number;
  canSwap: boolean;
  usesKnown: boolean;
}

export function getSpellLearningInfo(
  className: string, 
  currentLevel: number, 
  previousLevel: number
): SpellLearningInfo {
  return {
    newCantrips: getNewCantripsToLearn(className, currentLevel, previousLevel),
    newSpells: getNewSpellsToLearn(className, currentLevel, previousLevel),
    totalCantrips: getTotalCantripsKnown(className, currentLevel),
    totalSpells: getTotalSpellsKnown(className, currentLevel),
    canSwap: canSwapSpells(className),
    usesKnown: usesSpellsKnown(className),
  };
}
