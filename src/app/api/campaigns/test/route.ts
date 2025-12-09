import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint de teste para diagnosticar problemas
 * GET /api/campaigns/test
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  // Teste 1: Verificar autenticação
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      results.tests.push({
        name: "Autenticação",
        status: "✅ OK",
        details: `Usuário autenticado: ${user.email}`,
      });
      results.userId = user.id;
    } else {
      results.tests.push({
        name: "Autenticação",
        status: "❌ FALHOU",
        details: "Usuário não autenticado",
      });
    }
  } catch (error: any) {
    results.tests.push({
      name: "Autenticação",
      status: "❌ ERRO",
      details: error.message,
    });
  }

  // Teste 2: Verificar conexão com banco
  try {
    await db.select().from(schema.campaigns).limit(1);
    results.tests.push({
      name: "Conexão com Banco",
      status: "✅ OK",
      details: "Conexão estabelecida com sucesso",
    });
  } catch (error: any) {
    results.tests.push({
      name: "Conexão com Banco",
      status: "❌ ERRO",
      details: error.message,
    });
  }

  // Teste 3: Verificar se tabelas existem
  const tablesToCheck = [
    { name: "campaigns", schema: schema.campaigns },
    { name: "campaign_chapters", schema: schema.campaignChapters },
    { name: "campaign_npcs", schema: schema.campaignNpcs },
    { name: "maps", schema: schema.maps },
  ];

  for (const table of tablesToCheck) {
    try {
      await db.select().from(table.schema).limit(1);
      results.tests.push({
        name: `Tabela: ${table.name}`,
        status: "✅ OK",
        details: "Tabela existe e é acessível",
      });
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      results.tests.push({
        name: `Tabela: ${table.name}`,
        status: "❌ ERRO",
        details: errorMsg,
        hint: errorMsg.includes("does not exist") || errorMsg.includes("relation")
          ? "Execute a migração SQL: migrations/add_chapters_and_npc_expansion.sql"
          : undefined,
      });
    }
  }

  // Resumo
  const passed = results.tests.filter((t: any) => t.status.includes("✅")).length;
  const failed = results.tests.filter((t: any) => t.status.includes("❌")).length;

  results.summary = {
    total: results.tests.length,
    passed,
    failed,
    allPassed: failed === 0,
  };

  return NextResponse.json(results, {
    status: results.summary.allPassed ? 200 : 500,
  });
}

