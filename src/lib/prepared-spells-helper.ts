/**
 * Prepared Spells Helper Functions
 * Funções auxiliares para gerenciar magias preparadas
 */

// Classes que preparam magias diariamente
const SPELL_PREPARATION_CLASSES = [
    'Clérigo',
    'Druida',
    'Paladino',
    'Ranger', // Ranger também prepara magias (a partir do nível 2)
    'Mago',
];

// Classes que conhecem magias permanentemente (não preparam)
const SPELL_KNOWN_CLASSES = [
    'Bruxo',
    'Bardo',
    'Feiticeiro',
];

/**
 * Verifica se uma classe pode preparar magias
 */
export function canPrepareSpells(className: string): boolean {
    return SPELL_PREPARATION_CLASSES.includes(className);
}

/**
 * Verifica se uma classe conhece magias (mas não prepara)
 */
export function hasKnownSpells(className: string): boolean {
    return SPELL_KNOWN_CLASSES.includes(className);
}

/**
 * Calcula o número máximo de magias que podem ser preparadas
 * Fórmula D&D 5e: Modificador de Atributo + Nível da Classe
 * Mínimo de 1 magia
 */
export function getMaxPreparedSpells(
    className: string,
    level: number,
    attributeModifier: number
): number {
    if (!canPrepareSpells(className)) {
        return 0;
    }

    // Paladinos e Rangers só podem preparar magias a partir do nível 2
    if ((className === 'Paladino' || className === 'Ranger') && level < 2) {
        return 0;
    }

    // Fórmula padrão: modificador + nível (mínimo 1)
    return Math.max(1, attributeModifier + level);
}

/**
 * Retorna o atributo de conjuração para cada classe
 */
export function getSpellcastingAbility(className: string): string {
    const abilityMap: Record<string, string> = {
        'Clérigo': 'wisdom',
        'Druida': 'wisdom',
        'Paladino': 'charisma',
        'Mago': 'intelligence',
        'Bruxo': 'charisma',
        'Bardo': 'charisma',
        'Feiticeiro': 'charisma',
        'Ranger': 'wisdom',
    };

    return abilityMap[className] || 'intelligence';
}

/**
 * Calcula o modificador de atributo
 */
export function calculateModifier(attributeValue: number): number {
    return Math.floor((attributeValue - 10) / 2);
}

/**
 * Verifica se um personagem precisa preparar magias
 */
export function needsSpellPreparation(character: any): boolean {
    // Não precisa preparar se a classe não prepara magias
    if (!canPrepareSpells(character.characterClass)) {
        return false;
    }

    // Paladinos e Rangers nível 1 não preparam magias
    if ((character.characterClass === 'Paladino' || character.characterClass === 'Ranger') && character.level < 2) {
        return false;
    }

    // Se não tem magias preparadas, precisa preparar
    if (!character.prepared_spells || character.prepared_spells.length === 0) {
        return true;
    }

    // Se a data de preparação é diferente da data atual da campanha, precisa preparar
    if (character.last_spell_prep_date !== character.campaign?.current_date) {
        return true;
    }

    return false;
}

/**
 * Valida se a lista de magias preparadas é válida
 */
export function validatePreparedSpells(
    preparedSpells: string[],
    knownSpells: string[],
    maxPrepared: number
): { valid: boolean; error?: string } {
    // Verificar se não excede o limite
    if (preparedSpells.length > maxPrepared) {
        return {
            valid: false,
            error: `Você pode preparar no máximo ${maxPrepared} magia(s)`,
        };
    }

    // Verificar se todas as magias preparadas estão na lista de conhecidas
    for (const spell of preparedSpells) {
        if (!knownSpells.includes(spell)) {
            return {
                valid: false,
                error: `Magia "${spell}" não está na lista de magias conhecidas`,
            };
        }
    }

    return { valid: true };
}

/**
 * Filtra truques (cantrips) da lista de magias
 * Truques não precisam ser preparados
 */
export function filterCantrips(spells: string[], spellDetails: Record<string, any>): string[] {
    return spells.filter(spellIndex => {
        const detail = spellDetails[spellIndex];
        return detail && detail.level === 0;
    });
}

/**
 * Filtra magias que precisam ser preparadas (exclui truques)
 */
export function filterPreparableSpells(spells: string[], spellDetails: Record<string, any>): string[] {
    return spells.filter(spellIndex => {
        const detail = spellDetails[spellIndex];
        return detail && detail.level > 0;
    });
}

/**
 * Agrupa magias preparadas por nível
 */
export function groupPreparedSpellsByLevel(
    preparedSpells: string[],
    spellDetails: Record<string, any>
): Record<number, string[]> {
    const grouped: Record<number, string[]> = {};

    for (const spellIndex of preparedSpells) {
        const detail = spellDetails[spellIndex];
        if (detail) {
            const level = detail.level;
            if (!grouped[level]) {
                grouped[level] = [];
            }
            grouped[level].push(spellIndex);
        }
    }

    return grouped;
}

/**
 * Retorna informações sobre preparação de magias para um personagem
 */
export function getSpellPreparationInfo(character: any) {
    const className = character.characterClass;
    const level = character.level || 1;
    const attributes = character.attributes || {};

    // Obter atributo de conjuração
    const spellAbility = getSpellcastingAbility(className);
    const abilityValue = attributes[spellAbility] || 10;
    const abilityModifier = calculateModifier(abilityValue);

    // Calcular máximo de magias preparadas
    const maxPrepared = getMaxPreparedSpells(className, level, abilityModifier);

    // Contar magias atualmente preparadas
    const currentPrepared = character.prepared_spells?.length || 0;

    return {
        canPrepare: canPrepareSpells(className),
        maxPrepared,
        currentPrepared,
        remaining: Math.max(0, maxPrepared - currentPrepared),
        needsPreparation: needsSpellPreparation(character),
        spellAbility,
        abilityModifier,
    };
}
