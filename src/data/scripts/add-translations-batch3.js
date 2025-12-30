const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Call Lightning": "Uma nuvem de tempestade aparece na forma de um cilindro. Relâmpagos caem da nuvem em pontos de sua escolha, causando 3d10 de dano de relâmpago em criaturas que falharem no teste de resistência de Destreza.",
    "Calm Emotions": "Você tenta suprimir emoções fortes em um grupo de pessoas. Cada humanoide em uma esfera de 6 metros deve fazer um teste de resistência de Carisma.",
    "Chain Lightning": "Você lança um relâmpago que atinge um alvo e depois salta para até três outros alvos. Cada alvo sofre 10d8 de dano de relâmpago.",
    "Charm Person": "Você tenta enfeitiçar um humanoide que possa ver. Ele deve fazer um teste de resistência de Sabedoria com vantagem se você estiver lutando contra ele.",
    "Chill Touch": "Você cria uma mão esquelética fantasmagórica no espaço de uma criatura. Faça um ataque de magia à distância. Causa 1d8 de dano necrótico e impede a cura por 1 turno.",
    "Color Spray": "Uma matriz deslumbrante de luzes coloridas sai de sua mão. Role 6d10; o total é o número de pontos de vida de criaturas que você pode cegar.",
    "Comprehend Languages": "Pela duração, você entende o significado literal de qualquer linguagem falada que ouvir e entende qualquer linguagem escrita que vir.",
    "Cone of Cold": "Uma explosão de frio extremo sai de suas mãos. Cada criatura em um cone de 18 metros deve sofrer 8d8 de dano de frio ou metade num sucesso.",
    "Confusion": "Esta magia ataca e confunde as mentes das criaturas, gerando delírios e ações impulsivas. Alvos falham no teste de resistência de Sabedoria ficam confusas.",
    "Conjure Animals": "Você invoca espíritos feéricos que assumem a forma de bestas e aparecem em espaços desocupados que você possa ver dentro do alcance.",
    "Conjure Elemental": "Você invoca um elemental de nível de desafio 5 ou inferior, que aparece em uma área de ar, terra, fogo ou água dentro do alcance.",
    "Counterspell": "Você tenta interromper uma criatura no processo de conjurar uma magia. Se a magia for de 3º nível ou inferior, ela falha imediatamente.",
    "Darkness": "Névoa mágica e escuridão emanam de um ponto à sua escolha. Criaturas com visão no escuro não podem ver através desta escuridão.",
    "Darkvision": "Você toca uma criatura e concede a ela a habilidade de ver no escuro até um alcance de 18 metros.",
    "Daylight": "Uma esfera de luz brilhante de 18 metros de raio emana de um ponto à sua escolha. Esta luz é considerada luz do dia.",
    "Death Ward": "Você toca uma criatura e a protege da morte. A primeira vez que ela cair para 0 pontos de vida, ela cai para 1 ponto de vida em vez disso.",
    "Dimension Door": "Você se teletransporta de sua localização atual para qualquer outro ponto dentro do alcance (150 metros). Você chega exatamente no local pretendido.",
    "Disguise Self": "Você faz com que você pareça diferente, incluindo suas roupas e equipamentos, até a magia acabar ou você usar uma ação para encerrá-la.",
    "Disintegrate": "Um raio verde fino sai do seu dedo. O alvo sofre 10d6 + 40 de dano de força. Se isso reduzir os pontos de vida a 0, o alvo é desintegrado.",
    "Dispel Magic": "Escolha uma criatura, objeto ou efeito mágico dentro do alcance. Qualquer magia de 3º nível ou inferior no alvo termina.",
    "Divination": "Sua magia e sua oferenda colocam você em contato com um deus ou servo divino. Você pode fazer uma pergunta sobre uma atividade futura.",
    "Dominate Monster": "Você tenta controlar mentalmente uma criatura que possa ver. Ela deve ser bem-sucedida num teste de resistência de Sabedoria ou será controlada.",
    "Dominate Person": "Você tenta controlar um humanoide. Ele deve ser bem-sucedido num teste de resistência de Sabedoria ou será controlado por você.",
    "Dream": "Esta magia molda os sonhos de uma criatura. Escolha uma criatura conhecida por você como o alvo da magia. Você ou um mensageiro entra no sonho.",
    "Eldritch Blast": "Um feixe de energia estalante viaja em direção a uma criatura dentro do alcance. Faça um ataque de magia à distância. Causa 1d10 de dano de força.",
    "Enhance Ability": "Você toca uma criatura e concede a ela um aprimoramento mágico. Escolha entre: Força do Touro, Graça do Gato, Esplendor da Águia, etc.",
    "Enlarge/Reduce": "Você faz uma criatura ou objeto ficar maior ou menor. Alvos aumentados ganham vantagem em testes de Força e causam dano extra.",
    "Entangle": "Vinhas e ervas daninhas surgem do chão. Criaturas na área devem fazer um teste de Força ou ficarão impedidas pela vegetação.",
    "Expeditious Retreat": "Esta magia permite que você se mova em um ritmo incrível. Quando conjura, e como ação bônus nos turnos seguintes, você pode Correr.",
    "Faerie Fire": "Um brilho suave azul, verde ou violeta circunda objetos e criaturas na área. Ataques contra alvos afetados têm vantagem.",
    "Fear": "Você projeta uma imagem fantasmagórica dos piores medos de uma criatura. Criaturas na área devem fugir de você enquanto estiverem amedrontadas.",
    "Feather Fall": "Escolha até cinco criaturas caindo dentro do alcance. A velocidade da queda de cada criatura diminui para 18 metros por rodada.",
    "Find Steed": "Você invoca um espírito que assume a forma de uma montaria excepcionalmente inteligente e leal, criando um laço telepático com você.",
    "Finger of Death": "Você envia energia negativa através de uma criatura. Ela sofre 7d8 + 30 de dano necrótico. Se morrer, ela se torna um zumbi sob seu controle.",
    "Fire Ball": "Um rastro brilhante de luz sai do seu dedo e explode em chamas em um ponto. Cada criatura em uma esfera de 6 metros sofre 8d6 de dano de fogo.",
    "Fire Bolt": "Você lança um dardo de fogo em uma criatura ou objeto dentro do alcance. Faça um ataque de magia à distância. Causa d10 de dano de fogo.",
    "Fly": "Você toca uma criatura voluntária. O alvo ganha deslocamento de voo de 18 metros pela duração da magia.",
    "Fog Cloud": "Você cria uma esfera de névoa espessa de 6 metros de raio. A área é considerada densamente obscurecida.",
    "Forbiddance": "Você cria uma barreira contra viagem planar em uma área. A área é protegida contra teletransporte e criaturas planares sofrem dano."
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
console.log(`✅ Lote 3 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
