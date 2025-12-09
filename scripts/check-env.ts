import { readFileSync, existsSync } from "fs";
import { join } from "path";

function checkEnvFile() {
  console.log("🔍 Verificando configuração do ambiente...\n");

  const envFiles = [".env", ".env.local", ".env.development"];
  let envFound = false;
  let envPath = "";

  for (const envFile of envFiles) {
    const fullPath = join(process.cwd(), envFile);
    if (existsSync(fullPath)) {
      envFound = true;
      envPath = fullPath;
      console.log(`✅ Arquivo encontrado: ${envFile}`);
      break;
    }
  }

  if (!envFound) {
    console.log("❌ Nenhum arquivo .env encontrado!");
    console.log("\n💡 Crie um arquivo .env na raiz do projeto com:");
    console.log("   DATABASE_URL=postgresql://...");
    console.log("   NEXT_PUBLIC_SUPABASE_URL=https://...");
    console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=...");
    console.log("\n📋 Use o arquivo env.example como referência.");
    return false;
  }

  console.log(`📄 Lendo arquivo: ${envPath}\n`);

  try {
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    const requiredVars = [
      "DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    console.log("🔑 Verificando variáveis obrigatórias:\n");

    let allPresent = true;
    for (const varName of requiredVars) {
      const isPresent = lines.some(
        (line) =>
          line.trim().startsWith(`${varName}=`) &&
          !line.trim().startsWith("#")
      );

      if (isPresent) {
        const line = lines.find(
          (l) =>
            l.trim().startsWith(`${varName}=`) &&
            !l.trim().startsWith("#")
        );
        const value = line?.split("=")[1]?.trim() || "";
        const isConfigured = !value.includes("YOUR_") && value.length > 0;

        if (isConfigured) {
          // Mascarar valores sensíveis
          const maskedValue =
            varName.includes("PASSWORD") || varName.includes("KEY")
              ? "***" + value.slice(-4)
              : value.length > 50
              ? value.substring(0, 30) + "..."
              : value;
          console.log(`  ✅ ${varName} = ${maskedValue}`);
        } else {
          console.log(`  ⚠️  ${varName} está definida mas não configurada`);
          allPresent = false;
        }
      } else {
        console.log(`  ❌ ${varName} não encontrada`);
        allPresent = false;
      }
    }

    if (allPresent) {
      console.log("\n✅ Todas as variáveis obrigatórias estão configuradas!");
      return true;
    } else {
      console.log("\n⚠️  Algumas variáveis precisam ser configuradas.");
      return false;
    }
  } catch (error: any) {
    console.error("❌ Erro ao ler arquivo .env:", error.message);
    return false;
  }
}

const isConfigured = checkEnvFile();

if (!isConfigured) {
  console.log("\n📝 Para configurar:");
  console.log("   1. Copie env.example para .env");
  console.log("   2. Preencha as variáveis com seus valores reais");
  console.log("   3. Execute novamente: npm run test:db");
  process.exit(1);
}

console.log("\n🚀 Ambiente configurado! Você pode executar os testes agora.");
process.exit(0);

