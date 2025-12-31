/**
 * Script para buscar todas as magias da API D&D 5e e salvar em JSON local
 * Uso: npx ts-node src/data/scripts/fetch-spells.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://www.dnd5eapi.co/api';
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data', 'spells');

interface Spell {
    index: string;
    name: string;
    level: number;
    school: { name: string };
    classes: { name: string }[];
    desc: string[];
    higher_level?: string[];
    range: string;
    components: string[];
    material?: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    casting_time: string;
    attack_type?: string;
    damage?: any;
}

interface SpellsByClass {
    [className: string]: {
        [level: string]: string[];
    };
}

async function fetchAllSpells(): Promise<void> {
    console.log('🔮 Buscando lista de magias...');

    try {
        // Buscar lista de todas as magias
        const listResponse = await fetch(`${API_BASE}/spells`);
        const listData = await listResponse.json();
        const spellList = listData.results || [];

        console.log(`📜 Encontradas ${spellList.length} magias`);

        const allSpells: Record<string, any> = {};
        const spellsByClass: SpellsByClass = {};
        let processed = 0;

        // Buscar detalhes de cada magia
        for (const spellRef of spellList) {
            try {
                const spellResponse = await fetch(`${API_BASE}${spellRef.url}`);
                const spell: Spell = await spellResponse.json();

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
                    attackType: spell.attack_type,
                    damage: spell.damage,
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

                // Pequeno delay para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`❌ Erro ao buscar ${spellRef.index}:`, error);
            }
        }

        // Criar diretório se não existir
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Salvar arquivos JSON
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
        console.log(`✅ spells-by-class.json criado (${Object.keys(spellsByClass).length} classes)`);

        // Estatísticas
        console.log('\n📊 Estatísticas:');
        for (const [className, levels] of Object.entries(spellsByClass)) {
            const total = Object.values(levels).reduce((sum, spells) => sum + spells.length, 0);
            console.log(`  ${className}: ${total} magias`);
        }

        console.log('\n✨ Concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    }
}

// Executar
fetchAllSpells();
