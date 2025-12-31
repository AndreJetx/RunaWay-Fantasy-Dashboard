const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Sacred Flame": "Radiação em forma de chama desce sobre uma criatura que você possa ver dentro do alcance. O alvo sofre 1d8 de dano radiante; não ganha benefício de cobertura.",
    "Sanctuary": "Você protege uma criatura contra ataques. Qualquer criatura que tentar atacar o alvo deve primeiro fazer um teste de Resistência de Sabedoria ou escolher um novo alvo.",
    "Scrying": "Você pode ver e ouvir uma criatura específica em qualquer distância, desde que ela falhe num teste de Sabedoria. Você cria um sensor invisível próximo ao alvo.",
    "Searing Smite": "A próxima vez que você atingir uma criatura com um ataque de arma corpo a corpo, o alvo sofre 1d6 de dano de fogo adicional e incendeia.",
    "See Invisibility": "Pela duração, você vê criaturas e objetos invisíveis como se fossem visíveis, e pode ver no Plano Etéreo.",
    "Seeming": "Esta magia permite que você mude a aparência de qualquer número de criaturas que possa ver dentro do alcance, incluindo roupas e equipamentos.",
    "Sending": "Você envia uma mensagem curta de vinte e cinco palavras ou menos para uma criatura familiar para você. O alvo ouve a mensagem na mente e pode responder.",
    "Sequester": "Você torna uma criatura ou objeto invisível e não detectável por magias de adivinhação. O alvo entra em um estado de animação suspensa e não envelhece.",
    "Shapechange": "Você assume a forma de uma criatura diferente. Você mantém suas estatísticas mentais e ganha todas as estatísticas físicas e habilidades da nova forma.",
    "Shatter": "Um som estridente e doloroso emana de um ponto à sua escolha. Criaturas na área sofrem 3d8 de dano trovejante; objetos não-mágicos sofrem o mesmo.",
    "Shield": "Uma barreira invisível surge para proteger você. Você ganha +5 de bônus na CA até o início do seu próximo turno e é imune a Mísseis Mágicos.",
    "Shield of Faith": "Um campo cintilante envolve uma criatura de sua escolha, concedendo-lhe um bônus de +2 na CA pela duração.",
    "Shillelagh": "A madeira de um porrete ou bordão que você segura é imbuída com o poder da natureza. A arma causa 1d8 de dano e usa seu modificador de Sabedoria.",
    "Shocking Grasp": "Eletricidade estala da sua mão. Faça um ataque de magia corpo a corpo. Causa 1d8 de dano elétrico e impede o alvo de realizar reações.",
    "Silence": "Pela duração, nenhum som pode ser criado ou passar através de uma esfera de 6 metros de raio centrada em um ponto dentro do alcance.",
    "Silent Image": "Você cria a imagem visual de um objeto, criatura ou outro fenômeno visível. A imagem é puramente visual e não inclui som ou outros sentidos.",
    "Simulacrum": "Você cria uma duplicata ilusória de uma fera ou humanoide. O simulacro é uma criatura parcial, tem metade dos pontos de vida e obedece a você.",
    "Sleep": "Esta magia envia criaturas em um mergulho em um sono mágico. Role 5d8; o total é o número de pontos de vida de criaturas que você pode afetar.",
    "Sleet Storm": "Chuva gelada e granizo caem em um cilindro de 12 metros de altura. A área fica densamente obscurecida e o chão fica escorregadio.",
    "Slow": "Você altera o tempo ao redor de até seis criaturas. Alvos afetados têm seu deslocamento reduzido pela metade, penalidade na CA e perdem reações.",
    "Speak with Animals": "Você ganha a habilidade de compreender e se comunicar verbalmente com bestas pela duração da magia.",
    "Speak with Dead": "Você concede um semblante de vida a um cadáver, permitindo que ele responda a até cinco perguntas que você fizer.",
    "Speak with Plants": "Você imbui plantas com vida e inteligência limitadas, permitindo que você se comunique com elas e peça favores simples.",
    "Spider Climb": "Até a magia terminar, uma criatura voluntária ganha a habilidade de se mover por superfícies verticais e no teto, deixando as mãos livres.",
    "Spiritual Weapon": "Você cria uma arma espectral flutuante que ataca seus inimigos. Pela duração, você pode usar uma ação bônus para mover a arma e atacar.",
    "Stinking Cloud": "Você cria uma esfera de gás fétido e amarelado. Criaturas que começam o turno na nuvem devem fazer um teste de Constituição ou perderão sua ação.",
    "Stone Shape": "Você molda um objeto de pedra de tamanho Médio ou menor para que tome a forma que você desejar.",
    "Stoneskin": "A pele de uma criatura voluntária fica rígida como pedra. O alvo ganha resistência a dano de concussão, perfurante e cortante não-mágico.",
    "Storm of Vengeance": "Uma nuvem de tempestade massiva se forma. A cada turno, a tempestade produz efeitos diferentes: chuva ácida, relâmpagos, granizo e ventos fortes.",
    "Suggestion": "Você sugere um curso de atividade (limitado a uma ou duas sentenças) para uma criatura. O alvo deve fazer um teste de Sabedoria ou seguirá o comando.",
    "Sunbeam": "Um feixe de luz brilhante dispara da sua mão. Criaturas na linha sofrem 6d8 de dano radiante e ficam cegas. Você pode disparar o feixe repetidamente.",
    "Sunburst": "Luz solar brilhante explode. Cada criatura em um raio de 18 metros deve fazer um teste de Constituição ou sofrerá 12d6 de dano radiante e ficará cega.",
    "Symbol": "Você escreve um glifo nocivo em uma superfície ou dentro de um objeto. Quando ativado, o símbolo libera um efeito devastador (morte, medo, dor, etc).",
    "Telekinesis": "Você ganha a habilidade de mover ou manipular criaturas ou objetos com o poder da sua mente em um raio de 18 metros.",
    "Telepathic Bond": "Você cria um elo telepático entre até oito criaturas voluntárias. Elas podem se comunicar telepaticamente através do elo em qualquer distância.",
    "Teleport": "Esta magia transporta você e até oito criaturas voluntárias para um destino à sua escolha no mesmo plano de existência.",
    "Teleportation Circle": "Você desenha um círculo de 3 metros de diâmetro no chão que cria um portal para um círculo de teletransporte permanente que você conheça.",
    "Thaumaturgy": "Você manifesta pequenas maravilhas, um sinal de poder sobrenatural, como aumentar sua voz, tremer o chão ou mudar a cor de chamas.",
    "Thunderwave": "Uma onda de força trovejante emana de você. Criaturas em um cubo de 4,5 metros sofrem 2d8 de dano trovejante e são empurradas.",
    "Time Stop": "Você para o fluxo do tempo para todos, exceto você, por 1d4 + 1 rodadas. Você pode se mover e usar ações normalmente enquanto o tempo está parado.",
    "Tongues": "Esta magia concede à criatura tocada a habilidade de entender qualquer linguagem falada que ouvir e de ser entendida por qualquer criatura.",
    "Transport via Plants": "Esta magia cria um elo entre uma planta Grande viva e outra planta em qualquer distância, permitindo que você passe de uma para a outra.",
    "Tree Stride": "Você ganha a habilidade de entrar em uma árvore e sair de outra árvore do mesmo tipo a até 150 metros de distância.",
    "True Polymorph": "Você transforma uma criatura ou objeto em uma criatura ou objeto diferente de forma permanente (se a concentração durar o tempo total).",
    "True Resurrection": "Você toca uma criatura morta há não mais de 200 anos. Ela retorna à vida com todos os seus pontos de vida e um corpo novo se necessário.",
    "True Seeing": "Esta magia concede à criatura tocada a habilidade de ver as coisas como elas realmente são, ignorando ilusões, invisibilidade e escuridão mágica.",
    "True Strike": "Você estende sua mão e aponta o dedo para um alvo. Você ganha vantagem na sua primeira jogada de ataque contra o alvo no seu próximo turno."
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
console.log(`✅ Lote 6 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
