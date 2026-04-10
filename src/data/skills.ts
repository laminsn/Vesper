// ═══════════════════════════════════════════════════
// Vesper — Skills Library
// Ported from Dr. Claw Medical — 30+ skills across 11 categories
// ═══════════════════════════════════════════════════

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly tier: "starter" | "professional" | "advanced" | "enterprise";
  readonly icon: string;
}

export interface SkillCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

export const skillCategories: readonly SkillCategory[] = [
  { id: "executive", name: "C-Suite & Executive", description: "AI-powered executive leadership agents that drive strategic decision-making, operational excellence, and organizational growth.", icon: "Crown" },
  { id: "marketing", name: "Marketing & Content", description: "Specialized content creation and marketing strategy agents that craft compelling narratives and optimize campaigns.", icon: "Megaphone" },
  { id: "finance", name: "Finance & Accounting", description: "Financial intelligence agents that deliver precise forecasting, compliance oversight, and strategic capital management.", icon: "DollarSign" },
  { id: "research", name: "Research & Analysis", description: "Rigorous research and analytical agents that synthesize complex data into actionable insights.", icon: "Search" },
  { id: "healthcare", name: "Healthcare Operations", description: "Purpose-built healthcare workflow agents that streamline clinical operations and improve patient outcomes.", icon: "Heart" },
  { id: "operations", name: "Operations & HR", description: "Operational and human resources agents that optimize workflows, nurture talent, and build high-performing cultures.", icon: "Settings" },
  { id: "development", name: "Development & Integration", description: "Specialized development agents that build, integrate, and automate workflows across platforms.", icon: "Code" },
  { id: "clawbots", name: "Clawbots", description: "Autonomous client-facing agents that prospect, engage, and nurture leads across digital channels.", icon: "Bot" },
  { id: "intelligence", name: "Intelligence & Self-Improvement", description: "Meta-cognitive agents that analyze performance data, identify optimization opportunities, and continuously improve.", icon: "Sparkles" },
  { id: "marketing-suite", name: "Marketing Suite", description: "Enterprise-tier marketing powerhouse agents that orchestrate omni-channel campaigns and deliver full-funnel attribution.", icon: "Rocket" },
  { id: "sales", name: "Sales Suite", description: "Enterprise-tier sales acceleration agents that automate prospecting, manage pipeline intelligence, and forecast revenue.", icon: "Handshake" },
] as const;

