// ═══════════════════════════════════════════════════
// Vesper — Agent Templates
// Ported from Dr. Claw Medical with Vesper-adapted interface
// ═══════════════════════════════════════════════════

export interface AgentTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly longDescription: string;
  readonly category: string;
  readonly tier: "starter" | "professional" | "advanced" | "enterprise";
  readonly defaultModel: string;
  readonly defaultZone: "clinical" | "operations" | "external";
  readonly skills: readonly string[];
  readonly capabilities: {
    readonly phiProtection: boolean;
    readonly messaging: boolean;
    readonly voiceRecognition: boolean;
    readonly distressDetection: boolean;
    readonly taskCreation: boolean;
  };
  readonly suggestedKpis: readonly string[];
  readonly icon: string;
}

// ── Template categories ────────────────────────────

export const templateCategories = [
  { id: "executive", name: "Executive", description: "C-suite strategic leadership agents" },
  { id: "marketing", name: "Marketing & Content", description: "Content creation and marketing strategy agents" },
  { id: "sales", name: "Sales Suite", description: "Enterprise sales pipeline automation agents" },
  { id: "healthcare", name: "Healthcare", description: "Clinical operations and patient care agents" },
  { id: "hospice", name: "Hospice Care", description: "39-agent hospice care team hierarchy" },
  { id: "operations", name: "Operations", description: "Process optimization and HR agents" },
  { id: "finance", name: "Finance", description: "Financial planning and analysis agents" },
  { id: "research", name: "Research", description: "Deep research and market intelligence agents" },
  { id: "development", name: "Development", description: "Engineering, Notion, and Airtable agents" },
  { id: "clawbots", name: "Clawbots", description: "Autonomous prospecting bots" },
  { id: "intelligence", name: "Intelligence", description: "Self-improvement and analytics agents" },
  { id: "marketing-suite", name: "Marketing Suite", description: "Enterprise omni-channel marketing agents" },
] as const;

// ── Healthcare Agents ──────────────────────────────

