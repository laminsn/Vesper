import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase.from("integration_registry").select("*");

  const category = searchParams.get("category");
  if (category) {
    query = query.eq("category", category);
  }

  const status = searchParams.get("status");
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("display_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("integration_key" in body) ||
    !("display_name" in body) ||
    !("category" in body)
  ) {
    return NextResponse.json(
      { error: "Missing required fields: integration_key, display_name, category" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("integration_registry")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
