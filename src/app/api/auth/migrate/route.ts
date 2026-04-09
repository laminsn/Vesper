import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/migrate
 * Runs one-time migrations: expands category constraint + seeds MCP integrations.
 * Requires SUPABASE_SERVICE_ROLE_KEY.
 */
export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: string[] = [];

  // Phase 1: Expand category constraint
  // We can't ALTER CHECK constraints via PostgREST, so we'll just use the existing
  // categories (mcp, api, webhook, oauth, database) for new integrations too.
  // This avoids needing raw SQL access.
  results.push("Using existing category types (mcp, api, webhook, oauth, database)");

  // Phase 2: Seed new MCP integrations
  const newIntegrations = [
    {
      integration_key: "stitch",
      display_name: "Stitch",
      category: "mcp",
      config: { type: "npx", command: "@_davideast/stitch-mcp proxy", description: "AI code generation from data sources" },
      status: "connected",
      used_by_departments: ["marketing", "executive"],
    },
    {
      integration_key: "nano-banana",
      display_name: "Nano-Banana (Gemini)",
      category: "api",
      config: { type: "npx", command: "nano-banana-mcp", description: "Deep AI reasoning & multimodal analysis", provider: "Google Gemini" },
      status: "connected",
      used_by_departments: ["executive", "clinical-operations"],
    },
    {
      integration_key: "icons8",
      display_name: "Icons8",
      category: "mcp",
      config: { type: "http", url: "https://mcp.icons8.com/mcp/", description: "Icon and design asset library" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "better-icons",
      display_name: "Better Icons",
      category: "mcp",
      config: { type: "npx", command: "better-icons", description: "Icon asset management" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "lottiefiles",
      display_name: "LottieFiles",
      category: "mcp",
      config: { type: "npx", command: "mcp-server-lottiefiles", description: "Animation asset library" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "rive-docs",
      display_name: "Rive Docs",
      category: "mcp",
      config: { type: "local", description: "Interactive animation documentation" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "spline",
      display_name: "Spline",
      category: "mcp",
      config: { type: "local", description: "3D design and animation tool" },
      status: "disconnected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "trello",
      display_name: "Trello",
      category: "mcp",
      config: { type: "npx", command: "@delorenj/mcp-server-trello", description: "Project management boards" },
      status: "connected",
      used_by_departments: ["executive", "marketing", "compliance-quality"],
    },
    {
      integration_key: "google-drive",
      display_name: "Google Drive",
      category: "oauth",
      config: { type: "npx", command: "@piotr-agier/google-drive-mcp", description: "File storage and document management" },
      status: "connected",
      used_by_departments: ["executive", "clinical-operations", "admissions-intake", "compliance-quality", "accounting-finance"],
    },
    {
      integration_key: "vibe-prospecting",
      display_name: "Vibe Prospecting",
      category: "mcp",
      config: { type: "http", url: "https://mcp-gemini.vibeprospecting.ai/mcp", description: "AI-powered sales prospecting" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "openai",
      display_name: "OpenAI",
      category: "api",
      config: { type: "api", description: "GPT-4o, GPT-4, DALL-E models", apiKeyFormat: "sk-..." },
      status: "disconnected",
      used_by_departments: [],
    },
    {
      integration_key: "elevenlabs",
      display_name: "ElevenLabs",
      category: "api",
      config: { type: "api", description: "Voice synthesis and cloning", apiKeyFormat: "xi-..." },
      status: "disconnected",
      used_by_departments: [],
    },
    {
      integration_key: "deepgram",
      display_name: "Deepgram",
      category: "api",
      config: { type: "api", description: "Speech-to-text transcription" },
      status: "disconnected",
      used_by_departments: [],
    },
    {
      integration_key: "twilio",
      display_name: "Twilio",
      category: "api",
      config: { type: "api", description: "SMS, voice calls, and messaging" },
      status: "disconnected",
      used_by_departments: [],
    },
    // Wave 2: Design, scraping, dev tools, email, AI search
    {
      integration_key: "figma",
      display_name: "Figma",
      category: "mcp",
      config: { type: "http", url: "https://mcp.figma.com/mcp", description: "Collaborative design tool" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "canva",
      display_name: "Canva",
      category: "mcp",
      config: { type: "cloud", description: "Online design platform" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "apify",
      display_name: "Apify",
      category: "mcp",
      config: { type: "npx", command: "@apify/actors-mcp-server", description: "Web scraping and data extraction" },
      status: "connected",
      used_by_departments: ["marketing", "caregiver-staffing"],
    },
    {
      integration_key: "jobspy",
      display_name: "JobSpy",
      category: "mcp",
      config: { type: "npx", command: "jobspy-mcp-server", description: "Job market intelligence scraping" },
      status: "connected",
      used_by_departments: ["caregiver-staffing"],
    },
    {
      integration_key: "github",
      display_name: "GitHub",
      category: "api",
      config: { type: "cli", description: "Version control and code hosting" },
      status: "connected",
      used_by_departments: ["executive"],
    },
    {
      integration_key: "playwright",
      display_name: "Playwright",
      category: "mcp",
      config: { type: "plugin", description: "Browser automation and E2E testing" },
      status: "connected",
      used_by_departments: ["executive", "marketing"],
    },
    {
      integration_key: "context7",
      display_name: "Context7",
      category: "mcp",
      config: { type: "plugin", description: "Library documentation and code examples" },
      status: "connected",
      used_by_departments: ["executive"],
    },
    {
      integration_key: "nano-banana",
      display_name: "Nano-Banana (Gemini)",
      category: "api",
      config: { type: "npx", command: "nano-banana-mcp", description: "Deep AI reasoning via Gemini" },
      status: "connected",
      used_by_departments: ["executive", "clinical-operations"],
    },
    {
      integration_key: "rive",
      display_name: "Rive",
      category: "mcp",
      config: { type: "local", description: "Interactive vector animation" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "firecrawl",
      display_name: "Firecrawl",
      category: "api",
      config: { type: "api", description: "Web content extraction for LLMs" },
      status: "disconnected",
      used_by_departments: [],
    },
    {
      integration_key: "resend",
      display_name: "Resend",
      category: "api",
      config: { type: "api", description: "Developer-first email API" },
      status: "disconnected",
      used_by_departments: [],
    },
    {
      integration_key: "perplexity",
      display_name: "Perplexity",
      category: "api",
      config: { type: "api", description: "AI-powered search with citations" },
      status: "disconnected",
      used_by_departments: [],
    },
  ];

  let inserted = 0;
  let skipped = 0;

  for (const integration of newIntegrations) {
    const { error } = await supabase
      .from("integration_registry")
      .insert(integration);

    if (error) {
      results.push(`Failed: ${integration.integration_key} — ${error.message}`);
      skipped++;
    } else {
      inserted++;
    }
  }

  // Phase 2b: Update existing records
  const updates = [
    { key: "telegram", status: "connected" },
    { key: "figma", status: "connected" },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from("integration_registry")
      .update({ status: update.status })
      .eq("integration_key", update.key);

    if (error) {
      results.push(`Update failed: ${update.key} — ${error.message}`);
    } else {
      results.push(`Updated: ${update.key} → ${update.status}`);
    }
  }

  results.push(`Inserted/updated: ${inserted}, Skipped: ${skipped}`);

  return NextResponse.json({ success: true, results });
}
