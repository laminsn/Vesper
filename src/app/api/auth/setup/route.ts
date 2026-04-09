import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/setup
 * Bootstrap: creates an admin user via Supabase Admin API.
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export async function POST(request: Request) {
  const { email, password, displayName } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create user via admin API (proper password hashing, skip email confirm)
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName ?? "Admin" },
    });

  if (createError) {
    return NextResponse.json(
      { error: createError.message, step: "createUser" },
      { status: 500 }
    );
  }

  // Insert user_roles record (owner role)
  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      user_id: created.user.id,
      role: "owner",
      display_name: displayName ?? "Admin",
    },
    { onConflict: "user_id" }
  );

  if (roleError) {
    return NextResponse.json(
      { error: roleError.message, step: "userRoles" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    userId: created.user.id,
    email: created.user.email,
  });
}
