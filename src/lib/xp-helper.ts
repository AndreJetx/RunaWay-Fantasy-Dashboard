// D&D 5e Experience Points by Level
// Based on official D&D 5e Player's Handbook

export const XP_BY_LEVEL: Record<number, number> = {
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
 * Get the minimum XP required for a given level
 * @param level Character level (1-20)
 * @returns XP required for that level
 */
export function getXPForLevel(level: number): number {
    if (level < 1 || level > 20) {
        return 0;
    }
    return XP_BY_LEVEL[level] || 0;
}

/**
 * Determine if a character should have needsLevelUp enabled
 * Characters created above level 1 should have this flag set
 * @param level Starting level
 * @returns true if level > 1
 */
export function shouldEnableLevelUp(level: number): boolean {
    return level > 1;
}

/**
 * Get the level for a given XP amount
 * @param xp Current experience points
 * @returns Current level based on XP
 */
export function getLevelFromXP(xp: number): number {
    const levels = Object.keys(XP_BY_LEVEL)
        .map(Number)
        .sort((a, b) => b - a); // Sort descending

    for (const level of levels) {
        if (xp >= XP_BY_LEVEL[level]) {
            return level;
        }
    }
    return 1;
}

/**
 * Get XP needed for next level
 * @param currentLevel Current character level
 * @returns XP needed to reach next level, or 0 if max level
 */
export function getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= 20) {
        return 0;
    }
    return XP_BY_LEVEL[currentLevel + 1] || 0;
}
