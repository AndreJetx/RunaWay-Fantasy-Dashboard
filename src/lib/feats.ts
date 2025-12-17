// Feats (Talentos) do D&D 5e - Player's Handbook

export interface Feat {
  name: string;
  description: string;
  prerequisite?: string;
  attributeBonus?: {
    attribute: string;
    bonus: number;
  };
  benefits: string[];
}

export const FEATS: Feat[] = [
  {
    name: "Ator",
    description: "Habilidoso em mímica e dramatização, você ganha as seguintes vantagens:",
    attributeBonus: {
      attribute: "charisma",
      bonus: 1
    },
    benefits: [
      "Aumente seu Carisma em 1, até o máximo de 20",
      "Vantagem em testes de Carisma (Enganação) e (Atuação) quando tentar se passar por outra pessoa",
      "Você pode imitar a fala de outra pessoa ou sons de criaturas"
    ]
  },
  {
    name: "Alerta",
    description: "Sempre atento ao perigo, você ganha as seguintes vantagens:",
    benefits: [
      "+5 de bônus na iniciativa",
      "Você não pode ser surpreendido enquanto estiver consciente",
      "Outras criaturas não ganham vantagem em ataques contra você por estarem escondidas"
    ]
  },
  {
    name: "Atleta",
    description: "Você passou por treinamento físico extensivo e ganha os seguintes benefícios:",
    attributeBonus: {
      attribute: "strength",
      bonus: 1
    },
    benefits: [
      "Aumente sua Força ou Destreza em 1, até o máximo de 20",
      "Quando estiver caído, levantar usa apenas 5 pés do seu deslocamento",
      "Escalar não reduz pela metade seu deslocamento",
      "Você pode fazer um salto em distância ou altura com corrida de apenas 5 pés"
    ]
  },
  {
    name: "Carregador",
    description: "Você desenvolveu as habilidades necessárias para deslocamento em combate:",
    benefits: [
      "Quando você usa sua ação para Disparada, pode usar uma ação bônus para fazer um ataque corpo a corpo ou empurrar uma criatura",
      "Quando você usa sua ação bônus para Disparada, você pode se deslocar por terreno difícil sem custo adicional"
    ]
  },
  {
    name: "Sortudo",
    description: "Você tem sorte inexplicável que parece intervir no momento certo:",
    benefits: [
      "Você tem 3 pontos de sorte",
      "Você pode gastar 1 ponto de sorte para rolar um d20 adicional em um teste, ataque ou resistência",
      "Você pode gastar 1 ponto de sorte depois de rolar, mas antes do resultado ser determinado",
      "Você pode gastar 1 ponto de sorte quando uma criatura rola um ataque contra você, forçando-a a rolar novamente",
      "Você recupera todos os pontos de sorte gastos após um descanso longo"
    ]
  },
  {
    name: "Mago de Guerra",
    description: "Você praticou conjuração de magias em meio ao combate:",
    prerequisite: "Capacidade de conjurar pelo menos uma magia",
    benefits: [
      "Vantagem em testes de Constituição para manter concentração em magias quando sofrer dano",
      "Você pode realizar ataques de oportunidade contra uma criatura quando ela conjurar uma magia"
    ]
  },
  {
    name: "Mobilidade",
    description: "Você é excepcionalmente veloz e ágil:",
    benefits: [
      "Seu deslocamento aumenta em 10 pés",
      "Quando você usar a ação de Disparada, terreno difícil não custa movimento extra neste turno",
      "Quando você fizer um ataque corpo a corpo contra uma criatura, você não provoca ataques de oportunidade dela pelo resto do turno"
    ]
  },
  {
    name: "Duro na Queda",
    description: "Resistente e capaz de suportar muito dano:",
    benefits: [
      "Seus pontos de vida máximos aumentam em 2 por nível de personagem (incluindo níveis passados)",
      "Quando você ganhar um nível, seus pontos de vida aumentam em 2 adicionais"
    ]
  },
  {
    name: "Iniciado em Magia",
    description: "Escolha uma classe de conjurador: você aprende duas magias truque e uma magia de 1º nível dessa classe.",
    benefits: [
      "Aprenda 2 truques de qualquer classe de conjurador",
      "Aprenda 1 magia de 1º nível dessa classe",
      "Você pode conjurar essa magia uma vez por descanso longo",
      "Seu atributo de conjuração para essas magias depende da classe escolhida"
    ]
  },
  {
    name: "Sentinela",
    description: "Você dominou técnicas para aproveitar ataques de oportunidade:",
    benefits: [
      "Quando você acerta uma criatura com um ataque de oportunidade, o deslocamento dela se torna 0 pelo resto do turno",
      "Criaturas provocam ataques de oportunidade de você mesmo se realizarem a ação de Desengajar",
      "Quando uma criatura a 5 pés de você fizer um ataque contra um alvo que não seja você, você pode fazer um ataque de oportunidade contra ela"
    ]
  },
  {
    name: "Especialista em Armas Pesadas",
    description: "Você aprendeu a utilizar o peso de uma arma a seu favor:",
    prerequisite: "Proficiência com arma marcial",
    benefits: [
      "Quando você rolar 1 ou 2 em um dado de dano de um ataque com arma de duas mãos, pode rolar novamente e usar o novo resultado",
      "Antes de fazer um ataque corpo a corpo com arma pesada que você é proficiente, pode escolher sofrer -5 no ataque. Se acertar, adiciona +10 ao dano"
    ]
  },
  {
    name: "Mestre em Arco e Flecha",
    description: "Você alcançou maestria com arcos e bestas:",
    benefits: [
      "+2 de bônus em rolagens de ataque com armas de ataque à distância",
      "Ser a 5 pés de uma criatura hostil não impõe desvantagem em seus ataques à distância",
      "Seus ataques à distância ignoram meia cobertura e três quartos de cobertura",
      "Antes de fazer um ataque com arma de ataque à distância que você é proficiente, pode escolher sofrer -5 no ataque. Se acertar, adiciona +10 ao dano"
    ]
  },
  {
    name: "Observador",
    description: "Você é rápido em perceber detalhes do seu ambiente:",
    attributeBonus: {
      attribute: "wisdom",
      bonus: 1
    },
    benefits: [
      "Aumente sua Sabedoria em 1, até o máximo de 20",
      "+5 de bônus em testes de Sabedoria (Percepção) passiva e Inteligência (Investigação) passiva",
      "Você pode ler lábios de criaturas que você pode ver e que falam um idioma que você conhece"
    ]
  },
  {
    name: "Resistente",
    description: "Escolha um atributo. Você ganha proficiência em testes de resistência usando esse atributo.",
    attributeBonus: {
      attribute: "any",
      bonus: 1
    },
    benefits: [
      "Aumente o atributo escolhido em 1, até o máximo de 20",
      "Você ganha proficiência em testes de resistência usando esse atributo"
    ]
  },
  {
    name: "Combatente Dual",
    description: "Você domina a luta com duas armas:",
    benefits: [
      "Você ganha +1 de CA enquanto empunha uma arma corpo a corpo em cada mão",
      "Você pode usar combate com duas armas mesmo quando as armas que você está empunhando não são leves",
      "Você pode sacar ou guardar duas armas de uma mão quando normalmente só poderia sacar ou guardar uma"
    ]
  },
  {
    name: "Mestre em Escudos",
    description: "Você usa escudos não apenas para proteção, mas também como arma:",
    benefits: [
      "Se você sofrer o ataque de uma criatura que você pode ver a 5 pés de você, pode usar sua reação para adicionar +2 à sua CA contra esse ataque",
      "Se você é proficiente com escudos, pode usar sua ação bônus para tentar empurrar uma criatura a 5 pés de você com seu escudo"
    ]
  },
  {
    name: "Conjurador Adepto",
    description: "Você aprendeu a recuperar energia mágica rapidamente:",
    prerequisite: "Capacidade de conjurar pelo menos uma magia",
    benefits: [
      "Quando terminar um descanso curto, você pode escolher espaços de magia gastos para recuperar",
      "Os espaços de magia podem ter um nível combinado igual ou menor que a metade do seu nível de conjurador (arredondado para cima)",
      "Os espaços não podem ser de 6º nível ou superior",
      "Você não pode usar essa característica novamente até terminar um descanso longo"
    ]
  },
  {
    name: "Estudioso da Magia",
    description: "Você estudou as artes arcanas extensivamente:",
    attributeBonus: {
      attribute: "intelligence",
      bonus: 1
    },
    benefits: [
      "Aumente sua Inteligência em 1, até o máximo de 20",
      "Aprenda 2 magias truque à sua escolha do grimório do mago",
      "Aprenda 1 magia de 1º nível do grimório do mago",
      "Inteligência é seu atributo de conjuração para essas magias"
    ]
  },
  {
    name: "Resiliente",
    description: "Seu corpo e mente são excepcionalmente resistentes:",
    attributeBonus: {
      attribute: "constitution",
      bonus: 1
    },
    benefits: [
      "Aumente sua Constituição em 1, até o máximo de 20",
      "Você ganha proficiência em testes de resistência de Constituição"
    ]
  },
  {
    name: "Esquiva Sobrenatural",
    description: "Seu treinamento permitiu reações sobre-humanas ao perigo:",
    prerequisite: "Destreza 13 ou maior",
    benefits: [
      "Quando um atacante que você pode ver acerta você com um ataque, você pode usar sua reação para reduzir pela metade o dano do ataque contra você"
    ]
  },
  {
    name: "Adestrador de Bestas",
    description: "Você tem um talento natural para lidar com animais:",
    attributeBonus: {
      attribute: "wisdom",
      bonus: 1
    },
    benefits: [
      "Aumente sua Sabedoria em 1, até o máximo de 20",
      "Você pode usar uma ação bônus em seu turno para comandar uma criatura amigável a 60 pés de você que possa ouvi-lo",
      "A criatura pode usar sua reação para fazer um ataque corpo a corpo ou se deslocar até metade de seu deslocamento"
    ]
  },
];

export function getFeatByName(name: string): Feat | undefined {
  return FEATS.find(f => f.name === name);
}

export function getFeatsWithAttributeBonus(attribute?: string): Feat[] {
  if (!attribute) {
    return FEATS.filter(f => f.attributeBonus);
  }
  return FEATS.filter(f => 
    f.attributeBonus && 
    (f.attributeBonus.attribute === attribute || f.attributeBonus.attribute === 'any')
  );
}

