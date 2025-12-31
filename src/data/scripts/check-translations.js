const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');

console.log('🌍 Carregando magias...');
const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));
const spellList = Object.values(allSpells);

const withoutPT = spellList.filter(s => !s.descriptionPT);
console.log(`\n📊 Estatísticas:`);
console.log(`   Total de magias: ${spellList.length}`);
console.log(`   Sem tradução PT: ${withoutPT.length}`);
console.log(`   Com tradução PT: ${spellList.length - withoutPT.length}`);

console.log(`\n📝 Magias sem tradução:`);
withoutPT.slice(0, 20).forEach(s => console.log(`   - ${s.name}`));
if (withoutPT.length > 20) {
    console.log(`   ... e mais ${withoutPT.length - 20} magias`);
}
