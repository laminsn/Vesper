import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { syncBusinessProfile } from "@/lib/sync-engine";

const RequestSchema = z.object({
  filesystem_root: z.string().min(1, "filesystem_root is required"),
  organization_id: z.string().optional(),
});

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
      },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: parsed.error.issues.map((i) => i.message),
      },
      { status: 400 }
    );
  }

  const { filesystem_root, organization_id } = parsed.data;

  try {
    const result = await syncBusinessProfile(
      supabaseUrl,
      supabaseServiceKey,
      filesystem_root,
      organization_id
    );

    const hasErrors = result.errors.length > 0;

    return NextResponse.json(
      {
        success: !hasErrors,
        data: result,
        error: hasErrors
          ? `Completed with ${result.errors.length} error(s)`
          : null,
      },
      { status: hasErrors ? 207 : 200 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown sync error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
