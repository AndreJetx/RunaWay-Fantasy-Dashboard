/**
 * Script para traduzir a base de dados local de magias
 */

const fs = require('fs');
const path = require('path');

// Caminhos
const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data', 'spells');
const ALL_SPELLS_PATH = path.join(DATA_DIR, 'all-spells.json');
const LOG_FILE = path.join(PROJECT_ROOT, 'translate-log.txt');

function log(msg: string) {
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, msg + '\n');
    } catch (e) { }
}

async function translateSpells() {
    log('Iniciando tradução das magias (v4)...');

    try {
        // Registrar ts-node para permitir require em arquivos .ts
        require('ts-node').register();

        const transPath = path.join(PROJECT_ROOT, 'src/lib/i18n/spell-translations.ts');
        const descPath = path.join(PROJECT_ROOT, 'src/lib/i18n/spell-descriptions.ts');

        log(`Carregando traduções de: ${transPath}`);
        const { SPELL_TRANSLATIONS } = require(transPath);
        const { SPELL_DESCRIPTIONS } = require(descPath);

        if (!fs.existsSync(ALL_SPELLS_PATH)) {
            log('ERRO: Arquivo all-spells.json não encontrado!');
            return;
        }

        const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));
        log(`Carregadas ${Object.keys(allSpells).length} magias.`);

        const ptTranslations = SPELL_TRANSLATIONS['pt-BR'] || {};
        const ptDescriptions = SPELL_DESCRIPTIONS['pt-BR'] || {};

        let count = 0;
        let descCount = 0;

        for (const key in allSpells) {
            const spell = allSpells[key];
            const originalName = spell.name;

            // Traduzir nome
            if (ptTranslations[originalName]) {
                spell.namePT = ptTranslations[originalName];
                count++;
            }

            // Traduzir descrição
            if (ptDescriptions[originalName]) {
                const desc = ptDescriptions[originalName];
                spell.descriptionPT = Array.isArray(desc) ? desc.join('\n\n') : desc;
                descCount++;
            }
        }

        fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
        log(`Sucesso! ${count} nomes traduzidos e ${descCount} descrições traduzidas.`);
    } catch (err: any) {
        log(`ERRO FATAL: ${err.message}`);
        log(err.stack);
    }
}

translateSpells().catch((err: any) => {
    log(`CATCH ERRO: ${err.message}`);
});
