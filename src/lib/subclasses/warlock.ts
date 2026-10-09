import { Subclass } from './types';

// ============================================================================
// BRUXO - Patronos (Nível 1)
// ============================================================================

export const warlockPatrons: Subclass[] = [
    {
        name: "O Arquifada",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "PHB",
        description: "Seu patrono é um senhor ou senhora das fadas, uma criatura de lenda que detém segredos que foram esquecidos antes das raças mortais nascerem.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Arquifada permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Presença Feérica", description: "Você pode fazer com que cada criatura em um cubo de 3m fique encantada ou amedrontada" },
            { level: 6, name: "Fuga Enevoada", description: "Você pode desaparecer em uma nuvem de névoa quando sofrer dano" },
            { level: 10, name: "Defesa Sedutora", description: "Quando uma criatura acertar você com um ataque, você pode usar sua reação" },
            { level: 14, name: "Delírio Sombrio", description: "Você pode mergulhar uma criatura em um reino ilusório" },
        ],
        benefits: [
            { type: 'spell', value: ['faerie-fire', 'sleep'], level: 1, description: 'Magias expandidas de 1º nível' },
        ],
    },
    {
        name: "O Corruptor",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "PHB",
        description: "Você fez um pacto com um corruptor dos Planos Inferiores da existência, um ser cujos objetivos são o mal.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Corruptor permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Bênção do Sombrio", description: "Quando você reduzir uma criatura hostil a 0 PV, você ganha PV temporários" },
            { level: 6, name: "Sorte do Sombrio", description: "Você pode chamar seu patrono para alterar o destino a seu favor" },
            { level: 10, name: "Resistência Corruptora", description: "Você pode escolher um tipo de dano quando terminar um descanso" },
            { level: 14, name: "Arremessar Através do Inferno", description: "Quando você acertar uma criatura com um ataque, você pode banir o alvo" },
        ],
        benefits: [
            { type: 'spell', value: ['burning-hands', 'command'], level: 1, description: 'Magias expandidas de 1º nível' },
        ],
    },
    {
        name: "O Grande Antigo",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "PHB",
        description: "Seu patrono é uma entidade misteriosa cuja natureza é totalmente estranha ao tecido da realidade.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Grande Antigo permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Mente Desperta", description: "Você pode se comunicar telepaticamente com qualquer criatura que você possa ver" },
            { level: 6, name: "Proteção Entrópica", description: "Você aprende a se proteger magicamente contra ataques" },
            { level: 10, name: "Escudo de Pensamento", description: "Seus pensamentos não podem ser lidos por telepatia" },
            { level: 14, name: "Criar Lacaio", description: "Você ganha a habilidade de infectar a mente de um humanoide" },
        ],
        benefits: [
            { type: 'spell', value: ['dissonant-whispers', 'tashas-hideous-laughter'], level: 1, description: 'Magias expandidas de 1º nível' },
        ],
    },
    {
        name: "O Celestial",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "XGtE",
        description: "Seu patrono é um ser poderoso dos Planos Superiores.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Celestial permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Luz Curativa", description: "Você ganha a habilidade de canalizar energia celestial para curar ferimentos" },
            { level: 6, name: "Alma Radiante", description: "Você ganha resistência a dano radiante" },
            { level: 10, name: "Resistência Celestial", description: "Você ganha resistência temporária a dano" },
            { level: 14, name: "Vingança Ardente", description: "A energia radiante que você canaliza permite que você resista à morte" },
        ],
        benefits: [
            { type: 'spell', value: ['cure-wounds', 'guiding-bolt'], level: 1, description: 'Magias expandidas de 1º nível' },
            { type: 'resistance', value: 'radiant', level: 6, description: 'Resistência a dano radiante' },
        ],
    },
    {
        name: "O Hexblade",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "XGtE",
        description: "Você fez seu pacto com uma força misteriosa do Pendor das Sombras - uma força que se manifesta em armas sencientes.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Hexblade permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Guerreiro Hexblade", description: "Você adquire a capacidade de usar Carisma para ataques com armas" },
            { level: 1, name: "Maldição do Hexblade", description: "Você ganha a habilidade de colocar uma maldição em alguém" },
            { level: 6, name: "Espectro Amaldiçoado", description: "Você pode amaldiçoar o espírito de uma pessoa que você mata" },
            { level: 10, name: "Armadura de Hexes", description: "Sua maldição cria um vínculo temporário entre você e seu alvo" },
            { level: 14, name: "Mestre de Hexes", description: "Você pode espalhar sua Maldição do Hexblade de uma criatura morta para outra" },
        ],
        benefits: [
            { type: 'proficiency', value: ['medium-armor', 'shields', 'martial-weapons'], level: 1, description: 'Proficiências em combate' },
            { type: 'spell', value: ['shield', 'wrathful-smite'], level: 1, description: 'Magias expandidas de 1º nível' },
        ],
    },
    {
        name: "O Gênio",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "TCoE",
        description: "Você fez um pacto com um dos raros gênios dos Planos Elementais.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Gênio permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Recipiente do Gênio", description: "Seu patrono lhe dá um recipiente mágico" },
            { level: 6, name: "Dádiva Elemental", description: "Você começa a adotar características do tipo de gênio do seu patrono" },
            { level: 10, name: "Santuário do Gênio", description: "Quando você entra no seu Recipiente do Gênio, você pode pedir que até cinco criaturas entrem" },
            { level: 14, name: "Desejo Limitado", description: "Você implora ao seu patrono uma pequena parte do poder de realizar desejos" },
        ],
        benefits: [
            { type: 'resistance', value: 'choose-elemental', level: 6, description: 'Resistência a dano elemental baseado no tipo de gênio' },
        ],
    },
    {
        name: "O Morto-Vivo",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "TCoE",
        description: "Você fez um pacto com uma entidade morta-viva.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Morto-Vivo permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Forma da Sepultura", description: "Você pode transformar-se em uma forma morta-viva" },
            { level: 6, name: "Desafiar a Morte", description: "Você pode dar a si mesmo vitalidade quando engana a morte" },
            { level: 10, name: "Vida Morta-Viva", description: "Você não precisa mais comer, beber ou respirar" },
            { level: 14, name: "Projetar Mortos-Vivos", description: "Você pode projetar sua consciência em um corpo morto-vivo" },
        ],
        benefits: [
            { type: 'spell', value: ['bane', 'false-life'], level: 1, description: 'Magias expandidas de 1º nível' },
        ],
    },
    {
        name: "O Profundo",
        className: "Bruxo",
        level: 1,
        type: 'patron',
        source: "TCoE",
        description: "Seu patrono é uma entidade das profundezas do oceano, de um lago profundo ou do Plano Elemental da Água.",
        features: [
            { level: 1, name: "Lista de Magias Expandida", description: "O Profundo permite que você escolha de uma lista expandida de magias" },
            { level: 1, name: "Tentáculo das Profundezas", description: "Você pode criar um tentáculo espectral que ataca seus inimigos" },
            { level: 1, name: "Dádiva do Mar", description: "Você ganha velocidade de natação e pode respirar embaixo d'água" },
            { level: 6, name: "Alma Oceânica", description: "Você ganha resistência a dano de frio e pode se comunicar com criaturas marinhas" },
            { level: 6, name: "Guardião do Tentáculo", description: "Seu tentáculo pode proteger você ou outros" },
            { level: 10, name: "Vórtice Escarranchado", description: "Você pode se teletransportar através de um vórtice de água" },
            { level: 14, name: "Libertar o Profundo", description: "Você invoca uma manifestação do seu patrono" },
        ],
        benefits: [
            { type: 'spell', value: ['create-or-destroy-water', 'thunderwave'], level: 1, description: 'Magias expandidas de 1º nível' },
            { type: 'resistance', value: 'cold', level: 6, description: 'Resistência a dano de frio' },
        ],
    },
];

