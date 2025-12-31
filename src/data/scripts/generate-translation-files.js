/**
 * Script para gerar arquivos de tradução manual
 * Cria arquivos TXT organizados para tradução via Google Translate/DeepL
 */

const fs = require('fs');
const path = require('path');

const ALL_SPELLS_PATH = path.join(process.cwd(), 'src/data/spells/all-spells.json');
const OUTPUT_DIR = path.join(process.cwd(), 'translations-to-do');

function generateTranslationFiles() {
    console.log('📚 Gerando arquivos para tradução manual...\n');

    // Criar diretório de saída
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Carregar magias
    const allSpells = JSON.parse(fs.readFileSync(ALL_SPELLS_PATH, 'utf8'));
    const spellList = Object.values(allSpells);

    console.log(`Total de magias: ${spellList.length}\n`);

    // Gerar arquivo com todas as descrições
    let allDescriptions = '';
    let indexMap = {};

    spellList.forEach((spell, index) => {
        const marker = `[SPELL_${index}]`;
        indexMap[marker] = spell.name;

        allDescriptions += `${marker} ${spell.name}\n`;
        allDescriptions += `${spell.description}\n`;
        allDescriptions += `---\n\n`;
    });

    // Salvar arquivo principal
    const mainFile = path.join(OUTPUT_DIR, '1_ENGLISH_DESCRIPTIONS.txt');
    fs.writeFileSync(mainFile, allDescriptions, 'utf8');

    // Salvar mapa de índices
    const mapFile = path.join(OUTPUT_DIR, 'spell-index-map.json');
    fs.writeFileSync(mapFile, JSON.stringify(indexMap, null, 2), 'utf8');

    // Criar arquivo de instruções
    const instructions = `# INSTRUÇÕES PARA TRADUÇÃO

## Passo 1: Traduzir o arquivo
1. Abra o arquivo: 1_ENGLISH_DESCRIPTIONS.txt
2. Copie TODO o conteúdo
3. Cole no Google Translate ou DeepL
4. Traduza para Português (Brasil)
5. Copie o resultado traduzido
6. Cole em um novo arquivo chamado: 2_PORTUGUESE_DESCRIPTIONS.txt
7. Salve nesta mesma pasta

## Passo 2: Traduzir para Espanhol (opcional)
1. Repita o processo acima
2. Traduza para Espanhol
3. Salve como: 3_SPANISH_DESCRIPTIONS.txt

## Passo 3: Processar traduções
1. Abra o terminal
2. Execute: node src/data/scripts/process-manual-translations.js

## IMPORTANTE:
- NÃO remova os marcadores [SPELL_0], [SPELL_1], etc.
- NÃO remova as linhas com "---"
- Mantenha a estrutura exatamente como está
- Apenas traduza o TEXTO das descrições

## Dicas:
- Google Translate: https://translate.google.com/
- DeepL (melhor qualidade): https://www.deepl.com/translator
- DeepL tem limite de 5000 caracteres por vez, então você pode precisar dividir

Total de magias: ${spellList.length}
Tamanho aproximado: ${Math.round(allDescriptions.length / 1024)} KB
`;

    const instructionsFile = path.join(OUTPUT_DIR, 'LEIA-ME.txt');
    fs.writeFileSync(instructionsFile, instructions, 'utf8');

    console.log('✅ Arquivos gerados com sucesso!\n');
    console.log(`📁 Pasta: ${OUTPUT_DIR}`);
    console.log(`📄 Arquivo para traduzir: 1_ENGLISH_DESCRIPTIONS.txt`);
    console.log(`📖 Instruções: LEIA-ME.txt`);
    console.log(`\n🎯 Próximo passo: Siga as instruções no arquivo LEIA-ME.txt`);
}

generateTranslationFiles();
