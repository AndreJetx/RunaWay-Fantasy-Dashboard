// Eldritch Invocations for Warlock
// Based on D&D 5e Player's Handbook and expansions

export interface EldritchInvocation {
    id: string;
    name: string;
    nameEN: string;
    description: string;
    prerequisites?: {
        level?: number;
        pact?: "Blade" | "Tome" | "Chain" | "Talisman"; // Pact of the...
        spell?: string; // Spell index required
        patron?: string; // Patron type required
    };
}

export const ELDRITCH_INVOCATIONS: EldritchInvocation[] = [
    {
        id: "agonizing-blast",
        name: "Rajada Agonizante",
        nameEN: "Agonizing Blast",
        description: "Quando você conjura eldritch blast, adicione seu modificador de Carisma ao dano que ela causa em cada acerto.",
        prerequisites: {
            spell: "eldritch-blast"
        }
    },
    {
        id: "armor-of-shadows",
        name: "Armadura das Sombras",
        nameEN: "Armor of Shadows",
        description: "Você pode conjurar mage armor em si mesmo à vontade, sem gastar espaços de magia ou componentes materiais."
    },
    {
        id: "ascendant-step",
        name: "Passo Ascendente",
        nameEN: "Ascendant Step",
        description: "Você pode conjurar levitate em si mesmo à vontade, sem gastar espaços de magia ou componentes materiais.",
        prerequisites: {
            level: 9
        }
    },
    {
        id: "beast-speech",
        name: "Fala das Bestas",
        nameEN: "Beast Speech",
        description: "Você pode conjurar speak with animals à vontade, sem gastar espaços de magia."
    },
    {
        id: "beguiling-influence",
        name: "Influência Sedutora",
        nameEN: "Beguiling Influence",
        description: "Você ganha proficiência nas perícias Enganação e Persuasão."
    },
    {
        id: "bewitching-whispers",
        name: "Sussurros Enfeitiçadores",
        nameEN: "Bewitching Whispers",
        description: "Você pode conjurar compulsion uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 7
        }
    },
    {
        id: "book-of-ancient-secrets",
        name: "Livro dos Segredos Antigos",
        nameEN: "Book of Ancient Secrets",
        description: "Você pode agora inscrever rituais mágicos em seu Livro das Sombras. Escolha duas magias de 1º nível que tenham a tag ritual de qualquer lista de magias de classe. As magias aparecem no livro e não contam contra o número de magias que você conhece. Com seu Livro das Sombras em mãos, você pode conjurar as magias escolhidas como rituais.",
        prerequisites: {
            pact: "Tome"
        }
    },
    {
        id: "chains-of-carceri",
        name: "Correntes de Cárceri",
        nameEN: "Chains of Carceri",
        description: "Você pode conjurar hold monster à vontade – direcionando celestiais, diabos ou demônios – sem gastar espaços de magia ou componentes materiais. Você deve terminar um descanso longo antes de poder usar esta invocação na mesma criatura novamente.",
        prerequisites: {
            level: 15,
            pact: "Chain"
        }
    },
    {
        id: "devil-sight",
        name: "Visão do Diabo",
        nameEN: "Devil's Sight",
        description: "Você pode ver normalmente na escuridão, tanto mágica quanto não mágica, até uma distância de 120 pés."
    },
    {
        id: "dreadful-word",
        name: "Palavra Terrível",
        nameEN: "Dreadful Word",
        description: "Você pode conjurar confusion uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 7
        }
    },
    {
        id: "eldritch-sight",
        name: "Visão Mística",
        nameEN: "Eldritch Sight",
        description: "Você pode conjurar detect magic à vontade, sem gastar espaços de magia."
    },
    {
        id: "eldritch-spear",
        name: "Lança Mística",
        nameEN: "Eldritch Spear",
        description: "Quando você conjura eldritch blast, seu alcance é de 300 pés.",
        prerequisites: {
            spell: "eldritch-blast"
        }
    },
    {
        id: "eyes-of-the-rune-keeper",
        name: "Olhos do Guardião das Runas",
        nameEN: "Eyes of the Rune Keeper",
        description: "Você pode ler toda escrita."
    },
    {
        id: "fiendish-vigor",
        name: "Vigor Demoníaco",
        nameEN: "Fiendish Vigor",
        description: "Você pode conjurar false life em si mesmo à vontade como uma magia de 1º nível, sem gastar espaços de magia ou componentes materiais."
    },
    {
        id: "gaze-of-two-minds",
        name: "Olhar de Duas Mentes",
        nameEN: "Gaze of Two Minds",
        description: "Você pode usar sua ação para tocar um humanoide voluntário e perceber através de seus sentidos até o final do seu próximo turno. Enquanto a criatura estiver no mesmo plano de existência que você, você pode usar sua ação em turnos subsequentes para manter esta conexão, estendendo a duração até o final do seu próximo turno. Enquanto percebe através dos sentidos da outra criatura, você se beneficia de quaisquer sentidos especiais possuídos por essa criatura, e você fica cego e surdo em relação ao seu próprio entorno."
    },
    {
        id: "lifedrinker",
        name: "Bebedor de Vida",
        nameEN: "Lifedrinker",
        description: "Quando você acerta uma criatura com sua arma do pacto, a criatura sofre dano necrótico extra igual ao seu modificador de Carisma (mínimo 1).",
        prerequisites: {
            level: 12,
            pact: "Blade"
        }
    },
    {
        id: "mask-of-many-faces",
        name: "Máscara de Muitas Faces",
        nameEN: "Mask of Many Faces",
        description: "Você pode conjurar disguise self à vontade, sem gastar espaços de magia."
    },
    {
        id: "master-of-myriad-forms",
        name: "Mestre de Miríades de Formas",
        nameEN: "Master of Myriad Forms",
        description: "Você pode conjurar alter self à vontade, sem gastar espaços de magia.",
        prerequisites: {
            level: 15
        }
    },
    {
        id: "minions-of-chaos",
        name: "Servos do Caos",
        nameEN: "Minions of Chaos",
        description: "Você pode conjurar conjure elemental uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 9
        }
    },
    {
        id: "mire-the-mind",
        name: "Atoleiro Mental",
        nameEN: "Mire the Mind",
        description: "Você pode conjurar slow uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 5
        }
    },
    {
        id: "misty-visions",
        name: "Visões Nebulosas",
        nameEN: "Misty Visions",
        description: "Você pode conjurar silent image à vontade, sem gastar espaços de magia ou componentes materiais."
    },
    {
        id: "one-with-shadows",
        name: "Um com as Sombras",
        nameEN: "One with Shadows",
        description: "Quando você está em uma área de penumbra ou escuridão, você pode usar sua ação para se tornar invisível até se mover ou realizar uma ação ou reação.",
        prerequisites: {
            level: 5
        }
    },
    {
        id: "otherworldly-leap",
        name: "Salto Sobrenatural",
        nameEN: "Otherworldly Leap",
        description: "Você pode conjurar jump em si mesmo à vontade, sem gastar espaços de magia ou componentes materiais.",
        prerequisites: {
            level: 9
        }
    },
    {
        id: "repelling-blast",
        name: "Rajada Repulsiva",
        nameEN: "Repelling Blast",
        description: "Quando você acerta uma criatura com eldritch blast, você pode empurrar a criatura até 10 pés para longe de você em linha reta.",
        prerequisites: {
            spell: "eldritch-blast"
        }
    },
    {
        id: "sculptor-of-flesh",
        name: "Escultor de Carne",
        nameEN: "Sculptor of Flesh",
        description: "Você pode conjurar polymorph uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 7
        }
    },
    {
        id: "sign-of-ill-omen",
        name: "Sinal de Mau Agouro",
        nameEN: "Sign of Ill Omen",
        description: "Você pode conjurar bestow curse uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo.",
        prerequisites: {
            level: 5
        }
    },
    {
        id: "thief-of-five-fates",
        name: "Ladrão de Cinco Destinos",
        nameEN: "Thief of Five Fates",
        description: "Você pode conjurar bane uma vez usando um espaço de magia de bruxo. Você não pode fazer isso novamente até terminar um descanso longo."
    },
    {
        id: "thirsting-blade",
        name: "Lâmina Sedenta",
        nameEN: "Thirsting Blade",
        description: "Você pode atacar com sua arma do pacto duas vezes, em vez de uma, sempre que realizar a ação de Ataque no seu turno.",
        prerequisites: {
            level: 5,
            pact: "Blade"
        }
    },
    {
        id: "visions-of-distant-realms",
        name: "Visões de Reinos Distantes",
        nameEN: "Visions of Distant Realms",
        description: "Você pode conjurar arcane eye à vontade, sem gastar espaços de magia.",
        prerequisites: {
            level: 15
        }
    },
    {
        id: "voice-of-the-chain-master",
        name: "Voz do Mestre da Corrente",
        nameEN: "Voice of the Chain Master",
        description: "Você pode se comunicar telepaticamente com seu familiar e perceber através dos sentidos do seu familiar enquanto vocês estiverem no mesmo plano de existência. Além disso, enquanto percebe através dos sentidos do seu familiar, você também pode falar através do seu familiar com sua própria voz, mesmo que seu familiar normalmente não possa falar.",
        prerequisites: {
            pact: "Chain"
        }
    },
    {
        id: "whispers-of-the-grave",
        name: "Sussurros da Sepultura",
        nameEN: "Whispers of the Grave",
        description: "Você pode conjurar speak with dead à vontade, sem gastar espaços de magia.",
        prerequisites: {
            level: 9
        }
    },
    {
        id: "witch-sight",
        name: "Visão da Bruxa",
        nameEN: "Witch Sight",
        description: "Você pode ver a verdadeira forma de qualquer metamorfo ou criatura escondida por magia de ilusão ou transmutação enquanto a criatura estiver a até 30 pés de você e dentro de sua linha de visão.",
        prerequisites: {
            level: 15
        }
    }
];

