// Sistema de aplicação automática de benefícios de subclasses e antecedentes

import { Subclass, SubclassBenefit } from './subclasses/types';
import { Background } from './backgrounds';

// Tipo para representar um personagem (simplificado)
export interface Character {
    name: string;
    characterClass: string;
    level: number;
    subclass?: string;
    pact?: string; // Apenas para Bruxo
    background?: string;

    // Atributos que serão modificados
    skills?: Record<string, boolean>;
    proficiencies?: string[];
    languages?: string[];
    spellcasting?: {
        knownSpells?: string[];
        cantrips?: string[];
    };
    features?: Record<string, any>; // JSONB object, not array
    resistances?: string[];
}

/**
 * Aplica os benefícios de uma subclasse ao personagem
 */
export function applySubclassBenefits(
    character: Character,
    subclass: Subclass
): Character {
    const updatedCharacter = { ...character };

    // Inicializar campos se não existirem
    if (!updatedCharacter.skills) updatedCharacter.skills = {};
    else updatedCharacter.skills = { ...updatedCharacter.skills };

    if (!updatedCharacter.proficiencies) updatedCharacter.proficiencies = [];
    else updatedCharacter.proficiencies = [...updatedCharacter.proficiencies];

    if (!updatedCharacter.languages) updatedCharacter.languages = [];
    else updatedCharacter.languages = [...updatedCharacter.languages];

    if (!updatedCharacter.spellcasting) updatedCharacter.spellcasting = {};
    else updatedCharacter.spellcasting = { ...updatedCharacter.spellcasting };

    if (!updatedCharacter.spellcasting.knownSpells) updatedCharacter.spellcasting.knownSpells = [];
    else updatedCharacter.spellcasting.knownSpells = [...updatedCharacter.spellcasting.knownSpells];

    if (!updatedCharacter.spellcasting.cantrips) updatedCharacter.spellcasting.cantrips = [];
    else updatedCharacter.spellcasting.cantrips = [...updatedCharacter.spellcasting.cantrips];

    if (!updatedCharacter.features) updatedCharacter.features = {} as any; // features é um objeto JSONB
    else updatedCharacter.features = { ...updatedCharacter.features };

    if (!updatedCharacter.resistances) updatedCharacter.resistances = [];
    else updatedCharacter.resistances = [...updatedCharacter.resistances];

    // Processar escolhas da subclasse (perícias, estilo de luta, etc)
    if ((subclass as any).choices?.skills) {
        (subclass as any).choices.skills.forEach((skillKey: string) => {
            updatedCharacter.skills![skillKey] = true;
        });
    }

    // Aplicar benefícios do nível atual
    const currentLevelBenefits = subclass.benefits.filter(
        b => b.level <= character.level
    );

    for (const benefit of currentLevelBenefits) {
        switch (benefit.type) {
            case 'skill':
                // Adicionar perícia(s)
                if (Array.isArray(benefit.value)) {
                    benefit.value.forEach(skill => {
                        updatedCharacter.skills![skill] = true;
                    });
                } else if (typeof benefit.value === 'string' && !benefit.value.startsWith('choose-')) {
                    updatedCharacter.skills![benefit.value] = true;
                }
                // Nota: 'choose-X' é tratado via choices.skills acima
                break;

            case 'proficiency':
                // Adicionar proficiência(s)
                if (Array.isArray(benefit.value)) {
                    benefit.value.forEach(prof => {
                        if (!updatedCharacter.proficiencies!.includes(prof)) {
                            updatedCharacter.proficiencies!.push(prof);
                        }
                    });
                } else if (typeof benefit.value === 'string') {
                    if (!updatedCharacter.proficiencies!.includes(benefit.value)) {
                        updatedCharacter.proficiencies!.push(benefit.value);
                    }
                }
                break;

            case 'language':
                // Adicionar idioma(s)
                if (Array.isArray(benefit.value)) {
                    benefit.value.forEach(lang => {
                        if (!updatedCharacter.languages!.includes(lang)) {
                            updatedCharacter.languages!.push(lang);
                        }
                    });
                } else if (typeof benefit.value === 'string' && !benefit.value.startsWith('choose-')) {
                    if (!updatedCharacter.languages!.includes(benefit.value)) {
                        updatedCharacter.languages!.push(benefit.value);
                    }
                }
                break;

            case 'spell':
                // Adicionar magia(s)
                if (Array.isArray(benefit.value)) {
                    benefit.value.forEach(spell => {
                        // Verificar se é truque (level 0) ou magia
                        // Por simplicidade, adicionar às conhecidas
                        if (!updatedCharacter.spellcasting!.knownSpells!.includes(spell)) {
                            updatedCharacter.spellcasting!.knownSpells!.push(spell);
                        }
                    });
                } else if (typeof benefit.value === 'string') {
                    if (!updatedCharacter.spellcasting!.knownSpells!.includes(benefit.value)) {
                        updatedCharacter.spellcasting!.knownSpells!.push(benefit.value);
                    }
                }
                break;

            case 'feature':
                // Adicionar feature (features é um objeto JSONB, não array)
                const featureName = typeof benefit.value === 'string'
                    ? benefit.value
                    : benefit.value[0];

                if (!updatedCharacter.features) {
                    updatedCharacter.features = {};
                }

                if (!(updatedCharacter.features as any)[featureName]) {
                    (updatedCharacter.features as any)[featureName] = {
                        name: featureName,
                        description: benefit.description || '',
                        type: 'feature',
                        level: updatedCharacter.level || 1
                    };
                }
                break;

            case 'resistance':
                // Adicionar resistência
                if (Array.isArray(benefit.value)) {
                    benefit.value.forEach(res => {
                        if (!updatedCharacter.resistances!.includes(res)) {
                            updatedCharacter.resistances!.push(res);
                        }
                    });
                } else if (typeof benefit.value === 'string' && !benefit.value.startsWith('choose-')) {
                    if (!updatedCharacter.resistances!.includes(benefit.value)) {
                        updatedCharacter.resistances!.push(benefit.value);
                    }
                }
                break;
        }
    }

    return updatedCharacter;
}

