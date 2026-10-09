export const STANDARD_LANGUAGES = [
    "Comum",
    "Anão",
    "Élfico",
    "Gigante",
    "Gnômico",
    "Goblin",
    "Halfling",
    "Orc"
] as const;

export const EXOTIC_LANGUAGES = [
    "Abissal",
    "Celestial",
    "Dracônico",
    "Dialeto Subterrâneo", // Deep Speech
    "Infernal",
    "Primordial",
    "Silvestre",
    "Subterrâneo" // Undercommon
] as const;

export const ALL_LANGUAGES = [...STANDARD_LANGUAGES, ...EXOTIC_LANGUAGES];

export type Language = typeof ALL_LANGUAGES[number];

/**
 * Retorna se um idioma é exótico ou não
 */
export function isExotic(lang: string): boolean {
    return EXOTIC_LANGUAGES.includes(lang as any);
}
