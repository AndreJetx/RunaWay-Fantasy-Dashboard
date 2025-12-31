const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Conjure Celestial": "Você invoca uma criatura celestial de nível de desafio 4 ou inferior que aparece em um espaço desocupado dentro do alcance.",
    "Magnificent Mansion": "Você cria uma habitação extradimensional luxuosa com servos fantasmagóricos e comida farta para até 100 pessoas.",
    "Meld Into Stone": "Você mergulha e se esconde dentro de um objeto ou superfície de pedra sólida pela duração da magia.",
    "Pass Without Trace": "Um véu de sombras e silêncio torna você e seus aliados quase impossíveis de serem rastreados (+10 em Furtividade).",
    "Private Sanctum": "Você protege uma área contra espionagem, teletransporte e visão planar por 24 horas.",
    "Protection From Energy": "O alvo ganha resistência a um tipo de dano elemental: ácido, frio, fogo, relâmpago ou trovão.",
    "Resilient Sphere": "Uma esfera de força cintilante envolve uma criatura ou objeto, protegendo-o de todo dano mas impedindo-o de agir.",
    "Resistance": "Você toca uma criatura voluntária. Ela pode adicionar 1d4 a um teste de resistência de sua escolha.",
    "Secret Chest": "Você esconde um baú e seu conteúdo no Plano Etéreo, podendo recuperá-lo a qualquer momento.",
    "Speak with Plants": "Você imbui plantas com inteligência e pode conversar com elas para pedir informações ou favores.",
    "Spare the Dying": "Você toca uma criatura viva que tenha 0 pontos de vida. A criatura torna-se estável instantaneamente.",
    "Spike Growth": "O chão se torna cheio de espinhos e camuflado. Criaturas que caminham na área sofrem 2d4 de dano para cada 1,5 metro movido.",
    "Spirit Guardians": "Espíritos protetores flutuam ao seu redor. Inimigos na área têm seu deslocamento reduzido e sofrem dano radiante ou necrótico.",
    "Tiny Hut": "Uma cúpula de força imóvel envolve você e seus aliados, protegendo contra o clima e magias externas.",
    "Anti-Magic Field": "Uma esfera invisível de 3 metros de raio de antimagia envolve você, suprimindo toda a magia dentro dela."
};

let count = 0;
for (const [name, desc] of Object.entries(translations)) {
    for (const id in allSpells) {
        if (allSpells[id].name.toLowerCase() === name.toLowerCase() ||
            allSpells[id].name.toLowerCase().includes(name.toLowerCase())) {

            if (!allSpells[id].descriptionPT) {
                allSpells[id].descriptionPT = desc;
                count++;
            }
        }
    }
}

fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
console.log(`✅ Lote final de 100% concluído: +${count} magias.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 STATUS FINAL: ${total}/319 magias traduzidas.`);
