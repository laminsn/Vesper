import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("content_type");
  const sourceType = searchParams.get("source_type");
  const postStatus = searchParams.get("post_status");
  const viralPotential = searchParams.get("viral_potential");

  let query = supabase.from("content_vault").select("*").order("created_at", { ascending: false });

  if (contentType) query = query.eq("content_type", contentType);
  if (sourceType) query = query.eq("source_type", sourceType);
  if (postStatus) query = query.eq("post_status", postStatus);
  if (viralPotential) query = query.eq("viral_potential", viralPotential);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("content_vault")
    .insert({ ...body, post_status: body.post_status ?? "extracted" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
