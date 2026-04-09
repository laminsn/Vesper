import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

const VALID_STATUSES = ["active", "idle", "executing", "offline"] as const;

export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { agent_slug, status, task_context } = body;

  if (!agent_slug || !status) {
    return NextResponse.json(
      { error: "agent_slug and status are required" },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    status,
    last_seen_at: new Date().toISOString(),
  };

  if (task_context !== undefined) {
    updates.task_context = task_context;
  }

  const { data, error } = await supabase
    .from("agents")
    .update(updates)
    .eq("slug", agent_slug)
    .select()
    .single();

  if (error) {
    const statusCode = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  return NextResponse.json(data);
}
