const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Gaseous Form": "Você transforma uma criatura voluntária em uma nuvem enevoada. O alvo ganha resistência a dano não mágico e pode passar por pequenas fendas.",
    "Gate": "Você abre um portal dimensional para um plano de existência diferente. Você pode invocar uma criatura específica pelo seu nome através do portal.",
    "Geas": "Você coloca um comando mágico em uma criatura, forçando-a a realizar um serviço ou impedindo-a de uma ação. Falhar causa dano psíquico massivo.",
    "Globe of Invulnerability": "Uma barreira cintilante de 3 metros envolve você. Magias de 5º nível ou inferior não podem afetar criaturas dentro da barreira.",
    "Goodberry": "Até dez bagas aparecem na sua mão e são infundidas com magia. Uma criatura que come uma baga recupera 1 ponto de vida e se nutre por um dia.",
    "Grease": "Gordura escorregadia cobre o chão em um quadrado de 3 metros. Criaturas que entram na área ou terminam o turno nela devem cair no chão (caído).",
    "Greater Invisibility": "Você ou uma criatura que tocar fica invisível. Diferente da Invisibilidade normal, esta magia não termina se o alvo atacar ou conjurar.",
    "Greater Restoration": "Você toca uma criatura e encerra um efeito negativo: charme, petrificação, maldição, ou redução de atributos e pontos de vida máximos.",
    "Guardian of Faith": "Um guardião espectral aparece em um espaço vazio. O guardião ocupa o espaço e causa 20 de dano radiante em criaturas hostis que se aproximam.",
    "Guiding Bolt": "Um relâmpago de luz brilha contra um alvo. Em um acerto, causa 4d6 de dano radiante e concede vantagem no próximo ataque contra o alvo.",
    "Gust of Wind": "Uma linha de vento forte de 18 metros emana de você. Criaturas na linha são empurradas para longe e a área é considerada terreno difícil.",
    "Hallow": "Você imbui uma área com poder sagrado (ou profano). Criaturas celestiais, elementais, fadas, demônios e mortos-vivos não podem entrar na área.",
    "Hallucinatory Terrain": "Você faz um terreno parecer, soar e cheirar como outro tipo de terreno natural (um campo gramado parece um pântano ou precipício).",
    "Harm": "Você desfere uma doença virulenta em uma criatura. O alvo deve fazer um teste de Constituição ou sofrerá 14d6 de dano necrótico.",
    "Haste": "Escolha uma criatura voluntária. Pela duração, o deslocamento dela dobra, ela ganha +2 na CA e uma ação adicional em cada turno.",
    "Heal": "Você libera uma onda de energia curativa. Uma criatura recupera 70 pontos de vida e é curada de cegueira, surdez e todas as doenças.",
    "Heat Metal": "Escolha um objeto manufaturado de metal dentro do alcance. O metal fica em brasa. Criaturas segurando o objeto sofrem 2d8 de dano de fogo.",
    "Hellish Rebuke": "Você aponta o dedo e a criatura que o feriu é envolta em chamas infernais. Ela deve fazer um teste de Resistência de Destreza ou sofrerá 2d10 de dano.",
    "Heroes' Feast": "Você traz um banquete magnífico. Até 12 criaturas que comem ficam curadas de doenças, venenos e imunes a medo por 24 horas.",
    "Hold Monster": "Você tenta paralisar uma criatura (não-humanoide). Ela deve ser bem-sucedida num teste de resistência de Sabedoria ou ficará paralisada.",
    "Hold Person": "Você tenta paralisar um humanoide. O alvo deve ser bem-sucedido num teste de resistência de Sabedoria ou ficará paralisada pela duração.",
    "Holy Aura": "Luz divina emana de você em um raio de 9 metros. Aliados ganham vantagem em testes de resistência e ataques contra eles têm desvantagem.",
    "Hunger of Hadar": "Você abre um portal para a escuridão entre as estrelas. Uma esfera de 6 metros de raio de escuridão mágica causa dano gélido e ácido.",
    "Hypnotic Pattern": "Você cria um padrão de cores cintilantes. Criaturas que olham para o padrão devem fazer um teste de Sabedoria ou ficarão incapacitadas.",
    "Ice Storm": "Granizo cai em um cilindro de 6 metros. Criaturas na área sofrem 2d8 de dano de concussão e 4d6 de dano de frio; a área vira terreno difícil.",
    "Identify": "Você toca um item mágico e aprende suas propriedades, como usá-lo e se ele requer sintonização.",
    "Imprisonment": "Você cria uma estrutura mágica para prender uma criatura. O alvo deve fazer um teste de Sabedoria ou ficará preso por tempo indefinido.",
    "Incendiary Cloud": "Uma nuvem de fumaça fétida com brasas aparece. No início de cada turno, criaturas na nuvem sofrem 10d8 de dano de fogo.",
    "Inflict Wounds": "Você toca uma criatura com a energia da morte. O alvo sofre 3d10 de dano necrótico em um acerto.",
    "Invisibility": "Uma criatura que você tocar fica invisível. A magia termina se o alvo atacar ou conjurar uma magia.",
    "Jump": "Você toca uma criatura. Pela duração, a distância de salto do alvo é triplicada.",
    "Knock": "Você toca um objeto trancado (porta, baú) e ele se abre. A magia emite um som de batida audível até 90 metros de distância.",
    "Legend Lore": "Você traz à mente lendas e histórias sobre uma pessoa, lugar ou objeto importante que você nomear.",
    "Lesser Restoration": "Você toca uma criatura e encerra uma condição: cego, surdo, paralisado ou envenenado.",
    "Levitate": "Uma criatura ou objeto à sua escolha flutua verticalmente até 6 metros de altura e permanece suspensa no ar.",
    "Light": "Você toca um objeto e ele emite luz brilhante em um raio de 6 metros e luz plena por mais 6 metros.",
    "Lightning Bolt": "Um relâmpago de 30 metros de comprimento dispara de você. Criaturas na linha sofrem 8d6 de dano de relâmpago.",
    "Locate Creature": "Você descreve ou nomeia uma criatura familiar para você e sente a direção e distância dela, desde que esteja a até 300 metros.",
    "Locate Object": "Você descreve um objeto e sente a direção em que ele está em um raio de 300 metros.",
    "Longstrider": "Você toca uma criatura e aumenta o deslocamento dela em 3 metros pela duração de uma hora.",
    "Mage Armor": "Você toca uma criatura voluntária que não esteja usando armadura. A CA dela se torna 13 + modificador de Destreza.",
    "Mage Hand": "Uma mão espectral e flutuante aparece. Você pode usá-la para manipular objetos, abrir portas ou carregar itens leves.",
    "Magic Circle": "Você cria um cilindro de energia mágica para prender ou repelir tipos específicos de criaturas (celestiais, elementais, etc).",
    "Magic Jar": "Sua alma deixa seu corpo e entra em uma gema ou cristal, permitindo que você possua o corpo de outra criatura.",
    "Magic Missile": "Você cria três dardos de força mágica. Cada dardo atinge automaticamente uma criatura de sua escolha e causa 1d4 + 1 de dano.",
    "Magic Weapon": "Você toca uma arma não-mágica. Ela se torna uma arma mágica com um bônus de +1 nas jogadas de ataque e dano.",
    "Major Image": "Você cria a imagem visual de um objeto, criatura ou outro fenômeno visível. A ilusão inclui som, cheiro e temperatura.",
    "Mass Cure Wounds": "Uma onda de energia curativa emana de um ponto. Até seis criaturas recuperam 3d8 + modificador de conjuração.",
    "Mass Heal": "Uma inundação de energia curativa restaura até 700 pontos de vida divididos entre qualquer número de criaturas que você puder ver.",
    "Mass Healing Word": "Você fala palavras de restauração. Até seis criaturas recuperam 1d4 + modificador de habilidade de conjuração.",
    "Mass Suggestion": "Você sugere um curso de atividade para até doze criaturas. Elas devem fazer um teste de Sabedoria ou seguirão sua sugestão.",
    "Maze": "Você bane uma criatura para um labirinto dimensional. O alvo deve usar sua ação para tentar escapar com um teste de Inteligência.",
    "Meld into Stone": "Você entra em um objeto ou superfície de pedra, permanecendo escondido dentro dele pela duração da magia.",
    "Melf's Acid Arrow": "Uma flecha verde atinge um alvo, causando 4d4 de dano ácido imediato e 2d4 de dano ácido no final do próximo turno dele.",
    "Mending": "Este truque repara uma única quebra ou rachadura em um objeto que você tocar, como um elo de corrente quebrado ou uma chave partida.",
    "Message": "Você aponta para uma criatura e sussurra uma mensagem. Apenas o alvo ouve a mensagem e ele pode responder com um sussurro.",
    "Meteor Swarm": "Meteoros de fogo caem do céu. Cada criatura em quatro esferas de 12 metros de raio sofre 20d6 de dano de fogo e 20d6 de dano de concussão.",
    "Mind Blank": "Até o fim da magia, uma criatura voluntária fica protegida contra detecção de pensamentos, controle mental e efeitos de vidência.",
    "Minor Illusion": "Você cria um som ou uma imagem de um objeto dentro do alcance que dura 1 minuto.",
    "Mirage Arcane": "Você faz com que o terreno em um raio de 1,6 km pareça, soe e cheire como uma paisagem diferente, alterando até as estruturas.",
    "Mirror Image": "Três duplicatas ilusórias de você aparecem. Enquanto as duplicatas existirem, ataques contra você podem atingir uma duplicata em vez de você.",
    "Mislead": "Você fica invisível e ao mesmo tempo uma duplicata ilusória de você aparece. Você pode controlar a duplicata e ver através dos olhos dela.",
    "Misty Step": "Brevemente cercado por névoa prateada, você se teletransporta até 9 metros para um espaço desocupado que você possa ver.",
    "Moonbeam": "Um feixe prateado de luz pálida desce em um cilindro de 1,5 metro de raio. Criaturas na luz sofrem 2d10 de dano radiante.",
    "Mordenkainen's Faithful Hound": "Você invoca um cão de guarda invisível em um espaço vazio, que late para intrusos e ataca criaturas dentro de 1,5 metro.",
    "Mordenkainen's Magnificent Mansion": "Você cria uma habitação extradimensional luxuosa com comida farta e servos fantasmagóricas para até 100 pessoas.",
    "Mordenkainen's Private Sanctum": "Você protege uma área contra espionagem, teletransporte e visão planar, tornando-a escura por fora.",
    "Move Earth": "Você escolhe uma área de terreno e molda a terra, criando valas, montes ou nivelando o solo ao longo de 10 minutos."
};

let count = 0;
for (const [name, desc] of Object.entries(translations)) {
    for (const id in allSpells) {
        if (allSpells[id].name === name && !allSpells[id].descriptionPT) {
            allSpells[id].descriptionPT = desc;
            count++;
        }
    }
}

fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
console.log(`✅ Lote 4 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
