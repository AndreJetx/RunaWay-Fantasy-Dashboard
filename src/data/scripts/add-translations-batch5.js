const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Pass without Trace": "Um véu de sombras e silêncio irradia de você. Você e seus aliados a até 9 metros ganham um bônus de +10 em testes de Destreza (Furtividade).",
    "Phantasmal Killer": "Você acessa os pesadelos de uma criatura e cria uma manifestação ilusória de seus piores medos. O alvo sofre 4d10 de dano psíquico.",
    "Phantom Steed": "Você invoca uma criatura quase real que assume a forma de um cavalo. Ele tem deslocamento de 30 metros e pode andar sobre terreno difícil.",
    "Planar Ally": "Você suplica a uma entidade poderosa (deus ou senhor planar) por ajuda. A entidade envia um ser planar para servir você em troca de pagamento.",
    "Planar Binding": "Você tenta prender um celestial, elemental, fada ou demônio ao seu serviço. Se falhar no teste de Carisma, a criatura deve obedecer você por 24 horas.",
    "Plane Shift": "Você e até oito criaturas voluntárias são transportados para um plano de existência diferente ou para uma localização específica no Plano Material.",
    "Plant Growth": "Esta magia canaliza vitalidade nas plantas. Você pode fazer as plantas crescerem instantaneamente em uma área, tornando-a terreno difícil.",
    "Poison Spray": "Você projeta uma nuvem de gás tóxico da sua mão. Uma criatura deve ser bem-sucedida num teste de Constituição ou sofrerá 1d12 de dano de veneno.",
    "Polymorph": "Você transforma uma criatura que possa ver em uma nova forma de besta. O alvo assume as estatísticas de jogo da nova forma e seus pontos de vida.",
    "Power Word Kill": "Você pronuncia uma palavra de poder. Se a criatura que você puder ver tiver 100 pontos de vida ou menos, ela morre instantaneamente.",
    "Power Word Stun": "Você pronuncia uma palavra de poder. Se a criatura tiver 150 pontos de vida ou menos, ela fica atordoada.",
    "Prayer of Healing": "Até seis criaturas de sua escolha recuperam pontos de vida iguais a 2d8 + seu modificador de habilidade de conjuração.",
    "Prestidigitation": "Esta magia é um truque mágico simples que conjuradores iniciantes usam para praticar, como criar pequenos efeitos sensoriais ou limpar objetos.",
    "Prismatic Spray": "Oito raios multicoloridos saem da sua mão. Cada raio tem uma cor e efeito diferente (fogo, ácido, relâmpago, veneno, frio, petrificação, etc).",
    "Prismatic Wall": "Você cria uma barreira cintilante e multicolorida de sete camadas. Cada camada protege contra um tipo de dano e tem um efeito único.",
    "Produce Flame": "Uma chama tremulante aparece em sua mão. Ela emite luz e pode ser arremessada contra uma criatura a até 9 metros.",
    "Programmed Illusion": "Você cria uma ilusão visual de um objeto ou criatura que é ativada por um gatilho específico determinado por você (como alguém entrar na sala).",
    "Project Image": "Você cria uma cópia ilusória de si mesmo em uma localização que você conhece no mesmo plano de existência. Você pode ver e ouvir através dos sentidos dela.",
    "Protection from Energy": "Pela duração, a criatura tocada tem resistência a um tipo de dano de sua escolha: ácido, frio, fogo, relâmpago ou trovão.",
    "Protection from Evil and Good": "Até a magia acabar, uma criatura voluntária fica protegida contra certos tipos de criaturas: aberrações, celestiais, elementais, fadas, demônios e mortos-vivos.",
    "Protection from Poison": "Você toca uma criatura. O alvo tem vantagem em testes de resistência contra veneno e resistência a dano de veneno; neutraliza um veneno ativo.",
    "Purify Food and Drink": "Toda comida e bebida não-mágica em uma esfera de 1,5 metro de raio centrada em um ponto fica livre de venenos e doenças.",
    "Raise Dead": "Você traz uma criatura morta de volta à vida, desde que ela não tenha morrido há mais de 10 dias e não tenha morrido de velhice.",
    "Ray of Enfeeblement": "Um raio de energia negra enfraquece uma criatura. Enquanto a magia durar, ataques com armas de Força do alvo causam apenas metade do dano.",
    "Ray of Frost": "Um feixe de gelo azul-branco viaja em direção a uma criatura. Faça um ataque de magia à distância. Causa 1d8 de dano de frio e reduz o deslocamento.",
    "Ray of Sickness": "Um raio de energia nauseante atinge uma criatura. O alvo sofre 2d8 de dano de veneno e deve fazer um teste de Constituição ou ficará envenenado.",
    "Regenerate": "Uma criatura que você toca recupera 4d8 + 15 pontos de vida e regenera 1 ponto de vida a cada turno. Membros decepados crescem de volta.",
    "Reincarnate": "Você toca uma criatura humanoide morta e provê um novo corpo para ela, que pode ser de uma raça diferente da original.",
    "Remove Curse": "Ao seu toque, todas as maldições afetando um objeto ou criatura terminam. Se o objeto for um item amaldiçoado, a maldição permanece, mas o portador pode descartá-lo.",
    "Resurrection": "Você toca uma criatura que está morta há não mais de um século e a traz de volta à vida com todos os seus pontos de vida.",
    "Reverse Gravity": "Esta magia inverte a gravidade em um cilindro de 15 metros de raio. Criaturas e objetos na área caem para cima pela duração da magia.",
    "Revivify": "Você toca uma criatura que morreu no último minuto. A criatura retorna à vida com 1 ponto de vida. Esta magia não restaura membros perdidos."
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
console.log(`✅ Lote 5 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
