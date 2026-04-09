import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("agent_communications").select("*");

  const fromAgentId = searchParams.get("from_agent_id");
  if (fromAgentId) {
    query = query.eq("from_agent_id", fromAgentId);
  }

  const toAgentId = searchParams.get("to_agent_id");
  if (toAgentId) {
    query = query.eq("to_agent_id", toAgentId);
  }

  const channel = searchParams.get("channel");
  if (channel) {
    query = query.eq("channel", channel);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();

  const { data, error } = await supabase
    .from("agent_communications")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
