import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const users = await db.select().from(schema.users).limit(50);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const parsed = insertUserSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const passwordHash = parsed.password === "supabase_auth" 
      ? "supabase_auth" 
      : await hashPassword(parsed.password);

    const [user] = await db
      .insert(schema.users)
      .values({
        username: parsed.username,
        email: parsed.email,
        password: passwordHash,
        role: parsed.role || "player",
      })
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
        avatarUrl: schema.users.avatarUrl,
        createdAt: schema.users.createdAt,
        lastLogin: schema.users.lastLogin,
      });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

