/**
 * Script para processar traduções manuais e gerar arquivo TypeScript
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_DIR = path.join(process.cwd(), 'translations-to-do');
const OUTPUT_PATH = path.join(process.cwd(), 'src/lib/i18n/spell-descriptions-full.ts');

function parseTranslationFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = {};

    // Dividir por marcadores
    const sections = content.split(/\[SPELL_\d+\]/);

    sections.forEach(section => {
        if (!section.trim()) return;

        const lines = section.trim().split('\n');
        if (lines.length < 2) return;

        const spellName = lines[0].trim();
        const description = lines.slice(1)
            .join('\n')
            .replace(/---/g, '')
            .trim();

        if (spellName && description) {
            translations[spellName] = description;
        }
    });

    return translations;
}

function processTranslations() {
    console.log('🔄 Processando traduções manuais...\n');

    const ptFile = path.join(TRANSLATIONS_DIR, '2_PORTUGUESE_DESCRIPTIONS.txt');
    const esFile = path.join(TRANSLATIONS_DIR, '3_SPANISH_DESCRIPTIONS.txt');

    if (!fs.existsSync(ptFile)) {
        console.error('❌ Arquivo 2_PORTUGUESE_DESCRIPTIONS.txt não encontrado!');
        console.log('Por favor, traduza o arquivo primeiro.');
        return;
    }

    console.log('📖 Lendo traduções em português...');
    const ptTranslations = parseTranslationFile(ptFile);
    console.log(`✅ ${Object.keys(ptTranslations).length} magias em PT-BR`);

    let esTranslations = {};
    if (fs.existsSync(esFile)) {
        console.log('📖 Lendo traduções em espanhol...');
        esTranslations = parseTranslationFile(esFile);
        console.log(`✅ ${Object.keys(esTranslations).length} magias em ES`);
    } else {
        console.log('⚠️  Arquivo de espanhol não encontrado, pulando...');
    }

    // Gerar arquivo TypeScript
    const tsContent = `/**
 * Descrições completas de magias traduzidas
 * Traduzido manualmente via Google Translate/DeepL
 */

export const SPELL_DESCRIPTIONS_FULL = {
  "pt-BR": ${JSON.stringify(ptTranslations, null, 2)},
  "es": ${JSON.stringify(esTranslations, null, 2)}
} as const;

export function getSpellDescriptionFull(spellName: string, locale: 'pt-BR' | 'es' = 'pt-BR'): string | undefined {
  return SPELL_DESCRIPTIONS_FULL[locale][spellName as keyof typeof SPELL_DESCRIPTIONS_FULL['pt-BR']];
}
`;

    fs.writeFileSync(OUTPUT_PATH, tsContent, 'utf8');

    console.log('\n✅ Arquivo TypeScript gerado com sucesso!');
    console.log(`📁 ${OUTPUT_PATH}`);
    console.log(`\n📊 Estatísticas:`);
    console.log(`   PT-BR: ${Object.keys(ptTranslations).length} magias`);
    console.log(`   ES: ${Object.keys(esTranslations).length} magias`);
}

processTranslations();
