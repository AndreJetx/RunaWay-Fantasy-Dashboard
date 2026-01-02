// Helper function to calculate initiative bonuses from feats and other sources

/**
 * Calculate total initiative for a character
 * @param dexterityModifier - Character's Dexterity modifier
 * @param feats - Array of character's feats
 * @returns Total initiative bonus
 */
export function calculateInitiativeBonus(
    dexterityModifier: number,
    feats: any[] = []
): number {
    let initiative = dexterityModifier;

    // Check for Alert feat (+5 to initiative)
    const hasAlert = feats.some(
        (f: any) =>
            f.name === "Alerta" ||
            f.name === "Alert"
    );

    if (hasAlert) {
        initiative += 5;
    }

    return initiative;
}

/**
 * Get initiative bonus breakdown for display
 * @param dexterityModifier - Character's Dexterity modifier
 * @param feats - Array of character's feats
 * @returns Object with base, feat bonuses, and total
 */
export function getInitiativeBreakdown(
    dexterityModifier: number,
    feats: any[] = []
): {
    base: number;
    featBonus: number;
    total: number;
    details: string[];
} {
    const base = dexterityModifier;
    let featBonus = 0;
    const details: string[] = [];

    // Check for Alert feat
    const hasAlert = feats.some(
        (f: any) =>
            f.name === "Alerta" ||
            f.name === "Alert"
    );

    if (hasAlert) {
        featBonus += 5;
        details.push("Alerta: +5");
    }

    return {
        base,
        featBonus,
        total: base + featBonus,
        details
    };
}
