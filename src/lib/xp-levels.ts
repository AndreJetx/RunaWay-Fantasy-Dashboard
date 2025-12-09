// Tabela de XP por nível - D&D 5e
export const XP_TABLE: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

/**
 * Calcula o nível baseado no XP total
 */
export function calculateLevel(xp: number): number {
  let level = 1;
  
  for (let i = 20; i >= 1; i--) {
    if (xp >= XP_TABLE[i]) {
      level = i;
      break;
    }
  }
  
  return Math.min(level, 20); // Máximo nível 20
}

/**
 * Retorna o XP necessário para o próximo nível
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 20) {
    return 0; // Já está no nível máximo
  }
  return XP_TABLE[currentLevel + 1];
}

/**
 * Retorna o XP necessário para o nível atual
 */
export function getXPForCurrentLevel(level: number): number {
  return XP_TABLE[level] || 0;
}

/**
 * Calcula o progresso para o próximo nível (0-100)
 */
export function getLevelProgress(currentXP: number, currentLevel: number): number {
  if (currentLevel >= 20) {
    return 100;
  }
  
  const xpForCurrentLevel = getXPForCurrentLevel(currentLevel);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = currentXP - xpForCurrentLevel;
  
  return Math.min(100, Math.max(0, Math.round((xpProgress / xpNeeded) * 100)));
}

