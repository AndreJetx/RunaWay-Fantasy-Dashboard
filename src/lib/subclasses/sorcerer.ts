import { Subclass } from './types';

// ============================================================================
// FEITICEIRO - Origens (Nível 1)
// ============================================================================

export const sorcererSubclasses: Subclass[] = [
    {
        name: "Linhagem Dracônica",
        className: "Feiticeiro",
        level: 1,
        source: "PHB",
        description: "Sua magia inata vem da magia dracônica que foi misturada com seu sangue ou de seus ancestrais.",
        features: [
            { level: 1, name: "Ancestral Dracônico", description: "Você escolhe um tipo de dragão como seu ancestral" },
            { level: 1, name: "Resiliência Dracônica", description: "Seus pontos de vida aumentam e você ganha armadura natural" },
            { level: 6, name: "Afinidade Elemental", description: "Você ganha resistência ao tipo de dano do seu dragão ancestral" },
            { level: 14, name: "Asas Dracônicas", description: "Você ganha a habilidade de criar asas de dragão" },
            { level: 18, name: "Presença Dracônica", description: "Você pode canalizar a presença temível do seu dragão ancestral" },
        ],
        benefits: [
            { type: 'resistance', value: 'choose-dragon-type', level: 6, description: 'Resistência baseada no tipo de dragão' },
        ],
    },
    {
        name: "Magia Selvagem",
        className: "Feiticeiro",
        level: 1,
        source: "PHB",
        description: "Sua magia inata vem das forças selvagens do caos que fundamentam a ordem da criação.",
        features: [
            { level: 1, name: "Surto de Magia Selvagem", description: "Sua magia pode desencadear surtos de magia selvagem" },
            { level: 1, name: "Maré do Caos", description: "Você pode manipular as forças do acaso e caos" },
            { level: 6, name: "Dobrar a Sorte", description: "Você pode manipular o destino usando sua magia selvagem" },
            { level: 14, name: "Caos Controlado", description: "Você ganha controle sobre seus surtos de magia selvagem" },
            { level: 18, name: "Bombardeio de Magias", description: "Você pode criar efeitos de magia aleatórios" },
        ],
        benefits: [],
    },
    {
        name: "Magia Divina",
        className: "Feiticeiro",
        level: 1,
        source: "XGtE",
        description: "Às vezes, o centelha de magia que alimenta um feiticeiro vem de uma fonte divina.",
        features: [
            { level: 1, name: "Magia Divina", description: "Você aprende magias de clérigo" },
            { level: 1, name: "Favorecido pelos Deuses", description: "Você pode adicionar 2d4 a um teste de resistência ou ataque" },
            { level: 6, name: "Canalizar Divindade Fortalecido", description: "Você pode usar Canalizar Divindade" },
            { level: 14, name: "Asas Angelicais ou Infernais", description: "Você pode manifestar asas espectrais" },
            { level: 18, name: "Recuperação Divina Inata", description: "Você recupera pontos de vida quando conjura magias" },
        ],
        benefits: [
            { type: 'spell', value: 'cleric-spells', level: 1, description: 'Acesso a magias de clérigo' },
        ],
    },
    {
        name: "Magia das Sombras",
        className: "Feiticeiro",
        level: 1,
        source: "XGtE",
        description: "Você é uma criatura das sombras, pois sua magia inata vem do Pendor das Sombras.",
        features: [
            { level: 1, name: "Olhos das Trevas", description: "Você ganha visão no escuro" },
            { level: 1, name: "Força da Sepultura", description: "Você pode reduzir dano que recebe" },
            { level: 3, name: "Cão das Trevas", description: "Você pode invocar um cão das sombras" },
            { level: 6, name: "Caminhada nas Sombras", description: "Você pode se teletransportar através de sombras" },
            { level: 14, name: "Forma Sombria", description: "Você pode se transformar em uma sombra" },
            { level: 18, name: "Umbral", description: "Você pode se tornar um com as sombras" },
        ],
        benefits: [
            { type: 'proficiency', value: 'darkvision', level: 1, description: 'Visão no escuro 120 pés' },
        ],
    },
    {
        name: "Mente Aberrante",
        className: "Feiticeiro",
        level: 1,
        source: "TCoE",
        description: "Uma força alienígena tocou sua mente, concedendo-lhe poderes psiônicos.",
        features: [
            { level: 1, name: "Feitiços Psiônicos", description: "Você aprende magias psiônicas" },
            { level: 1, name: "Fala Telepática", description: "Você pode falar telepaticamente" },
            { level: 6, name: "Feitiçaria Psiônica", description: "Você pode usar pontos de feitiçaria para efeitos psiônicos" },
            { level: 6, name: "Deslocamento Psíquico", description: "Você pode se teletransportar" },
            { level: 14, name: "Revelação em Carne", description: "Você pode se transformar em uma forma aberrante" },
            { level: 18, name: "Deformação da Realidade", description: "Você pode alterar a realidade" },
        ],
        benefits: [
            { type: 'spell', value: ['arms-of-hadar', 'dissonant-whispers'], level: 1, description: 'Magias psiônicas' },
        ],
    },
    {
        name: "Alma do Relógio",
        className: "Feiticeiro",
        level: 1,
        source: "TCoE",
        description: "A centelha de magia que alimenta sua magia vem da energia de Mechanus ou de um artefato de lá.",
        features: [
            { level: 1, name: "Manifestações do Relógio", description: "Você aprende magias de ordem" },
            { level: 1, name: "Restaurar Equilíbrio", description: "Você pode negar vantagem ou desvantagem" },
            { level: 6, name: "Bastião da Lei", description: "Você pode criar uma proteção mágica" },
            { level: 14, name: "Convocação de Ordem", description: "Você pode invocar um construto" },
            { level: 18, name: "Alma do Relógio Aprimorada", description: "Você pode adicionar seu modificador de Carisma a CA" },
        ],
        benefits: [
            { type: 'spell', value: ['alarm', 'protection-from-evil-and-good'], level: 1, description: 'Magias de ordem' },
        ],
    },
];
