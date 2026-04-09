import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/setup
 * One-time bootstrap: creates the initial admin user via Supabase Admin API.
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 * Returns the created user's ID so we can verify it worked.
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

  // Delete existing user with this email if it exists (from raw SQL insert)
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
  }

  // Create user via admin API (proper password hashing)
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName ?? "Admin" },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  // Insert user_roles record
  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      user_id: created.user.id,
      role: "owner",
      display_name: displayName ?? "Admin",
    },
    { onConflict: "user_id" }
  );

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    userId: created.user.id,
    email: created.user.email,
  });
}
