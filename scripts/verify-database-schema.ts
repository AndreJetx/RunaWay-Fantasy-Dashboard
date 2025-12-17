/**
 * Script de verificação: Compara schema TypeScript com banco de dados
 * Executa: npm run check:db ou tsx scripts/verify-database-schema.ts
 */

import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

interface TableInfo {
  table_name: string;
  column_count: number;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Tabelas esperadas conforme schema.ts
const EXPECTED_TABLES = [
  "users",
  "campaigns",
  "campaign_members",
  "characters",
  "character_change_logs",
  "campaign_sessions",
  "campaign_chapters",
  "campaign_npcs",
  "items",
  "maps",
  "notes",
  "auth_tokens",
  "homebrew_content",
  "combats",
  "tokens",
  "events",
];

// Colunas esperadas por tabela (principais)
const EXPECTED_COLUMNS: Record<string, string[]> = {
  users: [
    "id",
    "username",
    "email",
    "password",
    "role",
    "avatar_url",
    "created_at",
    "last_login",
    "is_premium",
  ],
  campaigns: [
    "id",
    "dm_id",
    "title",
    "description",
    "system",
    "status",
    "current_session",
    "next_session",
    "progress",
    "total_chapters",
    "image",
    "invite_code",
    "attribute_system",
    "initial_money",
    "created_at",
  ],
  characters: [
    "id",
    "campaign_id",
    "player_id",
    "system",
    "name",
    "race",
    "character_class",
    "subclass",
    "level",
    "experience_points",
    "needs_level_up",
    "pending_hit_dice_roll",
    "inventory",
    "created_at",
    "updated_at",
  ],
  campaign_chapters: [
    "id",
    "campaign_id",
    "chapter_number",
    "title",
    "description",
    "is_completed",
    "completed_at",
    "created_at",
    "updated_at",
  ],
  campaign_npcs: [
    "id",
    "campaign_id",
    "chapter_id",
    "name",
    "type",
    "is_hostile",
    "challenge_rating",
    "created_at",
    "updated_at",
  ],
  maps: [
    "id",
    "campaign_id",
    "chapter_id",
    "dm_id",
    "title",
    "image_url",
    "markers",
    "is_initial_map",
    "visible_to_players",
    "created_at",
  ],
  combats: [
    "id",
    "campaign_id",
    "map_id",
    "turn_order",
    "current_turn",
    "round",
    "started_at",
    "ended_at",
  ],
  tokens: [
    "id",
    "character_id",
    "campaign_id",
    "combat_id",
    "x",
    "y",
    "color",
    "name",
    "image_url",
    "size",
    "created_at",
    "updated_at",
  ],
  events: [
    "id",
    "campaign_id",
    "type",
    "data",
    "created_by",
    "created_at",
  ],
};

async function verifyTables() {
  console.log("🔍 Verificando tabelas...\n");

  const result = await db.execute<TableInfo>(sql`
    SELECT 
      table_name,
      (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name = ANY(${EXPECTED_TABLES})
    ORDER BY table_name
  `);

  const existingTables = new Set(result.rows.map((r) => r.table_name));
  const missingTables = EXPECTED_TABLES.filter((t) => !existingTables.has(t));

  console.log("✅ Tabelas existentes:");
  result.rows.forEach((row) => {
    console.log(`   ✓ ${row.table_name} (${row.column_count} colunas)`);
  });

  if (missingTables.length > 0) {
    console.log("\n❌ Tabelas faltando:");
    missingTables.forEach((table) => {
      console.log(`   ✗ ${table}`);
    });
  } else {
    console.log("\n✅ Todas as tabelas existem!");
  }

  return { existingTables: Array.from(existingTables), missingTables };
}

async function verifyColumns(tableName: string) {
  const expectedCols = EXPECTED_COLUMNS[tableName] || [];
  if (expectedCols.length === 0) return { missing: [], extra: [] };

  const result = await db.execute<ColumnInfo>(sql`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `);

  const existingCols = new Set(result.rows.map((r) => r.column_name));
  const missingCols = expectedCols.filter((col) => !existingCols.has(col));
  const extraCols = result.rows
    .map((r) => r.column_name)
    .filter((col) => !expectedCols.includes(col));

  return { missing: missingCols, extra: extraCols, all: result.rows };
}

async function main() {
  try {
    console.log("=".repeat(60));
    console.log("VERIFICAÇÃO DE SCHEMA DO BANCO DE DADOS");
    console.log("=".repeat(60));
    console.log();

    const { existingTables, missingTables } = await verifyTables();

    if (missingTables.length > 0) {
      console.log(
        "\n⚠️  Execute a migration: migrations/verify_all_tables_and_columns.sql"
      );
      return;
    }

    console.log("\n🔍 Verificando colunas principais...\n");

    let hasIssues = false;

    for (const table of existingTables) {
      const { missing, extra } = await verifyColumns(table);

      if (missing.length > 0 || extra.length > 0) {
        hasIssues = true;
        console.log(`📋 ${table}:`);

        if (missing.length > 0) {
          console.log(`   ❌ Colunas faltando: ${missing.join(", ")}`);
        }

        if (extra.length > 0) {
          console.log(`   ⚠️  Colunas extras (não no schema): ${extra.join(", ")}`);
        }
      }
    }

    if (!hasIssues) {
      console.log("✅ Todas as colunas principais estão presentes!");
    } else {
      console.log(
        "\n⚠️  Execute a migration: migrations/verify_all_tables_and_columns.sql"
      );
    }

    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("❌ Erro ao verificar schema:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

