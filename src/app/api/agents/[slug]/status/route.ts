import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["active", "idle", "executing", "offline"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const body = await request.json();
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("agents")
    .update({ status, last_seen_at: new Date().toISOString() })
    .eq("slug", slug)
    .select()
    .single();

  if (error) {
    const statusCode = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status: statusCode });
  }

  return NextResponse.json(data);
}
