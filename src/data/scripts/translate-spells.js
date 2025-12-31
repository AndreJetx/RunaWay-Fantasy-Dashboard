/**
 * Script auto-contido para traduzir a base de dados de magias
 */

const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');

// Pequena amostra das traduções (o script vai ler o arquivo .ts e extrair o resto)
async function run() {
    console.log('Iniciando tradução (v5 - Auto-contido)...');

    const transFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/i18n/spell-translations.ts'), 'utf8');
    const descFile = fs.readFileSync(path.join(process.cwd(), 'src/lib/i18n/spell-descriptions.ts'), 'utf8');

    // Extração rústica mas eficiente via regex para evitar problemas de import
    function extractObject(content, startMarker) {
        const start = content.indexOf(startMarker);
        if (start === -1) return {};

        let braceCount = 0;
        let objStr = '';
        let foundStart = false;

        for (let i = start; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                foundStart = true;
            } else if (content[i] === '}') {
                braceCount--;
            }

            if (foundStart) objStr += content[i];
            if (foundStart && braceCount === 0) break;
        }

        try {
            // Limpa o conteúdo para ser JSON válido-ish (remove comentários e export)
            const clean = objStr
                .replace(/\/\/.*$/gm, '') // remove comentários
                .replace(/([a-zA-Z0-9_-]+):/g, '"$1":') // coloca aspas nas chaves
                .replace(/'/g, '"') // troca aspas simples por duplas
                .replace(/,(\s*[}\]])/g, '$1'); // remove vírgulas extras

            return JSON.parse(clean);
        } catch (e) {
            console.warn('Erro ao parsear objeto via regex, tentando eval inseguro (fallback)');
            try {
                // Remove o export para fazer eval
                const evalStr = "(() => { return " + objStr + "; })()";
                return eval(evalStr);
            } catch (e2) {
                console.error('Falha crítica na extração');
                return {};
            }
        }
    }

    const translations = extractObject(transFile, 'export const SPELL_TRANSLATIONS');
    const descriptions = extractObject(descFile, 'export const SPELL_DESCRIPTIONS');

    const ptTranslations = translations['pt-BR'] || {};
    const ptDescriptions = descriptions['pt-BR'] || {};

    if (!fs.existsSync(ALL_SPELLS_PATH)) {
        console.error('All spells not found');
        return;
    }

    const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));
    let nameCount = 0;
    let descCount = 0;

    for (const key in allSpells) {
        const spell = allSpells[key];
        const name = spell.name;

        if (ptTranslations[name]) {
            spell.namePT = ptTranslations[name];
            nameCount++;
        }

        if (ptDescriptions[name]) {
            const d = ptDescriptions[name];
            spell.descriptionPT = Array.isArray(d) ? d.join('\n\n') : d;
            descCount++;
        }
    }

    fs.writeFileSync(ALL_SPELLS_PATH, JSON.stringify(allSpells, null, 2));
    console.log(`Sucesso: ${nameCount} nomes e ${descCount} descrições traduzidas.`);
}

run().catch(console.error);
