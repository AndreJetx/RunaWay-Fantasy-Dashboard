import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const joinCampaignSchema = z.object({
  inviteCode: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = joinCampaignSchema.parse(payload);

    // Garantir que o usuário existe na tabela users
    let dbUser = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, tentar buscar por email
    if (dbUser.length === 0 && user.email) {
      const userByEmail = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      
      if (userByEmail.length > 0) {
        // Usuário existe mas com ID diferente - usar o que foi encontrado
        dbUser = userByEmail;
        console.log(`User found by email with different ID. Supabase ID: ${user.id}, DB ID: ${userByEmail[0].id}`);
      }
    }

    // Se ainda não encontrou, tentar criar usuário
    if (dbUser.length === 0) {
      try {
        const [newUser] = await db
          .insert(schema.users)
          .values({
            id: user.id,
            username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
            email: user.email || "",
            password: "supabase_auth",
            role: "player",
          })
          .returning();
        dbUser = [newUser];
        console.log("New user created:", newUser.id);
      } catch (insertError: any) {
        // Se der erro de duplicação (email ou ID), buscar novamente
        const isDuplicateError = insertError?.code === '23505' || 
                                 insertError?.message?.includes('duplicate') ||
                                 insertError?.message?.includes('unique');
        
        if (isDuplicateError) {
          console.log("User already exists (duplicate error), fetching...");
          // Tentar buscar por ID novamente
          const userById = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, user.id))
            .limit(1);
          
          if (userById.length > 0) {
            dbUser = userById;
          } else if (user.email) {
            // Tentar buscar por email
            const userByEmail = await db
              .select()
              .from(schema.users)
              .where(eq(schema.users.email, user.email))
              .limit(1);
            if (userByEmail.length > 0) {
              dbUser = userByEmail;
            }
          }
          
          // Se ainda não encontrou, retornar erro
          if (dbUser.length === 0) {
            console.error("Could not find user after duplicate error");
            throw new Error("Usuário já existe mas não foi possível encontrá-lo");
          }
        } else {
          // Outro tipo de erro, propagar
          throw insertError;
        }
      }
    }

    // Buscar campanha pelo código de convite (case-insensitive)
    // Normalizar o código para maiúsculas
    const normalizedCode = parsed.inviteCode.toUpperCase().trim();
    
    // Buscar todas as campanhas com código de convite
    const allCampaigns = await db
      .select()
      .from(schema.campaigns)
      .where(sql`${schema.campaigns.inviteCode} IS NOT NULL`);

    // Filtrar por código (case-insensitive)
    const campaign = allCampaigns.find(
      (c) => c.inviteCode && c.inviteCode.toUpperCase() === normalizedCode
    );

    if (!campaign || !campaign.inviteCode) {
      console.error(`Invite code not found: ${normalizedCode}`);
      console.error(`Available codes:`, allCampaigns.map(c => c.inviteCode).filter(Boolean));
      return NextResponse.json(
        { error: "Código de convite inválido ou não encontrado" },
        { status: 404 }
      );
    }

    // Usar o ID do usuário do banco de dados (pode ser diferente do Supabase ID)
    const userIdToUse = dbUser[0].id;

    // Verificar se o usuário já é membro (verificar ambos os IDs possíveis)
    const existingMembers = await db
      .select()
      .from(schema.campaignMembers)
      .where(
        and(
          eq(schema.campaignMembers.campaignId, campaign.id),
          eq(schema.campaignMembers.userId, userIdToUse)
        )
      )
      .limit(1);

    if (existingMembers.length > 0) {
      return NextResponse.json(
        { error: "Você já é membro desta campanha" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é o DM (não pode entrar como membro)
    if (campaign.dmId === userIdToUse || campaign.dmId === user.id) {
      return NextResponse.json(
        { error: "Você é o mestre desta campanha" },
        { status: 400 }
      );
    }

    // Adicionar como membro usando o ID do banco de dados
    const [member] = await db
      .insert(schema.campaignMembers)
      .values({
        campaignId: campaign.id,
        userId: userIdToUse,
        role: "player",
      })
      .returning();

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
      },
      member,
      message: "Successfully joined campaign",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.flatten());
      return NextResponse.json(
        { error: "Dados inválidos", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Error joining campaign:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { 
        error: "Erro ao entrar na campanha",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

