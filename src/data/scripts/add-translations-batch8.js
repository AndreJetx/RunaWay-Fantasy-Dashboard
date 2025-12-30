const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Animal Shapes": "Você transforma qualquer número de criaturas voluntárias em bestas de nível de desafio 4 ou inferior pela duração da magia.",
    "Animate Dead": "Esta magia cria um servo morto-vivo. Você imbuí um cadáver ou pilha de ossos com uma imitação vil de vida, erguendo-o como zumbi ou esqueleto.",
    "Animate Objects": "Objetos ganham vida ao seu comando. Escolha até dez objetos não-mágicos que não estejam sendo usados ou carregados para se tornarem criaturas.",
    "Arcane Eye": "Você cria um olho invisível e flutuante que envia informações visuais para você. O olho tem visão normal e visão no escuro.",
    "Arcane Gate": "Você cria dois portais de teletransporte ligados entre si. Qualquer criatura que entrar por um portal sai pelo outro.",
    "Arcane Lock": "Você tranca magicamente uma porta, janela ou baú. O objeto torna-se quase impossível de abrir sem a senha ou magia específica.",
    "Armor of Agathys": "Uma força protetora de gelo espectral envolve você, concedendo pontos de vida temporários e causando dano de frio a atacantes.",
    "Arms of Hadar": "Tentáculos de energia escura brotam de você. Criaturas próximas sofrem dano necrótico e perdem sua reação.",
    "Astral Projection": "Você e seus aliados projetam seus corpos astrais no Plano Astral, deixando seus corpos físicos protegidos e em animação suspensa.",
    "Augury": "Você pede um sinal de uma entidade cósmica sobre o resultado de um curso de ação que você planeja tomar nos próximos 30 minutos.",
    "Awaken": "Você toca uma besta ou planta e concede a ela inteligência humana e a habilidade de falar um idioma que você conheça.",
    "Banishment": "Você tenta enviar uma criatura para outro plano de existência. Se o alvo for nativo do plano atual, ele é enviado para um semiplano inofensivo.",
    "Beast Sense": "Você toca uma besta voluntária. Pela duração, você pode usar seus sentidos para ver e ouvir através dela.",
    "Bigby's Hand": "Você cria uma mão de força translúcida e Grande que obedece aos seus comandos, podendo socar, empurrar, agarrar ou proteger.",
    "Black Tentacles": "Tentáculos de ébano surgem do chão. Criaturas na área devem fazer um teste de Destreza ou ficarão presas e sofrerão dano de concussão.",
    "Blade Barrier": "Você cria uma parede vertical de lâminas giratórias e afiadas feitas de força mágica que causam dano cortante massivo.",
    "Bless": "Você abençoa até três criaturas. Elas podem adicionar 1d4 às suas jogadas de ataque e testes de resistência.",
    "Blindness/Deafness": "Você pode cegar ou ensurdecer um oponente por 1 minuto usando energia necromante.",
    "Blink": "Você entra e sai do Plano Etéreo no final de cada turno, tornando-se impossível de ser alvo de ataques no Plano Material.",
    "Blur": "Seu corpo se torna indistinto e trêmulo. Ataques contra você têm desvantagem.",
    "Burning Hands": "Um leque de chamas sai das pontas dos seus dedos, causando dano de fogo em um cone de 4,5 metros.",
    "Call Lightning": "Você invoca relâmpagos de uma nuvem de tempestade que você mesmo cria.",
    "Calm Emotions": "Você suprime efeitos de medo e charme ou torna criaturas indiferentes a seus inimigos.",
    "Chain Lightning": "Um arco de relâmpago atinge um alvo e salta para outros três inimigos próximos.",
    "Charm Person": "Você faz um humanoide acreditar que você é um amigo amigável e confiável.",
    "Chill Touch": "Uma mão esquelética fantasmagórica impede a cura de uma criatura e causa dano necrótico.",
    "Circle of Death": "Uma esfera de energia negativa negativa explode em um raio de 18 metros, causando dano necrótico massivo.",
    "Clairvoyance": "Você cria um sensor invisível em uma localização familiar ou óbvia para ver ou ouvir o que acontece lá.",
    "Clone": "Esta magia cria uma duplicata inerte de uma criatura viva como salvaguarda contra a morte. Se a criatura morrer, sua alma viaja para o clone.",
    "Cloudkill": "Você cria uma névoa venenosa que se move e mata criaturas instantaneamente.",
    "Color Spray": "Luzes coloridas cegam criaturas com poucos pontos de vida.",
    "Command": "Você dá uma ordem de uma palavra que a criatura deve obedecer (ex: Pare, Caia).",
    "Commune": "Você faz três perguntas à sua divindade.",
    "Comprehend Languages": "Você entende todas as linguagens faladas e escritas.",
    "Compelled Duel": "Você força um inimigo a lutar apenas contra você.",
    "Cone of Cold": "Uma explosão gélida causa dano de frio massivo em cone.",
    "Confusion": "Você faz inimigos agirem de forma errática e aleatória.",
    "Conjure Animals": "Você invoca animais espirituais para lutar por você.",
    "Conjure Elemental": "Você invoca um poderoso elemental da natureza.",
    "Conjure Fey": "Você invoca uma criatura feérica poderosa.",
    "Conjure Minor Elementals": "Você invoca vários elementais menores.",
    "Conjure Woodland Beings": "Você invoca criaturas da floresta.",
    "Contagion": "Seu toque transmite uma doença horrível à sua escolha.",
    "Contingency": "Você prepara uma magia para ser ativada automaticamente sob certas condições.",
    "Continual Flame": "Você cria uma chama mágica que não queima e nunca se apaga.",
    "Control Water": "Você controla grandes massas de água, criando redemoinhos ou dividindo o mar.",
    "Control Weather": "Você altera as condições climáticas em uma grande área ao longo de horas.",
    "Counterspell": "Você cancela a magia de um inimigo enquanto ela está sendo conjurada.",
    "Create Food and Water": "Você cria sustento básico para até 15 humanos ou 5 cavalos.",
    "Create Undead": "Você ergue ghouls, carniçais ou múmias sob seu controle.",
    "Create or Destroy Water": "Você cria ou faz desaparecer 40 litros de água.",
    "Creation": "Você puxa matéria do Plano das Sombras para criar um objeto não-mágico de material vegetal ou mineral.",
    "Crown of Madness": "Você coroa um humanoide com fúria, forçando-o a atacar seus próprios aliados.",
    "Cure Wounds": "Seu toque cura feridas através de energia positiva.",
    "Dancing Lights": "Você cria quatro luzes flutuantes que você pode mover.",
    "Darkness": "Escuridão mágica que bloqueia até visão no escuro.",
    "Darkvision": "Concede a habilidade de ver no escuro até 18 metros.",
    "Daylight": "Cria uma luz brilhante equivalente à luz do dia.",
    "Death Ward": "Protege uma criatura de morrer na próxima vez que cair para 0 HP.",
    "Delayed Blast Fireball": "Uma conta de fogo que explode com mais força quanto mais tempo você espera.",
    "Detect Evil and Good": "Sente a presença de seres planares e mortos-vivos.",
    "Detect Magic": "Sente a presença e tipo de magia próxima.",
    "Detect Poison and Disease": "Sente a presença de venenos e doenças.",
    "Detect Thoughts": "Lê os pensamentos superficiais de outros.",
    "Dimension Door": "Teletransporte instantâneo para um local visível ou descrito.",
    "Disguise Self": "Altera magicamente sua aparência física.",
    "Disintegrate": "Um raio que transforma alvos em pó.",
    "Dispel Evil and Good": "Protege contra seres planares e pode bani-los de volta.",
    "Dispel Magic": "Encerra efeitos mágicos em uma criatura ou área.",
    "Divination": "Faz uma pergunta sobre o futuro próximo.",
    "Divine Favor": "Seus ataques causam dano radiante extra.",
    "Divine Word": "Palavra poderosa que expulsa seres e mata os fracos.",
    "Dominate Monster": "Controle total sobre qualquer criatura.",
    "Dominate Person": "Controle total sobre um humanoide.",
    "Dream": "Moldar os sonhos de outros para enviar mensagens ou pesadelos.",
    "Druidcraft": "Pequenos truques naturais como prever o tempo ou abrir flores."
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
console.log(`✅ Lote 8 concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Total: ${total}/319 magias.`);
