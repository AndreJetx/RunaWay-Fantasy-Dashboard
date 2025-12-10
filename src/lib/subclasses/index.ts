// Arquivo central que consolida todas as subclasses
// Importa de módulos separados para melhor organização

import { Subclass } from './types';
import { barbarianSubclasses } from './barbarian';
import { bardSubclasses } from './bard';
import { warlockPatrons, warlockPacts } from './warlock';
import { clericSubclasses } from './cleric';
import { druidSubclasses } from './druid';
import { sorcererSubclasses } from './sorcerer';
import { fighterSubclasses } from './fighter';
import { rogueSubclasses } from './rogue';
import { wizardSubclasses, monkSubclasses, paladinSubclasses, rangerSubclasses } from './remaining';

// Exportar tipos
export * from './types';

// Consolidar todas as subclasses
export const ALL_SUBCLASSES: Subclass[] = [
    ...barbarianSubclasses,
    ...bardSubclasses,
    ...warlockPatrons,
    ...warlockPacts,
    ...clericSubclasses,
    ...druidSubclasses,
    ...sorcererSubclasses,
    ...fighterSubclasses,
    ...rogueSubclasses,
    ...wizardSubclasses,
    ...monkSubclasses,
    ...paladinSubclasses,
    ...rangerSubclasses,
];

/**
 * Retorna subclasses disponíveis para uma classe
 * @param className - Nome da classe
 * @param type - Tipo de subclasse (apenas para Bruxo: 'patron' ou 'pact')
 */
export function getSubclassesByClass(className: string, type?: 'patron' | 'pact'): Subclass[] {
    return ALL_SUBCLASSES.filter(s => {
        if (s.className !== className) return false;
        if (type && s.type !== type) return false;
        return true;
    });
}

/**
 * Retorna uma subclasse específica pelo nome
 */
export function getSubclass(name: string): Subclass | undefined {
    return ALL_SUBCLASSES.find(s => s.name === name);
}

/**
 * Retorna o nível em que uma classe ganha subclasse
 */
export function getSubclassLevel(className: string): number {
    const subclassLevels: Record<string, number> = {
        'Bárbaro': 3,
        'Bardo': 3,
        'Bruxo': 1, // Patrono no nível 1, Pacto no nível 3
        'Clérigo': 1,
        'Druida': 2,
        'Feiticeiro': 1,
        'Guerreiro': 3,
        'Ladino': 3,
        'Mago': 2,
        'Monge': 3,
        'Paladino': 3,
        'Patrulheiro': 3,
    };

    return subclassLevels[className] || 3;
}

/**
 * Verifica se o personagem precisa escolher uma subclasse
 */
export function needsSubclassSelection(
    className: string,
    level: number,
    currentSubclass?: string,
    currentPact?: string
): boolean {
    const subclassLevel = getSubclassLevel(className);

    // Caso especial: Bruxo
    if (className === 'Bruxo') {
        // Nível 1: precisa de Patrono
        if (level === 1 && !currentSubclass) return true;
        // Nível 3: precisa de Pacto
        if (level === 3 && !currentPact) return true;
        return false;
    }

    // Outras classes: verifica se atingiu o nível e não tem subclasse
    return level >= subclassLevel && !currentSubclass;
}

/**
 * Retorna as features de uma subclasse em um nível específico
 */
export function getSubclassFeaturesAtLevel(subclassName: string, level: number) {
    const subclass = getSubclass(subclassName);
    if (!subclass) return [];

    return subclass.features.filter(f => f.level === level);
}

/**
 * Retorna os benefícios de uma subclasse em um nível específico
 */
export function getSubclassBenefitsAtLevel(subclassName: string, level: number) {
    const subclass = getSubclass(subclassName);
    if (!subclass) return [];

    return subclass.benefits.filter(b => b.level <= level);
}

/**
 * Retorna um resumo dos benefícios que serão aplicados
 */
export function getSubclassBenefitsSummary(
    subclass: Subclass,
    level: number
): {
    skills: string[];
    proficiencies: string[];
    languages: string[];
    spells: string[];
    features: string[];
    resistances: string[];
    choices: Array<{ type: string; description: string }>;
} {
    const summary = {
        skills: [] as string[],
        proficiencies: [] as string[],
        languages: [] as string[],
        spells: [] as string[],
        features: [] as string[],
        resistances: [] as string[],
        choices: [] as Array<{ type: string; description: string }>,
    };

    const benefits = subclass.benefits.filter(b => b.level <= level);

    for (const benefit of benefits) {
        const value = benefit.value;
        const description = benefit.description || '';

        // Verificar se é uma escolha
        if (typeof value === 'string' && value.startsWith('choose-')) {
            summary.choices.push({
                type: benefit.type,
                description: description || value,
            });
            continue;
        }

        // Adicionar ao resumo apropriado
        switch (benefit.type) {
            case 'skill':
                if (Array.isArray(value)) {
                    summary.skills.push(...value);
                } else if (typeof value === 'string') {
                    summary.skills.push(value);
                }
                break;
            case 'proficiency':
                if (Array.isArray(value)) {
                    summary.proficiencies.push(...value);
                } else if (typeof value === 'string') {
                    summary.proficiencies.push(value);
                }
                break;
            case 'language':
                if (Array.isArray(value)) {
                    summary.languages.push(...value);
                } else if (typeof value === 'string') {
                    summary.languages.push(value);
                }
                break;
            case 'spell':
                if (Array.isArray(value)) {
                    summary.spells.push(...value);
                } else if (typeof value === 'string') {
                    summary.spells.push(value);
                }
                break;
            case 'feature':
                if (Array.isArray(value)) {
                    summary.features.push(...value);
                } else if (typeof value === 'string') {
                    summary.features.push(value);
                }
                break;
            case 'resistance':
                if (Array.isArray(value)) {
                    summary.resistances.push(...value);
                } else if (typeof value === 'string') {
                    summary.resistances.push(value);
                }
                break;
        }
    }

    return summary;
}
