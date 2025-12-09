import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";

type DbClient = PostgresJsDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __drizzleDb__: DbClient | undefined;
  // eslint-disable-next-line no-var
  var __postgresClient__: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Log da URL (sem senha) para debug em desenvolvimento
if (process.env.NODE_ENV === "development") {
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log("🔌 Database URL:", maskedUrl);
  
  // Detectar se é Supabase Pooler
  if (connectionString.includes("pooler.supabase.com") && connectionString.includes(":6543")) {
    console.log("✅ Usando PgBouncer (Supabase Pooler)");
  }
}

// Criar cliente postgres com configuração otimizada para PgBouncer
// O postgres-js funciona perfeitamente com PgBouncer
const client = globalThis.__postgresClient__ ?? postgres(connectionString, {
  max: 10, // Número máximo de conexões no pool
  idle_timeout: 20, // Tempo em segundos antes de fechar conexões idle
  connect_timeout: 10, // Timeout de conexão em segundos
});

if (process.env.NODE_ENV !== "production") {
  globalThis.__postgresClient__ = client;
}

export const db: DbClient =
  globalThis.__drizzleDb__ ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.__drizzleDb__ = db;
}

export { schema };

