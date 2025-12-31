const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Unseen Servant": "Você cria uma força invisível, sem mente e sem forma que realiza tarefas simples ao seu comando, como limpar, dobrar roupas ou servir comida.",
    "Vampiric Touch": "O toque da sua mão envolta em sombras pode sugar a força vital. Faça um ataque de magia corpo a corpo. Causa 3d6 de dano necrótico e você se cura metade.",
    "Vicious Mockery": "Você desfere uma série de insultos imbuídos de magia em uma criatura. O alvo deve fazer um teste de Sabedoria ou sofrerá 1d4 de dano psíquico.",
    "Wall of Fire": "Você cria uma parede de fogo ardente em uma superfície sólida dentro do alcance. Criaturas que terminam o turno próximas ou passam pela parede sofrem 5d8 de dano.",
    "Wall of Force": "Uma barreira invisível de força mágica surge em um ponto à sua escolha. A parede é indestrutível e nada pode passar fisicamente através dela.",
    "Wall of Ice": "Você cria uma parede de gelo composta por dez painéis. Criaturas na área quando ela aparece sofrem 10d6 de dano de frio; a parede pode ser quebrada.",
    "Wall of Stone": "Uma parede de pedra sólida surge em uma superfície. A parede pode ser moldada em formas simples e se torna permanente se a concentração durar 10 minutos.",
    "Wall of Thorns": "Você cria uma parede de arbustos e espinhos resistentes. Criaturas na parede sofrem 7d8 de dano cortante; a área é terreno difícil.",
    "Warding Bond": "Esta magia cria um elo de proteção entre você e um aliado. O alvo ganha +1 na CA e testes de resistência, além de resistência a todo dano.",
    "Water Breathing": "Esta magia concede a até dez criaturas voluntárias a habilidade de respirar debaixo d'água pela duração técnica de 24 horas.",
    "Water Walk": "Esta magia concede a até dez criaturas voluntárias a habilidade de se mover através de qualquer superfície líquida como se fosse solo sólido.",
    "Web": "Você conjura uma massa de teias pegajosas e grossas. Criaturas na área devem fazer um teste de Destreza ou ficarão impedidas pelas teias.",
    "Weird": "Você evoca pesadelos nas mentes de cada criatura em uma esfera de 9 metros. Alvos falham no teste de Sabedoria ficam amedrontadas e sofrem dano psíquico.",
    "Wind Walk": "Você e até dez criaturas voluntárias se transformam em nuvens de fumaça. Ganham deslocamento de voo de 90 metros e resistência a dano não-mágico.",
    "Wind Wall": "Uma parede de vento forte surge do chão. Criaturas na área sofrem 3d8 de dano de concussão; projéteis de flechas são desviados automaticamente.",
    "Wish": "Desejo é a magia mais poderosa que uma criatura mortal pode conjurar. Simplesmente falando em voz alta, você pode alterar as fundações da realidade.",
    "Witch Bolt": "Um feixe de energia azul estalante atinge uma criatura. Causa 1d12 de dano elétrico e você pode usar sua ação para causar dano automaticamente nos turnos seguintes.",
    "Word of Recall": "Você e até cinco criaturas voluntárias teletransportam-se instantaneamente para um santuário previamente designado que seja sagrado para sua divindade.",
    "Zone of Truth": "Você cria uma zona mágica que impede a mentira. Criaturas na área que falharem num teste de Carisma não podem falar mentiras deliberadas.",
    "Web": "Você cria uma massa de teias pegajosas em um ponto à sua escolha. Criaturas na área devem fazer um teste de Destreza ou ficarão presas (impedido).",
    "Aid": "Sua magia fortalece seus aliados. O máximo de pontos de vida e os pontos de vida atuais de até três criaturas aumentam em 5 pela duração.",
    "Alarm": "Você configura um alarme contra intrusões. Um alarme (mental ou sonoro) alerta você sempre que uma criatura entrar na área protegida.",
    "Barkskin": "Você toca uma criatura voluntária. Até a magia acabar, a pele do alvo fica áspera como casca de árvore e sua CA não pode ser menor que 16.",
    "Beacon of Hope": "Esta magia emite esperança e vitalidade. Alvos ganham vantagem em testes de resistência de Sabedoria e contra morte, e cura máxima.",
    "Bestow Curse": "Você toca uma criatura e ela deve fazer um teste de resistência de Sabedoria ou ficará amaldiçoada pela duração da magia.",
    "Blight": "Energia necromante drena a vida de uma criatura. O alvo sofre 8d8 de dano necrótico. Plantas têm desvantagem e sofrem dano máximo.",
    "Blindness/Deafness": "Você pode cegar ou ensurdecer um oponente. O alvo deve fazer um teste de Constituição para evitar o efeito.",
    "Blink": "No final de cada um de seus turnos, você rola um d20. Com 11 ou mais, você desaparece do seu plano atual e entra no Plano Etéreo.",
    "Blur": "Seu corpo se torna trêmulo e indistinto. Pela duração, qualquer criatura tem desvantagem nas jogadas de ataque contra você.",
    "Cloudkill": "Você cria uma esfera de gás verde venenoso e amarelado. A nuvem se move para longe de você a cada turno e mata criaturas instantaneamente.",
    "Color Spray": "Uma explosão de luzes coloridas cega criaturas. Role 6d10 para determinar o total de pontos de vida das criaturas afetadas.",
    "Commune": "Você entra em contato com sua divindade e faz até três perguntas que possam ser respondidas com sim ou não.",
    "Commune with Nature": "Você se torna um com a natureza e aprende fatos sobre o território ao seu redor (água, vilas, monstros, minerais).",
    "Comprehend Languages": "Você entende o significado literal de qualquer linguagem falada que ouvir e entende qualquer linguagem escrita que vir.",
    "Compulsion": "Criaturas de sua escolha em um raio de 9 metros devem fazer um teste de resistência de Sabedoria ou serão forçadas a se mover em uma direção.",
    "Delayed Blast Fireball": "Um feixe de luz amarela sai do seu dedo e se condensa em uma conta brilhante. A conta explode causando dano massivo de fogo.",
    "Demiplane": "Você cria uma porta que leva a um semiplano vazio, uma sala de 9 metros feita de pedra, madeira ou metal.",
    "Detect Evil and Good": "Pela duração, você sabe se há uma aberração, celestial, corruptor, elemental, fada ou morto-vivo a até 9 metros de você.",
    "Detect Thoughts": "Você lê os pensamentos superficiais de uma criatura. Você também pode tentar ler pensamentos mais profundos se o alvo falhar num teste de Sabedoria.",
    "Divine Word": "Você pronuncia uma palavra divina, imbuída com o poder que moldou o mundo. Criaturas de sua escolha sofrem efeitos baseados em seus pontos de vida.",
    "Enthrall": "Você tece uma corda de palavras desconcertantes, atraindo a atenção das criaturas. Alvos têm desvantagem em testes de Percepção.",
    "Etherealness": "Você entra nas bordas do Plano Etéreo, onde se torna invisível e pode passar através de objetos sólidos do Plano Material.",
    "Eye Bite": "Seus olhos tornam-se corredores de escuridão. Você pode usar uma ação para causar pavor, sono ou enjoo em uma criatura.",
    "Fabricate": "Você converte materiais brutos em produtos acabados (madeira em ponte, metal em armadura, linho em roupas).",
    "Faithful Hound": "Você invoca um cão de guarda invisível em um espaço vazio, que late para intrusos e ataca criaturas próximas.",
    "False Life": "Com um gesto necromante, você ganha 1d4 + 4 pontos de vida temporários pela duração da magia.",
    "Feeblemind": "Você ataca a mente de uma criatura. O alvo sofre 4d6 de dano psíquico e sua Inteligência e Carisma tornam-se 1.",
    "Find Familiar": "Você ganha o serviço de um espírito familiar que toma a forma de um animal à sua escolha, servindo como espião e mensageiro.",
    "Find the Path": "Esta magia permite que você encontre o caminho mais curto e direto para uma localização específica que você conheça.",
    "Find Traps": "Você sente a presença de qualquer armadilha dentro do seu campo de visão que tenha sido colocada para infligir um efeito nocivo.",
    "Fire Shield": "Chamas finas e brilhantes envolvem você. Você ganha resistência a fogo ou frio e causa dano a quem te atingir em combate corpo a corpo.",
    "Flame Blade": "Você evoca uma espada de fogo em sua mão. Você pode fazer ataques de magia corpo a corpo com a espada para causar 3d6 de dano de fogo.",
    "Flame Strike": "Uma coluna vertical de fogo divino desce do céu. Criaturas na área sofrem 4d6 de dano de fogo e 4d6 de dano radiante.",
    "Flaming Sphere": "Uma esfera de fogo surge. Você pode usar sua ação bônus para mover a esfera e queimar criaturas próximas a ela.",
    "Flesh to Stone": "Você tenta transformar uma criatura em pedra. O alvo deve fazer testes de resistência de Constituição para resistir à petrificação.",
    "Floating Disk": "Você cria um disco de força plano e circular que flutua e segue você, carregando até 250 kg de peso.",
    "Freedom of Movement": "Você toca uma criatura voluntária. Pela duração, o movimento do alvo não pode ser reduzido por terreno difícil ou magias.",
    "Freezing Sphere": "Uma esfera gélida de energia azul dispara de você. Ao atingir, explode causando 10d6 de dano de frio em um raio de 12 metros.",
    "Gaseous Form": "Você transforma uma criatura voluntária em uma nuvem enevoada. O alvo ganha resistência a dano e pode passar por pequenas fendas."
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
console.log(`✅ Lote 7 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
