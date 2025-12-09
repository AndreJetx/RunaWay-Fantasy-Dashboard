import postgres from "postgres";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  const envFiles = [".env.local", ".env", ".env.development"];
  for (const envFile of envFiles) {
    const envPath = join(process.cwd(), envFile);
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").trim();
            // Remover aspas se houver
            const cleanValue = value.replace(/^["']|["']$/g, "");
            process.env[key.trim()] = cleanValue;
          }
        }
      }
      break;
    }
  }
}

loadEnv();

async function testDatabaseConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL não está configurada!");
    console.log("Por favor, configure a variável DATABASE_URL no arquivo .env");
    process.exit(1);
  }

  console.log("🔌 Conectando ao banco de dados...");

  try {
    const client = postgres(connectionString);

    // Testar conexão básica
    const result = await client`SELECT version()`;
    console.log("✅ Conexão com o banco de dados estabelecida!");

    // Verificar se as tabelas existem
    console.log("\n📊 Verificando tabelas...");

    const tablesToCheck = [
      "campaigns",
      "campaign_chapters",
      "campaign_npcs",
      "maps",
    ];

    for (const tableName of tablesToCheck) {
      const tableExists = await client`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `;

      const exists = tableExists[0]?.exists;
      if (exists) {
        console.log(`  ✅ Tabela '${tableName}' existe`);
      } else {
        console.log(`  ❌ Tabela '${tableName}' NÃO existe`);
      }
    }

    // Verificar estrutura da tabela campaign_chapters
    console.log("\n🔍 Verificando estrutura da tabela campaign_chapters...");
    try {
      const columns = await client`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaign_chapters'
        ORDER BY ordinal_position
      `;
      if (columns.length > 0) {
        console.log("  Colunas encontradas:");
        columns.forEach((col: any) => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log("  ⚠️  Tabela não existe ou está vazia");
      }
    } catch (error: any) {
      console.log(`  ❌ Erro ao verificar estrutura: ${error.message}`);
    }

    // Verificar estrutura da tabela campaign_npcs
    console.log("\n🔍 Verificando estrutura da tabela campaign_npcs...");
    try {
      const columns = await client`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'campaign_npcs'
        ORDER BY ordinal_position
      `;
      if (columns.length > 0) {
        console.log("  Colunas encontradas:");
        columns.forEach((col: any) => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log("  ⚠️  Tabela não existe ou está vazia");
      }
    } catch (error: any) {
      console.log(`  ❌ Erro ao verificar estrutura: ${error.message}`);
    }

    console.log("\n✅ Teste de conexão concluído!");
    console.log("\n💡 Se alguma tabela não existe, execute a migração SQL:");
    console.log("   migrations/add_chapters_and_npc_expansion.sql");
    
    // Fechar conexão
    await client.end();

  } catch (error: any) {
    console.error("❌ Erro ao conectar ao banco de dados:");
    console.error(error.message);
    if (error.message.includes("password")) {
      console.log("\n💡 Verifique se a DATABASE_URL está correta no arquivo .env");
    }
    process.exit(1);
  }
}

testDatabaseConnection();

