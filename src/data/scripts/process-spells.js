/**
 * Script para processar lista de magias e buscar detalhes
 * Salva em JSON organizado por classe
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://www.dnd5eapi.co';
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data', 'spells');

// Lista de magias fornecida pelo usuário
const SPELL_LIST = require('./spell-list.json');

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

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSpellDetails() {
    console.log(`🔮 Processando ${SPELL_LIST.results.length} magias...`);

    const allSpells = {};
    const spellsByClass = {};
    let processed = 0;
    let errors = 0;

    for (const spellRef of SPELL_LIST.results) {
        try {
            console.log(`⏳ [${processed + 1}/${SPELL_LIST.results.length}] Buscando ${spellRef.name}...`);

            const spell = await httpsGet(`${API_BASE}${spellRef.url}`);

            // Salvar magia completa
            allSpells[spell.index] = {
                index: spell.index,
                name: spell.name,
                level: spell.level,
                school: spell.school?.name || 'Unknown',
                classes: spell.classes?.map(c => c.name) || [],
                description: spell.desc?.join('\n') || '',
                higherLevel: spell.higher_level?.join('\n') || '',
                range: spell.range || '',
                components: spell.components || [],
                material: spell.material || '',
                ritual: spell.ritual || false,
                duration: spell.duration || '',
                concentration: spell.concentration || false,
                castingTime: spell.casting_time || '',
                damage: spell.damage || null,
                dc: spell.dc || null,
                area_of_effect: spell.area_of_effect || null,
            };

            // Organizar por classe
            if (spell.classes) {
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
            }

            processed++;

            // Delay para não sobrecarregar a API (150ms entre requisições)
            await delay(150);

        } catch (error) {
            errors++;
            console.error(`❌ Erro ao buscar ${spellRef.index}:`, error.message);

            // Se houver muitos erros consecutivos, pausar mais tempo
            if (errors > 5) {
                console.log('⏸️  Muitos erros, pausando por 5 segundos...');
                await delay(5000);
                errors = 0;
            }
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
    console.log('\n📊 Estatísticas por Classe:');
    const classStats = {};
    for (const [className, levels] of Object.entries(spellsByClass)) {
        const total = Object.values(levels).reduce((sum, spells) => sum + spells.length, 0);
        classStats[className] = total;
    }

    // Ordenar por quantidade
    const sorted = Object.entries(classStats).sort((a, b) => b[1] - a[1]);
    for (const [className, count] of sorted) {
        console.log(`  ${className.padEnd(15)} ${count} magias`);
    }

    console.log(`\n✨ Concluído! ${processed} magias processadas com sucesso!`);
}

fetchSpellDetails().catch(console.error);
