import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getDbUser, isDM as checkIsDM } from "@/lib/user-helper";
import { isSameDay } from "@/lib/calendar-helper";

/**
 * GET /api/campaigns/[id]/calendar
 * Retorna a data e hora atual da campanha
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const campaignId = params.id;

        // Buscar campanha
        const [campaign] = await db
            .select()
            .from(schema.campaigns)
            .where(eq(schema.campaigns.id, campaignId))
            .limit(1);

        if (!campaign) {
            return NextResponse.json(
                { error: "Campanha não encontrada" },
                { status: 404 }
            );
        }

        // Verificar se o usuário é membro da campanha
        const dbUser = await getDbUser(user.id, user.email);
        const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);

        const [memberBySupabaseId, memberByDbId] = await Promise.all([
            db
                .select()
                .from(schema.campaignMembers)
                .where(
                    and(
                        eq(schema.campaignMembers.campaignId, campaignId),
                        eq(schema.campaignMembers.userId, user.id)
                    )
                )
                .limit(1),
            dbUser && dbUser.id !== user.id
                ? db
                    .select()
                    .from(schema.campaignMembers)
                    .where(
                        and(
                            eq(schema.campaignMembers.campaignId, campaignId),
                            eq(schema.campaignMembers.userId, dbUser.id)
                        )
                    )
                    .limit(1)
                : Promise.resolve([]),
        ]);

        const isMember = memberBySupabaseId.length > 0 || memberByDbId.length > 0;

        if (!userIsDM && !isMember) {
            return NextResponse.json(
                { error: "Você não é membro desta campanha" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            currentDate: campaign.campaignDate || "1-1-1490",
            currentTime: campaign.campaignTime || "08:00",
            calendarSystem: campaign.calendarSystem || "faerun",
        });
    } catch (error: any) {
        console.error("Error fetching campaign calendar:", error);
        return NextResponse.json(
            { error: "Erro ao buscar calendário da campanha" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/campaigns/[id]/calendar
 * Atualiza a data e hora da campanha (apenas DM)
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const campaignId = params.id;
        const body = await req.json();
        const { currentDate, currentTime } = body;

        // Validar dados
        if (!currentDate || !currentTime) {
            return NextResponse.json(
                { error: "Data e hora são obrigatórias" },
                { status: 400 }
            );
        }

        // Buscar campanha
        const [campaign] = await db
            .select()
            .from(schema.campaigns)
            .where(eq(schema.campaigns.id, campaignId))
            .limit(1);

        if (!campaign) {
            return NextResponse.json(
                { error: "Campanha não encontrada" },
                { status: 404 }
            );
        }

        // Verificar se o usuário é o DM
        const dbUser = await getDbUser(user.id, user.email);
        const userIsDM = checkIsDM(campaign.dmId, user.id, dbUser?.id);

        if (!userIsDM) {
            return NextResponse.json(
                { error: "Apenas o DM pode alterar o calendário" },
                { status: 403 }
            );
        }

        const oldDate = campaign.campaignDate || "1-1-1490";
        const newDate = currentDate;

        // Atualizar calendário da campanha
        await db
            .update(schema.campaigns)
            .set({
                campaignDate: currentDate,
                campaignTime: currentTime,
            })
            .where(eq(schema.campaigns.id, campaignId));

        // Se o dia mudou, resetar magias preparadas de todos os personagens
        const dayChanged = !isSameDay(oldDate, newDate);

        if (dayChanged) {
            // Buscar todos os personagens da campanha que preparam magias
            const characters = await db
                .select()
                .from(schema.characters)
                .where(eq(schema.characters.campaignId, campaignId));

            // Resetar magias preparadas apenas para classes que preparam magias
            const classesToReset = ['Clérigo', 'Druida', 'Paladino', 'Mago'];

            for (const character of characters) {
                if (classesToReset.includes(character.characterClass || '')) {
                    await db
                        .update(schema.characters)
                        .set({
                            preparedSpells: [],
                            lastSpellPrepDate: null,
                        })
                        .where(eq(schema.characters.id, character.id));
                }
            }

            console.log(`Day changed in campaign ${campaignId}. Prepared spells reset.`);
        }

        return NextResponse.json({
            success: true,
            currentDate,
            currentTime,
            dayChanged,
            message: dayChanged
                ? "Calendário atualizado. Magias preparadas foram resetadas."
                : "Calendário atualizado com sucesso",
        });
    } catch (error: any) {
        console.error("Error updating campaign calendar:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar calendário da campanha" },
            { status: 500 }
        );
    }
}
