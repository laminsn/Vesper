import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { execution_id, step_number, status, completed_at } = body;

  if (!execution_id || !step_number || !status) {
    return NextResponse.json(
      { error: "execution_id, step_number, and status are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: execution, error: fetchError } = await supabase
    .from("playbook_executions")
    .select("step_statuses, current_step")
    .eq("id", execution_id)
    .single();

  if (fetchError) {
    const statusCode = fetchError.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: fetchError.message }, { status: statusCode });
  }

  const stepStatuses = {
    ...(execution.step_statuses as Record<string, unknown>),
    [String(step_number)]: {
      status,
      completed_at: completed_at ?? new Date().toISOString(),
    },
  };

  const nextStep =
    status === "completed" ? step_number + 1 : execution.current_step;

  const { data, error: updateError } = await supabase
    .from("playbook_executions")
    .update({
      step_statuses: stepStatuses,
      current_step: nextStep,
    })
    .eq("id", execution_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
