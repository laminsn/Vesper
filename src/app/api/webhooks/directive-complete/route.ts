import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { directive_id, status, response } = body;

  if (!directive_id || !status) {
    return NextResponse.json(
      { error: "directive_id and status are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    status,
    response: response ?? null,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("directives")
    .update(updates)
    .eq("id", directive_id)
    .select()
    .single();

  if (error) {
    const statusCode = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  return NextResponse.json(data);
}
