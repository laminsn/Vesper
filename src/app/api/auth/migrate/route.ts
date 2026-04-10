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
    {
      integration_key: "cloudinary",
      display_name: "Cloudinary",
      category: "database",
      config: { type: "api", description: "Media asset management — images, video, transformations" },
      status: "disconnected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "remotion",
      display_name: "Remotion",
      category: "api",
      config: { type: "cli", description: "Programmatic video production with React" },
      status: "connected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "ideogram",
      display_name: "Ideogram",
      category: "api",
      config: { type: "api", description: "AI image generation with text rendering" },
      status: "disconnected",
      used_by_departments: ["marketing"],
    },
    {
      integration_key: "beehiiv",
      display_name: "Beehiiv",
      category: "api",
      config: { type: "api", description: "Newsletter & blog publishing platform" },
      status: "disconnected",
      used_by_departments: ["marketing"],
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

  // Shared: Get agent IDs for submitters (used by daily reports + calendar seeds)
  const { data: agentRows } = await supabase.from("agents").select("id, slug");
  const agentMap = new Map((agentRows ?? []).map((a: { slug: string; id: string }) => [a.slug, a.id]));

  // Phase 3: Seed daily reports for today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingReports } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", today)
    .limit(1);

  if (!existingReports || existingReports.length === 0) {

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

  // Phase 4: Seed journalist agents (one per company)
  const journalistAgents = [
    { slug: "quill", name: "Quill", role: "Content Publishing Specialist & Journalist", department: "marketing", soul_file_path: "souls/quill.soul.md" },
  ];

  for (const agent of journalistAgents) {
    const { data: existing } = await supabase.from("agents").select("id").eq("slug", agent.slug).single();
    if (!existing) {
      const { error } = await supabase.from("agents").insert({
        slug: agent.slug,
        name: agent.name,
        role: agent.role,
        department: agent.department,
        tier: "specialist",
        status: "idle",
        soul_file_path: agent.soul_file_path,
      });
      if (error) {
        results.push(`Agent failed: ${agent.slug} — ${error.message}`);
      } else {
        results.push(`Agent created: ${agent.slug}`);
        // Set parent to Camila (marketing director)
        const camila = agentMap.get("camila");
        if (camila) {
          const { data: newAgent } = await supabase.from("agents").select("id").eq("slug", agent.slug).single();
          if (newAgent) {
            await supabase.from("agents").update({ parent_agent_id: camila }).eq("id", newAgent.id);
          }
        }
      }
    } else {
      results.push(`Agent already exists: ${agent.slug}`);
    }
  }

  // Update marketing department agent count
  const { data: mktAgents } = await supabase.from("agents").select("id").eq("department", "marketing");
  if (mktAgents) {
    await supabase.from("departments").update({ agent_count: mktAgents.length }).eq("slug", "marketing");
    results.push(`Marketing dept agent count updated: ${mktAgents.length}`);
  }

  // Phase 5: Seed calendar events
  const { data: existingEvents } = await supabase
    .from("calendar_events")
    .select("id")
    .limit(1);

  if (!existingEvents || existingEvents.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    const calendarEvents = [
      {
        title: "Leadership Team Standup",
        description: "Daily 45-minute standup with Diane and all 7 department directors. Review operations, escalations, and priorities.",
        event_type: "standup",
        start_time: `${todayStr}T08:00:00`,
        end_time: `${todayStr}T08:45:00`,
        department: "executive",
        assigned_agent_id: agentMap.get("diane") ?? null,
        attendees: [
          { name: "Diane", role: "CEO" },
          { name: "Camila", role: "Marketing Director" },
          { name: "Dr. Elena", role: "Clinical Director" },
          { name: "River", role: "Admissions Director" },
          { name: "Terra", role: "Staffing Director" },
          { name: "Serenity", role: "CX Director" },
          { name: "Justice", role: "Compliance Director" },
          { name: "Steward", role: "Finance Director" },
        ],
        google_meet_link: "https://meet.google.com/hhcc-standup",
        status: "completed",
      },
      {
        title: "IDT Meeting — Weekly Interdisciplinary Team",
        description: "Weekly IDT meeting chaired by Dr. Elena. Review all active patient cases, care coordination, bereavement updates.",
        event_type: "idt",
        start_time: `${tomorrowStr}T09:00:00`,
        end_time: `${tomorrowStr}T10:30:00`,
        department: "clinical-operations",
        assigned_agent_id: agentMap.get("dr-elena") ?? null,
        attendees: [
          { name: "Dr. Elena", role: "Chair" },
          { name: "Nurse Riley", role: "DON" },
          { name: "Solace", role: "RN" },
          { name: "Spirit", role: "Chaplain" },
          { name: "Harmony", role: "MSW" },
          { name: "Bereavement", role: "Bereavement Coord" },
        ],
        google_meet_link: "https://meet.google.com/hhcc-idt",
        status: "scheduled",
      },
      {
        title: "Marketing Team Standup",
        description: "Weekly marketing standup — channel performance, campaign updates, event planning.",
        event_type: "standup",
        start_time: `${tomorrowStr}T08:00:00`,
        end_time: `${tomorrowStr}T08:45:00`,
        department: "marketing",
        assigned_agent_id: agentMap.get("camila") ?? null,
        attendees: [
          { name: "Camila", role: "Director" },
          { name: "Haven", role: "Research" },
          { name: "Beacon", role: "Paid Ads" },
          { name: "Roots", role: "SEO" },
          { name: "Ember", role: "Email" },
          { name: "Grace", role: "Community" },
          { name: "Gather", role: "Events" },
        ],
        status: "scheduled",
      },
      {
        title: "Compliance Weekly Briefing",
        description: "Justice + Chart weekly compliance briefing. Chart audit findings, regulatory updates, documentation review.",
        event_type: "review",
        start_time: `${tomorrowStr}T13:00:00`,
        end_time: `${tomorrowStr}T13:45:00`,
        department: "compliance-quality",
        assigned_agent_id: agentMap.get("justice") ?? null,
        attendees: [
          { name: "Justice", role: "Compliance Director" },
          { name: "Chart", role: "Medical Records" },
        ],
        status: "scheduled",
      },
      {
        title: "New Patient Assessment — Hospital Referral",
        description: "Triage conducting bedside assessment for new hospital referral. Memorial Hospital discharge planner referral.",
        event_type: "appointment",
        start_time: `${todayStr}T10:00:00`,
        end_time: `${todayStr}T11:00:00`,
        department: "admissions-intake",
        assigned_agent_id: agentMap.get("triage") ?? null,
        location: "Memorial Hospital, Room 412",
        status: "scheduled",
      },
      {
        title: "Monthly Mission Alignment",
        description: "Monthly all-hands meeting. Family letters read aloud. 'Are we still this company?' reflection.",
        event_type: "meeting",
        start_time: `${tomorrowStr}T16:00:00`,
        end_time: `${tomorrowStr}T17:00:00`,
        department: "executive",
        assigned_agent_id: agentMap.get("diane") ?? null,
        google_meet_link: "https://meet.google.com/hhcc-mission",
        status: "scheduled",
      },
    ];

    let eventsInserted = 0;
    for (const event of calendarEvents) {
      const { error } = await supabase.from("calendar_events").insert(event);
      if (error) {
        results.push(`Event failed: ${event.title} — ${error.message}`);
      } else {
        eventsInserted++;
      }
    }
    results.push(`Calendar events seeded: ${eventsInserted}`);

    // Seed meeting notes for the completed standup
    const { data: standupEvent } = await supabase
      .from("calendar_events")
      .select("id")
      .eq("title", "Leadership Team Standup")
      .limit(1)
      .single();

    if (standupEvent) {
      await supabase.from("meeting_notes").insert([
        {
          event_id: standupEvent.id,
          note_type: "agenda",
          title: "Standup Agenda",
          body: "1. Census update (Dr. Elena)\n2. Admissions pipeline (River)\n3. Staffing coverage (Terra)\n4. Marketing metrics (Camila)\n5. Compliance status (Justice)\n6. Financial update (Steward)\n7. CX feedback (Serenity)\n8. Action items review",
          author_agent_id: agentMap.get("diane") ?? null,
          action_items: [],
        },
        {
          event_id: standupEvent.id,
          note_type: "summary",
          title: "Standup Summary — All Systems Operational",
          body: "All 7 directors present. Census stable at 12 patients. 2 new referrals in pipeline — 1 hospital, 1 physician. 100% staffing coverage today. Google Ads CPI trending down 12% (positive). Zero compliance findings. Claims batch submitted on time. Family satisfaction at 4.6/5.0. No escalations.",
          author_agent_id: agentMap.get("diane") ?? null,
          action_items: [
            { task: "Schedule assessment for hospital referral by EOD", assignee: "Triage", due: tomorrowStr },
            { task: "Follow up on physician referral family contact", assignee: "Bridge", due: tomorrowStr },
            { task: "Prepare Q2 community event proposal", assignee: "Gather", due: tomorrowStr },
          ],
        },
      ]);
      results.push("Meeting notes seeded for standup");
    }
  } else {
    results.push("Calendar events already exist — skipped seeding");
  }

  // Phase 6: Seed content vault items
  const { data: existingVault } = await supabase.from("content_vault").select("id").limit(1);
  if (!existingVault || existingVault.length === 0) {
    const quillId = agentMap.get("quill") ?? null;
    const vaultItems = [
      {
        source_type: "interview",
        source_url: "https://youtube.com/watch?v=example1",
        source_title: "Diane on Compassionate End-of-Life Care — Full Interview",
        content_type: "quote",
        body: "We don't measure success by how many patients we admit. We measure it by how many families tell us they felt supported during the hardest moment of their lives.",
        speaker: "Diane",
        timestamp_start: "12:34",
        timestamp_end: "12:52",
        tags: ["leadership", "compassion", "metrics", "family-centered"],
        viral_potential: "high",
        visual_treatment: "Dark background, white serif text, Diane's portrait left-aligned. Orange highlight on 'felt supported'. 1080x1350 format.",
        department: "executive",
        extracted_by_agent_id: quillId,
      },
      {
        source_type: "youtube",
        source_url: "https://youtube.com/watch?v=example2",
        source_title: "Dr. Elena — What Families Need to Know About Hospice",
        content_type: "quote",
        body: "The number one misconception about hospice is that it means giving up. It doesn't. It means choosing to focus on living — on comfort, on dignity, on being present with the people you love.",
        speaker: "Dr. Elena",
        timestamp_start: "4:17",
        timestamp_end: "4:38",
        tags: ["hospice-education", "misconceptions", "dignity", "family"],
        viral_potential: "viral",
        visual_treatment: "Split layout: Dr. Elena speaking still on left, quote text on right. Blue accent on 'choosing to focus on living'. Carousel slide 1 of 2.",
        department: "clinical-operations",
        extracted_by_agent_id: quillId,
      },
      {
        source_type: "podcast",
        source_url: "https://podcast.example.com/ep42",
        source_title: "HHCC Insights Podcast Ep 42 — Caregiver Wellness",
        content_type: "key_phrase",
        body: "You cannot pour from an empty cup. Caregiver burnout isn't just a staffing problem — it's a patient care problem.",
        speaker: "Terra",
        timestamp_start: "18:05",
        tags: ["caregiver-wellness", "burnout", "staffing", "patient-care"],
        viral_potential: "high",
        visual_treatment: "Minimal design: black background, large white text, purple accent on 'empty cup'. Single static post 1080x1080.",
        department: "caregiver-staffing",
        extracted_by_agent_id: quillId,
      },
      {
        source_type: "youtube",
        source_url: "https://youtube.com/watch?v=example3",
        source_title: "Community Education: Understanding Hospice",
        content_type: "viral_topic",
        body: "Topic: '5 Things Every Family Should Know Before Calling Hospice' — recurring theme across 3 recent community events. Families consistently say they wish they'd called sooner. This angle has carousel potential: 5 slides, each with one 'thing' + brief explanation.",
        tags: ["content-idea", "carousel", "family-education", "evergreen"],
        viral_potential: "viral",
        platform_target: "instagram,linkedin",
        department: "marketing",
        extracted_by_agent_id: quillId,
      },
      {
        source_type: "interview",
        source_title: "Terrell Alston on Building a Hospice Company with Heart",
        content_type: "hook",
        body: "What if the most important business decision you ever make isn't about profit — but about how you treat people at the end?",
        speaker: "Terrell Alston",
        tags: ["hook", "opening-line", "leadership", "purpose"],
        viral_potential: "high",
        visual_treatment: "Video hook for Reels/TikTok: text overlay on B-roll of HHC team. 3 seconds max before reveal.",
        platform_target: "instagram,tiktok",
        department: "executive",
        extracted_by_agent_id: quillId,
      },
      {
        source_type: "youtube",
        source_title: "HHCC Monthly Mission Alignment Recording",
        content_type: "thumbnail",
        body: "Thumbnail moment: Diane reading a family letter aloud at 23:15 — emotional, authentic, would make a strong still for a quote post. Family letter text (anonymized): 'You gave us three more months of real conversations.'",
        timestamp_start: "23:15",
        tags: ["thumbnail", "emotional", "family-letter", "diane"],
        viral_potential: "medium",
        department: "executive",
        extracted_by_agent_id: quillId,
      },
    ];

    let vaultInserted = 0;
    for (const item of vaultItems) {
      const { error } = await supabase.from("content_vault").insert(item);
      if (!error) vaultInserted++;
    }
    results.push("Content vault seeded: " + vaultInserted);
  } else {
    results.push("Content vault already has data — skipped seeding");
  }

  return NextResponse.json({ success: true, results });
}
