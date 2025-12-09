import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
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

    const campaignId = params.id;

    // Verificar se o usuário é o DM da campanha
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Verificar se é o DM
    let dbUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isDM = campaign.dmId === user.id || campaign.dmId === dbUser[0].id;
    if (!isDM) {
      return NextResponse.json({ error: "Only the DM can generate invite codes" }, { status: 403 });
    }

    // Gerar código de convite único (8 caracteres alfanuméricos)
    const generateInviteCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removendo caracteres ambíguos
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let inviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Garantir que o código seja único
    while (attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(schema.campaigns)
        .where(eq(schema.campaigns.inviteCode, inviteCode))
        .limit(1);

      if (existing.length === 0) {
        break;
      }

      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique invite code" },
        { status: 500 }
      );
    }

    // Atualizar a campanha com o código de convite
    const [updatedCampaign] = await db
      .update(schema.campaigns)
      .set({ inviteCode })
      .where(eq(schema.campaigns.id, campaignId))
      .returning();

    return NextResponse.json({
      inviteCode: updatedCampaign.inviteCode,
      message: "Invite code generated successfully",
    });
  } catch (error) {
    console.error("Error generating invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

