// Tipos de dragões para Linhagem Dracônica do Feiticeiro

export interface DragonType {
    name: string;
    damageType: string;
    breathWeapon: string;
    color: string;
}

export const DRAGON_TYPES: DragonType[] = [
    {
        name: "Dragão Negro",
        damageType: "acid",
        breathWeapon: "Linha de 5 por 30 pés (Des. save)",
        color: "black"
    },
    {
        name: "Dragão Azul",
        damageType: "lightning",
        breathWeapon: "Linha de 5 por 30 pés (Des. save)",
        color: "blue"
    },
    {
        name: "Dragão de Bronze",
        damageType: "lightning",
        breathWeapon: "Linha de 5 por 30 pés (Des. save)",
        color: "bronze"
    },
    {
        name: "Dragão de Cobre",
        damageType: "acid",
        breathWeapon: "Linha de 5 por 30 pés (Des. save)",
        color: "copper"
    },
    {
        name: "Dragão Dourado",
        damageType: "fire",
        breathWeapon: "Cone de 15 pés (Des. save)",
        color: "gold"
    },
    {
        name: "Dragão Verde",
        damageType: "poison",
        breathWeapon: "Cone de 15 pés (Con. save)",
        color: "green"
    },
    {
        name: "Dragão de Latão",
        damageType: "fire",
        breathWeapon: "Linha de 5 por 30 pés (Des. save)",
        color: "brass"
    },
    {
        name: "Dragão de Prata",
        damageType: "cold",
        breathWeapon: "Cone de 15 pés (Con. save)",
        color: "silver"
    },
    {
        name: "Dragão Branco",
        damageType: "cold",
        breathWeapon: "Cone de 15 pés (Con. save)",
        color: "white"
    },
    {
        name: "Dragão Vermelho",
        damageType: "fire",
        breathWeapon: "Cone de 15 pés (Des. save)",
        color: "red"
    },
];

export function getDragonType(name: string): DragonType | undefined {
    return DRAGON_TYPES.find(d => d.name === name);
}

export function getDamageTypeLabel(damageType: string): string {
    const labels: Record<string, string> = {
        'acid': 'Ácido',
        'lightning': 'Elétrico',
        'fire': 'Fogo',
        'poison': 'Veneno',
        'cold': 'Gelo',
    };
    return labels[damageType] || damageType;
}