// ============================================================================
// BRUXO - Pactos (Nível 3)
// ============================================================================

export const warlockPacts: Subclass[] = [
    {
        name: "Pacto da Lâmina",
        className: "Bruxo",
        level: 3,
        type: 'pact',
        source: "PHB",
        description: "Seu patrono lhe dá uma arma mágica - sua lâmina de pacto.",
        features: [
            { level: 3, name: "Lâmina de Pacto", description: "Você pode usar sua ação para criar uma arma de pacto em sua mão vazia" },
        ],
        benefits: [
            { type: 'feature', value: 'Lâmina de Pacto', level: 3, description: 'Criar arma mágica como ação' },
        ],
    },
    {
        name: "Pacto da Corrente",
        className: "Bruxo",
        level: 3,
        type: 'pact',
        source: "PHB",
        description: "Você aprende a magia encontrar familiar e pode conjurá-la como um ritual.",
        features: [
            { level: 3, name: "Pacto da Corrente", description: "Você aprende a magia encontrar familiar" },
        ],
        benefits: [
            { type: 'spell', value: ['find-familiar'], level: 3, description: 'Familiar especial' },
        ],
    },
    {
        name: "Pacto do Tomo",
        className: "Bruxo",
        level: 3,
        type: 'pact',
        source: "PHB",
        description: "Seu patrono lhe dá um grimório chamado Livro das Sombras.",
        features: [
            { level: 3, name: "Livro das Sombras", description: "Seu patrono lhe dá um grimório - um Livro das Sombras" },
        ],
        benefits: [
            { type: 'feature', value: 'Livro das Sombras', level: 3, description: '3 truques de qualquer classe' },
        ],
    },
    {
        name: "Pacto do Talismã",
        className: "Bruxo",
        level: 3,
        type: 'pact',
        source: "TCoE",
        description: "Seu patrono lhe dá um amuleto, um talismã que pode ajudar o portador quando a necessidade é grande.",
        features: [
            { level: 3, name: "Talismã", description: "Seu patrono lhe dá um amuleto mágico" },
        ],
        benefits: [
            { type: 'feature', value: 'Talismã', level: 3, description: 'Bônus em testes de habilidade' },
        ],
    },
];
