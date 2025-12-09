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

async function diagnoseDatabase() {
  console.log("🔍 Diagnóstico de Conexão com Banco de Dados\n");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL não está configurada!");
    console.log("\n💡 Configure a variável DATABASE_URL no arquivo .env");
    process.exit(1);
  }

  // Mascarar senha para exibição
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log("📋 URL configurada:", maskedUrl);
  console.log("");

  // Verificar formato da URL
  console.log("🔍 Analisando formato da URL...");
  
  const isSupabase = connectionString.includes("supabase.com") || 
                     connectionString.includes("pooler.supabase");
  const isNeon = connectionString.includes("neon.tech") || 
                 connectionString.includes("neon") ||
                 connectionString.includes("neondb");
  
  if (isSupabase) {
    console.log("  ✅ Detectado: Supabase");
    console.log("  ⚠️  Para Supabase, certifique-se de usar a URL do Pooler");
    console.log("  📝 Formato esperado: postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres");
  } else if (isNeon) {
    console.log("  ✅ Detectado: Neon");
    console.log("  ⚠️  Para Neon, use a connection string padrão");
    console.log("  📝 Formato esperado: postgresql://[user]:[pass]@[host]/[db]");
  } else {
    console.log("  ⚠️  Provedor não identificado automaticamente");
    console.log("  💡 Certifique-se de usar a URL correta do seu provedor");
  }

  console.log("\n🔌 Testando conexão...\n");

  try {
    const client = postgres(connectionString);
    
    // Teste simples
    console.log("  📤 Enviando query de teste...");
    const startTime = Date.now();
    
    const result = await Promise.race([
      client`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout após 10 segundos")), 10000)
      )
    ]) as any[];

    const duration = Date.now() - startTime;
    
    console.log("  ✅ Conexão estabelecida com sucesso!");
    console.log(`  ⏱️  Tempo de resposta: ${duration}ms`);
    console.log(`  📊 Resultado:`, result[0]);
    
    // Teste de versão do PostgreSQL
    try {
      const versionResult = await client`SELECT version() as version`;
      console.log("\n  📋 Versão do PostgreSQL:");
      console.log("     ", (versionResult[0] as any).version?.split("\n")[0]);
    } catch (e) {
      // Ignorar erro de versão
    }

    console.log("\n✅ Banco de dados está acessível e funcionando!");
    
    // Fechar conexão
    await client.end();
    
    return true;

  } catch (error: any) {
    console.error("\n❌ Erro ao conectar:");
    console.error("  Mensagem:", error.message);
    
    if (error.message.includes("fetch failed")) {
      console.log("\n💡 Possíveis soluções:");
      console.log("  1. Verifique se a URL está correta");
      console.log("  2. Verifique sua conexão com a internet");
      console.log("  3. Se estiver usando Neon, verifique se o projeto está ativo (não pausado)");
      console.log("  4. Se estiver usando Supabase, certifique-se de usar a URL do Pooler");
      console.log("  5. Verifique se há firewall bloqueando a conexão");
    } else if (error.message.includes("password") || error.message.includes("authentication")) {
      console.log("\n💡 Possíveis soluções:");
      console.log("  1. Verifique se a senha na URL está correta");
      console.log("  2. Se a senha contém caracteres especiais, eles devem ser codificados:");
      console.log("     @ → %40, # → %23, % → %25, espaços → %20");
    } else if (error.message.includes("timeout")) {
      console.log("\n💡 Possíveis soluções:");
      console.log("  1. Verifique sua conexão com a internet");
      console.log("  2. O banco pode estar sobrecarregado, tente novamente");
    } else {
      console.log("\n💡 Verifique:");
      console.log("  1. Se a URL está no formato correto");
      console.log("  2. Se o banco de dados está acessível");
      console.log("  3. Se as credenciais estão corretas");
    }

    return false;
  }
}

diagnoseDatabase().then((success) => {
  process.exit(success ? 0 : 1);
});

