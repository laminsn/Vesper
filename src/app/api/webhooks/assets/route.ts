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

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const body = await request.json();
  const { agent_slug, ...assetData } = body;

  let agentId: string | null = null;
  if (agent_slug) {
    const { data: agent } = await supabase.from("agents").select("id").eq("slug", agent_slug).single();
    agentId = agent?.id ?? null;
  }

  const { data, error } = await supabase.from("assets").insert({
    ...assetData,
    created_by_agent_id: agentId,
    approval_status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, asset: data }, { status: 201 });
}
