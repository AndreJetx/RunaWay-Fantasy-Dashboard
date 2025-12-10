import { Subclass } from './types';

// ============================================================================
// DRUIDA - Círculos (Nível 2)
// ============================================================================

export const druidSubclasses: Subclass[] = [
    {
        name: "Círculo da Terra",
        className: "Druida",
        level: 2,
        source: "PHB",
        description: "O Círculo da Terra é composto de místicos e sábios que protegem conhecimentos antigos e ritos através de uma vasta tradição oral.",
        features: [
            { level: 2, name: "Truque Adicional", description: "Você aprende um truque adicional de druida" },
            { level: 2, name: "Recuperação Natural", description: "Você pode recuperar espaços de magia durante um descanso curto" },
            { level: 3, name: "Magias de Círculo", description: "Você ganha magias adicionais baseadas no terreno escolhido" },
            { level: 6, name: "Caminhada na Terra", description: "Mover-se através de terreno difícil não-mágico não custa movimento extra" },
            { level: 10, name: "Proteção da Natureza", description: "Você não pode ser encantado ou amedrontado por elementais ou fadas" },
            { level: 14, name: "Santuário da Natureza", description: "Criaturas que te atacam sofrem dano" },
        ],
        benefits: [
            { type: 'spell', value: 'choose-terrain', level: 3, description: 'Magias baseadas no terreno escolhido' },
        ],
    },
    {
        name: "Círculo da Lua",
        className: "Druida",
        level: 2,
        source: "PHB",
        description: "Druidas do Círculo da Lua são guardiões ferozes da natureza selvagem.",
        features: [
            { level: 2, name: "Forma Selvagem de Combate", description: "Você pode usar Forma Selvagem como ação bônus" },
            { level: 2, name: "Formas de Círculo", description: "Você pode se transformar em bestas mais poderosas" },
            { level: 6, name: "Golpe Primitivo", description: "Seus ataques em forma selvagem contam como mágicos" },
            { level: 10, name: "Forma Elemental", description: "Você pode se transformar em um elemental" },
            { level: 14, name: "Mil Formas", description: "Você pode conjurar alterar-se à vontade" },
        ],
        benefits: [],
    },
    {
        name: "Círculo dos Sonhos",
        className: "Druida",
        level: 2,
        source: "XGtE",
        description: "Druidas que são membros do Círculo dos Sonhos vieram de regiões que têm fortes laços com a Agrestia das Fadas.",
        features: [
            { level: 2, name: "Bálsamo da Corte de Verão", description: "Você pode curar aliados com energia feérica" },
            { level: 6, name: "Refúgio Onírico", description: "Você pode conjurar um refúgio protetor" },
            { level: 10, name: "Caminhante Onírico", description: "Você pode se teletransportar" },
            { level: 14, name: "Guardião dos Sonhos", description: "Você pode proteger aliados adormecidos" },
        ],
        benefits: [
            { type: 'spell', value: ['sleep'], level: 2, description: 'Magias adicionais' },
        ],
    },
    {
        name: "Círculo do Pastor",
        className: "Druida",
        level: 2,
        source: "XGtE",
        description: "Druidas do Círculo do Pastor se comunicam com espíritos da natureza.",
        features: [
            { level: 2, name: "Fala da Floresta", description: "Você pode falar com bestas" },
            { level: 2, name: "Espírito Totêmico", description: "Você pode invocar um espírito totêmico" },
            { level: 6, name: "Forma Poderosa", description: "Suas bestas invocadas são mais fortes" },
            { level: 10, name: "Guardião Espiritual", description: "Seus espíritos protegem aliados" },
            { level: 14, name: "Invocação Fiel", description: "Suas bestas invocadas ganham benefícios" },
        ],
        benefits: [
            { type: 'language', value: 'sylvan', level: 2, description: 'Você pode falar Silvestre' },
        ],
    },
    {
        name: "Círculo das Estrelas",
        className: "Druida",
        level: 2,
        source: "TCoE",
        description: "O Círculo das Estrelas permite que druidas aproveitem o poder do céu estrelado.",
        features: [
            { level: 2, name: "Mapa Estelar", description: "Você cria um mapa das estrelas" },
            { level: 2, name: "Forma Estelar", description: "Você pode assumir uma forma estelar" },
            { level: 6, name: "Presságio Cósmico", description: "Você pode mudar rolagens de d20" },
            { level: 10, name: "Cintilação de Estrelas", description: "Você pode se teletransportar" },
            { level: 14, name: "Constelação Completa", description: "Sua forma estelar se torna mais poderosa" },
        ],
        benefits: [
            { type: 'spell', value: ['guiding-bolt'], level: 2, description: 'Magias adicionais' },
        ],
    },
    {
        name: "Círculo dos Incêndios Florestais",
        className: "Druida",
        level: 2,
        source: "TCoE",
        description: "Druidas deste círculo entendem que a destruição às vezes é necessária para a criação.",
        features: [
            { level: 2, name: "Magias de Círculo", description: "Você ganha magias de fogo" },
            { level: 2, name: "Invocação de Incêndio Florestal", description: "Você pode invocar um espírito de fogo" },
            { level: 6, name: "Chama Aprimorada", description: "Suas magias de fogo ignoram resistência" },
            { level: 10, name: "Espírito Cauterizante", description: "Seu espírito de fogo cura aliados" },
            { level: 14, name: "Fúria Ardente", description: "Seu espírito causa dano extra" },
        ],
        benefits: [
            { type: 'spell', value: ['burning-hands', 'scorching-ray'], level: 2, description: 'Magias de círculo' },
        ],
    },
];
