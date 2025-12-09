import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createNpcSchema = z.object({
  campaignId: z.string().uuid(),
  chapterId: z.string().uuid().optional(),
  name: z.string().min(1),
  race: z.string().optional(),
  characterClass: z.string().optional(),
  subclass: z.string().optional(),
  level: z.number().int().min(1).optional(),
  challengeRating: z.string().optional(),
  type: z.enum(["npc", "enemy", "boss"]).optional(),
  alignment: z.string().optional(),
  image: z.string().url().optional(),
  // Atributos
  armorClass: z.number().int().optional(),
  initiative: z.number().int().optional(),
  speed: z.number().int().optional(),
  currentHp: z.number().int().optional(),
  maxHp: z.number().int().optional(),
  tempHp: z.number().int().optional(),
  hitDice: z.string().optional(),
  attributes: z.record(z.any()).optional(),
  savingThrows: z.record(z.any()).optional(),
  skills: z.record(z.any()).optional(),
  proficiencyBonus: z.number().int().optional(),
  // Ataques e habilidades
  attacks: z.array(z.any()).optional(),
  abilities: z.array(z.any()).optional(),
  resistances: z.array(z.string()).optional(),
  immunities: z.array(z.string()).optional(),
  vulnerabilities: z.array(z.string()).optional(),
  // Informações adicionais
  role: z.string().optional(),
  attitude: z.string().optional(),
  description: z.string().optional(),
  backstory: z.string().optional(),
  notes: z.string().optional(),
  isHostile: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const chapterId = searchParams.get("chapterId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    let query = db
      .select()
      .from(schema.campaignNpcs)
      .where(eq(schema.campaignNpcs.campaignId, campaignId));

    // Note: We can't filter by chapterId in the same query easily without relations
    // For now, we'll fetch all and filter in memory if needed
    const npcs = await query;

    const filteredNpcs = chapterId
      ? npcs.filter((npc) => npc.chapterId === chapterId)
      : npcs;

    return NextResponse.json({ npcs: filteredNpcs });
  } catch (error) {
    console.error("Error fetching NPCs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createNpcSchema.parse(body);

    // Verify user is DM of the campaign
    const [campaign] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.id, parsed.campaignId))
      .limit(1);

    if (!campaign || campaign.dmId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const [npc] = await db
      .insert(schema.campaignNpcs)
      .values({
        campaignId: parsed.campaignId,
        chapterId: parsed.chapterId,
        name: parsed.name,
        race: parsed.race,
        characterClass: parsed.characterClass,
        subclass: parsed.subclass,
        level: parsed.level ?? 1,
        challengeRating: parsed.challengeRating,
        type: parsed.type ?? "npc",
        alignment: parsed.alignment,
        image: parsed.image,
        armorClass: parsed.armorClass ?? 10,
        initiative: parsed.initiative ?? 0,
        speed: parsed.speed ?? 30,
        currentHp: parsed.currentHp ?? parsed.maxHp ?? 10,
        maxHp: parsed.maxHp ?? 10,
        tempHp: parsed.tempHp ?? 0,
        hitDice: parsed.hitDice,
        attributes: parsed.attributes ?? {},
        savingThrows: parsed.savingThrows ?? {},
        skills: parsed.skills ?? {},
        proficiencyBonus: parsed.proficiencyBonus ?? 2,
        attacks: parsed.attacks ?? [],
        abilities: parsed.abilities ?? [],
        resistances: parsed.resistances ?? [],
        immunities: parsed.immunities ?? [],
        vulnerabilities: parsed.vulnerabilities ?? [],
        role: parsed.role,
        attitude: parsed.attitude,
        description: parsed.description,
        backstory: parsed.backstory,
        notes: parsed.notes,
        isHostile: parsed.isHostile ?? false,
      })
      .returning();

    return NextResponse.json({ npc }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", issues: error.flatten() },
        { status: 400 }
      );
    }
    console.error("Error creating NPC:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

