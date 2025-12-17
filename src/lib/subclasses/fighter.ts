import { Subclass } from './types';

// ============================================================================
// GUERREIRO - Arquétipos Marciais (Nível 3)
// ============================================================================

export const fighterSubclasses: Subclass[] = [
    {
        name: "Campeão",
        className: "Guerreiro",
        level: 3,
        source: "PHB",
        description: "O arquétipo de Campeão foca na excelência física pura, refinada à perfeição mortal.",
        features: [
            { level: 3, name: "Crítico Aprimorado", description: "Seus ataques com arma acertam crítico em 19-20" },
            { level: 7, name: "Atleta Notável", description: "Você adiciona metade do seu bônus de proficiência a testes de Força, Destreza e Constituição" },
            { level: 10, name: "Estilo de Luta Adicional", description: "Você escolhe um segundo Estilo de Luta" },
            { level: 15, name: "Crítico Superior", description: "Seus ataques com arma acertam crítico em 18-20" },
            { level: 18, name: "Sobrevivente", description: "Você recupera pontos de vida no início do seu turno" },
        ],
        benefits: [],
    },
    {
        name: "Mestre de Batalha",
        className: "Guerreiro",
        level: 3,
        source: "PHB",
        description: "Aqueles que emulam o arquétipo de Mestre de Batalha empregam técnicas marciais passadas através de gerações.",
        features: [
            { level: 3, name: "Superioridade em Combate", description: "Você aprende manobras e ganha dados de superioridade" },
            { level: 3, name: "Estudante de Guerra", description: "Você ganha proficiência em uma perícia ou ferramenta" },
            { level: 7, name: "Conhece Teu Inimigo", description: "Você pode avaliar as capacidades de um oponente" },
            { level: 10, name: "Superioridade em Combate Aprimorada", description: "Seus dados de superioridade aumentam para d10" },
            { level: 15, name: "Implacável", description: "Você recupera um dado de superioridade se não tiver nenhum" },
            { level: 18, name: "Superioridade em Combate Aprimorada", description: "Seus dados de superioridade aumentam para d12" },
        ],
        benefits: [
            { type: 'skill', value: 'choose-1', level: 3, description: 'Escolha 1 perícia ou ferramenta de artesão' },
        ],
    },
    {
        name: "Cavaleiro Arcano",
        className: "Guerreiro",
        level: 3,
        source: "PHB",
        description: "O arquétipo de Cavaleiro Arcano combina a maestria marcial comum a todos os guerreiros com um estudo cuidadoso de magia.",
        features: [
            { level: 3, name: "Conjuração", description: "Você aprende a conjurar magias" },
            { level: 3, name: "Vínculo com Arma", description: "Você aprende um ritual que cria um vínculo mágico entre você e uma arma" },
            { level: 7, name: "Magia de Guerra", description: "Quando você usa sua ação para conjurar um truque, você pode fazer um ataque com arma como ação bônus" },
            { level: 10, name: "Golpe Arcano", description: "Você aprende a infundir seus ataques com magia" },
            { level: 15, name: "Carga Arcana", description: "Você ganha a habilidade de se teletransportar" },
            { level: 18, name: "Magia de Guerra Aprimorada", description: "Quando você usa sua ação para conjurar uma magia, você pode fazer um ataque com arma como ação bônus" },
        ],
        benefits: [
            { type: 'spell', value: 'wizard-cantrips', level: 3, description: 'Conjuração de magias' },
        ],
    },
    {
        name: "Samurai",
        className: "Guerreiro",
        level: 3,
        source: "XGtE",
        description: "O Samurai é um guerreiro que se baseia em uma tradição de honra e disciplina.",
        features: [
            { level: 3, name: "Proficiência Adicional", description: "Você ganha proficiência em uma perícia" },
            { level: 3, name: "Espírito de Luta", description: "Você pode se dar pontos de vida temporários" },
            { level: 7, name: "Cortesia Elegante", description: "Você adiciona seu bônus de Sabedoria a testes de Persuasão" },
            { level: 10, name: "Vontade Inabalável", description: "Você adiciona seu bônus de proficiência a testes de resistência de Sabedoria" },
            { level: 15, name: "Golpe Rápido", description: "Você pode fazer um ataque extra" },
            { level: 18, name: "Força Antes da Morte", description: "Quando você for reduzido a 0 pontos de vida, você pode fazer um turno extra" },
        ],
        benefits: [
            { type: 'skill', value: 'choose-1', level: 3, description: 'Escolha 1 perícia entre History, Insight, Performance, Persuasion' },
        ],
    },
    {
        name: "Cavaleiro Rúnico",
        className: "Guerreiro",
        level: 3,
        source: "TCoE",
        description: "Cavaleiros Rúnicos aprimoram seu equipamento com runas mágicas dos gigantes.",
        features: [
            { level: 3, name: "Proficiência Adicional", description: "Você ganha proficiência com ferramentas de ferreiro" },
            { level: 3, name: "Runas de Gigante", description: "Você aprende runas mágicas" },
            { level: 3, name: "Magia de Gigante", description: "Você aprende magias relacionadas a gigantes" },
            { level: 7, name: "Estatura de Gigante", description: "Você pode aumentar seu tamanho" },
            { level: 10, name: "Grande Estatura", description: "Você se torna Grande permanentemente" },
            { level: 15, name: "Mestre de Runas", description: "Você pode invocar o poder de suas runas" },
            { level: 18, name: "Destruidor de Runas", description: "Você pode destruir magias com suas runas" },
        ],
        benefits: [
            { type: 'proficiency', value: 'smiths-tools', level: 3, description: 'Proficiência com ferramentas de ferreiro' },
            { type: 'language', value: 'giant', level: 3, description: 'Você aprende Gigante' },
        ],
    },
    {
        name: "Psi Warrior",
        className: "Guerreiro",
        level: 3,
        source: "TCoE",
        description: "Psi Warriors despertam poderes psiônicos latentes.",
        features: [
            { level: 3, name: "Poderes Psiônicos", description: "Você ganha dados de energia psiônica" },
            { level: 7, name: "Golpe Telecinético", description: "Você pode mover criaturas com sua mente" },
            { level: 10, name: "Escudo Protetor", description: "Você pode criar um escudo psiônico" },
            { level: 15, name: "Salto Telecinético", description: "Você pode voar com telecinese" },
            { level: 18, name: "Mestre Telecinético", description: "Você pode lançar telecinese" },
        ],
        benefits: [],
    },
    {
        name: "Eco Knight",
        className: "Guerreiro",
        level: 3,
        source: "TCoE",
        description: "Eco Knights manifestam ecos de si mesmos de linhas temporais alternativas.",
        features: [
            { level: 3, name: "Manifestar Eco", description: "Você pode invocar um eco de si mesmo" },
            { level: 3, name: "Liberar Encarnação", description: "Você pode fazer um ataque extra através do seu eco" },
            { level: 7, name: "Avatar Eco", description: "Você pode se teletransportar para o seu eco" },
            { level: 10, name: "Martelo das Sombras", description: "Você pode fazer seu eco atacar" },
            { level: 15, name: "Recorrência", description: "Você pode fazer seu eco absorver dano" },
            { level: 18, name: "Legião de Um", description: "Você pode criar múltiplos ecos" },
        ],
        benefits: [],
    },
];
