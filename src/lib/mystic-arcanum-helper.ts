// Helper functions for Warlock Mystic Arcanum feature

/**
 * Get the Mystic Arcanum spell level that should be learned at a given character level
 * @param level - Character level
 * @returns Spell level (6, 7, 8, or 9) or null if no Mystic Arcanum at this level
 */
export function getMysticArcanumLevel(level: number): number | null {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    return null;
}

/**
 * Get the new Mystic Arcanum spell level to learn when leveling up
 * @param currentLevel - Current character level
 * @param newLevel - New level after level up
 * @returns Spell level to learn or null
 */
export function getNewMysticArcanumLevel(currentLevel: number, newLevel: number): number | null {
    const currentArcanum = getMysticArcanumLevel(currentLevel);
    const newArcanum = getMysticArcanumLevel(newLevel);

    // Return the new arcanum level if it's different from current
    if (newArcanum !== currentArcanum) {
        return newArcanum;
    }

    return null;
}

/**
 * Check if character needs to select a Mystic Arcanum spell
 * @param characterLevel - Current character level
 * @param mysticArcanum - Current mystic arcanum object
 * @returns True if needs to select
 */
export function needsMysticArcanum(characterLevel: number, mysticArcanum: any = {}): boolean {
    const arcanumLevel = getMysticArcanumLevel(characterLevel);
    if (!arcanumLevel) return false;

    // Check if already has this level's arcanum
    return !mysticArcanum[arcanumLevel.toString()];
}

/**
 * Get all Mystic Arcanum levels the character should have at a given level
 * @param level - Character level
 * @returns Array of spell levels [6, 7, 8, 9] that should be known
 */
export function getAllMysticArcanumLevels(level: number): number[] {
    const levels: number[] = [];

    if (level >= 11) levels.push(6);
    if (level >= 13) levels.push(7);
    if (level >= 15) levels.push(8);
    if (level >= 17) levels.push(9);

    return levels;
}
