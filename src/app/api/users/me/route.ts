import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar usuário na tabela users (primeiro por ID, depois por email como fallback)
    let [dbUser] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1);

    // Se não encontrou por ID, tentar por email
    if (!dbUser && user.email) {
      const usersByEmail = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          role: schema.users.role,
        })
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1);
      
      if (usersByEmail.length > 0) {
        dbUser = usersByEmail[0];
      }
    }

    // Se ainda não encontrou, criar usuário automaticamente
    if (!dbUser) {
      console.log("User not found in database, creating automatically:", {
        supabaseId: user.id,
        email: user.email,
      });
      
      try {
        const [newUser] = await db
          .insert(schema.users)
          .values({
            id: user.id, // Usar o ID do Supabase Auth
            username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
            email: user.email || "",
            password: "supabase_auth",
            role: "player",
          })
          .returning({
            id: schema.users.id,
            username: schema.users.username,
            email: schema.users.email,
            role: schema.users.role,
          });
        
        dbUser = newUser;
        console.log("User created automatically:", dbUser.id);
      } catch (insertError: any) {
        // Se der erro de duplicação, tentar buscar novamente
        if (insertError?.code === '23505' || insertError?.message?.includes('duplicate')) {
          console.log("Duplicate error, fetching user again...");
          const userById = await db
            .select({
              id: schema.users.id,
              username: schema.users.username,
              email: schema.users.email,
              role: schema.users.role,
            })
            .from(schema.users)
            .where(eq(schema.users.id, user.id))
            .limit(1);
          
          if (userById.length > 0) {
            dbUser = userById[0];
          } else if (user.email) {
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
              dbUser = userByEmail[0];
            }
          }
        }
        
        if (!dbUser) {
          console.error("Failed to create or find user:", insertError);
          return NextResponse.json(
            { error: "Failed to create user in database" },
            { status: 500 }
          );
        }
      }
    }

    // Verifica se o usuário é DM de alguma campanha
    const [campaignAsDM] = await db
      .select()
      .from(schema.campaigns)
      .where(eq(schema.campaigns.dmId, dbUser.id))
      .limit(1);

    // Se for DM de alguma campanha, força o role para "dm"
    // (mesmo que o role no banco esteja como "player")
    let role = dbUser.role?.toLowerCase() === "admin" ? "admin" : "player";
    
    if (campaignAsDM) {
      role = "dm";
      // Atualiza o role no banco se estiver diferente
      if (dbUser.role?.toLowerCase() !== "dm") {
        await db
          .update(schema.users)
          .set({ role: "dm" })
          .where(eq(schema.users.id, dbUser.id));
      }
    } else {
      // Normaliza o role do banco
      role = dbUser.role?.toLowerCase() === "dm" ? "dm" : 
             dbUser.role?.toLowerCase() === "admin" ? "admin" : 
             "player";
    }

    return NextResponse.json({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: role,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



