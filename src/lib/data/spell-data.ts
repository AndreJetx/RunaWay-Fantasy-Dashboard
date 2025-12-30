/**
 * Spell Data Helper
 * Funções para acessar a base de dados local de magias
 */

import allSpellsData from '@/data/spells/all-spells.json';
import spellsByClassData from '@/data/spells/spells-by-class.json';

export interface SpellData {
    index: string;
    name: string;
    level: number;
    school: string;
    classes: string[];
    description: string;
    descriptionPT?: string;
    namePT?: string;
    higherLevel?: string;
    range: string;
    components: string[];
    material?: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    castingTime: string;
    damage?: any;
    dc?: any;
    area_of_effect?: any;
}

/**
 * Retorna a descrição traduzida de uma magia
 */
export function getTranslatedDescription(spellName: string, locale: 'pt-BR' | 'es' = 'pt-BR'): string | undefined {
    const allSpells = getAllSpells();

    // Tentar encontrar pelo nome original ou pelo nome traduzido
    const spell = Object.values(allSpells).find(s =>
        s.name.toLowerCase() === spellName.toLowerCase() ||
        s.namePT?.toLowerCase() === spellName.toLowerCase()
    );

    if (!spell) return undefined;

    if (locale === 'pt-BR') {
        return spell.descriptionPT || spell.description;
    }

    return spell.description;
}

/**
 * Retorna todas as magias
 */
export function getAllSpells(): Record<string, SpellData> {
    return allSpellsData as Record<string, SpellData>;
}

/**
 * Retorna detalhes de uma magia específica
 */
export function getSpellDetails(spellIndex: string): SpellData | null {
    const allSpells = getAllSpells();
    return allSpells[spellIndex] || null;
}

/**
 * Retorna todas as magias de uma classe específica
 * @param className Nome da classe em inglês (Paladin, Cleric, etc.)
 * @param maxLevel Nível máximo de magia para filtrar
 */
export function getSpellsByClass(className: string, maxLevel?: number): string[] {
    const spellsByClass = spellsByClassData as Record<string, Record<string, string[]>>;
    const classSpells = spellsByClass[className];

    if (!classSpells) {
        return [];
    }

    const allClassSpells: string[] = [];

    for (let level = 0; level <= (maxLevel || 9); level++) {
        const levelKey = `level${level}`;
        if (classSpells[levelKey]) {
            allClassSpells.push(...classSpells[levelKey]);
        }
    }

    return allClassSpells;
}

/**
 * Mapeia nomes de classes PT-BR para EN
 */
const CLASS_NAME_MAP: Record<string, string> = {
    'Paladino': 'Paladin',
    'Clérigo': 'Cleric',
    'Druida': 'Druid',
    'Mago': 'Wizard',
    'Ranger': 'Ranger',
    'Bruxo': 'Warlock',
    'Bardo': 'Bard',
    'Feiticeiro': 'Sorcerer',
    'Guerreiro': 'Fighter',
    'Ladino': 'Rogue',
    'Bárbaro': 'Barbarian',
    'Monge': 'Monk',
};

/**
 * Retorna magias de uma classe (aceita nome em PT-BR)
 */
export function getSpellsByClassPTBR(className: string, maxLevel?: number): string[] {
    const englishName = CLASS_NAME_MAP[className];
    if (!englishName) {
        console.warn(`Classe não encontrada: ${className}`);
        return [];
    }
    return getSpellsByClass(englishName, maxLevel);
}

/**
 * Filtra magias por nível
 */
export function filterSpellsByLevel(spellIndices: string[], level: number): string[] {
    const allSpells = getAllSpells();
    return spellIndices.filter(index => {
        const spell = allSpells[index];
        return spell && spell.level === level;
    });
}

/**
 * Agrupa magias por nível
 */
export function groupSpellsByLevel(spellIndices: string[]): Record<number, string[]> {
    const allSpells = getAllSpells();
    const grouped: Record<number, string[]> = {};

    for (const index of spellIndices) {
        const spell = allSpells[index];
        if (spell) {
            if (!grouped[spell.level]) {
                grouped[spell.level] = [];
            }
            grouped[spell.level].push(index);
        }
    }

    return grouped;
}
