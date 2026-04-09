import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("kpis").select("*");

  const departmentId = searchParams.get("department_id");
  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query.order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const { kpi_id, value } = body;

  if (!kpi_id || value === undefined) {
    return NextResponse.json(
      { error: "kpi_id and value are required" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("kpis")
    .update({ current_value: value })
    .eq("id", kpi_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: historyData, error: historyError } = await supabase
    .from("kpi_history")
    .insert({ kpi_id, value, recorded_at: new Date().toISOString() })
    .select()
    .single();

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  return NextResponse.json(historyData, { status: 201 });
}
