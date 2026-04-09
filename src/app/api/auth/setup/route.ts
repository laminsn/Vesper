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

  // Clean up any existing user with this email (from raw SQL insert)
  // Use direct SQL via RPC to remove the corrupt auth record
  await supabase.rpc("cleanup_auth_user", { target_email: email }).catch(() => {
    // RPC might not exist — fall back to admin API
  });

  // Also try admin API deletion
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
    // Also clean up the old user_roles record
    await supabase.from("user_roles").delete().eq("user_id", existing.id);
  }

  // Also try direct cleanup of any orphaned records
  await supabase.from("user_roles").delete().eq("display_name", displayName ?? "Admin");

  // Create user via admin API (proper password hashing)
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName ?? "Admin" },
    });

  if (createError) {
    // If user already exists with proper auth, try updating password instead
    if (createError.message.includes("already") && existing) {
      const { data: updated, error: updateError } =
        await supabase.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      // Re-insert role
      await supabase.from("user_roles").upsert(
        { user_id: existing.id, role: "owner", display_name: displayName ?? "Admin" },
        { onConflict: "user_id" }
      );
      return NextResponse.json({
        success: true,
        userId: existing.id,
        email: updated.user.email,
        note: "Updated existing user password",
      });
    }
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
