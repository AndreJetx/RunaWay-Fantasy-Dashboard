import { Subclass } from './types';

// ============================================================================
// BARDO - Nível 3
// ============================================================================

export const bardSubclasses: Subclass[] = [
    {
        name: "Colégio do Conhecimento",
        className: "Bardo",
        level: 3,
        source: "PHB",
        description: "Bardos do Colégio do Conhecimento sabem algo sobre a maioria das coisas, coletando pedaços de conhecimento de fontes tão diversas quanto tomos acadêmicos e contos camponeses.",
        features: [
            { level: 3, name: "Proficiências Adicionais", description: "Você ganha proficiência em três perícias à sua escolha" },
            { level: 3, name: "Palavras de Interrupção", description: "Você pode usar reação para distrair uma criatura" },
            { level: 6, name: "Segredos Mágicos Adicionais", description: "Você aprende duas magias de qualquer classe" },
            { level: 14, name: "Incomparável Habilidade", description: "Quando fizer um teste de habilidade, você pode adicionar metade do seu bônus de proficiência" },
        ],
        benefits: [
            { type: 'skill', value: 'choose-3', level: 3, description: 'Escolha 3 perícias adicionais' },
        ],
    },
    {
        name: "Colégio do Valor",
        className: "Bardo",
        level: 3,
        source: "PHB",
        description: "Bardos do Colégio do Valor são ousados escaldos cujos contos mantêm viva a memória dos grandes heróis do passado, inspirando assim uma nova geração de heróis.",
        features: [
            { level: 3, name: "Proficiências Adicionais", description: "Você ganha proficiência com armaduras médias, escudos e armas marciais" },
            { level: 3, name: "Inspiração em Combate", description: "Uma criatura que tem um dado de Inspiração Bárdica pode rolar o dado e adicionar ao dano ou CA" },
            { level: 6, name: "Ataque Extra", description: "Você pode atacar duas vezes quando usar a ação Ataque" },
            { level: 14, name: "Magia de Batalha", description: "Quando usar sua ação para conjurar uma magia, você pode fazer um ataque com arma como ação bônus" },
        ],
        benefits: [
            { type: 'proficiency', value: ['medium-armor', 'shields', 'martial-weapons'], level: 3, description: 'Proficiências em combate' },
        ],
    },
    {
        name: "Colégio das Espadas",
        className: "Bardo",
        level: 3,
        source: "SCAG",
        description: "Bardos do Colégio das Espadas são chamados de lâminas, e entretêm através de façanhas de proeza marcial.",
        features: [
            { level: 3, name: "Proficiências Adicionais", description: "Você ganha proficiência com armaduras médias e cimitarras" },
            { level: 3, name: "Estilo de Luta", description: "Você adota um estilo de luta" },
            { level: 3, name: "Floreio de Lâmina", description: "Você aprende a realizar impressionantes exibições de proeza marcial" },
            { level: 6, name: "Ataque Extra", description: "Você pode atacar duas vezes quando usar a ação Ataque" },
            { level: 14, name: "Floreio de Mestre", description: "Quando rolar iniciativa, você pode usar um Floreio de Lâmina sem gastar dado de Inspiração" },
        ],
        benefits: [
            { type: 'proficiency', value: ['medium-armor', 'scimitar'], level: 3, description: 'Proficiências em combate' },
        ],
    },
    {
        name: "Colégio do Glamour",
        className: "Bardo",
        level: 3,
        source: "XGtE",
        description: "O Colégio do Glamour está aberto àqueles bardos que dominaram suas artes nas salas luminosas das Terras Feéricas.",
        features: [
            { level: 3, name: "Presença Encantadora", description: "Você ganha a habilidade de tecer magia feérica em sua Inspiração Bárdica" },
            { level: 3, name: "Manto de Inspiração", description: "Como ação bônus, você pode gastar um uso de Inspiração Bárdica" },
            { level: 6, name: "Fuga Encantadora", description: "Você pode se desvincular magicamente do perigo" },
            { level: 14, name: "Majestade Inigualável", description: "Você ganha uma aparência de beleza sobrenatural" },
        ],
        benefits: [
            { type: 'feature', value: 'Presença Encantadora', level: 3, description: 'PV temporários e movimento para aliados' },
        ],
    },
    {
        name: "Colégio dos Sussurros",
        className: "Bardo",
        level: 3,
        source: "XGtE",
        description: "A maioria das pessoas fica feliz em receber um bardo em sua taverna ou corte, mas o medo dos bardos do Colégio dos Sussurros é tão grande que raramente são bem-vindos.",
        features: [
            { level: 3, name: "Palavras Psíquicas", description: "Você aprende a infligir dor terrível com suas palavras" },
            { level: 3, name: "Lâminas Psíquicas", description: "Você ganha a habilidade de fazer suas armas causarem dano psíquico terrível" },
            { level: 6, name: "Palavras de Terror", description: "Você aprende a infundir palavras inocentes com uma magia insidiosa" },
            { level: 14, name: "Persona Sombria", description: "Você ganha a habilidade de adotar a persona de um humanoide" },
        ],
        benefits: [
            { type: 'feature', value: 'Lâminas Psíquicas', level: 3, description: 'Dano psíquico extra em ataques com arma' },
        ],
    },
    {
        name: "Colégio da Criação",
        className: "Bardo",
        level: 3,
        source: "TCoE",
        description: "Bardos acreditam que o cosmos é uma obra de arte - a criação dos primeiros dragões e deuses.",
        features: [
            { level: 3, name: "Nota de Potencial", description: "Quando você dá Inspiração Bárdica, você pode pronunciar uma nota da Canção da Criação" },
            { level: 3, name: "Performance de Criação", description: "Você pode usar uma ação para canalizar a magia da canção da criação" },
            { level: 6, name: "Crescendo Animador", description: "Quando você usa Performance de Criação, você pode criar mais de um item" },
            { level: 14, name: "Apresentação Criativa", description: "Quando você usa Performance de Criação, você pode criar um item de raridade muito rara" },
        ],
        benefits: [
            { type: 'feature', value: 'Performance de Criação', level: 3, description: 'Criar objetos não-mágicos com música' },
        ],
    },
    {
        name: "Colégio da Eloquência",
        className: "Bardo",
        level: 3,
        source: "TCoE",
        description: "Aderência ao Colégio da Eloquência significa dominar a arte da oratória.",
        features: [
            { level: 3, name: "Língua Prateada", description: "Você é um mestre em dizer a coisa certa na hora certa" },
            { level: 3, name: "Inspiração Infalível", description: "Suas palavras inspiradoras são tão persuasivas que outros se sentem impelidos a ter sucesso" },
            { level: 6, name: "Palavras Infalíveis", description: "Você aprende a fazer suas palavras afetarem até mesmo aqueles que de outra forma seriam imunes" },
            { level: 14, name: "Discurso Infeccioso", description: "Você pode espalhar sua Inspiração Bárdica para múltiplas criaturas" },
        ],
        benefits: [
            { type: 'feature', value: 'Língua Prateada', level: 3, description: 'Mínimo de 10 em testes de Persuasão e Enganação' },
        ],
    },
];
