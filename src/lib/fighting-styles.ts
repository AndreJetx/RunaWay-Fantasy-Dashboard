/**
 * Fighting Styles for D&D 5e
 * Available to: Fighter (1), Paladin (2), Ranger (2)
 */

export interface FightingStyle {
    id: string;
    name: string;
    description: string;
    benefits: string[];
}

export const FIGHTING_STYLES: FightingStyle[] = [
    {
        id: "archery",
        name: "Arquearia",
        description: "Você ganha +2 de bônus nas jogadas de ataque com armas de ataque à distância.",
        benefits: ["+2 em ataques à distância"]
    },
    {
        id: "defense",
        name: "Defesa",
        description: "Enquanto estiver usando armadura, você ganha +1 de bônus na CA.",
        benefits: ["+1 CA com armadura"]
    },
    {
        id: "dueling",
        name: "Duelo",
        description: "Quando você empunhar uma arma de ataque corpo a corpo em uma mão e nenhuma outra arma, você ganha +2 de bônus nas jogadas de dano com essa arma.",
        benefits: ["+2 dano com arma de uma mão"]
    },
    {
        id: "great_weapon_fighting",
        name: "Combate com Arma Grande",
        description: "Quando você rolar 1 ou 2 em um dado de dano de um ataque com arma corpo a corpo que você esteja empunhando com duas mãos, você pode rolar o dado novamente.",
        benefits: ["Rolar novamente 1s e 2s em dados de dano"]
    },
    {
        id: "protection",
        name: "Proteção",
        description: "Quando uma criatura que você possa ver atacar um alvo que esteja a até 1,5m de você, você pode usar sua reação para impor desvantagem na jogada de ataque. Você deve estar empunhando um escudo.",
        benefits: ["Impor desvantagem em ataques contra aliados próximos"]
    },
    {
        id: "two_weapon_fighting",
        name: "Combate com Duas Armas",
        description: "Quando você se engajar em combate com duas armas, você pode adicionar seu modificador de habilidade ao dano do segundo ataque.",
        benefits: ["Adicionar modificador ao dano do ataque bônus"]
    }
];

/**
 * Get fighting styles available for a class
 */
export function getFightingStylesForClass(className: string): FightingStyle[] {
    // All classes that get Fighting Style have access to all options
    const classesWithFightingStyle = ["Guerreiro", "Paladino", "Ranger"];

    if (classesWithFightingStyle.includes(className)) {
        return FIGHTING_STYLES;
    }

    return [];
}

/**
 * Check if a class gets Fighting Style at a specific level
 */
export function needsFightingStyleSelection(className: string, level: number): boolean {
    if (className === "Guerreiro" && level === 1) return true;
    if (className === "Paladino" && level === 2) return true;
    if (className === "Ranger" && level === 2) return true;

    return false;
}