export const skills: readonly Skill[] = [
  // ── Executive Skills ─────────────────────────────
  { id: "ceo", name: "Chief Executive Officer", description: "Strategic leadership — vision development, stakeholder communication, board presentations, M&A evaluation, crisis management, OKR frameworks, and investor relations.", category: "executive", tier: "enterprise", icon: "Crown" },
  { id: "coo", name: "Chief Operating Officer", description: "Operational excellence — process improvement, supply chain management, quality assurance, vendor management, workflow automation, capacity planning, KPI dashboards, and SOP development.", category: "executive", tier: "enterprise", icon: "Cog" },
  { id: "cio", name: "Chief Information Officer", description: "Technology strategy — IT roadmapping, cybersecurity planning, digital transformation, system integration, cloud infrastructure, SOC 2 / ISO compliance, and disaster recovery.", category: "executive", tier: "enterprise", icon: "Server" },
  { id: "caio", name: "Chief AI Officer", description: "AI strategy — tool evaluation, implementation roadmapping, ethics and governance, model performance monitoring, prompt engineering strategy, and AI literacy programs.", category: "executive", tier: "enterprise", icon: "Brain" },

  // ── Marketing & Content Skills ───────────────────
  { id: "cmo", name: "Chief Marketing Officer", description: "Marketing strategy — brand positioning, campaign planning, market research, customer acquisition, content strategy, digital marketing, budget allocation, and go-to-market planning.", category: "marketing", tier: "enterprise", icon: "Target" },
  { id: "professional-copywriter", name: "Professional Copywriter", description: "Expert content creation — blog posts, email marketing, social media content, landing pages, ad copy, press releases, product descriptions, case studies, and white papers.", category: "marketing", tier: "professional", icon: "PenTool" },
  { id: "grant-writer", name: "Grant Writer", description: "Specialized grant writing — opportunity identification, proposal writing, budget narratives, logic models, federal grants (NIH/NSF/DOE), foundation proposals, and corporate sponsorship.", category: "marketing", tier: "professional", icon: "FileText" },
  { id: "instructional-video-maker", name: "Instructional Video Maker", description: "Video production — script writing, storyboard development, instructional design, course curriculum planning, production planning, animation direction, and video SEO.", category: "marketing", tier: "professional", icon: "Play" },

  // ── Finance Skills ───────────────────────────────
  { id: "cfo", name: "Chief Financial Officer", description: "Financial strategy — FP&A, budget forecasting, cash flow management, revenue modeling, cost optimization, investment analysis, tax strategy, fundraising, and unit economics.", category: "finance", tier: "enterprise", icon: "TrendingUp" },

  // ── Research & Analysis Skills ───────────────────
  { id: "researcher", name: "Researcher", description: "Rigorous research — literature review, data collection & analysis, methodology design, survey design, statistical analysis, competitive intelligence, market research, and trend analysis.", category: "research", tier: "professional", icon: "Microscope" },
  { id: "book-research-specialist", name: "Book Read & Research Specialist", description: "Deep reading — book summarization, key insight extraction, comparative analysis, curated reading lists, thematic synthesis, annotated bibliographies, and learning path development.", category: "research", tier: "professional", icon: "BookOpen" },

  // ── Healthcare Skills ────────────────────────────
  { id: "appointment-scheduling", name: "Appointment Scheduling", description: "Intelligent scheduling — multi-provider calendars, patient preference matching, automated reminders, waitlist management, telehealth scheduling, and buffer time optimization.", category: "healthcare", tier: "starter", icon: "Calendar" },
  { id: "insurance-verification", name: "Insurance Verification", description: "Real-time verification — eligibility checks, benefits breakdown, prior authorization, claims tracking, patient cost estimates, denial management, and batch verification.", category: "healthcare", tier: "starter", icon: "ShieldCheck" },
  { id: "patient-follow-up", name: "Patient Follow-Up", description: "Proactive engagement — post-visit outreach, medication adherence, appointment reminders, satisfaction surveys, care plan compliance, no-show recovery, and chronic care check-ins.", category: "healthcare", tier: "starter", icon: "PhoneCall" },
  { id: "clinical-documentation", name: "Clinical Documentation", description: "Clinical writing — visit summaries, referral letters, patient instructions, discharge notes, SOAP notes, procedure documentation, lab result summaries, and care plans.", category: "healthcare", tier: "professional", icon: "ClipboardList" },
  { id: "referral-management", name: "Referral Management", description: "End-to-end referral coordination — specialist matching, referral tracking, document preparation, patient communication, follow-up coordination, and network management.", category: "healthcare", tier: "professional", icon: "GitBranch" },
  { id: "no-show-recovery", name: "No-Show Recovery", description: "Patient recovery — automated rescheduling, cancellation follow-up, waitlist backfill, pattern identification, reminder optimization, and financial impact tracking.", category: "healthcare", tier: "starter", icon: "UserX" },
  { id: "rx-refill-coordination", name: "Rx Refill Coordination", description: "Medication management — refill reminders, pharmacy coordination, prior auth for medications, medication reconciliation, adherence tracking, and drug interaction alerts.", category: "healthcare", tier: "professional", icon: "Pill" },
  { id: "lab-results-communication", name: "Lab Results Communication", description: "Lab results management — result notification, critical value alerts, normal range explanations, follow-up scheduling, trending analysis, and reference range context.", category: "healthcare", tier: "professional", icon: "TestTube" },
  { id: "pre-authorization-automation", name: "Pre-Authorization Automation", description: "Authorization automation — request submission, status tracking, approval documentation, appeal preparation, clinical justification, and denial prevention.", category: "healthcare", tier: "advanced", icon: "CheckSquare" },
  { id: "post-surgical-follow-up", name: "Post-Surgical Follow-Up", description: "Surgical recovery — recovery check-ins, wound care instructions, physical therapy scheduling, pain management follow-up, complication screening, and return-to-work planning.", category: "healthcare", tier: "advanced", icon: "Stethoscope" },
  { id: "home-healthcare-hospice-researcher", name: "Home Healthcare & Hospice Researcher", description: "Home health research — CMS regulatory research, OASIS assessment guidance, PDGM payment analysis, hospice eligibility, quality measures, accreditation, and palliative care models.", category: "healthcare", tier: "advanced", icon: "Heart" },

  // ── Operations & HR Skills ───────────────────────
  { id: "chro", name: "Chief Human Resources Officer", description: "People strategy — talent acquisition, employee retention, compensation planning, performance management, training programs, DEI initiatives, organizational design, and succession planning.", category: "operations", tier: "enterprise", icon: "Users" },

  // ── Development & Integration Skills ─────────────
  { id: "notion-development-specialist", name: "Notion Development Specialist", description: "Notion architecture — database design, template creation, API integration, automation workflows, dashboards, formula engineering, client portals, and knowledge base construction.", category: "development", tier: "professional", icon: "FileText" },
  { id: "airtable-development-specialist", name: "Airtable Development Specialist", description: "Airtable development — base architecture, automation builder, interface designer, scripting & extensions, API integration, view configuration, and workflow optimization.", category: "development", tier: "professional", icon: "BarChart3" },
  { id: "coding-specialist", name: "Coding Specialist", description: "Full-stack development — frontend/backend coding, code review, debugging, API development, database design, testing & QA, DevOps & CI/CD, and security best practices.", category: "development", tier: "professional", icon: "Code" },
  { id: "application-specialist", name: "Application Specialist", description: "Application lifecycle — requirements analysis, architecture design, UI/UX specification, MVP strategy, integration architecture, QA planning, deployment, and SaaS development.", category: "development", tier: "advanced", icon: "Monitor" },

  // ── Clawbot Skills ───────────────────────────────
  { id: "linkedin-client-clawbot", name: "LinkedIn Client Clawbot", description: "LinkedIn prospecting — ICP targeting, connection personalization, messaging sequences, content engagement, thought leadership, lead qualification, and InMail campaigns.", category: "clawbots", tier: "advanced", icon: "Linkedin" },
  { id: "google-client-search-clawbot", name: "Google Client Search Clawbot", description: "Web research — advanced search queries, business directory mining, company intelligence, contact discovery, intent signal detection, and prospect enrichment.", category: "clawbots", tier: "advanced", icon: "Search" },

  // ── Intelligence & Self-Improvement Skills ───────
  { id: "self-improving-skillset", name: "Self-Improving Skillset", description: "Meta-intelligence — agent performance monitoring, prompt optimization, error pattern detection, A/B testing, knowledge gap identification, model selection & tuning, and regression detection.", category: "intelligence", tier: "enterprise", icon: "RefreshCw" },
  { id: "analytics-data-skillset", name: "Analytics & Data Skillset", description: "Data analytics — dashboard development, KPI tracking, predictive analytics, data pipeline design, statistical analysis, anomaly detection, and custom report generation.", category: "intelligence", tier: "enterprise", icon: "BarChart3" },

  // ── Marketing Suite Skills (Enterprise) ──────────
  { id: "marketing-director", name: "Marketing Director", description: "Enterprise marketing leadership — omni-channel orchestration, brand strategy, budget optimization, full-funnel attribution, competitive intelligence, and GTM planning.", category: "marketing-suite", tier: "enterprise", icon: "Rocket" },
  { id: "content-pipeline-manager", name: "Content Pipeline Manager", description: "Content production at scale — editorial calendars, SEO content, content repurposing, brand voice consistency, performance analytics, and thought leadership development.", category: "marketing-suite", tier: "enterprise", icon: "FileText" },
  { id: "paid-media-optimizer", name: "Paid Media Optimizer", description: "Paid advertising — cross-platform campaign management, ad creative generation, bid strategy optimization, audience targeting, ROAS tracking, and A/B testing.", category: "marketing-suite", tier: "enterprise", icon: "TrendingUp" },
  { id: "email-automation-specialist", name: "Email Automation Specialist", description: "Email marketing — nurture sequence design, behavioral triggers, subject line optimization, list health & deliverability, segmentation, and performance analytics.", category: "marketing-suite", tier: "enterprise", icon: "Mail" },
  { id: "social-media-commander", name: "Social Media Commander", description: "Social media management — multi-platform strategy, content calendars, community engagement, social listening, influencer identification, and social analytics & ROI.", category: "marketing-suite", tier: "enterprise", icon: "Share2" },
  { id: "marketing-analytics-engine", name: "Marketing Analytics Engine", description: "Marketing analytics — multi-touch attribution, CLV analysis, pipeline forecasting, marketing mix modeling, funnel conversion analysis, and competitive benchmarking.", category: "marketing-suite", tier: "enterprise", icon: "BarChart3" },
  { id: "event-webinar-producer", name: "Event & Webinar Producer", description: "Event management — strategy & planning, promotional campaigns, webinar production, registration workflows, post-event follow-up, and event ROI analysis.", category: "marketing-suite", tier: "enterprise", icon: "CalendarCheck" },
  { id: "seo-growth-specialist", name: "SEO & Growth Specialist", description: "SEO — technical auditing, keyword research, content strategy, ranking monitoring, link building, and conversion rate optimization.", category: "marketing-suite", tier: "enterprise", icon: "Search" },

  // ── Sales Suite Skills (Enterprise) ──────────────
  { id: "sales-director", name: "Sales Director", description: "Sales leadership — revenue strategy, pipeline management, team performance, compensation design, deal coaching, sales process optimization, and QBR preparation.", category: "sales", tier: "enterprise", icon: "Handshake" },
  { id: "lead-generation-engine", name: "Lead Generation Engine", description: "Prospecting — ICP development, prospect list building, lead qualification & scoring, multi-channel outreach, intent signal monitoring, and lead nurture automation.", category: "sales", tier: "enterprise", icon: "UserPlus" },
  { id: "crm-intelligence-agent", name: "CRM Intelligence Agent", description: "CRM optimization — data enrichment & hygiene, deal intelligence, workflow automation, pipeline dashboards, activity tracking, and integration architecture.", category: "sales", tier: "enterprise", icon: "Database" },
  { id: "proposal-quote-specialist", name: "Proposal & Quote Specialist", description: "Sales documents — proposal generation, dynamic pricing, SOW & contract drafting, competitive battle cards, ROI models, and document analytics.", category: "sales", tier: "enterprise", icon: "FileCheck" },
  { id: "sales-enablement-specialist", name: "Sales Enablement Specialist", description: "Sales training — playbook development, onboarding programs, objection handling library, demo templates, win/loss analysis, and content utilization tracking.", category: "sales", tier: "enterprise", icon: "GraduationCap" },
  { id: "revenue-forecasting-analyst", name: "Revenue Forecasting Analyst", description: "Revenue prediction — statistical models, pipeline health scoring, scenario modeling, quota attainment tracking, seasonal analysis, and forecast accuracy measurement.", category: "sales", tier: "enterprise", icon: "BarChart3" },
  { id: "account-expansion-agent", name: "Account Expansion Agent", description: "Customer expansion — whitespace analysis, upsell/cross-sell scoring, account planning, renewal risk detection, customer success alignment, and expansion forecasting.", category: "sales", tier: "enterprise", icon: "TrendingUp" },
  { id: "sales-outreach-automator", name: "Sales Outreach Automator", description: "Personalized outreach — email sequences, LinkedIn messaging, call script generation, sequence optimization, prospect research automation, and response handling.", category: "sales", tier: "enterprise", icon: "Send" },
] as const;

// ── Utility functions ──────────────────────────────

export const getSkillsByCategory = (category: string): readonly Skill[] =>
  skills.filter((s) => s.category === category);

export const getSkillById = (id: string): Skill | undefined =>
  skills.find((s) => s.id === id);

export const getSkillsByTier = (tier: Skill["tier"]): readonly Skill[] =>
  skills.filter((s) => s.tier === tier);

export const getCategoryById = (id: string): SkillCategory | undefined =>
  skillCategories.find((c) => c.id === id);
