// Metamágicas disponíveis para Feiticeiros - D&D 5e

export interface Metamagic {
    id: string;
    name: string;
    description: string;
    cost: number; // Custo em pontos de feitiçaria
    requirements?: string;
}

export const METAMAGICS: Record<string, Metamagic> = {
    'careful-spell': {
        id: 'careful-spell',
        name: 'Magia Cuidadosa',
        description: 'Quando conjura uma magia que força outras criaturas a fazer testes de resistência, você pode escolher até CHA criaturas que você pode ver. Elas automaticamente passam no teste.',
        cost: 1,
    },
    'distant-spell': {
        id: 'distant-spell',
        name: 'Magia Distante',
        description: 'Quando conjura uma magia com alcance de 1,5m ou maior, você pode dobrar o alcance. Quando conjura uma magia com alcance de toque, você pode mudar o alcance para 9m.',
        cost: 1,
    },
    'empowered-spell': {
        id: 'empowered-spell',
        name: 'Magia Potencializada',
        description: 'Quando rola dano de uma magia, você pode rolar novamente até CHA dados de dano. Você deve usar as novas rolagens. Você pode usar mesmo se já usou metamágica diferente nesta magia.',
        cost: 1,
    },
    'extended-spell': {
        id: 'extended-spell',
        name: 'Magia Estendida',
        description: 'Quando conjura uma magia com duração de 1 minuto ou maior, você pode dobrar a duração, até o máximo de 24 horas.',
        cost: 1,
    },
    'heightened-spell': {
        id: 'heightened-spell',
        name: 'Magia Elevada',
        description: 'Quando conjura uma magia que força uma criatura a fazer teste de resistência para resistir aos efeitos, você pode dar desvantagem no primeiro teste de resistência de uma criatura contra a magia.',
        cost: 3,
    },
    'quickened-spell': {
        id: 'quickened-spell',
        name: 'Magia Acelerada',
        description: 'Quando conjura uma magia que tem tempo de conjuração de 1 ação, você pode mudar o tempo de conjuração para 1 ação bônus neste turno.',
        cost: 2,
    },
    'subtle-spell': {
        id: 'subtle-spell',
        name: 'Magia Sutil',
        description: 'Quando conjura uma magia, você pode conjurá-la sem componentes somáticos ou verbais.',
        cost: 1,
    },
    'twinned-spell': {
        id: 'twinned-spell',
        name: 'Magia Geminada',
        description: 'Quando conjura uma magia que tem como alvo apenas uma criatura e não tem alcance de si mesmo, você pode ter como alvo uma segunda criatura no alcance com a mesma magia.',
        cost: 1, // Nota: Custo real = nível da magia (mínimo 1)
        requirements: 'Custo em pontos = nível da magia (mínimo 1 ponto)',
    },
};

export const METAMAGIC_LIST = Object.values(METAMAGICS);

/**
 * Retorna quantas metamágicas o feiticeiro pode ter em determinado nível
 */
export function getMetamagicCount(level: number): number {
    if (level < 3) return 0;
    if (level < 10) return 2;
    if (level < 17) return 3;
    return 4;
}

/**
 * Retorna quantas metamágicas NOVAS o feiticeiro ganha ao subir de nível
 */
export function getNewMetamagicCount(currentLevel: number, newLevel: number): number {
    const currentCount = getMetamagicCount(currentLevel);
    const newCount = getMetamagicCount(newLevel);
    return Math.max(0, newCount - currentCount);
}
