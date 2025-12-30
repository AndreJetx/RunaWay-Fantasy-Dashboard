const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Bane": "Você amaldiçoa até três criaturas que possa ver dentro do alcance. Cada alvo deve ser bem-sucedido em um teste de resistência de Carisma ou, sempre que fizer uma jogada de ataque ou um teste de resistência antes da magia terminar, o alvo deve subtrair 1d4 da jogada.",
    "Bless": "Você abençoa até três criaturas que possa ver dentro do alcance. Sempre que um alvo fizer uma jogada de ataque ou um teste de resistência antes da magia terminar, o alvo pode adicionar 1d4 à jogada.",
    "Burning Hands": "Enquanto seus polegares se tocam e seus dedos estão abertos, uma fina camada de chamas sai das pontas dos seus dedos. Cada criatura em um cone de 4,5 metros deve fazer um teste de resistência de Destreza. Uma criatura sofre 3d6 de dano de fogo em uma falha, ou metade em um sucesso.",
    "Command": "Você fala um comando de uma única palavra para uma criatura que possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Sabedoria ou seguirá o comando no próximo turno dele (Ex: Parem, Caiam, Fujam).",
    "Cure Wounds": "Uma criatura que você toca recupera um número de pontos de vida igual a 1d8 + seu modificador de habilidade de conjuração. Esta magia não tem efeito em mortos-vivos ou construtos.",
    "Detect Magic": "Pela duração, você sente a presença de magia a até 9 metros de você. Se você sentir magia desta forma, você pode usar sua ação para ver uma aura fraca ao redor de qualquer criatura ou objeto visível na área que contenha magia.",
    "Guiding Bolt": "Um relâmpago de luz brilha em direção a uma criatura dentro do alcance. Faça um ataque de magia à distância. Em um acerto, o alvo sofre 4d6 de dano radiante, e a próxima jogada de ataque feita contra este alvo antes do final do seu próximo turno tem vantagem.",
    "Healing Word": "Uma criatura de sua escolha que você possa ver dentro do alcance recupera pontos de vida iguais a 1d4 + seu modificador de habilidade de conjuração. Esta magia não tem efeito em mortos-vivos ou construtos.",
    "Inflict Wounds": "Faça um ataque de magia corpo a corpo contra uma criatura que você possa tocar. Em um acerto, o alvo sofre 3d10 de dano necrótico.",
    "Magic Missile": "Você cria três dardos brilhantes de força mágica. Cada dardo atinge uma criatura de sua escolha que você possa ver dentro do alcance. Um dardo causa 1d4 + 1 de dano de força ao seu alvo. Os dardos atingem simultaneamente.",
    "Shield": "Uma barreira invisível de força mágica aparece e protege você. Até o início do seu próximo turno, você tem um bônus de +5 na CA, incluindo contra o ataque de gatilho, e você não sofre dano de mísseis mágicos.",
    "Shield of Faith": "Um campo cintilante aparece e envolve uma criatura de sua escolha dentro do alcance, concedendo-lhe um bônus de +2 na CA pela duração.",
    "Thunderous Smite": "A primeira vez que você atingir com um ataque de arma corpo a corpo enquanto esta magia durar, sua arma ressoa com trovão, e o ataque causa 2d6 de dano de trovão adicional ao alvo. Além disso, o alvo deve ser bem-sucedido em um teste de resistência de Força ou será empurrado 3 metros para longe de você e caído.",
    "Wrathful Smite": "A próxima vez que você atingir com um ataque de arma corpo a corpo enquanto esta magia durar, seu ataque causa 1d6 de dano psíquico adicional. O alvo deve fazer um teste de resistência de Sabedoria ou ficará amedrontado por você até a magia acabar.",
    "Searing Smite": "A próxima vez que você atingir uma criatura com um ataque de arma corpo a corpo enquanto esta magia durar, seu ataque causa 1d6 de dano de fogo adicional e incendeia o alvo.",
    "Compelled Duel": "Você tenta compelir uma criatura a um duelo. Uma criatura que você possa ver dentro do alcance deve fazer um teste de resistência de Sabedoria. Em uma falha, a criatura é atraída por você, compelida pelo seu desafio divino.",
    "Divine Favor": "Sua oração imbui você com poder divino. Até a magia acabar, seus ataques com armas causam 1d4 de dano radiante adicional em um acerto."
};

let count = 0;
for (const [name, desc] of Object.entries(translations)) {
    for (const id in allSpells) {
        if (allSpells[id].name === name) {
            allSpells[id].descriptionPT = desc;
            count++;
        }
    }
}

fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
console.log(`✅ Lote 2 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
