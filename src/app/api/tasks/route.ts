import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("tasks").select("*");

  const status = searchParams.get("status");
  if (status) {
    query = query.eq("status", status);
  }

  const departmentId = searchParams.get("department_id");
  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const assignedAgentId = searchParams.get("assigned_agent_id");
  if (assignedAgentId) {
    query = query.eq("assigned_agent_id", assignedAgentId);
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
    .from("tasks")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
