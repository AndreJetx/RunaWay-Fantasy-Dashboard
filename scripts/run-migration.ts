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

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL não encontrada no .env");
    process.exit(1);
  }

  console.log("🔌 Conectando ao banco de dados...");

  const sql = postgres(connectionString, {
    max: 1,
    onnotice: () => {},
  });

  try {
    // Ler o arquivo de migração
    const migrationPath = join(process.cwd(), "migrations", "add_attribute_system_and_initial_money.sql");
    console.log(`📄 Lendo migração: ${migrationPath}`);
    
    const migrationSQL = readFileSync(migrationPath, "utf-8");
    
    console.log("🚀 Executando migração...");
    console.log("\nSQL a ser executado:");
    console.log("─".repeat(50));
    console.log(migrationSQL);
    console.log("─".repeat(50));
    
    // Executar o SQL
    await sql.unsafe(migrationSQL);
    
    console.log("\n✅ Migração executada com sucesso!");
    console.log("   Campos adicionados:");
    console.log("   - attribute_system (TEXT, default: 'fixed')");
    console.log("   - initial_money (TEXT, default: '0')");
    
  } catch (error: any) {
    if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
      console.log("\n⚠️  Campos já existem no banco de dados. Tudo certo!");
    } else {
      console.error("\n❌ Erro ao executar migração:", error.message);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

runMigration();

