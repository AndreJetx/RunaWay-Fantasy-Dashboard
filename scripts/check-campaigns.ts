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

async function checkCampaigns() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL não está configurada!");
    process.exit(1);
  }

  console.log("🔍 Verificando campanhas no banco de dados...\n");

  try {
    const client = postgres(connectionString);

    // Listar todas as campanhas
    const campaigns = await client`
      SELECT 
        id,
        dm_id,
        title,
        status,
        created_at
      FROM runaway.campaigns
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`📊 Total de campanhas encontradas: ${campaigns.length}\n`);

    if (campaigns.length === 0) {
      console.log("⚠️  Nenhuma campanha encontrada no banco de dados");
    } else {
      console.log("📋 Campanhas encontradas:\n");
      for (const campaign of campaigns) {
        console.log(`  🎲 ${campaign.title}`);
        console.log(`     ID: ${campaign.id}`);
        console.log(`     DM ID: ${campaign.dm_id}`);
        console.log(`     Status: ${campaign.status}`);
        console.log(`     Criada em: ${campaign.created_at}`);
        console.log("");

        // Verificar se o usuário DM existe
        const dmUser = await client`
          SELECT id, username, email
          FROM runaway.users
          WHERE id = ${campaign.dm_id}
          LIMIT 1
        `;

        if (dmUser.length === 0) {
          console.log(`     ⚠️  ATENÇÃO: Usuário DM (${campaign.dm_id}) NÃO encontrado na tabela users!`);
        } else {
          console.log(`     ✅ DM: ${dmUser[0].username} (${dmUser[0].email})`);
        }
        console.log("");
      }
    }

    // Listar todos os usuários
    const users = await client`
      SELECT 
        id,
        username,
        email,
        role,
        created_at
      FROM runaway.users
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`\n👥 Total de usuários encontrados: ${users.length}\n`);

    if (users.length > 0) {
      console.log("📋 Usuários encontrados:\n");
      for (const user of users) {
        console.log(`  👤 ${user.username || user.email}`);
        console.log(`     ID: ${user.id}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Criado em: ${user.created_at}`);
        console.log("");

        // Verificar campanhas deste usuário como DM
        const userCampaigns = await client`
          SELECT id, title
          FROM runaway.campaigns
          WHERE dm_id = ${user.id}
        `;

        if (userCampaigns.length > 0) {
          console.log(`     🎲 Campanhas como DM: ${userCampaigns.length}`);
          userCampaigns.forEach((c: any) => {
            console.log(`        - ${c.title} (${c.id})`);
          });
        }
        console.log("");
      }
    }

    await client.end();
    console.log("✅ Verificação concluída!");

  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

checkCampaigns();

