import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const body = await request.json();
  const { action, agent_slug, event_id, ...eventData } = body;

  if (!action) {
    return NextResponse.json({ error: "action is required (create|update|cancel|complete)" }, { status: 400 });
  }

  // Resolve agent ID from slug
  let agentId: string | null = null;
  if (agent_slug) {
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("slug", agent_slug)
      .single();
    agentId = agent?.id ?? null;
  }

  switch (action) {
    case "create": {
      if (!eventData.title || !eventData.start_time) {
        return NextResponse.json({ error: "title and start_time are required" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          title: eventData.title,
          description: eventData.description ?? null,
          event_type: eventData.event_type ?? "meeting",
          start_time: eventData.start_time,
          end_time: eventData.end_time ?? null,
          all_day: eventData.all_day ?? false,
          location: eventData.location ?? null,
          google_meet_link: eventData.google_meet_link ?? null,
          department: eventData.department ?? null,
          assigned_agent_id: agentId,
          attendees: eventData.attendees ?? [],
          recurrence: eventData.recurrence ?? null,
          status: "scheduled",
          created_by: agent_slug ?? "system",
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: "created", event: data }, { status: 201 });
    }

    case "update": {
      if (!event_id) {
        return NextResponse.json({ error: "event_id is required for update" }, { status: 400 });
      }

      const updateFields: Record<string, unknown> = {};
      if (eventData.title) updateFields.title = eventData.title;
      if (eventData.description !== undefined) updateFields.description = eventData.description;
      if (eventData.event_type) updateFields.event_type = eventData.event_type;
      if (eventData.start_time) updateFields.start_time = eventData.start_time;
      if (eventData.end_time !== undefined) updateFields.end_time = eventData.end_time;
      if (eventData.location !== undefined) updateFields.location = eventData.location;
      if (eventData.google_meet_link !== undefined) updateFields.google_meet_link = eventData.google_meet_link;
      if (eventData.department) updateFields.department = eventData.department;
      if (eventData.attendees) updateFields.attendees = eventData.attendees;
      if (eventData.status) updateFields.status = eventData.status;
      if (agentId) updateFields.assigned_agent_id = agentId;

      const { data, error } = await supabase
        .from("calendar_events")
        .update(updateFields)
        .eq("id", event_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: "updated", event: data });
    }

    case "cancel": {
      if (!event_id) {
        return NextResponse.json({ error: "event_id is required for cancel" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .update({ status: "cancelled" })
        .eq("id", event_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: "cancelled", event: data });
    }

    case "complete": {
      if (!event_id) {
        return NextResponse.json({ error: "event_id is required for complete" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .update({ status: "completed" })
        .eq("id", event_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: "completed", event: data });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
