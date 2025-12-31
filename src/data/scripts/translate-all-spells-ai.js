/**
 * Script para traduzir TODAS as descrições de magias usando IA
 * Usa a API do Google Gemini para traduções de alta qualidade
 */

const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const OUTPUT_PATH = path.join(process.cwd(), 'src/lib/i18n/spell-descriptions-full.ts');

// Configuração da API (você precisará adicionar sua chave)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function translateWithGemini(text, targetLang) {
    const prompt = targetLang === 'pt-BR'
        ? `Traduza o seguinte texto de D&D 5e para português brasileiro (PT-BR). Mantenha os termos técnicos de RPG apropriados. Retorne APENAS a tradução, sem explicações:\n\n${text}`
        : `Traduce el siguiente texto de D&D 5e al español. Mantén los términos técnicos de RPG apropiados. Devuelve SOLO la traducción, sin explicaciones:\n\n${text}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const translation = data.candidates[0]?.content?.parts[0]?.text?.trim();
        return translation || text;
    } catch (error) {
        console.error(`Erro ao traduzir: ${error.message}`);
        return text; // Fallback para texto original
    }
}

async function translateAllSpells() {
    console.log('🚀 Iniciando tradução de TODAS as magias...\n');

    // Carregar magias
    const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));
    const spellList = Object.values(allSpells);

    console.log(`📚 Total de magias: ${spellList.length}\n`);

    const ptBR = {};
    const es = {};

    // Processar em lotes para não sobrecarregar a API
    const BATCH_SIZE = 10;
    const DELAY_MS = 2000; // 2 segundos entre lotes

    for (let i = 0; i < spellList.length; i += BATCH_SIZE) {
        const batch = spellList.slice(i, i + BATCH_SIZE);
        console.log(`\n📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(spellList.length / BATCH_SIZE)}...`);

        await Promise.all(batch.map(async (spell) => {
            const name = spell.name;
            const description = spell.description;

            console.log(`  ✨ Traduzindo: ${name}`);

            // Traduzir para PT-BR
            const ptDesc = await translateWithGemini(description, 'pt-BR');
            ptBR[name] = ptDesc;

            // Pequeno delay entre traduções
            await new Promise(resolve => setTimeout(resolve, 500));

            // Traduzir para ES
            const esDesc = await translateWithGemini(description, 'es');
            es[name] = esDesc;

            console.log(`  ✅ ${name} concluído`);
        }));

        // Delay entre lotes
        if (i + BATCH_SIZE < spellList.length) {
            console.log(`  ⏳ Aguardando ${DELAY_MS / 1000}s antes do próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    // Gerar arquivo TypeScript
    const tsContent = `/**
 * Descrições completas de magias traduzidas
 * Gerado automaticamente via IA
 */

export const SPELL_DESCRIPTIONS_FULL = {
  "pt-BR": ${JSON.stringify(ptBR, null, 2)},
  "es": ${JSON.stringify(es, null, 2)}
} as const;

export function getSpellDescriptionFull(spellName: string, locale: 'pt-BR' | 'es' = 'pt-BR'): string | undefined {
  return SPELL_DESCRIPTIONS_FULL[locale][spellName as keyof typeof SPELL_DESCRIPTIONS_FULL['pt-BR']];
}
`;

    fs.writeFileSync(OUTPUT_PATH, tsContent, 'utf8');

    console.log(`\n✅ Tradução concluída!`);
    console.log(`📁 Arquivo salvo em: ${OUTPUT_PATH}`);
    console.log(`📊 PT-BR: ${Object.keys(ptBR).length} magias`);
    console.log(`📊 ES: ${Object.keys(es).length} magias`);
}

// Executar
if (require.main === module) {
    translateAllSpells().catch(console.error);
}

module.exports = { translateAllSpells };
