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
  const { event_id, agent_slug, note_type, title, body: noteBody, action_items } = body;

  if (!event_id || !note_type || !title || !noteBody) {
    return NextResponse.json(
      { error: "event_id, note_type, title, and body are required" },
      { status: 400 }
    );
  }

  // Verify event exists
  const { data: event, error: eventError } = await supabase
    .from("calendar_events")
    .select("id")
    .eq("id", event_id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
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

  const { data, error } = await supabase
    .from("meeting_notes")
    .insert({
      event_id,
      note_type,
      title,
      body: noteBody,
      author_agent_id: agentId,
      action_items: action_items ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, note: data }, { status: 201 });
}
