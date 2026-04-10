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
  const { agent_slug, items } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items array is required" }, { status: 400 });
  }

  // Resolve agent ID
  let agentId: string | null = null;
  if (agent_slug) {
    const { data: agent } = await supabase.from("agents").select("id").eq("slug", agent_slug).single();
    agentId = agent?.id ?? null;
  }

  const results: { id: string; content_type: string; body: string }[] = [];

  for (const item of items) {
    const { data, error } = await supabase
      .from("content_vault")
      .insert({
        source_type: item.source_type ?? "other",
        source_url: item.source_url ?? null,
        source_title: item.source_title ?? "Untitled",
        content_type: item.content_type ?? "quote",
        body: item.body,
        speaker: item.speaker ?? null,
        timestamp_start: item.timestamp_start ?? null,
        timestamp_end: item.timestamp_end ?? null,
        thumbnail_url: item.thumbnail_url ?? null,
        tags: item.tags ?? [],
        viral_potential: item.viral_potential ?? "medium",
        post_status: "extracted",
        platform_target: item.platform_target ?? null,
        visual_treatment: item.visual_treatment ?? null,
        department: item.department ?? null,
        extracted_by_agent_id: agentId,
      })
      .select()
      .single();

    if (data) {
      results.push({ id: data.id, content_type: data.content_type, body: data.body.slice(0, 80) });
    }
  }

  return NextResponse.json({
    success: true,
    extracted: results.length,
    items: results,
  }, { status: 201 });
}
