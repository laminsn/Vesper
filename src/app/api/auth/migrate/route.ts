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

  results.push(`Integrations inserted/updated: ${inserted}, Skipped: ${skipped}`);

  // Phase 3: Seed daily reports for today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingReports } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", today)
    .limit(1);

  if (!existingReports || existingReports.length === 0) {
    // Get agent IDs for submitters
    const { data: agentRows } = await supabase.from("agents").select("id, slug");
    const agentMap = new Map((agentRows ?? []).map((a) => [a.slug, a.id]));

    const dailyReports = [
      {
        report_date: today,
        department: "executive",
        submitted_by_agent_id: agentMap.get("diane") ?? null,
        report_type: "morning_brief",
        title: "Morning Leadership Standup — All Systems Operational",
        body: "All 7 directors checked in. Census stable at target. No escalations overnight. Clinical team reports 100% visit compliance. Finance confirms claims batch submitted on time. Marketing reports 3 new physician referral meetings scheduled this week. Compliance: zero findings from last chart audit cycle.",
        metrics: { directors_present: 7, escalations: 0, census_status: "stable" },
        status: "submitted",
      },
      {
        report_date: today,
        department: "clinical-operations",
        submitted_by_agent_id: agentMap.get("dr-elena") ?? null,
        report_type: "clinical_review",
        title: "Daily Clinical Review — 7:00 AM",
        body: "Reviewed all active patient charts. 12 patients currently on census. Pain management protocols effective across all patients. One new admission expected today from hospital referral. Nurse Riley conducting assessment at 10:00 AM. Bereavement team following up with 3 families this week. IDT meeting scheduled for Thursday.",
        metrics: { active_patients: 12, pain_managed: "100%", new_admissions: 1, idt_scheduled: true },
        status: "submitted",
      },
      {
        report_date: today,
        department: "admissions-intake",
        submitted_by_agent_id: agentMap.get("river") ?? null,
        report_type: "standup",
        title: "Admissions Daily Update",
        body: "2 new referrals received yesterday — 1 from Memorial Hospital (Bridge processing), 1 from Dr. Patterson (physician referral). Insurance verification in progress for both. Assessment scheduled for hospital referral within 24 hours. Family inquiry from website being followed up by Bridge today.",
        metrics: { new_referrals: 2, pending_assessments: 1, active_inquiries: 1 },
        status: "submitted",
      },
      {
        report_date: today,
        department: "marketing",
        submitted_by_agent_id: agentMap.get("camila") ?? null,
        report_type: "marketing_update",
        title: "Marketing Weekly Standup Summary",
        body: "Beacon reports Google Ads CPI down 12% this week — campaign optimization working. Roots completed SEO audit, 3 new blog posts scheduled. Ember's physician nurture sequence showing 34% open rate (above 30% target). Grace hosted community grief support awareness post — 2.4K engagements. Gather planning Q2 community education event.",
        metrics: { ad_cpi_change: "-12%", email_open_rate: "34%", social_engagements: 2400 },
        status: "reviewed",
      },
      {
        report_date: today,
        department: "compliance-quality",
        submitted_by_agent_id: agentMap.get("justice") ?? null,
        report_type: "compliance_check",
        title: "Daily Compliance Check — Chart Audit",
        body: "Chart completed 3-chart spot check today. All 3 charts fully compliant — care plans current, documentation complete, signatures present. Guardian monitoring regulatory sources — no new changes. Shield confirms HIPAA training completion at 100% for current quarter. Next mock survey exercise scheduled for end of month.",
        metrics: { charts_audited: 3, compliant: 3, hipaa_training: "100%", deficiencies: 0 },
        status: "submitted",
      },
      {
        report_date: today,
        department: "accounting-finance",
        submitted_by_agent_id: agentMap.get("steward") ?? null,
        report_type: "financial_update",
        title: "Financial Daily Update",
        body: "Nurture completed daily transaction logging. Harvest submitted 4 Medicare claims — all within 3-day SLA. No denials received today. Provision processed 2 vendor payments. Pledge confirms payroll processing on track for Friday. Hospice cap utilization at 87% — well within target.",
        metrics: { claims_submitted: 4, denials: 0, cap_utilization: "87%", payroll_status: "on_track" },
        status: "submitted",
      },
      {
        report_date: today,
        department: "caregiver-staffing",
        submitted_by_agent_id: agentMap.get("terra") ?? null,
        report_type: "recruitment_update",
        title: "Staffing Daily Update",
        body: "Shift reports 100% coverage for today — all visits scheduled and confirmed. Recruit has 3 candidates in final interview stage for CNA position. Train completed orientation for 1 new PRN nurse yesterday. Retain conducted monthly satisfaction check-in with night shift team — morale is good. No call-outs today.",
        metrics: { coverage: "100%", candidates_interviewing: 3, call_outs: 0 },
        status: "submitted",
      },
      {
        report_date: today,
        department: "customer-experience",
        submitted_by_agent_id: agentMap.get("serenity") ?? null,
        report_type: "standup",
        title: "CX Daily Update",
        body: "Embrace completed 2 family follow-up calls — both families report positive experience. Memory received 1 new testimonial request (pending family approval). Gratitude sent thank-you to referring family from last week. Listen compiled weekly satisfaction data — trending at 4.6/5.0. Reflect published new grief resource guide.",
        metrics: { family_calls: 2, testimonials_pending: 1, satisfaction_score: 4.6 },
        status: "submitted",
      },
    ];

    let reportsInserted = 0;
    for (const report of dailyReports) {
      const { error } = await supabase.from("daily_reports").insert(report);
      if (error) {
        results.push(`Report failed: ${report.department} — ${error.message}`);
      } else {
        reportsInserted++;
      }
    }
    results.push(`Daily reports seeded: ${reportsInserted}`);
  } else {
    results.push("Daily reports already exist for today — skipped seeding");
  }

  return NextResponse.json({ success: true, results });
}
