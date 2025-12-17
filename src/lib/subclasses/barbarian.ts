import { Subclass } from './types';

// ============================================================================
// BÁRBARO - Nível 3
// ============================================================================

export const barbarianSubclasses: Subclass[] = [
    {
        name: "Caminho do Berserker",
        className: "Bárbaro",
        level: 3,
        source: "PHB",
        description: "Para alguns bárbaros, a fúria é um meio para um fim – esse fim é a violência. O Caminho do Berserker é um caminho de fúria desenfreada, manchado de sangue.",
        features: [
            { level: 3, name: "Frenesi", description: "Você pode entrar em frenesi durante sua fúria" },
            { level: 6, name: "Fúria Incansável", description: "Sua fúria o mantém lutando apesar de ferimentos graves" },
            { level: 10, name: "Presença Intimidadora", description: "Você pode usar sua ação para amedrontar alguém" },
            { level: 14, name: "Retaliação", description: "Quando sofrer dano de uma criatura a 1,5m, você pode usar sua reação para fazer um ataque corpo a corpo" },
        ],
        benefits: [
            { type: 'feature', value: 'Frenesi', level: 3, description: 'Ataque adicional como ação bônus durante fúria' },
        ],
    },
    {
        name: "Caminho do Guerreiro Totêmico",
        className: "Bárbaro",
        level: 3,
        source: "PHB",
        description: "O Caminho do Guerreiro Totêmico é uma jornada espiritual, enquanto o bárbaro aceita um espírito animal como guia, protetor e inspiração.",
        features: [
            { level: 3, name: "Buscador Espiritual", description: "Você ganha a habilidade de conjurar magias de adivinhação e comunicação com animais" },
            { level: 3, name: "Totem Espiritual", description: "Escolha um espírito totem: Águia, Lobo ou Urso" },
            { level: 6, name: "Aspecto da Besta", description: "Você ganha um benefício mágico baseado no totem escolhido" },
            { level: 10, name: "Caminhante Espiritual", description: "Você pode conjurar comunhão com a natureza" },
            { level: 14, name: "Sintonia Totêmica", description: "Você ganha um benefício mágico baseado no totem escolhido" },
        ],
        benefits: [
            { type: 'spell', value: ['beast-sense', 'speak-with-animals'], level: 3, description: 'Magias rituais' },
        ],
    },
    {
        name: "Caminho do Batalhador",
        className: "Bárbaro",
        level: 3,
        source: "SCAG",
        description: "Bárbaros que seguem o Caminho do Batalhador combinam a ferocidade da fúria com técnicas de combate refinadas.",
        features: [
            { level: 3, name: "Técnicas de Batalha", description: "Você aprende manobras de combate" },
            { level: 6, name: "Fúria Persistente", description: "Sua fúria dura mais tempo" },
            { level: 10, name: "Golpe Devastador", description: "Você pode causar dano extra com seus ataques" },
            { level: 14, name: "Mestre de Batalha", description: "Você domina técnicas avançadas de combate" },
        ],
        benefits: [],
    },
    {
        name: "Caminho do Arauto da Tempestade",
        className: "Bárbaro",
        level: 3,
        source: "XGtE",
        description: "Bárbaros típicos carregam sua fúria como uma tocha em uma terra escura. Aqueles que seguem o Caminho do Arauto da Tempestade aprendem a transformar essa fúria em um manto de magia primordial.",
        features: [
            { level: 3, name: "Aura da Tempestade", description: "Quando você entra em fúria, emana uma aura tempestuosa" },
            { level: 6, name: "Alma da Tempestade", description: "A tempestade concede resistência a dano" },
            { level: 10, name: "Tempestade Protetora", description: "Você aprende a usar o vento para proteger aliados" },
            { level: 14, name: "Fúria da Tempestade", description: "Sua aura se torna mais destrutiva" },
        ],
        benefits: [
            { type: 'resistance', value: 'thunder', level: 6, description: 'Resistência a dano de trovão' },
        ],
    },
    {
        name: "Caminho do Zelote",
        className: "Bárbaro",
        level: 3,
        source: "XGtE",
        description: "Alguns deuses incitam seus seguidores a mergulhar no campo de batalha, dominados por fúria divina. Esses bárbaros são zelotes – guerreiros que canalizam sua fúria em exibições poderosas de poder divino.",
        features: [
            { level: 3, name: "Fúria Divina", description: "Você pode canalizar fúria divina para causar dano extra" },
            { level: 6, name: "Guerreiro dos Deuses", description: "Sua devoção divina o protege da morte" },
            { level: 10, name: "Presença Zelosa", description: "Você aprende a canalizar energia divina para inspirar aliados" },
            { level: 14, name: "Fúria Além da Morte", description: "Você pode continuar lutando mesmo após cair a 0 PV" },
        ],
        benefits: [
            { type: 'feature', value: 'Fúria Divina', level: 3, description: 'Dano radiante/necrótico extra no primeiro ataque' },
        ],
    },
    {
        name: "Caminho da Besta",
        className: "Bárbaro",
        level: 3,
        source: "TCoE",
        description: "Bárbaros que caminham o Caminho da Besta extraem sua fúria do poder bestial que arde em suas almas. Quando entram em fúria, manifestam essa besta interior.",
        features: [
            { level: 3, name: "Forma da Besta", description: "Quando você entra em fúria, você se transforma" },
            { level: 6, name: "Alma Bestial", description: "A fera interior fortalece seu corpo" },
            { level: 10, name: "Alma Contagiosa", description: "Quando você usa Forma da Besta, pode escolher um aliado" },
            { level: 14, name: "Chamado da Caçada", description: "A besta interior se torna poderosa o suficiente para controlar você" },
        ],
        benefits: [
            { type: 'feature', value: 'Forma da Besta', level: 3, description: 'Garras, cauda ou mordida durante fúria' },
        ],
    },
    {
        name: "Caminho da Magia Selvagem",
        className: "Bárbaro",
        level: 3,
        source: "TCoE",
        description: "Muitos lugares no multiverso abundam com beleza, magia intensa e emoção desenfreada. Para bárbaros, essas forças primordiais são mais do que apenas parte da natureza - elas são a própria essência de sua fúria.",
        features: [
            { level: 3, name: "Consciência Mágica", description: "Você pode sentir a presença de magia" },
            { level: 3, name: "Surto de Magia Selvagem", description: "Efeitos mágicos aleatórios quando você entra em fúria" },
            { level: 6, name: "Retribuição Mágica", description: "Quando você sofre dano, pode usar reação para causar dano de força" },
            { level: 10, name: "Fúria Instável", description: "Sempre que você entra em fúria, role na tabela de Magia Selvagem" },
            { level: 14, name: "Fúria Controlada", description: "Você pode controlar os efeitos de Magia Selvagem" },
        ],
        benefits: [
            { type: 'feature', value: 'Surto de Magia Selvagem', level: 3, description: 'Efeitos mágicos aleatórios durante fúria' },
        ],
    },
];