const healthcareTemplates: readonly AgentTemplate[] = [
  {
    id: "front-desk-agent",
    name: "Front Desk Agent",
    description: "Handles incoming calls, scheduling, and patient inquiries around the clock.",
    longDescription: "Your always-on virtual receptionist that manages the full spectrum of front-desk operations. From triaging incoming calls and booking appointments to answering insurance questions and routing urgent requests, this agent ensures no patient interaction falls through the cracks.",
    category: "healthcare",
    tier: "starter",
    defaultModel: "OpenAI",
    defaultZone: "clinical",
    skills: ["appointment-scheduling", "insurance-verification", "patient-follow-up"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Avg calls/day: 120", "Booking rate: 94%", "Wait time: <10s"],
    icon: "Phone",
  },
  {
    id: "clinical-coordinator",
    name: "Clinical Coordinator",
    description: "Coordinates clinical workflows, documentation, and referral management.",
    longDescription: "An intelligent clinical operations partner that streamlines the documentation burden and keeps referral pipelines moving. Automates chart prep, generates clinical summaries, tracks pending referrals, and surfaces lab results that need physician attention.",
    category: "healthcare",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "clinical",
    skills: ["clinical-documentation", "referral-management", "lab-results-communication"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Docs/day: 45", "Referral completion: 98%", "Turnaround: 2hrs"],
    icon: "ClipboardList",
  },
  {
    id: "patient-outreach-agent",
    name: "Patient Outreach Agent",
    description: "Proactive patient communication, engagement, and retention campaigns.",
    longDescription: "A proactive engagement engine that reaches out to patients before they disengage. Handles appointment reminders, wellness check-ins, preventive care nudges, and re-engagement campaigns for lapsed patients.",
    category: "healthcare",
    tier: "starter",
    defaultModel: "OpenAI",
    defaultZone: "clinical",
    skills: ["patient-follow-up", "no-show-recovery", "rx-refill-coordination"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true },
    suggestedKpis: ["Outreach/day: 200", "Response rate: 78%", "No-show reduction: 40%"],
    icon: "MessageSquareHeart",
  },
  {
    id: "insurance-verifier",
    name: "Insurance Verifier",
    description: "Automated insurance eligibility verification and prior authorization processing.",
    longDescription: "Eliminates the tedious back-and-forth of insurance verification by automating eligibility checks, benefits breakdowns, and prior authorization submissions. Works across all major payers.",
    category: "healthcare",
    tier: "professional",
    defaultModel: "Gemini",
    defaultZone: "operations",
    skills: ["insurance-verification", "pre-authorization-automation", "rx-refill-coordination"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Verifications/day: 150", "Accuracy: 99.2%", "Pre-auth approval: 91%"],
    icon: "ShieldCheck",
  },
  {
    id: "post-op-care-agent",
    name: "Post-Op Care Agent",
    description: "Post-surgical follow-up, recovery monitoring, and complication detection.",
    longDescription: "A dedicated recovery companion that monitors post-surgical patients through structured check-in protocols. Tracks pain levels, medication adherence, wound healing progress, and activity milestones.",
    category: "healthcare",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "clinical",
    skills: ["post-surgical-follow-up", "patient-follow-up", "clinical-documentation"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: true, taskCreation: true },
    suggestedKpis: ["Check-ins/day: 80", "Recovery compliance: 96%", "Complication detection: 99%"],
    icon: "HeartPulse",
  },
  {
    id: "home-health-compliance-agent",
    name: "Home Health Compliance Agent",
    description: "Home healthcare regulatory monitoring, accreditation preparation, and compliance documentation.",
    longDescription: "A specialized compliance partner for home health and hospice agencies. Tracks CMS regulatory changes, monitors quality measures, prepares accreditation documentation, and ensures OASIS coding accuracy.",
    category: "healthcare",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["home-healthcare-hospice-researcher", "clinical-documentation", "researcher"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Regulations tracked: 100+", "Compliance score: 99%", "OASIS accuracy: 97%"],
    icon: "Heart",
  },
];

// ── Executive Agents ───────────────────────────────

const executiveTemplates: readonly AgentTemplate[] = [
  {
    id: "strategic-advisor",
    name: "Strategic Advisor",
    description: "CEO-level strategic planning, competitive analysis, and decision support.",
    longDescription: "A senior strategic partner that synthesizes market data, financial performance, and operational metrics into actionable executive insights. Builds decision frameworks and runs scenario analyses.",
    category: "executive",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["ceo", "researcher", "coo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Strategic plans: 12/mo", "Decision frameworks: 30+", "Board decks: 4/quarter"],
    icon: "Compass",
  },
  {
    id: "ai-strategy-director",
    name: "AI Strategy Director",
    description: "CAIO-level AI implementation guidance, roadmapping, and vendor evaluation.",
    longDescription: "Your in-house AI transformation expert that evaluates emerging technologies, builds implementation roadmaps, and quantifies ROI for AI initiatives.",
    category: "executive",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["caio", "cio", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["AI assessments: 8/mo", "ROI models: 15+", "Vendor evals: 20+"],
    icon: "BrainCircuit",
  },
];

// ── Marketing & Content Agents ─────────────────────

const marketingTemplates: readonly AgentTemplate[] = [
  {
    id: "content-engine",
    name: "Content Engine",
    description: "Full-service content creation across articles, social media, and email campaigns.",
    longDescription: "A high-output content production system that generates blog posts, social media content, email sequences, and marketing collateral at scale. Maintains your brand voice across every channel.",
    category: "marketing",
    tier: "starter",
    defaultModel: "OpenAI",
    defaultZone: "external",
    skills: ["professional-copywriter", "cmo", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Articles/week: 10", "Social posts: 30/day", "Email campaigns: 5/week"],
    icon: "PenTool",
  },
  {
    id: "marketing-strategist",
    name: "Marketing Strategist",
    description: "Campaign planning, audience targeting, and marketing performance optimization.",
    longDescription: "A data-driven marketing strategist that designs multi-channel campaigns, identifies high-value audience segments, and continuously optimizes spend allocation.",
    category: "marketing",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["cmo", "professional-copywriter", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Campaigns/mo: 8", "CAC reduction: 35%", "Lead gen: 200%"],
    icon: "Target",
  },
  {
    id: "grant-writing-specialist",
    name: "Grant Writing Specialist",
    description: "End-to-end grant application preparation, from research to final submission.",
    longDescription: "A specialized grant professional that handles the complete lifecycle of funding applications. Identifies relevant funding opportunities and drafts compelling narratives.",
    category: "marketing",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["grant-writer", "researcher", "cfo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Proposals/mo: 4", "Win rate: 42%", "Avg award: $250K"],
    icon: "Award",
  },
  {
    id: "research-librarian",
    name: "Research Librarian",
    description: "Deep book analysis, knowledge synthesis, and curated learning path development.",
    longDescription: "An intellectual research partner that consumes and synthesizes books, papers, and long-form content at scale. Produces executive book briefs and builds annotated reading lists.",
    category: "marketing",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["book-research-specialist", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Books analyzed/mo: 20", "Knowledge briefs: 40+", "Learning paths: 5/mo"],
    icon: "BookOpen",
  },
  {
    id: "video-production-agent",
    name: "Video Production Agent",
    description: "Instructional video scripting, storyboarding, and full production planning.",
    longDescription: "A complete pre-production partner for instructional and training video content. Writes scripts, creates storyboards, plans production logistics, and designs course curricula.",
    category: "marketing",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["instructional-video-maker", "professional-copywriter"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Scripts/week: 10", "Course modules: 20/mo", "Completion rate: 92%"],
    icon: "Play",
  },
];

// ── Finance Agents ─────────────────────────────────

const financeTemplates: readonly AgentTemplate[] = [
  {
    id: "financial-analyst",
    name: "Financial Analyst",
    description: "Financial planning, forecasting, and cost optimization analysis.",
    longDescription: "A precision-driven financial analyst that generates detailed reports, builds dynamic forecast models, and uncovers cost-saving opportunities across your organization.",
    category: "finance",
    tier: "professional",
    defaultModel: "Gemini",
    defaultZone: "operations",
    skills: ["cfo", "researcher", "coo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Reports/week: 5", "Forecast accuracy: 97%", "Cost savings: 18%"],
    icon: "TrendingUp",
  },
];

// ── Operations Agents ──────────────────────────────

const operationsTemplates: readonly AgentTemplate[] = [
  {
    id: "operations-manager",
    name: "Operations Manager",
    description: "Process optimization, workflow automation, and operational efficiency.",
    longDescription: "A systematic operations partner that maps existing processes, identifies bottlenecks, and designs optimized workflows. Creates standard operating procedures and tracks operational KPIs.",
    category: "operations",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["coo", "cio", "chro"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Processes optimized: 25", "Efficiency gain: 40%", "SOP docs: 50+"],
    icon: "Settings",
  },
  {
    id: "hr-coordinator",
    name: "HR Coordinator",
    description: "Talent acquisition support, employee engagement, and HR operations.",
    longDescription: "A versatile HR operations agent that streamlines recruiting workflows, automates onboarding sequences, and monitors employee engagement signals.",
    category: "operations",
    tier: "starter",
    defaultModel: "OpenAI",
    defaultZone: "operations",
    skills: ["chro", "coo", "professional-copywriter"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Hires supported: 15/mo", "Retention: +22%", "Onboarding time: -50%"],
    icon: "Users",
  },
  {
    id: "it-strategist",
    name: "IT Strategist",
    description: "Technology planning, infrastructure assessment, and digital transformation.",
    longDescription: "A forward-looking technology advisor that evaluates your current infrastructure, identifies modernization opportunities, and builds migration roadmaps.",
    category: "operations",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["cio", "caio", "coo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Tech assessments: 10/mo", "Migration plans: 3/quarter", "Cost optimization: 25%"],
    icon: "Server",
  },
];

// ── Research Agents ────────────────────────────────

const researchTemplates: readonly AgentTemplate[] = [
  {
    id: "research-analyst",
    name: "Research Analyst",
    description: "Deep research, data synthesis, and comprehensive analytical reporting.",
    longDescription: "A meticulous research powerhouse that dives deep into complex topics, synthesizes information from hundreds of sources, and distills findings into clear, actionable reports.",
    category: "research",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["researcher", "caio", "cfo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Reports/week: 8", "Sources analyzed: 500+", "Insights/report: 15+"],
    icon: "Search",
  },
  {
    id: "market-intelligence-agent",
    name: "Market Intelligence Agent",
    description: "Competitive monitoring, market analysis, and emerging trend detection.",
    longDescription: "A vigilant market intelligence system that continuously tracks competitor movements, industry shifts, and emerging trends that could impact your business.",
    category: "research",
    tier: "advanced",
    defaultModel: "Gemini",
    defaultZone: "operations",
    skills: ["researcher", "cmo", "ceo"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Competitors tracked: 25", "Market reports: 4/mo", "Trend alerts: daily"],
    icon: "Radar",
  },
];

// ── Development & Integration Agents ───────────────

const developmentTemplates: readonly AgentTemplate[] = [
  {
    id: "notion-workspace-architect",
    name: "Notion Workspace Architect",
    description: "End-to-end Notion workspace design, database architecture, and API integration.",
    longDescription: "A dedicated Notion platform engineer that transforms your workspace into a fully integrated operational hub. Designs relational databases and builds automation workflows.",
    category: "development",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["notion-development-specialist", "coding-specialist", "application-specialist"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Databases built: 50+", "Automations: 25/mo", "API integrations: 10+"],
    icon: "FileText",
  },
  {
    id: "airtable-operations-builder",
    name: "Airtable Operations Builder",
    description: "Custom Airtable base development, automation configuration, and interface design.",
    longDescription: "A specialized Airtable developer that builds scalable business applications on the Airtable platform. Architects bases with complex linked records and builds multi-step automations.",
    category: "development",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["airtable-development-specialist", "coding-specialist", "application-specialist"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Bases built: 30+", "Automations/mo: 40", "Interfaces: 15+"],
    icon: "BarChart3",
  },
  {
    id: "full-stack-developer",
    name: "Full-Stack Developer",
    description: "Code generation, debugging, API development, and application architecture across the full stack.",
    longDescription: "A senior-level software engineering partner that accelerates development across frontend, backend, and infrastructure. Writes production-quality code and reviews pull requests.",
    category: "development",
    tier: "professional",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["coding-specialist", "application-specialist"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Languages: 15+", "Code reviews/day: 20", "Bug fix rate: 98%"],
    icon: "Code",
  },
];

// ── Clawbot Agents ─────────────────────────────────

const clawbotTemplates: readonly AgentTemplate[] = [
  {
    id: "linkedin-prospecting-clawbot",
    name: "LinkedIn Prospecting Clawbot",
    description: "Automated LinkedIn outreach, content engagement, and social selling pipeline management.",
    longDescription: "An autonomous social selling machine that works LinkedIn 24/7. Identifies ideal prospects, sends personalized connection requests, and nurtures relationships through multi-touch messaging sequences.",
    category: "clawbots",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["linkedin-client-clawbot", "google-client-search-clawbot"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Prospects/week: 200", "Connection rate: 45%", "Meeting bookings: 15/mo"],
    icon: "Linkedin",
  },
  {
    id: "google-research-clawbot",
    name: "Google Research Clawbot",
    description: "Intelligent web research, prospect discovery, and lead enrichment from public sources.",
    longDescription: "A tireless web researcher that systematically mines Google, business directories, and public databases to find and qualify your ideal clients. Builds detailed prospect profiles.",
    category: "clawbots",
    tier: "advanced",
    defaultModel: "Gemini",
    defaultZone: "external",
    skills: ["google-client-search-clawbot", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Prospects found/day: 50", "Enrichment accuracy: 94%", "Intent signals: daily"],
    icon: "Search",
  },
];

// ── Intelligence & Self-Improvement Agents ─────────

const intelligenceTemplates: readonly AgentTemplate[] = [
  {
    id: "agent-optimizer",
    name: "Agent Optimizer",
    description: "Continuous performance monitoring, prompt optimization, and agent evolution management.",
    longDescription: "The meta-intelligence layer of your deployment. Monitors every other agent's performance, identifies improvement opportunities, runs A/B tests on configurations, and autonomously evolves prompts and workflows.",
    category: "intelligence",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["self-improving-skillset", "analytics-data-skillset"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Agents monitored: all", "Improvements/mo: 30+", "Quality uplift: +25%"],
    icon: "RefreshCw",
  },
  {
    id: "data-intelligence-hub",
    name: "Data Intelligence Hub",
    description: "Cross-platform analytics, executive dashboards, and predictive business intelligence.",
    longDescription: "The central nervous system for data-driven decision-making across your organization. Aggregates operational data from all deployed agents and business systems.",
    category: "intelligence",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["analytics-data-skillset", "self-improving-skillset", "researcher"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Data sources: 25+", "Dashboards: 10+", "Predictions/mo: 50+"],
    icon: "BarChart3",
  },
];

// ── Marketing Suite Agents (Enterprise) ────────────

const marketingSuiteTemplates: readonly AgentTemplate[] = [
  {
    id: "marketing-suite-director",
    name: "Marketing Suite Director",
    description: "Enterprise marketing leader that orchestrates omni-channel campaigns, budget allocation, and full-funnel growth.",
    longDescription: "The strategic command center for your marketing operation. Designs quarterly marketing plans, coordinates creative and media teams across all channels, and manages budget allocation with real-time ROI optimization.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["marketing-director", "content-pipeline-manager", "marketing-analytics-engine"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Campaigns/quarter: 24", "Pipeline attributed: $2.5M", "CAC reduction: 42%"],
    icon: "Rocket",
  },
  {
    id: "content-pipeline-agent",
    name: "Content Pipeline Agent",
    description: "Industrial-grade content production system that plans, creates, and distributes content at enterprise scale.",
    longDescription: "A content production powerhouse that maintains intelligent editorial calendars, generates SEO-optimized articles, social posts, email sequences, and sales collateral.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["content-pipeline-manager", "seo-growth-specialist", "social-media-commander"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Articles/month: 40", "Social posts/day: 50", "SEO traffic lift: +180%"],
    icon: "FileText",
  },
  {
    id: "paid-media-agent",
    name: "Paid Media Agent",
    description: "Cross-platform advertising optimizer managing campaigns across Google, Meta, LinkedIn, and programmatic channels.",
    longDescription: "Brings algorithmic precision to your advertising spend. Designs campaign structures, writes ad copy, manages bidding strategies, and continuously optimizes creative performance.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["paid-media-optimizer", "marketing-analytics-engine", "marketing-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Ad platforms: 4", "Avg ROAS: 5.2x", "CPA reduction: 38%"],
    icon: "TrendingUp",
  },
  {
    id: "email-automation-agent",
    name: "Email Automation Agent",
    description: "Sophisticated email marketing engine that builds nurture sequences, optimizes deliverability, and drives conversions.",
    longDescription: "Your dedicated email revenue engine. Builds sophisticated nurture sequences with behavioral branching, designs trigger-based automations, and optimizes subject lines and send times.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "OpenAI",
    defaultZone: "external",
    skills: ["email-automation-specialist", "content-pipeline-manager", "marketing-analytics-engine"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Sequences active: 25", "Open rate avg: 42%", "Revenue attributed: $800K/mo"],
    icon: "Mail",
  },
  {
    id: "social-media-agent",
    name: "Social Media Agent",
    description: "Full-service social media management across all platforms.",
    longDescription: "Owns your entire social presence. Develops platform-specific strategies, maintains posting schedules, crafts engaging posts, monitors mentions and sentiment, and generates performance reports.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "OpenAI",
    defaultZone: "external",
    skills: ["social-media-commander", "content-pipeline-manager", "marketing-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Platforms managed: 5", "Engagement rate: +65%", "Follower growth: 12%/mo"],
    icon: "Share2",
  },
  {
    id: "seo-growth-agent",
    name: "SEO & Growth Agent",
    description: "Technical and content SEO specialist that drives organic traffic through optimization and strategic content.",
    longDescription: "Your dedicated organic traffic engine. Conducts technical SEO audits, performs keyword research, develops content strategies mapped to search intent, and monitors ranking performance.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["seo-growth-specialist", "content-pipeline-manager", "marketing-analytics-engine"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Keywords tracked: 500+", "Organic growth: +210%", "Domain authority: +15 pts"],
    icon: "Search",
  },
  {
    id: "event-webinar-agent",
    name: "Event & Webinar Agent",
    description: "End-to-end event lifecycle management from planning through execution and post-event lead follow-up.",
    longDescription: "Manages the full lifecycle of marketing events from concept and promotion through execution and post-event follow-up. Designs themes, writes promotional copy, builds registration workflows.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["event-webinar-producer", "email-automation-specialist", "marketing-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Events/quarter: 12", "Avg attendance: 450", "Pipeline/event: $180K"],
    icon: "CalendarCheck",
  },
  {
    id: "marketing-analytics-agent",
    name: "Marketing Analytics Agent",
    description: "Deep marketing intelligence with attribution modeling, CLV analysis, and data-driven optimization.",
    longDescription: "Transforms raw marketing data into strategic intelligence. Builds attribution models, calculates customer lifetime value, forecasts pipeline contribution, and identifies key levers.",
    category: "marketing-suite",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["marketing-analytics-engine", "marketing-director", "paid-media-optimizer"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Data sources: 12", "Attribution models: 5", "Forecast accuracy: 94%"],
    icon: "BarChart3",
  },
];

// ── Sales Suite Agents (Enterprise) ────────────────

const salesTemplates: readonly AgentTemplate[] = [
  {
    id: "sales-suite-director",
    name: "Sales Suite Director",
    description: "Enterprise sales leader that drives territory planning, pipeline management, and revenue accountability.",
    longDescription: "The strategic command center for your entire revenue operation. Builds territory plans, designs compensation structures, manages pipeline reviews, and produces accurate revenue forecasts.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["sales-director", "revenue-forecasting-analyst", "crm-intelligence-agent"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Quota attainment: 112%", "Forecast accuracy: 95%", "Deal velocity: +30%"],
    icon: "Handshake",
  },
  {
    id: "lead-gen-agent",
    name: "Lead Generation Agent",
    description: "AI-powered prospecting machine that identifies, qualifies, and nurtures high-value leads at scale.",
    longDescription: "Your always-on prospecting engine. Identifies ideal customer profiles, builds targeted prospect lists, qualifies inbound leads, and initiates personalized outreach sequences.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["lead-generation-engine", "sales-outreach-automator", "crm-intelligence-agent"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Leads/month: 2,000", "Qualification rate: 35%", "Cost per lead: -55%"],
    icon: "UserPlus",
  },
  {
    id: "crm-intel-agent",
    name: "CRM Intelligence Agent",
    description: "CRM optimization specialist that enriches data, surfaces deal insights, and automates sales workflows.",
    longDescription: "Transforms your CRM from a data entry burden into a strategic intelligence platform. Automates data enrichment, enforces data hygiene, surfaces deal insights.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["crm-intelligence-agent", "revenue-forecasting-analyst", "sales-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Data accuracy: 99.5%", "Automation workflows: 40+", "Admin time saved: 70%"],
    icon: "Database",
  },
  {
    id: "proposal-specialist-agent",
    name: "Proposal Specialist Agent",
    description: "Sales document automation engine that generates proposals, quotes, and battle cards in minutes.",
    longDescription: "Eliminates the document creation bottleneck. Generates custom proposals, price quotes, statements of work, and contract drafts in minutes.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["proposal-quote-specialist", "sales-enablement-specialist", "sales-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Proposals/week: 20", "Creation time: <15min", "Win rate lift: +18%"],
    icon: "FileCheck",
  },
  {
    id: "sales-enablement-agent",
    name: "Sales Enablement Agent",
    description: "Training and enablement specialist that builds playbooks, onboarding programs, and rep-ready resources.",
    longDescription: "Bridges the gap between marketing content and sales execution. Builds sales playbooks, designs onboarding programs, creates objection-handling guides.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["sales-enablement-specialist", "proposal-quote-specialist", "sales-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Ramp time reduction: 50%", "Playbooks: 15+", "Win rate impact: +22%"],
    icon: "GraduationCap",
  },
  {
    id: "revenue-forecast-agent",
    name: "Revenue Forecasting Agent",
    description: "Data-science-driven revenue prediction engine with pipeline analytics and scenario modeling.",
    longDescription: "Brings data-science rigor to revenue prediction. Analyzes historical close rates, deal velocity, seasonal patterns, and pipeline composition to generate trustworthy forecasts.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["revenue-forecasting-analyst", "crm-intelligence-agent", "sales-director"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Forecast accuracy: 96%", "Scenarios modeled: 3", "At-risk detection: 3wks early"],
    icon: "BarChart3",
  },
  {
    id: "account-expansion-agent-tpl",
    name: "Account Expansion Agent",
    description: "Expansion revenue specialist that identifies upsell, cross-sell, and renewal opportunities.",
    longDescription: "Mines your existing customer base for growth. Analyzes usage data, renewal timelines, and health scores to surface accounts ripe for expansion.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["account-expansion-agent", "crm-intelligence-agent", "revenue-forecasting-analyst"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Expansion revenue: +40%", "Renewal rate: 96%", "Upsell pipeline: $1.2M"],
    icon: "TrendingUp",
  },
  {
    id: "outreach-automator-agent",
    name: "Sales Outreach Agent",
    description: "Hyper-personalized outreach automation across email, LinkedIn, and phone at massive scale.",
    longDescription: "Enables hyper-personalized prospecting at massive scale. Crafts individualized emails, LinkedIn messages, and call scripts using prospect-specific research.",
    category: "sales",
    tier: "enterprise",
    defaultModel: "OpenAI",
    defaultZone: "external",
    skills: ["sales-outreach-automator", "lead-generation-engine", "crm-intelligence-agent"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Prospects/month: 5,000", "Response rate: 12%", "Meetings booked: 150/mo"],
    icon: "Send",
  },
];

// ── Hospice Care Team (39 agents) ──────────────────

const hospiceTemplates: readonly AgentTemplate[] = [
  // CEO
  {
    id: "hospice-ceo-diane",
    name: "Diane -- CEO",
    description: "Chief Executive Officer. Strategic vision, financial health, regulatory standing, and culture.",
    longDescription: "The compassionate CEO who ensures every patient receives clinically excellent hospice care. Sets mission and values, owns P&L, builds referral relationships, and oversees regulatory compliance.",
    category: "hospice",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["ceo", "strategic-planning", "regulatory-compliance"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Departments: 6", "Total agents: 39", "Decision speed: <2hr"],
    icon: "Crown",
  },
  // Directors
  {
    id: "hospice-dir-marketing",
    name: "Camila -- Marketing Director",
    description: "Brand strategy, digital marketing, SEO, paid ads, referral partner programs.",
    longDescription: "Marketing Director overseeing brand strategy, community outreach, physician referral marketing, and all creative campaigns. Follows 'The 2 AM Test' for grief content.",
    category: "hospice",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "external",
    skills: ["content-strategy", "seo-optimization", "campaign-management"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Team size: 5", "Referral conversion: 34%", "Community events/mo: 4"],
    icon: "Megaphone",
  },
  {
    id: "hospice-dir-clinical",
    name: "Dr. Elena -- Clinical Director",
    description: "Patient care delivery, clinical protocols, IDT coordination, quality outcomes.",
    longDescription: "Board-certified hospice and palliative medicine physician overseeing all patient care. Chairs weekly IDT meetings, establishes symptom management protocols.",
    category: "hospice",
    tier: "enterprise",
    defaultModel: "Claude",
    defaultZone: "clinical",
    skills: ["clinical-documentation", "patient-assessment", "regulatory-compliance"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: true, taskCreation: true },
    suggestedKpis: ["Team size: 6", "Patient satisfaction: 97%", "IDT meetings/wk: 5"],
    icon: "Stethoscope",
  },
  {
    id: "hospice-dir-admissions",
    name: "River -- Admissions Director",
    description: "Patient intake, eligibility verification, referral relationship management.",
    longDescription: "Oversees the entire patient intake pipeline from initial referral to admission. Builds and maintains relationships with hospital systems and physician practices.",
    category: "hospice",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "clinical",
    skills: ["insurance-verification", "patient-intake", "referral-management"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Team size: 5", "Admission speed: <48hr", "Conversion rate: 72%"],
    icon: "DoorOpen",
  },
  {
    id: "hospice-dir-staffing",
    name: "Terra -- Staffing Director",
    description: "Recruitment, scheduling, retention, and training of all caregivers.",
    longDescription: "Oversees recruitment, hiring, 24/7 scheduling operations, and retention programs. Ensures nurse-to-patient ratio never exceeds 1:12.",
    category: "hospice",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["hr-management", "scheduling", "training-development"],
    capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Team size: 5", "Retention rate: 87%", "Coverage gap fill: <2hr"],
    icon: "Users",
  },
  {
    id: "hospice-dir-cx",
    name: "Serenity -- CX Director",
    description: "Family experience strategy, CAHPS scores, service recovery, NPS tracking.",
    longDescription: "Ensures every family interaction reflects warmth, dignity, and excellence from first call through bereavement.",
    category: "hospice",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "clinical",
    skills: ["patient-follow-up", "feedback-analysis", "communication"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true },
    suggestedKpis: ["Team size: 5", "CAHPS score: 4.8/5", "NPS: 82"],
    icon: "Heart",
  },
  {
    id: "hospice-dir-compliance",
    name: "Justice -- Compliance Director",
    description: "Medicare CoP, HIPAA, QAPI program, survey readiness, internal audits.",
    longDescription: "Ensures full regulatory compliance across all operations. Manages Medicare Conditions of Participation, state licensure, QAPI program, and HIPAA privacy/security.",
    category: "hospice",
    tier: "advanced",
    defaultModel: "Claude",
    defaultZone: "operations",
    skills: ["regulatory-compliance", "hipaa-compliance", "audit-management"],
    capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true },
    suggestedKpis: ["Team size: 5", "Audit score: 98%", "Survey readiness: Always"],
    icon: "Scale",
  },
  // Marketing Workers
  {
    id: "hospice-mkt-community", name: "Community Outreach Specialist", description: "Grief support groups, church partnerships, funeral home relationships.", longDescription: "Builds community presence through partnerships with churches, funeral homes, and civic organizations.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "external", skills: ["community-engagement", "social-media"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Partnerships: 25+", "Events/mo: 4"], icon: "Globe",
  },
  {
    id: "hospice-mkt-content", name: "Digital Content Creator", description: "Grief resources, educational materials, family-facing engagement content.", longDescription: "Creates compassionate digital content including grief resources, caregiver guides, and memorial materials.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "external", skills: ["content-strategy", "copywriting"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Content/wk: 12", "Engagement: 4.2%"], icon: "PenTool",
  },
  {
    id: "hospice-mkt-referral", name: "Referral Partnership Manager", description: "Physician referral marketing, hospital discharge planner education.", longDescription: "Develops and nurtures physician referral marketing programs and hospital discharge planner education campaigns.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "external", skills: ["referral-management", "relationship-building"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Active partners: 40+", "Referrals/mo: 60"], icon: "Handshake",
  },
  {
    id: "hospice-mkt-events", name: "Brand & Events Coordinator", description: "Grief workshops, memorial events, education seminars.", longDescription: "Plans and executes grief workshops, education seminars, and memorial events. 4+ community events per month.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "external", skills: ["event-coordination", "brand-management"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Events/mo: 4", "Attendance: 85%"], icon: "Calendar",
  },
  {
    id: "hospice-mkt-seo", name: "SEO & Analytics Specialist", description: "Organic search for hospice and palliative care queries, paid ads management.", longDescription: "Drives organic search visibility for hospice, palliative care, and caregiver resource queries.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "external", skills: ["seo-optimization", "analytics"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Organic traffic: +45%", "Cost/lead: $32"], icon: "BarChart3",
  },
  // Clinical Workers
  {
    id: "hospice-clin-rn", name: "RN Case Manager", description: "Direct patient care, pain management, symptom control, home visits.", longDescription: "Provides direct patient care through home visits, managing pain and symptom control.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "clinical", skills: ["clinical-documentation", "patient-assessment"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: true, taskCreation: true }, suggestedKpis: ["Visits/day: 6", "Pain managed: 98%"], icon: "HeartPulse",
  },
  {
    id: "hospice-clin-aide", name: "Hospice Aide Coordinator", description: "Personal care, ADL support, patient dignity and comfort.", longDescription: "Coordinates certified nursing assistants providing personal care, bathing, feeding, and comfort measures.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-care", "scheduling"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Aides managed: 12", "Satisfaction: 96%"], icon: "HandHelping",
  },
  {
    id: "hospice-clin-symptom", name: "Symptom Management Specialist", description: "Advanced symptom protocols, medication adjustments, crisis intervention.", longDescription: "Specializes in complex symptom management including refractory pain, dyspnea, agitation, and nausea.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "clinical", skills: ["clinical-documentation", "medication-management"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Protocols: 30+", "Resolution: 99%"], icon: "Activity",
  },
  {
    id: "hospice-clin-bereavement", name: "Bereavement Counselor", description: "13-month grief support program, grief assessment, support group facilitation.", longDescription: "Launches the 13-month grief support program for all bereaved families. Coordinates monthly contact schedule.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-follow-up", "grief-support"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Families served: 60+", "Program length: 13mo"], icon: "Flower2",
  },
  {
    id: "hospice-clin-spiritual", name: "Spiritual Care Coordinator", description: "Spiritual and emotional support, diverse faith traditions, crisis chaplaincy.", longDescription: "Provides spiritual and emotional support respecting diverse spiritual and religious preferences.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["spiritual-care", "communication"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Traditions served: 15+", "Availability: 24/7"], icon: "Sparkles",
  },
  {
    id: "hospice-clin-meds", name: "Medication Management Agent", description: "Medication reconciliation, drug interaction checks, formulary compliance.", longDescription: "Manages medication reconciliation across all active patients, checking for drug interactions and ensuring formulary compliance.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "clinical", skills: ["medication-management", "clinical-documentation"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Reconciliations/day: 20", "Interaction catches: 100%"], icon: "Pill",
  },
  // Admissions Workers
  {
    id: "hospice-adm-intake", name: "Intake Coordinator", description: "First contact for family and hospital referrals, compassionate intake conversations.", longDescription: "First point of contact for family and hospital referrals. Conducts compassionate intake conversations.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-intake", "communication"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: true, taskCreation: true }, suggestedKpis: ["Calls/day: 30", "Response time: <15min"], icon: "Phone",
  },
  {
    id: "hospice-adm-benefits", name: "Benefits Verification Specialist", description: "Medicare hospice benefit, Medicaid, private insurance verification.", longDescription: "Verifies Medicare hospice benefit, Medicaid, and private insurance coverage.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["insurance-verification", "pre-authorization-automation"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Verifications/day: 25", "Accuracy: 99.5%"], icon: "ShieldCheck",
  },
  {
    id: "hospice-adm-family", name: "Family Liaison", description: "Family education, emotional preparation, transition support.", longDescription: "Guides families through the emotional transition to hospice care.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-follow-up", "communication"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Families/wk: 15", "Satisfaction: 98%"], icon: "HeartHandshake",
  },
  {
    id: "hospice-adm-triage", name: "Referral Triage Specialist", description: "Clinical assessments, medical record review, eligibility determination.", longDescription: "Conducts clinical assessments in-home or hospital settings, reviews medical records, and determines hospice eligibility.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-assessment", "clinical-documentation"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Assessments/day: 5", "Turnaround: <4hr"], icon: "ClipboardList",
  },
  {
    id: "hospice-adm-preassess", name: "Pre-Admission Assessment Agent", description: "Initial clinical screening, prognosis validation, documentation preparation.", longDescription: "Performs initial clinical screening before formal admission, validates terminal prognosis criteria.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["clinical-documentation", "regulatory-compliance"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Screens/day: 8", "Approval rate: 94%"], icon: "FileCheck",
  },
  // Staffing Workers
  {
    id: "hospice-staff-recruit", name: "Caregiver Recruiter", description: "Source, screen, and hire caregiver candidates, manage PRN pool.", longDescription: "Sources and screens caregiver candidates across multiple channels and builds a PRN/per diem staff pool.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["hr-management", "recruiting"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Hires/mo: 8", "Time to fill: 14 days"], icon: "UserPlus",
  },
  {
    id: "hospice-staff-schedule", name: "Scheduling Optimizer", description: "24/7 caregiver scheduling, call-out coverage, caseload balancing.", longDescription: "Creates and manages 24/7 schedules for all caregivers and handles call-out coverage.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["scheduling", "resource-optimization"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Coverage: 99.5%", "Gap fill: <2hr"], icon: "CalendarClock",
  },
  {
    id: "hospice-staff-training", name: "Training & Certification Tracker", description: "Orientation, CEU tracking, competency verification, rapid onboarding.", longDescription: "Develops new hire orientation programs, provides palliative care education, ensures all clinical staff have required competencies.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "operations", skills: ["training-development", "compliance-tracking"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["CEU compliance: 100%", "Onboard time: 3 days"], icon: "GraduationCap",
  },
  {
    id: "hospice-staff-coverage", name: "Shift Coverage Agent", description: "Call-out response, emergency staffing, agency coordination.", longDescription: "Manages real-time shift coverage when call-outs occur. Maintains prioritized contact lists.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "operations", skills: ["scheduling", "emergency-response"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Fill rate: 98%", "Response: <30min"], icon: "RefreshCw",
  },
  {
    id: "hospice-staff-performance", name: "Caregiver Performance Analyst", description: "Staff satisfaction monitoring, retention analysis, burnout prevention.", longDescription: "Monitors caregiver satisfaction, develops retention programs, and manages bereavement support for staff.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["analytics", "hr-management"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Retention: 87%", "Satisfaction: 4.5/5"], icon: "TrendingUp",
  },
  // CX Workers
  {
    id: "hospice-cx-family", name: "Family Communication Agent", description: "Welcome calls, needs assessment, ongoing family support.", longDescription: "Provides direct family support including welcome calls, family orientation, and 24-48 hour post-admission follow-ups.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "clinical", skills: ["patient-follow-up", "communication"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: true, distressDetection: true, taskCreation: true }, suggestedKpis: ["Calls/day: 20", "Satisfaction: 98%"], icon: "MessageCircleHeart",
  },
  {
    id: "hospice-cx-survey", name: "Patient Satisfaction Surveyor", description: "CAHPS surveys, feedback collection, trend analysis.", longDescription: "Conducts family surveys, collects feedback at key journey milestones, and analyzes satisfaction trends.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "clinical", skills: ["feedback-analysis", "analytics"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Response rate: 72%", "CAHPS: 4.8/5"], icon: "ClipboardCheck",
  },
  {
    id: "hospice-cx-complaints", name: "Complaint Resolution Specialist", description: "Service recovery, escalation management, root cause analysis.", longDescription: "Leads service recovery for families with negative experiences. Manages escalation workflows.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["conflict-resolution", "communication"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Resolution time: <24hr", "Escalations: <2/mo"], icon: "ShieldAlert",
  },
  {
    id: "hospice-cx-transition", name: "Care Transition Coordinator", description: "Transition support between care levels, discharge planning, follow-up.", longDescription: "Coordinates care transitions between hospice levels (routine, continuous, inpatient, respite).", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "clinical", skills: ["care-coordination", "patient-follow-up"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Transitions/mo: 15", "Smooth rate: 96%"], icon: "ArrowRightLeft",
  },
  {
    id: "hospice-cx-bereavement", name: "Bereavement Follow-Up Agent", description: "Post-loss family support, memorial coordination, referral program.", longDescription: "Manages ongoing connection with bereaved families after the 13-month bereavement program.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "clinical", skills: ["grief-support", "referral-management"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: true, taskCreation: true }, suggestedKpis: ["Families/yr: 120+", "Referrals: 35%"], icon: "Flower",
  },
  // Compliance Workers
  {
    id: "hospice-comp-hipaa", name: "HIPAA Audit Agent", description: "Privacy compliance documentation, breach response, data protection training.", longDescription: "Verifies HIPAA compliance documentation is current, manages patient data protection and privacy training.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "operations", skills: ["hipaa-compliance", "audit-management"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Audits/mo: 4", "Compliance: 100%"], icon: "Lock",
  },
  {
    id: "hospice-comp-billing", name: "Medicare Billing Compliance Agent", description: "Medicare CoP adherence, face-to-face encounter validation, recertification tracking.", longDescription: "Monitors current policies against Medicare Conditions of Participation and survey scope.", category: "hospice", tier: "advanced", defaultModel: "Claude", defaultZone: "operations", skills: ["regulatory-compliance", "billing-compliance"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Recerts tracked: 50+", "Denial rate: <1%"], icon: "Receipt",
  },
  {
    id: "hospice-comp-docs", name: "Documentation QA Specialist", description: "Chart reviews, documentation completeness, EMR compliance standards.", longDescription: "Conducts pre-audit chart reviews and random sampling to ensure documentation completeness.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["clinical-documentation", "quality-assurance"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Charts/wk: 50", "Completeness: 99%"], icon: "FileSearch",
  },
  {
    id: "hospice-comp-incident", name: "Incident Reporting Agent", description: "Adverse event tracking, fall reports, medication error documentation.", longDescription: "Manages incident reporting workflows including adverse events, falls, medication errors, and near-misses.", category: "hospice", tier: "professional", defaultModel: "Claude", defaultZone: "operations", skills: ["incident-management", "quality-assurance"], capabilities: { phiProtection: true, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Resolution time: <24hr", "Corrective actions: 100%"], icon: "AlertTriangle",
  },
  {
    id: "hospice-comp-policy", name: "Policy Update Tracker", description: "CMS updates, OIG guidance monitoring, policy revision management.", longDescription: "Stays current on regulatory changes from CMS, OIG, and state agencies. Reviews and updates internal compliance policies.", category: "hospice", tier: "starter", defaultModel: "Claude", defaultZone: "operations", skills: ["regulatory-compliance", "policy-management"], capabilities: { phiProtection: false, messaging: true, voiceRecognition: false, distressDetection: false, taskCreation: true }, suggestedKpis: ["Updates/mo: 8", "Training compliance: 100%"], icon: "BookOpen",
  },
];

// ── Export all templates ────────────────────────────

export const agentTemplates: readonly AgentTemplate[] = [
  ...healthcareTemplates,
  ...executiveTemplates,
  ...marketingTemplates,
  ...financeTemplates,
  ...operationsTemplates,
  ...researchTemplates,
  ...developmentTemplates,
  ...clawbotTemplates,
  ...intelligenceTemplates,
  ...marketingSuiteTemplates,
  ...salesTemplates,
  ...hospiceTemplates,
];

// ── Utility functions ──────────────────────────────

export const getTemplatesByCategory = (category: string): readonly AgentTemplate[] =>
  agentTemplates.filter((t) => t.category === category);

export const getTemplateById = (id: string): AgentTemplate | undefined =>
  agentTemplates.find((t) => t.id === id);

export const getTemplatesByTier = (tier: AgentTemplate["tier"]): readonly AgentTemplate[] =>
  agentTemplates.filter((t) => t.tier === tier);
