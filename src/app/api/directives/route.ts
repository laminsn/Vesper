import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("directives").select("*");

  const status = searchParams.get("status");
  if (status) {
    query = query.eq("status", status);
  }

  const targetAgentId = searchParams.get("target_agent_id");
  if (targetAgentId) {
    query = query.eq("target_agent_id", targetAgentId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("directives")
    .insert({ ...body, issued_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
