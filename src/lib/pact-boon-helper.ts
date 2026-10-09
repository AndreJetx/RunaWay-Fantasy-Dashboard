// Helper function to apply Pact Boon benefits to Warlock characters
// Adds items and features based on the selected pact

import type { Subclass } from "./subclasses/types";

export interface PactBoonApplication {
    inventory?: Array<{ index: string; name: string; quantity: number; cost: number }>;
    features?: Record<number, Array<{ name: string; description: string; type: string }>>;
    spellcasting?: {
        knownSpells?: string[];
    };
}

/**
 * Apply Pact Boon benefits to a character
 * @param characterClass - The character's class (should be "Bruxo")
 * @param pact - The selected pact (Subclass object)
 * @param currentLevel - Character's current level
 * @returns Object with items/features to add to character
 */
export function applyPactBoonBenefits(
    characterClass: string,
    pact: Subclass | null,
    currentLevel: number
): PactBoonApplication {
    if (characterClass !== "Bruxo" || !pact || !pact.name) {
        return {};
    }

    const result: PactBoonApplication = {
        inventory: [],
        features: {},
    };

    switch (pact.name) {
        case "Pacto da Lâmina":
        case "Pact of the Blade":
            // Add Pact Weapon to inventory
            result.inventory?.push({
                index: "pact-weapon",
                name: "Arma do Pacto",
                quantity: 1,
                cost: 0,
            });

            // Add feature description
            result.features![currentLevel] = result.features![currentLevel] || [];
            result.features![currentLevel].push({
                name: "Lâmina de Pacto",
                description: "Você pode usar sua ação para criar uma arma de pacto em sua mão vazia. Você pode escolher a forma que esta arma corpo a corpo assume cada vez que a cria. Você é proficiente com ela enquanto a empunha. Esta arma conta como mágica para ultrapassar resistência e imunidade a ataques e dano não mágico.",
                type: "Pacto",
            });
            break;

        case "Pacto da Corrente":
        case "Pact of the Chain":
            // Add Find Familiar spell info
            result.features![currentLevel] = result.features![currentLevel] || [];
            result.features![currentLevel].push({
                name: "Pacto da Corrente - Familiar",
                description: "Você aprende a magia 'Encontrar Familiar' e pode conjurá-la como ritual. A magia não conta contra seu número de magias conhecidas. Quando você conjura a magia, você pode escolher uma das formas normais para seu familiar ou uma das seguintes formas especiais: diabrete, pseudodragão, quasit ou sprite.",
                type: "Pacto",
            });

            // Add familiar spell to known spells if spellcasting exists
            result.spellcasting = {
                knownSpells: ["find-familiar"],
            };
            break;

        case "Pacto do Tomo":
        case "Pact of the Tome":
            // Add Book of Shadows to inventory
            result.inventory?.push({
                index: "book-of-shadows",
                name: "Livro das Sombras",
                quantity: 1,
                cost: 0,
            });

            // Add feature description
            result.features![currentLevel] = result.features![currentLevel] || [];
            result.features![currentLevel].push({
                name: "Livro das Sombras",
                description: "Seu patrono lhe dá um grimório - um Livro das Sombras. Quando você ganha esta característica, escolha três truques de qualquer lista de magias de classe (os três não precisam ser da mesma lista). Enquanto o livro estiver com você, você pode conjurar esses truques à vontade. Eles não contam contra seu número de truques conhecidos. Se eles não aparecerem na lista de magias de bruxo, eles são considerados magias de bruxo para você.",
                type: "Pacto",
            });
            break;

        case "Pacto do Talismã":
        case "Pact of the Talisman":
            // Add Talisman to inventory
            result.inventory?.push({
                index: "pact-talisman",
                name: "Talismã do Pacto",
                quantity: 1,
                cost: 0,
            });

            // Add feature description
            result.features![currentLevel] = result.features![currentLevel] || [];
            result.features![currentLevel].push({
                name: "Talismã",
                description: "Seu patrono lhe dá um amuleto, um talismã que pode ajudar o portador quando a necessidade é grande. Quando o portador faz um teste de habilidade no qual não é proficiente, ele pode adicionar 1d4 ao teste. Uma vez que o dado seja adicionado ao teste, ele não pode ser usado novamente até você terminar um descanso longo.",
                type: "Pacto",
            });
            break;
    }

    return result;
}

/**
 * Check if a character already has pact boon items to avoid duplicates
 */
export function hasPactBoonItems(inventory: any[], pactName: string): boolean {
    if (!inventory || !pactName) return false;

    const pactItems = {
        "Pacto da Lâmina": "pact-weapon",
        "Pacto da Corrente": null, // No physical item
        "Pacto do Tomo": "book-of-shadows",
        "Pacto do Talismã": "pact-talisman",
    };

    const itemIndex = pactItems[pactName as keyof typeof pactItems];
    if (!itemIndex) return false;

    return inventory.some(item => item.index === itemIndex);
}
