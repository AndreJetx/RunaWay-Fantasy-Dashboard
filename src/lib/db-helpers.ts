import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * Busca usuário no banco de dados de forma otimizada
 * Retorna o usuário encontrado ou null
 */
export async function getUserFromDb(userId: string, email?: string) {
  // Buscar por ID primeiro (mais rápido)
  const [userById] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (userById) {
    return userById;
  }

  // Se não encontrou e tem email, buscar por email
  if (email) {
    const [userByEmail] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (userByEmail) {
      return userByEmail;
    }
  }

  return null;
}

/**
 * Verifica se o usuário é DM de uma campanha
 */
export function isCampaignDM(
  campaignDmId: string,
  userId: string,
  dbUserId?: string
): boolean {
  return (
    String(campaignDmId) === String(userId) ||
    (dbUserId !== undefined && String(campaignDmId) === String(dbUserId))
  );
}