/**
 * Aplica os benefícios de um antecedente ao personagem
 */
export function applyBackgroundBenefits(
    character: Character,
    background: Background
): Character {
    const updatedCharacter = { ...character };

    // Inicializar campos se não existirem
    if (!updatedCharacter.skills) updatedCharacter.skills = {};
    else updatedCharacter.skills = { ...updatedCharacter.skills }; // Clonar para evitar mutação direta

    if (!updatedCharacter.proficiencies) updatedCharacter.proficiencies = [];
    else updatedCharacter.proficiencies = [...updatedCharacter.proficiencies];

    if (!updatedCharacter.languages) updatedCharacter.languages = [];
    else updatedCharacter.languages = [...updatedCharacter.languages];

    if (!updatedCharacter.features) updatedCharacter.features = {} as any;
    else updatedCharacter.features = { ...updatedCharacter.features };

    // Aplicar perícias (não duplica se já existe)
    background.skillProficiencies.forEach(skill => {
        // Só aplica se ainda não tem essa perícia
        if (!updatedCharacter.skills![skill]) {
            updatedCharacter.skills![skill] = true;
        }
    });

    // Aplicar proficiências em ferramentas
    if (background.toolProficiencies) {
        background.toolProficiencies.forEach(tool => {
            if (!updatedCharacter.proficiencies!.includes(tool)) {
                updatedCharacter.proficiencies!.push(tool);
            }
        });
    }

    // Aplicar feature do antecedente
    const featureName = `${background.name}: ${background.feature.name}`;
    if (!(updatedCharacter.features as any)[featureName]) {
        (updatedCharacter.features as any)[featureName] = {
            name: background.feature.name,
            description: background.feature.description,
            type: 'background',
            source: background.name
        };
    }

    // Aplicar equipamento inicial ao inventário
    if (background.equipment && background.equipment.length > 0) {
        // Inicializar inventário se não existir
        if (!(updatedCharacter as any).inventory) {
            (updatedCharacter as any).inventory = [];
        }

        background.equipment.forEach(item => {
            // Adicionar cada item do equipamento ao inventário
            (updatedCharacter as any).inventory.push({
                name: item,
                quantity: 1,
                equipped: false,
                notes: `Do antecedente ${background.name}`
            });
        });
    }

    // Nota: Idiomas requerem escolha do jogador e serão tratados na UI

    return updatedCharacter;
}

/**
 * Retorna um resumo dos benefícios que serão aplicados
 * Útil para mostrar ao jogador antes de confirmar
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

/**
 * Retorna um resumo dos benefícios de um antecedente
 */
export function getBackgroundBenefitsSummary(background: Background): {
    skills: string[];
    toolProficiencies: string[];
    languages: number;
    equipment: string[];
    feature: string;
} {
    return {
        skills: background.skillProficiencies,
        toolProficiencies: background.toolProficiencies || [],
        languages: background.languages || 0,
        equipment: background.equipment,
        feature: background.feature.name,
    };
}
