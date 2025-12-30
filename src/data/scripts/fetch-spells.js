/**
 * Script simplificado para buscar magias da API D&D 5e
 * Uso: node src/data/scripts/fetch-spells.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://www.dnd5eapi.co';
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data', 'spells');

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function fetchAllSpells() {
    console.log('🔮 Buscando lista de magias...');

    try {
        // Buscar lista de magias
        const listData = await httpsGet(`${API_BASE}/api/spells`);
        const spellList = listData.results || [];

        console.log(`📜 Encontradas ${spellList.length} magias`);

        const allSpells = {};
        const spellsByClass = {};
        let processed = 0;

        // Buscar detalhes de cada magia
        for (const spellRef of spellList) {
            try {
                const spell = await httpsGet(`${API_BASE}${spellRef.url}`);

                // Salvar magia completa
                allSpells[spell.index] = {
                    index: spell.index,
                    name: spell.name,
                    level: spell.level,
                    school: spell.school.name,
                    classes: spell.classes.map(c => c.name),
                    description: spell.desc.join('\n'),
                    higherLevel: spell.higher_level?.join('\n'),
                    range: spell.range,
                    components: spell.components,
                    material: spell.material,
                    ritual: spell.ritual,
                    duration: spell.duration,
                    concentration: spell.concentration,
                    castingTime: spell.casting_time,
                };

                // Organizar por classe
                for (const classInfo of spell.classes) {
                    const className = classInfo.name;
                    if (!spellsByClass[className]) {
                        spellsByClass[className] = {};
                    }

                    const levelKey = `level${spell.level}`;
                    if (!spellsByClass[className][levelKey]) {
                        spellsByClass[className][levelKey] = [];
                    }

                    spellsByClass[className][levelKey].push(spell.index);
                }

                processed++;
                if (processed % 50 === 0) {
                    console.log(`⏳ Processadas ${processed}/${spellList.length} magias...`);
                }

                // Delay para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ Erro ao buscar ${spellRef.index}:`, error.message);
            }
        }

        // Criar diretório
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Salvar arquivos
        console.log('\n💾 Salvando arquivos JSON...');

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'all-spells.json'),
            JSON.stringify(allSpells, null, 2),
            'utf-8'
        );
        console.log(`✅ all-spells.json criado (${Object.keys(allSpells).length} magias)`);

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'spells-by-class.json'),
            JSON.stringify(spellsByClass, null, 2),
            'utf-8'
        );
        console.log(`✅ spells-by-class.json criado`);

        // Estatísticas
        console.log('\n📊 Estatísticas:');
        for (const [className, levels] of Object.entries(spellsByClass)) {
            const total = Object.values(levels).reduce((sum, spells) => sum + spells.length, 0);
            console.log(`  ${className}: ${total} magias`);
        }

        console.log('\n✨ Concluído!');

    } catch (error) {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    }
}

fetchAllSpells();
