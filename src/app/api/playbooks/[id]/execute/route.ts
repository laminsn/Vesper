import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playbookId } = await params;
  const supabase = await createClient();

  const { data: playbook, error: fetchError } = await supabase
    .from("playbooks")
    .select("*")
    .eq("id", playbookId)
    .single();

  if (fetchError) {
    const status = fetchError.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: fetchError.message }, { status });
  }

  const { data, error } = await supabase
    .from("playbook_executions")
    .insert({
      playbook_id: playbookId,
      status: "running",
      current_step: 1,
      step_statuses: {},
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ...data, playbook_name: playbook.name },
    { status: 201 }
  );
}
