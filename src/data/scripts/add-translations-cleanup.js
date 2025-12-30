const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));

const translations = {
    "Acid Arrow": "Uma flecha verde cintilante que atinge um alvo, causando 4d4 de dano ácido imediato e 2d4 no final do próximo turno.",
    "Acid Splash": "Você arremessa uma bolha de ácido em uma ou duas criaturas, causando 1d6 de dano ácido.",
    "Alter Self": "Você adapta sua forma física para respirar na água, mudar sua aparência ou ganhar armas naturais.",
    "Animal Friendship": "Convence uma besta de que você não significa mal, deixando-a enfeitiçada por você.",
    "Animal Messenger": "Usa um animal minúsculo para entregar uma mensagem curta em um local específico.",
    "Arcane Hand": "Cria uma mão de força Grande que pode socar, empurrar, agarrar ou proteger.",
    "Arcane Sword": "Cria uma espada de força que flutua e corta seus inimigos ao seu comando.",
    "Arcanist's Magic Aura": "Altera a aura mágica de um objeto ou criatura para enganar magias de detecção.",
    "Branding Smite": "Seu próximo ataque com arma brilha com luz, causando 2d6 de dano radiante e impedindo invisibilidade.",
    "Commune With Nature": "Você se torna um com a natureza para aprender fatos sobre o território ao seu redor.",
    "Compelled Duel": "Força um inimigo a duelar contra você, dando-lhe desvantagem ao atacar outros.",
    "Dancing Lights": "Cria luzes flutuantes que você pode mover para iluminar o caminho.",
    "Dimension Door": "Teletransporta você e um passageiro para qualquer lugar a até 150 metros.",
    "Divine Favor": "Sua arma brilha com poder divino, causando 1d4 de dano radiante adicional.",
    "Enhance Ability": "Concede aprimoramentos mágicos como Força de Touro ou Graça de Gato.",
    "Enlarge/Reduce": "Aumenta ou reduz o tamanho de uma criatura ou objeto.",
    "Expeditious Retreat": "Permite que você use a ação de Correr como uma ação bônus.",
    "Faerie Fire": "Luzes destacam alvos, impedindo invisibilidade e dando vantagem no ataque.",
    "False Life": "Concede pontos de vida temporários para proteger você do perigo.",
    "Fear": "Projeta um pesadelo que faz inimigos soltarem o que seguram e fugirem.",
    "Find Steed": "Invoca uma montaria espiritual leal e inteligente que luta ao seu lado.",
    "Guiding Bolt": "Um relâmpago de luz que causa 4d6 de dano e ilumina o alvo.",
    "Healing Word": "Cura rápida disparada através de uma palavra inspiradora.",
    "Hellish Rebuke": "Retribui o dano sofrido com chamas infernais no agressor.",
    "Heroism": "Infundir coragem, tornando o alvo imune a medo e dando HP temporário.",
    "Hunter's Mark": "Marca um inimigo para causar 1d6 de dano extra em cada acerto.",
    "Inflict Wounds": "Toque necrótico devastador que causa 3d10 de dano por toque.",
    "Mage Armor": "Cria um campo de força ao redor de um alvo sem armadura.",
    "Magic Missile": "Três dardos de força mágica que atingem alvos sem errar.",
    "Misty Step": "Teletransporte curto e instantâneo feito em um piscar de olhos.",
    "Protection from Evil and Good": "Protege contra seres de outros planos e seus efeitos mentais.",
    "Ray of Frost": "Feixe de gelo que causa dano e reduz a velocidade do alvo.",
    "Sacred Flame": "Chama radiante desce sobre o inimigo ignorando cobertura.",
    "Searing Smite": "Seu ataque incendeia o inimigo, causando dano contínuo de fogo.",
    "Shield": "Defesa instantânea que bloqueia um golpe e protege contra magia.",
    "Shield of Faith": "Aura protetora que concede +2 de bônus na CA ao alvo.",
    "Thunderous Smite": "Ataque que causa dano de trovão, empurra e derruba o alvo.",
    "Thunderwave": "Explosão sônica que empurra todos ao redor de você.",
    "Wrathful Smite": "Ataque que causa dano psíquico e amedronta o inimigo.",
    "Fire Ball": "Explosão de fogo massiva em uma grande área.",
    "Guidance": "Ajuda divina que concede um bônus de 1d4 em um teste futuro."
};

let count = 0;
for (const [name, desc] of Object.entries(translations)) {
    for (const id in allSpells) {
        // Tentar casamento exato ou aproximado
        if (allSpells[id].name.toLowerCase() === name.toLowerCase() ||
            allSpells[id].name.toLowerCase().includes(name.toLowerCase())) {

            if (!allSpells[id].descriptionPT || allSpells[id].descriptionPT.length < 10) {
                allSpells[id].descriptionPT = desc;
                count++;
            }
        }
    }
}

fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
console.log(`✅ Lote final de limpeza concluído: +${count} magias traduzidas.`);
const total = Object.values(allSpells).filter(s => s.descriptionPT).length;
console.log(`📊 Progresso Final: ${total}/319 magias.`);
const remaining = Object.values(allSpells).filter(s => !s.descriptionPT);
console.log(`📉 Restam apenas ${remaining.length} magias sem descrição PT.`);
if (remaining.length > 0) {
    remaining.forEach(s => console.log(`   - ${s.name}`));
}
