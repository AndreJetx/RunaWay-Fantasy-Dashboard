import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export interface DbUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Helper otimizado para buscar usuário no banco de dados
 * Tenta buscar por ID primeiro, depois por email
 */
export async function getDbUser(
  supabaseUserId: string,
  supabaseEmail?: string | null
): Promise<DbUser | null> {
  // Tentar buscar por ID primeiro
  const [userById] = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(eq(schema.users.id, supabaseUserId))
    .limit(1);

  if (userById) {
    return userById;
  }

  // Se não encontrou e tem email, buscar por email
  if (supabaseEmail) {
    const [userByEmail] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.email, supabaseEmail))
      .limit(1);

    if (userByEmail) {
      return userByEmail;
    }
  }

  return null;
}

/**
 * Verifica se é DM comparando IDs
 */
export function isDM(campaignDmId: string, userId: string, dbUserId?: string): boolean {
  return String(campaignDmId) === String(userId) || 
         (dbUserId !== undefined && String(campaignDmId) === String(dbUserId));
}

