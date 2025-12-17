import { Subclass } from './types';

// ============================================================================
// LADINO - Arquétipos (Nível 3)
// ============================================================================

export const rogueSubclasses: Subclass[] = [
    {
        name: "Ladrão",
        className: "Ladino",
        level: 3,
        source: "PHB",
        description: "Você aperfeiçoa suas habilidades nas artes do furto.",
        features: [
            { level: 3, name: "Mãos Rápidas", description: "Você pode usar Ação Astuta para fazer testes de Sleight of Hand, usar ferramentas de ladrão ou fazer a ação Usar um Objeto" },
            { level: 3, name: "Trabalho de Segundo Andar", description: "Você ganha a habilidade de escalar mais rápido" },
            { level: 9, name: "Furtividade Suprema", description: "Você tem vantagem em testes de Stealth se se mover até metade da sua velocidade" },
            { level: 13, name: "Usar Dispositivo Mágico", description: "Você pode usar itens mágicos mesmo se não for da sua classe" },
            { level: 17, name: "Reflexos de Ladrão", description: "Você pode fazer dois turnos no primeiro round de combate" },
        ],
        benefits: [],
    },
    {
        name: "Assassino",
        className: "Ladino",
        level: 3,
        source: "PHB",
        description: "Você foca sua prática na arte da morte.",
        features: [
            { level: 3, name: "Proficiências Adicionais", description: "Você ganha proficiência com kit de disfarce e kit de veneno" },
            { level: 3, name: "Assassinar", description: "Você tem vantagem em ataques contra criaturas que ainda não agiram no combate" },
            { level: 9, name: "Infiltração Experiente", description: "Você pode criar identidades falsas" },
            { level: 13, name: "Impostor", description: "Você pode imitar perfeitamente a fala, escrita e comportamento de outra pessoa" },
            { level: 17, name: "Golpe Mortal", description: "Você se torna um mestre da morte instantânea" },
        ],
        benefits: [
            { type: 'proficiency', value: ['disguise-kit', 'poisoners-kit'], level: 3, description: 'Proficiências adicionais' },
        ],
    },
    {
        name: "Trapaceiro Arcano",
        className: "Ladino",
        level: 3,
        source: "PHB",
        description: "Alguns ladinos aprimoram suas habilidades furtivas com magia.",
        features: [
            { level: 3, name: "Conjuração", description: "Você aprende a conjurar magias" },
            { level: 3, name: "Mão de Mago", description: "Você aprende o truque mão mágica e pode torná-lo invisível" },
            { level: 9, name: "Emboscada Mágica", description: "Você pode usar Ataque Furtivo em uma criatura que você surpreender" },
            { level: 13, name: "Ladrão Versátil", description: "Você ganha a habilidade de usar Ação Astuta para controlar sua mão mágica" },
            { level: 17, name: "Ladrão de Magias", description: "Você pode roubar o conhecimento de uma magia" },
        ],
        benefits: [
            { type: 'spell', value: 'wizard-cantrips', level: 3, description: 'Conjuração de magias' },
        ],
    },
    {
        name: "Batedor",
        className: "Ladino",
        level: 3,
        source: "XGtE",
        description: "Você é hábil em furtividade e sobrevivência, longe das ruas da cidade.",
        features: [
            { level: 3, name: "Skirmisher", description: "Você pode se mover até metade da sua velocidade como reação quando um inimigo termina seu turno perto de você" },
            { level: 3, name: "Sobrevivencialista", description: "Você ganha proficiência em Nature e Survival" },
            { level: 9, name: "Mobilidade Superior", description: "Sua velocidade de caminhada aumenta" },
            { level: 13, name: "Emboscada", description: "Você tem vantagem em iniciativa" },
            { level: 17, name: "Golpe Súbito", description: "Você pode fazer um ataque extra se usar Ataque Furtivo" },
        ],
        benefits: [
            { type: 'skill', value: ['nature', 'survival'], level: 3, description: 'Proficiências de sobrevivência' },
        ],
    },
    {
        name: "Inquisitivo",
        className: "Ladino",
        level: 3,
        source: "XGtE",
        description: "Você se destaca em desvendar segredos e desmascarar mentiras.",
        features: [
            { level: 3, name: "Ouvido para Engano", description: "Você pode usar Insight para determinar se alguém está mentindo" },
            { level: 3, name: "Olho para Detalhes", description: "Você pode usar ação bônus para fazer testes de Perception ou Investigation" },
            { level: 9, name: "Insight Firme", description: "Você não pode ser surpreendido enquanto estiver consciente" },
            { level: 13, name: "Olho Infalível", description: "Você pode rolar novamente testes de Perception ou Investigation" },
            { level: 17, name: "Olho para Fraqueza", description: "Você pode usar Ataque Furtivo contra criaturas que você estudou" },
        ],
        benefits: [],
    },
    {
        name: "Lâmina Fantasma",
        className: "Ladino",
        level: 3,
        source: "XGtE",
        description: "Você é um mestre em se mover através das sombras e atacar de lugares inesperados.",
        features: [
            { level: 3, name: "Lâminas Psíquicas", description: "Você pode criar lâminas de energia psíquica" },
            { level: 9, name: "Caminhada nas Sombras", description: "Você pode se teletransportar através de sombras" },
            { level: 13, name: "Pensamentos Sombrios", description: "Você pode ler pensamentos superficiais" },
            { level: 17, name: "Lâmina Fantasma Aprimorada", description: "Suas lâminas psíquicas se tornam mais poderosas" },
        ],
        benefits: [],
    },
    {
        name: "Alma da Lâmina",
        className: "Ladino",
        level: 3,
        source: "TCoE",
        description: "Você domina a arte do combate com lâminas.",
        features: [
            { level: 3, name: "Proficiências Adicionais", description: "Você ganha proficiência com armaduras médias" },
            { level: 3, name: "Lâmina Ardilosa", description: "Você pode usar Ataque Furtivo com mais frequência" },
            { level: 9, name: "Lâmina Fantasmagórica", description: "Você pode criar uma lâmina espectral" },
            { level: 13, name: "Lâmina Sombria", description: "Você pode se teletransportar" },
            { level: 17, name: "Mestre da Lâmina", description: "Você pode fazer ataques de oportunidade contra qualquer criatura" },
        ],
        benefits: [
            { type: 'proficiency', value: 'medium-armor', level: 3, description: 'Proficiência em armaduras médias' },
        ],
    },
];
