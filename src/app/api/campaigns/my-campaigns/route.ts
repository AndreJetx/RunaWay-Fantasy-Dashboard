import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, inArray, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser } from "@/lib/user-helper";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar usuário primeiro
    const dbUser = await getDbUser(user.id, user.email);
    
    // IDs para buscar campanhas (pode ser o mesmo ou diferente)
    // Se dbUser existe e tem ID diferente, buscar por ambos
    // Caso contrário, buscar apenas pelo user.id (Supabase ID)
    const userIdsToSearch = dbUser && dbUser.id && dbUser.id !== user.id 
      ? [user.id, dbUser.id] 
      : [user.id];
    
    // Buscar campanhas em paralelo
    const [dmCampaignsBySupabaseId, memberCampaignsBySupabaseId] = await Promise.all([
      // Buscar campanhas onde o usuário é DM (pode ser por Supabase ID ou DB User ID)
      userIdsToSearch.length > 1
        ? db
            .select({
              id: schema.campaigns.id,
              title: schema.campaigns.title,
              description: schema.campaigns.description,
              status: schema.campaigns.status,
              system: schema.campaigns.system,
              progress: schema.campaigns.progress,
              image: schema.campaigns.image,
              dmId: schema.campaigns.dmId,
              createdAt: schema.campaigns.createdAt,
            })
            .from(schema.campaigns)
            .where(
              or(
                eq(schema.campaigns.dmId, userIdsToSearch[0]),
                eq(schema.campaigns.dmId, userIdsToSearch[1])
              )
            )
        : db
            .select({
              id: schema.campaigns.id,
              title: schema.campaigns.title,
              description: schema.campaigns.description,
              status: schema.campaigns.status,
              system: schema.campaigns.system,
              progress: schema.campaigns.progress,
              image: schema.campaigns.image,
              dmId: schema.campaigns.dmId,
              createdAt: schema.campaigns.createdAt,
            })
            .from(schema.campaigns)
            .where(eq(schema.campaigns.dmId, userIdsToSearch[0])),
      db
        .select({
          campaignId: schema.campaignMembers.campaignId,
        })
        .from(schema.campaignMembers)
        .where(eq(schema.campaignMembers.userId, user.id)),
    ]);

    // Buscar campanhas adicionais como membro se dbUser for diferente
    const memberCampaignsByDbId = dbUser && dbUser.id !== user.id
      ? await db
          .select({
            campaignId: schema.campaignMembers.campaignId,
          })
          .from(schema.campaignMembers)
          .where(eq(schema.campaignMembers.userId, dbUser.id))
      : [];

    // Combinar campanhas como DM (já inclui ambas as buscas se necessário)
    const dmCampaigns = Array.from(
      new Map(dmCampaignsBySupabaseId.map((c) => [c.id, c])).values()
    );

    // Obter IDs únicos de campanhas como membro
    const allMemberIds = [
      ...memberCampaignsBySupabaseId.map((m) => m.campaignId),
      ...memberCampaignsByDbId.map((m) => m.campaignId),
    ];
    const memberCampaignIds = Array.from(new Set(allMemberIds));

    // Buscar campanhas como membro apenas se houver IDs
    const memberCampaignsData =
      memberCampaignIds.length > 0
        ? await db
            .select({
              id: schema.campaigns.id,
              title: schema.campaigns.title,
              description: schema.campaigns.description,
              status: schema.campaigns.status,
              system: schema.campaigns.system,
              progress: schema.campaigns.progress,
              image: schema.campaigns.image,
              dmId: schema.campaigns.dmId,
              createdAt: schema.campaigns.createdAt,
            })
            .from(schema.campaigns)
            .where(inArray(schema.campaigns.id, memberCampaignIds))
        : [];

    // Combinar todas as campanhas (removendo duplicatas)
    const allCampaigns = [...dmCampaigns, ...memberCampaignsData];
    const uniqueCampaigns = Array.from(
      new Map(allCampaigns.map((c) => [c.id, c])).values()
    );

    return NextResponse.json({
      campaigns: uniqueCampaigns,
      isDM: dmCampaigns.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error && process.env.NODE_ENV === "development" 
          ? error.message 
          : undefined,
      },
      { status: 500 }
    );
  }
}
