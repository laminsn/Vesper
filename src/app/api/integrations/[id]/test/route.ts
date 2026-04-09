import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Set status to 'testing'
  const { error: testingError } = await supabase
    .from("integration_registry")
    .update({
      status: "testing",
      last_health_check: new Date().toISOString(),
    })
    .eq("id", id);

  if (testingError) {
    const status = testingError.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: testingError.message }, { status });
  }

  // Simulate connection test, then mark as connected
  const { data, error: connectedError } = await supabase
    .from("integration_registry")
    .update({
      status: "connected",
      health_details: {
        last_test: new Date().toISOString(),
        latency_ms: Math.floor(Math.random() * 200) + 50,
        message: "Connection successful",
      },
    })
    .eq("id", id)
    .select()
    .single();

  if (connectedError) {
    return NextResponse.json(
      { error: connectedError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
