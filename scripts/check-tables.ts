import postgres from "postgres";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Carregar variáveis de ambiente
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

async function checkTables() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL não está configurada!");
    process.exit(1);
  }

  console.log("🔍 Verificando tabelas no banco de dados...\n");

  try {
    const client = postgres(connectionString);

    // Verificar se campaign_members existe
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'campaign_members'
      )
    `;

    if (tableExists[0]?.exists) {
      console.log("✅ Tabela 'campaign_members' existe");
      
      // Verificar estrutura
      const columns = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'campaign_members'
        ORDER BY ordinal_position
      `;
      
      console.log("\n📋 Estrutura da tabela:");
      columns.forEach((col: any) => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log("❌ Tabela 'campaign_members' NÃO existe!");
      console.log("\n💡 Criando tabela...");
      
      // Criar tabela
      await client`
        CREATE TABLE campaign_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role user_role NOT NULL DEFAULT 'player',
          joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(campaign_id, user_id)
        )
      `;
      
      console.log("✅ Tabela 'campaign_members' criada!");
    }

    await client.end();
    console.log("\n✅ Verificação concluída!");

  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    
    if (error.message.includes("type \"user_role\" does not exist")) {
      console.log("\n💡 O enum 'user_role' não existe. Criando...");
      const client = postgres(connectionString);
      try {
        await client`CREATE TYPE user_role AS ENUM ('player', 'dm', 'admin')`;
        console.log("✅ Enum 'user_role' criado!");
        await client.end();
        // Tentar novamente
        return checkTables();
      } catch (e: any) {
        console.error("Erro ao criar enum:", e.message);
        await client.end();
      }
    }
    
    process.exit(1);
  }
}

checkTables();

