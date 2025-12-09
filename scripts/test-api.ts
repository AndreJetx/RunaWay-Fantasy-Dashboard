/**
 * Script para testar a API de criação de campanhas
 * Execute: npm run test:api
 */

async function testCreateCampaign() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  console.log("🧪 Testando criação de campanha...");
  console.log(`📍 URL base: ${baseUrl}\n`);

  // Payload de teste
  const testPayload = {
    title: "Campanha de Teste",
    description: "Esta é uma campanha de teste criada automaticamente",
    system: "dnd5e",
    status: "Active",
    image: "",
    initialMap: {
      title: "Mapa Inicial de Teste",
      imageUrl: "https://example.com/map.png",
      notes: "Mapa de teste",
    },
    chapters: [
      {
        chapterNumber: 1,
        title: "Capítulo 1 - O Início",
        description: "Primeiro capítulo da campanha",
      },
      {
        chapterNumber: 2,
        title: "Capítulo 2 - A Jornada",
        description: "Segundo capítulo da campanha",
      },
    ],
    chapter1Enemies: [
      {
        name: "Goblin Teste",
        race: "Goblin",
        type: "enemy",
        level: 1,
        armorClass: 15,
        maxHp: 7,
        attributes: {
          strength: 8,
          dexterity: 14,
          constitution: 10,
          intelligence: 10,
          wisdom: 8,
          charisma: 8,
        },
        attacks: [],
        abilities: [],
        isHostile: true,
      },
    ],
  };

  try {
    console.log("📤 Enviando requisição POST para /api/campaigns...");
    console.log("📦 Payload:", JSON.stringify(testPayload, null, 2));
    console.log("");

    const response = await fetch(`${baseUrl}/api/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`📥 Status da resposta: ${response.status} ${response.statusText}`);

    const responseData = await response.json();

    if (response.ok) {
      console.log("✅ Campanha criada com sucesso!");
      console.log("📋 Dados retornados:");
      console.log(JSON.stringify(responseData, null, 2));
    } else {
      console.error("❌ Erro ao criar campanha:");
      console.error("Mensagem:", responseData.message);
      if (responseData.error) {
        console.error("Erro detalhado:", responseData.error);
      }
      if (responseData.issues) {
        console.error("Problemas de validação:", JSON.stringify(responseData.issues, null, 2));
      }
      if (responseData.stack) {
        console.error("Stack trace:", responseData.stack);
      }
    }
  } catch (error: any) {
    console.error("❌ Erro ao fazer requisição:");
    console.error(error.message);
    if (error.message.includes("fetch")) {
      console.log("\n💡 Certifique-se de que o servidor está rodando:");
      console.log("   npm run dev");
    }
  }
}

// Verificar se está rodando em modo de teste
if (import.meta.url === `file://${process.argv[1]}`) {
  testCreateCampaign();
}

export { testCreateCampaign };

