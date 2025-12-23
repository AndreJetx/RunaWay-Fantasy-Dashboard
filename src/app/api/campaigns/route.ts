import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { campaignStatusEnum } from "@shared/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { getDbUser } from "@/lib/user-helper";

const campaignStatusValues = campaignStatusEnum.enumValues as [
  string,
  ...string[],
];

const chapterSchema = z.object({
  chapterNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

const npcSchema = z.object({
  name: z.string().min(1),
  race: z.string().optional(),
  characterClass: z.string().optional(),
  level: z.number().int().min(1).optional(),
  challengeRating: z.string().optional(),
  type: z.enum(["npc", "enemy", "boss"]).optional(),
  alignment: z.string().optional(),
  armorClass: z.number().int().optional(),
  maxHp: z.number().int().optional(),
  attributes: z.record(z.any()).optional(),
  attacks: z.array(z.any()).optional(),
  abilities: z.array(z.any()).optional(),
  description: z.string().optional(),
  isHostile: z.boolean().optional(),
});

const createCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  system: z.string().default("dnd5e").optional(),
  status: z.enum(campaignStatusValues).optional(),
  image: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  totalChapters: z.number().int().min(1).default(10).optional(),
  attributeSystem: z.enum(["fixed", "point_buy", "roll_4d6"]).default("fixed").optional(),
  initialMoney: z.string().default("0").optional(),
  maxPlayers: z.number().int().min(1).max(100).default(6).optional(),
  visibility: z.enum(["public", "private"]).default("private").optional(),
  // Mapa inicial
  initialMap: z.object({
    title: z.string().min(1),
    imageUrl: z.string().url(),
    notes: z.string().optional(),
  }).optional(),
  // Capítulos
  chapters: z.array(chapterSchema).min(1, "Pelo menos um capítulo é necessário"),
  // Inimigos do capítulo 1
  chapter1Enemies: z.array(npcSchema).optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Buscar campanhas públicas
    let query = db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.visibility, "public"));

    const campaigns = await query.limit(50);

    // Se o usuário estiver logado, podemos filtrar para não mostrar o que ele já participa
    if (user) {
      const dbUser = await getDbUser(user.id, user.email);
      const userId = dbUser?.id || user.id;

      // Buscar IDs das campanhas que ele já participa
      const myCampaigns = await db
        .select({ id: schema.campaignMembers.campaignId })
        .from(schema.campaignMembers)
        .where(eq(schema.campaignMembers.userId, userId));

      const myDmCampaigns = await db
        .select({ id: schema.campaigns.id })
        .from(schema.campaigns)
        .where(eq(schema.campaigns.dmId, userId));

      const myIds = new Set([
        ...myCampaigns.map(c => c.id),
        ...myDmCampaigns.map(c => c.id)
      ]);

      // Filtrar a lista final
      const filteredCampaigns = campaigns.filter(c => !myIds.has(c.id));
      return NextResponse.json(filteredCampaigns);
    }

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching discoverable campaigns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("📥 Recebendo requisição para criar campanha...");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Usuário autenticado:", user.id);
    console.log("📧 Email do usuário:", user.email);

    // Verificar se o usuário existe na tabela users
    // Se não existir, criar automaticamente
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      console.log("⚠️  Usuário não encontrado na tabela users, criando...");
      console.log("   ID do Supabase:", user.id);
      console.log("   Email:", user.email);

      // Criar usuário na tabela users com dados do Supabase Auth
      const [newUser] = await db
        .insert(schema.users)
        .values({
          id: user.id,
          username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
          email: user.email || "",
          password: "supabase_auth", // Marca especial para usuários autenticados via Supabase
          role: "dm", // Default para DM já que está criando campanha
        })
        .returning();

      console.log("✅ Usuário criado na tabela users:", newUser.id);
      dbUser = [newUser];
    } else {
      console.log("✅ Usuário encontrado na tabela users");
      console.log("   ID do usuário:", dbUser[0].id);
    }

    const payload = await request.json();
    console.log("📦 Payload recebido:", JSON.stringify(payload, null, 2));

    // Limpar campos vazios antes de validar
    if (payload.image === "") {
      delete payload.image;
    }
    if (payload.description === "") {
      delete payload.description;
    }

    console.log("🔍 Validando payload...");
    const parsed = createCampaignSchema.parse(payload);
    console.log("✅ Payload validado com sucesso");

    // Criar campanha
    console.log("📝 Criando campanha...");
    console.log("   Usando dmId:", dbUser[0].id);
    const campaignValues: any = {
      dmId: dbUser[0].id, // Usar o ID do usuário da tabela users
      title: parsed.title,
      system: parsed.system ?? "dnd5e",
      status: parsed.status ?? "Active",
      progress: 0,
      totalChapters: payload.totalChapters || 10,
      attributeSystem: parsed.attributeSystem ?? "fixed",
      initialMoney: parsed.initialMoney ?? "0",
      maxPlayers: parsed.maxPlayers ?? 6,
      visibility: parsed.visibility ?? "private",
    };

    // Adicionar campos opcionais apenas se definidos
    if (parsed.description) campaignValues.description = parsed.description;
    if (parsed.image) campaignValues.image = parsed.image;

    console.log("💾 Valores da campanha:", JSON.stringify(campaignValues, null, 2));

    const [campaign] = await db
      .insert(schema.campaigns)
      .values(campaignValues)
      .returning();

    console.log("✅ Campanha criada:", campaign.id);

    // Criar mapa inicial se fornecido
    if (parsed.initialMap) {
      console.log("🗺️  Criando mapa inicial...");
      const mapValues: any = {
        campaignId: campaign.id,
        dmId: user.id,
        title: parsed.initialMap.title,
        imageUrl: parsed.initialMap.imageUrl,
        isInitialMap: true,
        visibleToPlayers: true,
      };

      // Adicionar notas apenas se definidas
      if (parsed.initialMap.notes) {
        mapValues.notes = parsed.initialMap.notes;
      }

      await db.insert(schema.maps).values(mapValues);
      console.log("✅ Mapa inicial criado");
    }

    // Criar capítulos
    console.log(`📚 Criando ${parsed.chapters.length} capítulo(s)...`);
    const chapters = [];
    for (const chapterData of parsed.chapters) {
      const chapterValues: any = {
        campaignId: campaign.id,
        chapterNumber: chapterData.chapterNumber,
        title: chapterData.title,
      };

      // Adicionar descrição apenas se definida
      if (chapterData.description) {
        chapterValues.description = chapterData.description;
      }

      console.log(`  📖 Criando capítulo ${chapterData.chapterNumber}: ${chapterData.title}`);
      const [chapter] = await db
        .insert(schema.campaignChapters)
        .values(chapterValues)
        .returning();
      chapters.push(chapter);
      console.log(`  ✅ Capítulo criado: ${chapter.id}`);
    }

    // Criar inimigos do capítulo 1 se fornecido
    const chapter1 = chapters.find((c) => c.chapterNumber === 1);
    if (chapter1 && parsed.chapter1Enemies) {
      for (const enemyData of parsed.chapter1Enemies) {
        const npcValues: any = {
          campaignId: campaign.id,
          chapterId: chapter1.id,
          name: enemyData.name,
          level: enemyData.level ?? 1,
          type: enemyData.type ?? "enemy",
          armorClass: enemyData.armorClass ?? 10,
          maxHp: enemyData.maxHp ?? 10,
          currentHp: enemyData.maxHp ?? 10,
          attributes: enemyData.attributes || {},
          attacks: enemyData.attacks || [],
          abilities: enemyData.abilities || [],
          isHostile: enemyData.isHostile ?? true,
        };

        // Adicionar campos opcionais apenas se definidos
        if (enemyData.race) npcValues.race = enemyData.race;
        if (enemyData.characterClass) npcValues.characterClass = enemyData.characterClass;
        if (enemyData.challengeRating) npcValues.challengeRating = enemyData.challengeRating;
        if (enemyData.alignment) npcValues.alignment = enemyData.alignment;
        if (enemyData.description) npcValues.description = enemyData.description;

        await db.insert(schema.campaignNpcs).values(npcValues);
      }
    }

    return NextResponse.json(
      {
        campaign,
        chapters,
        message: "Campaign created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Error creating campaign:", error);

    // Retornar mais detalhes do erro em desenvolvimento
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Verificar tipos de erro
    const isDbConnectionError = errorMessage.toLowerCase().includes("fetch failed") ||
      errorMessage.toLowerCase().includes("connection") ||
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("timeout");

    const isDbError = errorMessage.toLowerCase().includes("relation") ||
      errorMessage.toLowerCase().includes("does not exist") ||
      errorMessage.toLowerCase().includes("column") ||
      errorMessage.toLowerCase().includes("syntax") ||
      errorMessage.toLowerCase().includes("undefined table") ||
      (errorMessage.toLowerCase().includes("table") && errorMessage.toLowerCase().includes("not exist"));

    // Log detalhado do erro
    console.error("Error details:", {
      message: errorMessage,
      name: error instanceof Error ? error.name : "Unknown",
      cause: error instanceof Error ? (error as any).cause : undefined,
      isDbConnectionError,
      isDbError,
    });

    let userMessage = "Internal Server Error";
    let hint: string | undefined;

    if (isDbConnectionError) {
      userMessage = "Erro de conexão com o banco de dados";
      hint = "Verifique se a DATABASE_URL está correta e se o banco está acessível. Se estiver usando Neon, certifique-se de usar a URL de conexão HTTP.";
    } else if (isDbError) {
      userMessage = "Database error - verifique se a migração foi executada";
      hint = "Execute a migração SQL em migrations/add_chapters_and_npc_expansion.sql";
    }

    return NextResponse.json(
      {
        message: userMessage,
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        hint: process.env.NODE_ENV === "development" ? hint : undefined,
      },
      { status: 500 },
    );
  }
}

