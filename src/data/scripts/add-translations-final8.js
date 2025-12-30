const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Contact Other Plane": "Você envia sua mente para outro plano de existência para falar com uma entidade poderosa e fazer cinco perguntas.",
    "Dominate Beast": "Você tenta controlar mentalmente uma besta que possa ver. Ela deve fazer um teste de Resistência de Sabedoria ou será controlada.",
    "Forcecage": "Você cria uma prisão de força invisível em forma de cubo ou gaiola que é indestrutível e inquebrável por meios mágicos.",
    "Gentle Repose": "Você toca um cadáver e o protege contra a decomposição natural e contra ser transformado em morto-vivo por 10 dias.",
    "Guards and Wards": "Você cria uma série de efeitos mágicos em um local (névoa, portas trancadas, teias, sugestões) para protegê-lo.",
    "Hideous Laughter": "O alvo percebe tudo como hilário e cai no chão em um acesso de riso, ficando incapacitado e caído.",
    "Instant Summons": "Você marca um objeto e pode invocá-lo instantaneamente para sua mão, não importa a distância, desde que esteja no mesmo plano.",
    "Locate Animals or Plants": "Você sente a direção e distância de um tipo específico de besta ou planta a até 8 quilômetros de você."
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
console.log(`✅ Lote final absoluto concluído: +${count} magias.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`\n🏆 MISSÃO CUMPRIDA: ${total}/319 magias traduzidas corretamente!`);
