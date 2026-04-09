import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const department = searchParams.get("department");
  const reportType = searchParams.get("report_type");

  let query = supabase
    .from("daily_reports")
    .select("*")
    .eq("report_date", date)
    .order("created_at", { ascending: false });

  if (department) query = query.eq("department", department);
  if (reportType) query = query.eq("report_type", reportType);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("daily_reports")
    .insert({
      report_date: body.report_date ?? new Date().toISOString().split("T")[0],
      department: body.department,
      submitted_by_agent_id: body.submitted_by_agent_id ?? null,
      report_type: body.report_type,
      title: body.title,
      body: body.body,
      metrics: body.metrics ?? {},
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
