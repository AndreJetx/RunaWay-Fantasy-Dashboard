import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { getDbUser } from "@/lib/user-helper";

/**
 * POST /api/characters/[id]/fix-hp-bonus
 * Corrige o HP de personagens que deveriam ter bônus de HP por nível mas não têm
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const characterId = params.id;

        // Buscar personagem
        const [character] = await db
            .select()
            .from(schema.characters)
            .where(eq(schema.characters.id, characterId))
            .limit(1);

        if (!character) {
            return NextResponse.json(
                { error: "Personagem não encontrado" },
                { status: 404 }
            );
        }

        // Verificar permissão (dono ou DM)
        const dbUser = await getDbUser(user.id, user.email);
        const isOwner = character.playerId === user.id || (dbUser && character.playerId === dbUser.id);

        // Buscar campanha para verificar se é DM
        let isDM = false;
        if (character.campaignId) {
            const [campaign] = await db
                .select()
                .from(schema.campaigns)
                .where(eq(schema.campaigns.id, character.campaignId))
                .limit(1);

            if (campaign) {
                isDM = !!(campaign.dmId === user.id || (dbUser && campaign.dmId === dbUser.id));
            }
        }

        if (!isOwner && !isDM) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        // Verificar se o personagem tem bônus de HP por nível baseado na raça/subrace
        let hpBonusPerLevel = 0;

        // Anão Hill tem +1 HP por nível
        if (character.race === "Anão" && character.subrace === "Hill") {
            hpBonusPerLevel = 1;
        }

        if (hpBonusPerLevel === 0) {
            return NextResponse.json({
                message: "Este personagem não tem bônus de HP por nível",
                hpBonusPerLevel: 0,
            });
        }

        // Se já tem o bônus definido e o maxHp parece correto (opcional, vamos forçar a correção se solicitado)
        if (character.hpBonusPerLevel === hpBonusPerLevel) {
            // Se o bônus já estiver lá, talvez já tenha sido aplicado.
            // Mas o usuário chamou a rota de correção, então vamos recalcular baseando-se no que falta.
            return NextResponse.json({
                message: "O bônus já está configurado para este personagem.",
                hpBonusPerLevel: character.hpBonusPerLevel,
                maxHp: character.maxHp
            });
        }

        // Calcular HP correto
        const level = character.level || 1;
        const currentMaxHp = character.maxHp || 0;

        // HP que deveria ter = HP atual + (bônus × nível)
        // Isso assume que o personagem subiu todos os níveis SEM o bônus.
        const correctedMaxHp = currentMaxHp + (hpBonusPerLevel * level);

        // Ajustar currentHp proporcionalmente
        const hpPercentage = currentMaxHp > 0 ? (character.currentHp || 0) / currentMaxHp : 1;
        const correctedCurrentHp = Math.max(1, Math.floor(correctedMaxHp * hpPercentage));

        // Atualizar personagem
        await db
            .update(schema.characters)
            .set({
                hpBonusPerLevel,
                maxHp: correctedMaxHp,
                currentHp: correctedCurrentHp,
            })
            .where(eq(schema.characters.id, characterId));

        return NextResponse.json({
            message: `HP corrigido! Bônus de +${hpBonusPerLevel} HP por nível aplicado retroativamente.`,
            hpBonusPerLevel,
            oldMaxHp: currentMaxHp,
            newMaxHp: correctedMaxHp,
            hpGained: correctedMaxHp - currentMaxHp,
            level,
        });
    } catch (error: any) {
        console.error("Error fixing HP bonus:", error);
        return NextResponse.json(
            { error: "Erro ao corrigir HP", details: error.message },
            { status: 500 }
        );
    }
}
