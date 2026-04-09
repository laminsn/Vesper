import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const department = searchParams.get("department");

  let query = supabase
    .from("calendar_events")
    .select("*")
    .order("start_time");

  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);
  if (department) query = query.eq("department", department);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      title: body.title,
      description: body.description ?? null,
      event_type: body.event_type,
      start_time: body.start_time,
      end_time: body.end_time ?? null,
      all_day: body.all_day ?? false,
      location: body.location ?? null,
      google_meet_link: body.google_meet_link ?? null,
      department: body.department ?? null,
      assigned_agent_id: body.assigned_agent_id ?? null,
      attendees: body.attendees ?? [],
      recurrence: body.recurrence ?? null,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