/**
 * Get the number of invocations a Warlock should have at a given level
 */
export function getInvocationsCount(level: number): number {
    if (level < 2) return 0;
    if (level < 5) return 2;
    if (level < 7) return 3;
    if (level < 9) return 4;
    if (level < 12) return 5;
    if (level < 15) return 6;
    if (level < 18) return 7;
    return 8;
}

/**
 * Get the number of new invocations to select when leveling up
 */
export function getNewInvocationsCount(currentLevel: number, newLevel: number): number {
    const currentCount = getInvocationsCount(currentLevel);
    const newCount = getInvocationsCount(newLevel);
    return newCount - currentCount;
}

/**
 * Check if a character meets the prerequisites for an invocation
 */
export function meetsInvocationPrerequisites(
    invocation: EldritchInvocation,
    characterLevel: number,
    pactBoon?: string,
    knownSpells?: string[]
): boolean {
    const prereqs = invocation.prerequisites;

    if (!prereqs) return true;

    // Check level requirement
    if (prereqs.level && characterLevel < prereqs.level) {
        return false;
    }

    // Check pact requirement
    if (prereqs.pact && pactBoon !== `Pact of the ${prereqs.pact}`) {
        return false;
    }

    // Check spell requirement
    if (prereqs.spell && knownSpells) {
        if (!knownSpells.includes(prereqs.spell)) {
            return false;
        }
    }

    return true;
}

/**
 * Get available invocations for a Warlock based on their level, pact, and known spells
 */
export function getAvailableInvocations(
    characterLevel: number,
    pactBoon?: string,
    knownSpells?: string[],
    currentInvocations?: string[]
): EldritchInvocation[] {
    return ELDRITCH_INVOCATIONS.filter(invocation => {
        // Don't show already learned invocations
        if (currentInvocations?.includes(invocation.id)) {
            return false;
        }

        return meetsInvocationPrerequisites(invocation, characterLevel, pactBoon, knownSpells);
    });
}
