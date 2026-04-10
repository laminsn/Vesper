/**
 * Daily Task Templates — operational backbone of the HHCC Vesper.
 *
 * 108 templates across 9 departments + universal workflows covering every
 * daily operational touchpoint: email, DMs, calendar, meetings, KPIs,
 * financials, satisfaction, social media, sales, clinical, compliance,
 * operations, outreach, recruitment, and grants.
 */

/* ───── Types ───── */

export type TaskCategory =
  | "email"
  | "dm"
  | "calendar"
  | "meetings"
  | "kpi"
  | "financial"
  | "satisfaction"
  | "social_media"
  | "sales"
  | "clinical"
  | "compliance"
  | "operations"
  | "outreach"
  | "recruitment"
  | "grants";

export type TaskAction =
  | "read"
  | "parse"
  | "summarize"
  | "report"
  | "reply"
  | "document"
  | "send"
  | "search"
  | "scrape"
  | "review"
  | "score"
  | "apply"
  | "follow_up";

export type TaskFrequency = "daily" | "weekly" | "monthly";

export interface DailyTaskTemplate {
  readonly id: string;
  readonly title: string;
  readonly department: string;
  readonly assigned_agent_slug: string;
  readonly category: TaskCategory;
  readonly frequency: TaskFrequency;
  readonly due_time: string | null;
  readonly metric_keys: readonly string[];
  readonly description: string;
  readonly actions: readonly TaskAction[];
}

export interface DailyTaskInstance {
  readonly id: string;
  readonly template_id: string;
  readonly title: string;
  readonly department: string;
  readonly assigned_agent_slug: string;
  readonly category: TaskCategory;
  readonly due_time: string | null;
  readonly metric_keys: readonly string[];
  readonly description: string;
  readonly actions: readonly TaskAction[];
  readonly date: string;
  readonly completed: boolean;
  readonly completed_at: string | null;
  readonly completed_by: string | null;
  readonly metric_values: Readonly<Record<string, number>>;
  readonly is_custom: boolean;
}

export interface CompletedMetric {
  readonly metric_key: string;
  readonly value: number;
  readonly department: string;
  readonly agent: string;
  readonly timestamp: string;
}

/* ───── Category Colors ───── */

export const CATEGORY_COLORS: Readonly<Record<TaskCategory, string>> = {
  email: "#3b82f6",
  dm: "#6366f1",
  calendar: "#8b5cf6",
  meetings: "#a855f7",
  kpi: "#06d6a0",
  financial: "#14b8a6",
  satisfaction: "#f59e0b",
  social_media: "#ec4899",
  sales: "#f97316",
  clinical: "#ef4444",
  compliance: "#f97316",
  operations: "#8b5cf6",
  outreach: "#3b82f6",
  recruitment: "#06b6d4",
  grants: "#10b981",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   UNIVERSAL TEMPLATES (department: "universal")
   ═══════════════════════════════════════════════════════════════════ */

const universalEmailTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-email-01",
    title: "Read & Triage Inbox",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "email",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["emails_received", "emails_actioned"],
    description: "Scan all inbound emails. Flag urgent items, categorize by department, and route to appropriate agents for action.",
    actions: ["read", "parse"],
  },
  {
    id: "uni-email-02",
    title: "Summarize Important Emails",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "email",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["emails_summarized"],
    description: "Produce concise summaries of high-priority emails for leadership review and decision-making.",
    actions: ["parse", "summarize"],
  },
  {
    id: "uni-email-03",
    title: "Draft & Send Replies",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "email",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["replies_sent"],
    description: "Compose and dispatch professional replies to pending emails requiring immediate response.",
    actions: ["reply", "send"],
  },
  {
    id: "uni-email-04",
    title: "Document Email Decisions",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "email",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["emails_documented"],
    description: "Record all decisions, commitments, and action items from email conversations into the appropriate tracking systems.",
    actions: ["document"],
  },
  {
    id: "uni-email-05",
    title: "Email Activity Report",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "email",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["email_report_generated"],
    description: "Generate end-of-day email activity summary: volume, response times, pending items, and escalations.",
    actions: ["summarize", "report"],
  },
] as const;

const universalDmTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-dm-01",
    title: "Read & Triage DMs (Slack/Telegram/GHL)",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "dm",
    frequency: "daily",
    due_time: "08:30",
    metric_keys: ["dms_received", "dms_actioned"],
    description: "Monitor all direct messaging channels including Slack, Telegram, and GoHighLevel. Prioritize and route messages.",
    actions: ["read", "parse"],
  },
  {
    id: "uni-dm-02",
    title: "Summarize DM Conversations",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "dm",
    frequency: "daily",
    due_time: "09:30",
    metric_keys: ["dms_summarized"],
    description: "Digest key DM threads into structured summaries for team awareness and continuity.",
    actions: ["parse", "summarize"],
  },
  {
    id: "uni-dm-03",
    title: "Reply to DMs",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "dm",
    frequency: "daily",
    due_time: "10:30",
    metric_keys: ["dm_replies_sent"],
    description: "Respond to outstanding DMs across all platforms with appropriate tone and content.",
    actions: ["reply", "send"],
  },
  {
    id: "uni-dm-04",
    title: "Document DM Decisions",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "dm",
    frequency: "daily",
    due_time: "16:30",
    metric_keys: ["dms_documented"],
    description: "Capture agreements, next steps, and decisions made via DM into formal tracking systems.",
    actions: ["document"],
  },
  {
    id: "uni-dm-05",
    title: "DM Activity Report",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "dm",
    frequency: "daily",
    due_time: "17:15",
    metric_keys: ["dm_report_generated"],
    description: "Compile daily DM metrics: message volume by channel, response rates, unresolved threads.",
    actions: ["summarize", "report"],
  },
] as const;

const universalCalendarTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-cal-01",
    title: "Review Today's Calendar",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "calendar",
    frequency: "daily",
    due_time: "07:30",
    metric_keys: ["meetings_today"],
    description: "Pull and review all scheduled events for today. Verify attendees, locations, and required prep materials.",
    actions: ["review"],
  },
  {
    id: "uni-cal-02",
    title: "Summarize Upcoming Commitments",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "calendar",
    frequency: "daily",
    due_time: "07:45",
    metric_keys: ["commitments_flagged"],
    description: "Highlight the next 48 hours of calendar commitments, deadlines, and deliverables requiring attention.",
    actions: ["summarize"],
  },
  {
    id: "uni-cal-03",
    title: "Report Calendar Conflicts",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "calendar",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["calendar_conflicts"],
    description: "Identify and flag any double-bookings, scheduling conflicts, or resource contention in today's calendar.",
    actions: ["report"],
  },
  {
    id: "uni-cal-04",
    title: "Document Meeting Action Items",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "calendar",
    frequency: "daily",
    due_time: "17:30",
    metric_keys: ["action_items_logged"],
    description: "At end of day, consolidate all action items from completed meetings into the task tracking system.",
    actions: ["document"],
  },
] as const;

const universalMeetingTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-mtg-01",
    title: "Prepare Meeting Agendas",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "meetings",
    frequency: "daily",
    due_time: "07:00",
    metric_keys: ["meetings_prepped"],
    description: "Draft structured agendas for all scheduled meetings today, including context, objectives, and pre-reads.",
    actions: ["review"],
  },
  {
    id: "uni-mtg-02",
    title: "Summarize Meeting Notes",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "meetings",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["meetings_summarized"],
    description: "Synthesize raw meeting notes into clear summaries with decisions, action items, and owners.",
    actions: ["summarize"],
  },
  {
    id: "uni-mtg-03",
    title: "Report Key Decisions",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "meetings",
    frequency: "daily",
    due_time: "16:30",
    metric_keys: ["follow_ups_assigned"],
    description: "Distribute key decisions from meetings to relevant stakeholders and assign follow-up tasks.",
    actions: ["report"],
  },
  {
    id: "uni-mtg-04",
    title: "Document Action Items with Deadlines",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "meetings",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["meeting_docs_created"],
    description: "Formalize all meeting action items with assigned owners, deadlines, and priority levels.",
    actions: ["document"],
  },
] as const;

const universalKpiTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-kpi-01",
    title: "Pull & Review Department KPIs",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["kpis_reviewed"],
    description: "Extract latest KPI data across all departments and review against targets and benchmarks.",
    actions: ["review"],
  },
  {
    id: "uni-kpi-02",
    title: "Summarize KPI Trends",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "09:30",
    metric_keys: ["kpi_trends_flagged"],
    description: "Analyze KPI trajectories over 7/30/90-day windows. Highlight improving and declining metrics.",
    actions: ["summarize"],
  },
  {
    id: "uni-kpi-03",
    title: "Report KPI Anomalies",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["kpi_alerts"],
    description: "Flag any KPIs with significant deviations from expected ranges. Escalate critical anomalies to department directors.",
    actions: ["report"],
  },
  {
    id: "uni-kpi-04",
    title: "Document in Daily Log",
    department: "universal",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["kpi_log_updated"],
    description: "Record today's KPI snapshot in the daily operational log for historical tracking and trend analysis.",
    actions: ["document"],
  },
] as const;

const universalFinancialTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-fin-01",
    title: "Review Daily Revenue",
    department: "universal",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["daily_revenue"],
    description: "Pull revenue data from billing and payment systems. Compare against daily and monthly targets.",
    actions: ["review"],
  },
  {
    id: "uni-fin-02",
    title: "Review Daily Expenses",
    department: "universal",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "09:30",
    metric_keys: ["daily_expenses"],
    description: "Catalog all expenses processed today. Flag any unusual or unapproved expenditures.",
    actions: ["review"],
  },
  {
    id: "uni-fin-03",
    title: "Summarize Net Position",
    department: "universal",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["daily_net"],
    description: "Calculate net financial position for the day. Summarize cash flow status and working capital impact.",
    actions: ["summarize"],
  },
  {
    id: "uni-fin-04",
    title: "Report Budget Variances",
    department: "universal",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["budget_variances"],
    description: "Compare actual spend against budget allocations by department. Flag variances exceeding 10%.",
    actions: ["report"],
  },
  {
    id: "uni-fin-05",
    title: "Document in Financial Log",
    department: "universal",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["financial_docs_updated"],
    description: "Persist all financial data points and notes into the daily financial log for audit trail.",
    actions: ["document"],
  },
] as const;

const universalSatisfactionTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "uni-sat-01",
    title: "Send Pulse Surveys",
    department: "universal",
    assigned_agent_slug: "listen",
    category: "satisfaction",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["satisfaction_surveys_sent"],
    description: "Distribute quick pulse surveys to team members to gauge daily sentiment and engagement levels.",
    actions: ["send"],
  },
  {
    id: "uni-sat-02",
    title: "Document Responses",
    department: "universal",
    assigned_agent_slug: "listen",
    category: "satisfaction",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["satisfaction_responses"],
    description: "Collect and record all survey responses. Categorize feedback by theme and department.",
    actions: ["document"],
  },
  {
    id: "uni-sat-03",
    title: "Summarize Team Morale",
    department: "universal",
    assigned_agent_slug: "listen",
    category: "satisfaction",
    frequency: "daily",
    due_time: "15:00",
    metric_keys: ["morale_score"],
    description: "Aggregate satisfaction data into a composite morale score. Compare against rolling averages.",
    actions: ["summarize"],
  },
  {
    id: "uni-sat-04",
    title: "Report Concerns",
    department: "universal",
    assigned_agent_slug: "listen",
    category: "satisfaction",
    frequency: "daily",
    due_time: "15:30",
    metric_keys: ["morale_escalations"],
    description: "Escalate any critical team concerns, burnout signals, or dissatisfaction flags to leadership.",
    actions: ["report"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   MARKETING TEMPLATES (department: "marketing")
   ═══════════════════════════════════════════════════════════════════ */

const marketingTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "mkt-sm-01",
    title: "Publish to Facebook",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["fb_posts_published", "fb_engagement"],
    description: "Create and publish daily Facebook content aligned with content calendar. Monitor initial engagement.",
    actions: ["send", "review"],
  },
  {
    id: "mkt-sm-02",
    title: "Publish to Instagram",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["ig_posts_published", "ig_engagement"],
    description: "Post curated visual content to Instagram feed and stories. Use relevant hashtags and location tags.",
    actions: ["send", "review"],
  },
  {
    id: "mkt-sm-03",
    title: "Publish to LinkedIn",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "08:30",
    metric_keys: ["li_posts_published", "li_engagement"],
    description: "Share professional thought-leadership content on LinkedIn. Engage with industry discussions.",
    actions: ["send", "review"],
  },
  {
    id: "mkt-sm-04",
    title: "Publish to TikTok / Reels",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "12:00",
    metric_keys: ["tiktok_posts_published", "tiktok_views"],
    description: "Upload short-form video content to TikTok and Instagram Reels. Optimize for algorithm reach.",
    actions: ["send", "review"],
  },
  {
    id: "mkt-sm-05",
    title: "Publish to X (Twitter)",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["x_posts_published", "x_engagement"],
    description: "Post timely updates and engage in relevant conversations on X. Monitor mentions and replies.",
    actions: ["send", "review"],
  },
  {
    id: "mkt-sm-06",
    title: "Review & Reply to Community Comments",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["comments_replied", "sentiment_score"],
    description: "Monitor all social media comments across platforms. Respond to questions, acknowledge feedback, and escalate complaints.",
    actions: ["read", "reply", "send"],
  },
  {
    id: "mkt-sm-07",
    title: "Social Media Analytics Report",
    department: "marketing",
    assigned_agent_slug: "grace",
    category: "social_media",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["total_reach", "total_engagement_rate"],
    description: "Compile cross-platform social media performance metrics. Identify top-performing content and trending topics.",
    actions: ["summarize", "report"],
  },
  {
    id: "mkt-ads-01",
    title: "Review Paid Ad Performance",
    department: "marketing",
    assigned_agent_slug: "beacon",
    category: "sales",
    frequency: "daily",
    due_time: "09:30",
    metric_keys: ["ad_spend", "ad_roas", "ad_clicks"],
    description: "Audit all active ad campaigns across Google Ads, Meta, and LinkedIn. Check ROAS, CPC, and conversion rates.",
    actions: ["review", "report"],
  },
  {
    id: "mkt-email-01",
    title: "Review Email Campaign Metrics",
    department: "marketing",
    assigned_agent_slug: "ember",
    category: "email",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["email_open_rate", "email_click_rate", "email_unsubscribes"],
    description: "Analyze performance of active email campaigns. Track open rates, click-through rates, and unsubscribe trends.",
    actions: ["review", "summarize"],
  },
  {
    id: "mkt-funnel-01",
    title: "Review Marketing Funnel",
    department: "marketing",
    assigned_agent_slug: "camila",
    category: "sales",
    frequency: "daily",
    due_time: "10:30",
    metric_keys: ["funnel_visitors", "funnel_leads", "funnel_conversions"],
    description: "Analyze the full marketing funnel from awareness to conversion. Identify drop-off points and optimization opportunities.",
    actions: ["review", "summarize", "report"],
  },
  {
    id: "mkt-outreach-01",
    title: "Community Outreach Touchpoints",
    department: "marketing",
    assigned_agent_slug: "gather",
    category: "outreach",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["outreach_contacts", "outreach_responses"],
    description: "Execute planned community outreach activities. Follow up with local organizations, churches, and healthcare partners.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "mkt-content-01",
    title: "Content Production Pipeline",
    department: "marketing",
    assigned_agent_slug: "camila",
    category: "operations",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["content_pieces_in_progress", "content_published"],
    description: "Review content pipeline status. Ensure blog posts, videos, and graphics are on schedule.",
    actions: ["review", "report"],
  },
  {
    id: "mkt-seo-01",
    title: "SEO & Website Analytics",
    department: "marketing",
    assigned_agent_slug: "roots",
    category: "kpi",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["organic_traffic", "keyword_rankings", "page_views"],
    description: "Pull website analytics and SEO metrics. Monitor organic traffic trends, keyword positions, and page performance.",
    actions: ["review", "summarize"],
  },
  {
    id: "mkt-research-01",
    title: "Market Research Scan",
    department: "marketing",
    assigned_agent_slug: "haven",
    category: "operations",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["research_insights_found"],
    description: "Scan industry news, competitor activity, and market trends. Flag relevant developments for strategy team.",
    actions: ["search", "scrape", "summarize"],
  },
  {
    id: "mkt-grant-01",
    title: "Search Government Grants",
    department: "marketing",
    assigned_agent_slug: "haven",
    category: "grants",
    frequency: "weekly",
    due_time: "10:00",
    metric_keys: ["grants_found", "grants_eligible"],
    description: "Search federal, state, and local grant databases for hospice and healthcare funding opportunities.",
    actions: ["search", "scrape", "review"],
  },
  {
    id: "mkt-grant-02",
    title: "Score & Apply for Grants",
    department: "marketing",
    assigned_agent_slug: "haven",
    category: "grants",
    frequency: "weekly",
    due_time: "14:00",
    metric_keys: ["grants_scored", "grant_applications_submitted"],
    description: "Evaluate eligible grants by fit, amount, and probability. Prepare and submit applications for top candidates.",
    actions: ["score", "apply", "document"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   CLINICAL OPERATIONS TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const clinicalTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "clin-01",
    title: "Patient Census Review",
    department: "clinical-operations",
    assigned_agent_slug: "dr-elena",
    category: "clinical",
    frequency: "daily",
    due_time: "07:00",
    metric_keys: ["active_patients", "new_admissions", "discharges"],
    description: "Review current patient census. Track new admissions, discharges, and any status changes across all care locations.",
    actions: ["review", "summarize"],
  },
  {
    id: "clin-02",
    title: "Care Plan Compliance Check",
    department: "clinical-operations",
    assigned_agent_slug: "nurse-riley",
    category: "clinical",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["care_plans_reviewed", "care_plans_compliant"],
    description: "Audit active care plans for completeness, timeliness, and regulatory compliance. Flag overdue updates.",
    actions: ["review", "report"],
  },
  {
    id: "clin-03",
    title: "Medication Administration Review",
    department: "clinical-operations",
    assigned_agent_slug: "solace",
    category: "clinical",
    frequency: "daily",
    due_time: "08:30",
    metric_keys: ["medications_reviewed", "medication_issues"],
    description: "Verify medication administration records for accuracy and timeliness. Report any discrepancies or missed doses.",
    actions: ["review", "report"],
  },
  {
    id: "clin-04",
    title: "Symptom Management Tracking",
    department: "clinical-operations",
    assigned_agent_slug: "solace",
    category: "clinical",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["symptoms_tracked", "pain_scores_avg"],
    description: "Track patient symptom levels and pain scores. Escalate uncontrolled symptoms to physician for intervention.",
    actions: ["review", "document", "report"],
  },
  {
    id: "clin-05",
    title: "Spiritual & Emotional Care Rounds",
    department: "clinical-operations",
    assigned_agent_slug: "spirit",
    category: "clinical",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["spiritual_visits_completed", "emotional_support_sessions"],
    description: "Conduct spiritual care visits and emotional support sessions with patients and families.",
    actions: ["review", "document"],
  },
  {
    id: "clin-06",
    title: "Social Work Case Review",
    department: "clinical-operations",
    assigned_agent_slug: "harmony",
    category: "clinical",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["cases_reviewed", "referrals_made"],
    description: "Review active social work cases. Process referrals, coordinate community resources, and update care plans.",
    actions: ["review", "document", "follow_up"],
  },
  {
    id: "clin-07",
    title: "Bereavement Program Follow-ups",
    department: "clinical-operations",
    assigned_agent_slug: "bereavement",
    category: "clinical",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["bereavement_calls_made", "bereavement_contacts"],
    description: "Execute scheduled bereavement follow-up calls and mailings per the 13-month bereavement program.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "clin-08",
    title: "Clinical Outcomes Report",
    department: "clinical-operations",
    assigned_agent_slug: "dr-elena",
    category: "clinical",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["clinical_incidents", "quality_scores"],
    description: "Compile daily clinical outcomes including incidents, quality metrics, and patient satisfaction indicators.",
    actions: ["summarize", "report", "document"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   ADMISSIONS & INTAKE TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const admissionsTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "adm-01",
    title: "New Referral Processing",
    department: "admissions-intake",
    assigned_agent_slug: "river",
    category: "operations",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["new_referrals", "referrals_processed"],
    description: "Process all incoming referrals. Verify patient information, insurance eligibility, and clinical appropriateness.",
    actions: ["read", "parse", "review"],
  },
  {
    id: "adm-02",
    title: "Intake Assessment Scheduling",
    department: "admissions-intake",
    assigned_agent_slug: "bridge",
    category: "operations",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["assessments_scheduled", "assessments_completed"],
    description: "Schedule and coordinate clinical intake assessments. Confirm times with patients, families, and clinicians.",
    actions: ["review", "send", "document"],
  },
  {
    id: "adm-03",
    title: "Insurance Verification Queue",
    department: "admissions-intake",
    assigned_agent_slug: "verify",
    category: "operations",
    frequency: "daily",
    due_time: "08:30",
    metric_keys: ["verifications_completed", "verification_issues"],
    description: "Process pending insurance verifications. Confirm Medicare/Medicaid eligibility, benefits, and authorization requirements.",
    actions: ["review", "document", "report"],
  },
  {
    id: "adm-04",
    title: "Clinical Intake Nurse Assessments",
    department: "admissions-intake",
    assigned_agent_slug: "triage",
    category: "clinical",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["intake_assessments_done", "hospice_eligible"],
    description: "Perform clinical intake assessments for new patient referrals. Determine hospice eligibility and care needs.",
    actions: ["review", "document", "report"],
  },
  {
    id: "adm-05",
    title: "Referral Source Follow-up",
    department: "admissions-intake",
    assigned_agent_slug: "river",
    category: "outreach",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["referral_followups_sent", "referral_source_contacts"],
    description: "Follow up with referral sources (hospitals, physicians, SNFs) on pending and recent referrals.",
    actions: ["send", "follow_up"],
  },
  {
    id: "adm-06",
    title: "Pending Admissions Tracker",
    department: "admissions-intake",
    assigned_agent_slug: "bridge",
    category: "operations",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["pending_admissions", "admission_blockers"],
    description: "Review all pending admissions and identify blockers. Escalate stalled cases for resolution.",
    actions: ["review", "report"],
  },
  {
    id: "adm-07",
    title: "Family Communication Touchpoints",
    department: "admissions-intake",
    assigned_agent_slug: "bridge",
    category: "outreach",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["family_calls_made", "family_satisfaction"],
    description: "Contact families of patients in the intake process. Provide updates, answer questions, and ease anxiety.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "adm-08",
    title: "Admissions Conversion Report",
    department: "admissions-intake",
    assigned_agent_slug: "river",
    category: "kpi",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["admission_rate", "referral_to_admit_days"],
    description: "Generate daily admission conversion metrics: referral-to-admit time, conversion rate, and pipeline health.",
    actions: ["summarize", "report"],
  },
  {
    id: "adm-09",
    title: "Document Intake Activity",
    department: "admissions-intake",
    assigned_agent_slug: "river",
    category: "compliance",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["intake_docs_completed"],
    description: "Ensure all intake documentation is complete, accurate, and filed according to regulatory requirements.",
    actions: ["document", "review"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   CAREGIVER STAFFING TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const staffingTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "staff-01",
    title: "Daily Shift Coverage Review",
    department: "caregiver-staffing",
    assigned_agent_slug: "shift",
    category: "operations",
    frequency: "daily",
    due_time: "06:00",
    metric_keys: ["shifts_covered", "shifts_open", "coverage_rate"],
    description: "Verify all shifts are covered for today and tomorrow. Identify and fill any gaps immediately.",
    actions: ["review", "report"],
  },
  {
    id: "staff-02",
    title: "Callout & No-Show Management",
    department: "caregiver-staffing",
    assigned_agent_slug: "shift",
    category: "operations",
    frequency: "daily",
    due_time: "07:00",
    metric_keys: ["callouts_today", "replacements_found"],
    description: "Process caregiver callouts and no-shows. Activate backup staffing protocols and fill vacancies.",
    actions: ["read", "send", "follow_up"],
  },
  {
    id: "staff-03",
    title: "Recruitment Pipeline Review",
    department: "caregiver-staffing",
    assigned_agent_slug: "recruit",
    category: "recruitment",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["new_applicants", "interviews_scheduled", "offers_pending"],
    description: "Review recruitment pipeline: new applications, interview schedules, background checks in progress, pending offers.",
    actions: ["review", "summarize"],
  },
  {
    id: "staff-04",
    title: "Job Board Posting & Scraping",
    department: "caregiver-staffing",
    assigned_agent_slug: "recruit",
    category: "recruitment",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["job_posts_active", "candidates_scraped"],
    description: "Refresh job postings across Indeed, LinkedIn, ZipRecruiter. Scrape for qualified candidates matching open roles.",
    actions: ["search", "scrape", "send"],
  },
  {
    id: "staff-05",
    title: "Caregiver Credential Tracking",
    department: "caregiver-staffing",
    assigned_agent_slug: "train",
    category: "compliance",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["creds_expiring_30d", "creds_expired"],
    description: "Monitor caregiver certifications, licenses, and training expirations. Alert caregivers with 30-day reminders.",
    actions: ["review", "send", "report"],
  },
  {
    id: "staff-06",
    title: "Training Completion Tracking",
    department: "caregiver-staffing",
    assigned_agent_slug: "train",
    category: "operations",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["trainings_due", "trainings_completed"],
    description: "Track mandatory and optional training completion rates. Follow up with caregivers behind on requirements.",
    actions: ["review", "follow_up", "document"],
  },
  {
    id: "staff-07",
    title: "Employee Relations Check-in",
    department: "caregiver-staffing",
    assigned_agent_slug: "retain",
    category: "satisfaction",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["retention_touchpoints", "grievances_logged"],
    description: "Conduct proactive check-ins with caregivers. Address concerns, log grievances, and track retention risk factors.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "staff-08",
    title: "Overtime & Hours Analysis",
    department: "caregiver-staffing",
    assigned_agent_slug: "shift",
    category: "financial",
    frequency: "daily",
    due_time: "15:00",
    metric_keys: ["overtime_hours", "total_labor_hours"],
    description: "Analyze daily labor hours and overtime usage. Flag excessive overtime and recommend schedule adjustments.",
    actions: ["review", "report"],
  },
  {
    id: "staff-09",
    title: "Staffing KPI Dashboard Update",
    department: "caregiver-staffing",
    assigned_agent_slug: "terra",
    category: "kpi",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["staffing_ratio", "turnover_rate_mtd", "time_to_fill"],
    description: "Update staffing KPI dashboard with daily metrics: ratios, turnover, time-to-fill, and satisfaction scores.",
    actions: ["summarize", "report", "document"],
  },
  {
    id: "staff-10",
    title: "Next-Day Schedule Confirmation",
    department: "caregiver-staffing",
    assigned_agent_slug: "shift",
    category: "operations",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["schedules_confirmed"],
    description: "Send schedule confirmations to all caregivers working tomorrow. Verify acknowledgment of shifts.",
    actions: ["send", "follow_up"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMER EXPERIENCE TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const cxTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "cx-01",
    title: "Family Satisfaction Check-ins",
    department: "customer-experience",
    assigned_agent_slug: "embrace",
    category: "satisfaction",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["family_checkins_completed", "family_satisfaction_score"],
    description: "Conduct scheduled satisfaction check-ins with patient families. Record feedback and address immediate concerns.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "cx-02",
    title: "Review & Respond to Online Reviews",
    department: "customer-experience",
    assigned_agent_slug: "memory",
    category: "social_media",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["reviews_received", "reviews_responded", "avg_rating"],
    description: "Monitor Google, Yelp, and healthcare review sites. Respond professionally to all new reviews within 24 hours.",
    actions: ["read", "reply", "send"],
  },
  {
    id: "cx-03",
    title: "Referral Program Outreach",
    department: "customer-experience",
    assigned_agent_slug: "gratitude",
    category: "outreach",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["referral_requests_sent", "referrals_received"],
    description: "Reach out to satisfied families for referrals. Track referral program participation and conversion.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "cx-04",
    title: "Engagement Content Distribution",
    department: "customer-experience",
    assigned_agent_slug: "reflect",
    category: "social_media",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["content_pieces_shared", "engagement_rate"],
    description: "Distribute educational and supportive content to families: articles, resources, coping guides, and community events.",
    actions: ["send", "document"],
  },
  {
    id: "cx-05",
    title: "Complaint Resolution Tracking",
    department: "customer-experience",
    assigned_agent_slug: "serenity",
    category: "operations",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["open_complaints", "complaints_resolved", "avg_resolution_time"],
    description: "Review all open complaints. Ensure resolution within SLA. Escalate aging complaints to leadership.",
    actions: ["review", "follow_up", "report"],
  },
  {
    id: "cx-06",
    title: "Feedback & Insights Analysis",
    department: "customer-experience",
    assigned_agent_slug: "listen",
    category: "kpi",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["nps_score", "feedback_themes_identified"],
    description: "Analyze aggregated feedback data. Identify recurring themes, improvement opportunities, and success patterns.",
    actions: ["summarize", "report"],
  },
  {
    id: "cx-07",
    title: "CX Daily Summary Report",
    department: "customer-experience",
    assigned_agent_slug: "serenity",
    category: "kpi",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["cx_score_daily", "touchpoints_total"],
    description: "Compile customer experience daily summary: satisfaction scores, complaint status, engagement metrics, and highlights.",
    actions: ["summarize", "report", "document"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   COMPLIANCE & QUALITY TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const complianceTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "comp-01",
    title: "Regulatory Update Scan",
    department: "compliance-quality",
    assigned_agent_slug: "guardian",
    category: "compliance",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["regulatory_updates_found", "action_items_created"],
    description: "Scan CMS, state health department, and accreditation body updates for regulatory changes affecting operations.",
    actions: ["search", "review", "report"],
  },
  {
    id: "comp-02",
    title: "Medical Records Audit",
    department: "compliance-quality",
    assigned_agent_slug: "chart",
    category: "compliance",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["records_audited", "records_compliant", "deficiencies_found"],
    description: "Audit a sample of medical records for completeness, accuracy, and regulatory compliance. Flag deficiencies.",
    actions: ["review", "score", "report"],
  },
  {
    id: "comp-03",
    title: "HIPAA Compliance Monitoring",
    department: "compliance-quality",
    assigned_agent_slug: "shield-agent",
    category: "compliance",
    frequency: "daily",
    due_time: "08:30",
    metric_keys: ["hipaa_incidents", "access_audits_completed"],
    description: "Monitor PHI access logs, review security incidents, and verify HIPAA compliance across all systems.",
    actions: ["review", "report", "document"],
  },
  {
    id: "comp-04",
    title: "Quality Improvement Metrics",
    department: "compliance-quality",
    assigned_agent_slug: "quality",
    category: "kpi",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["qi_metrics_collected", "quality_score"],
    description: "Collect and analyze quality improvement metrics: QAPI indicators, patient outcomes, and process adherence rates.",
    actions: ["review", "summarize", "document"],
  },
  {
    id: "comp-05",
    title: "Incident Report Processing",
    department: "compliance-quality",
    assigned_agent_slug: "justice",
    category: "compliance",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["incidents_reported", "incidents_resolved"],
    description: "Process all new incident reports. Ensure proper documentation, investigation initiation, and corrective actions.",
    actions: ["review", "document", "follow_up"],
  },
  {
    id: "comp-06",
    title: "Compliance Daily Summary",
    department: "compliance-quality",
    assigned_agent_slug: "justice",
    category: "compliance",
    frequency: "daily",
    due_time: "16:00",
    metric_keys: ["compliance_score_daily", "open_findings"],
    description: "Summarize daily compliance posture: open findings, audit results, incident status, and regulatory action items.",
    actions: ["summarize", "report"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   ACCOUNTING & FINANCE TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const financeTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "fin-01",
    title: "Claims & Billing Processing",
    department: "accounting-finance",
    assigned_agent_slug: "harvest",
    category: "financial",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["claims_submitted", "claims_pending", "claims_denied"],
    description: "Process Medicare/Medicaid claims submissions. Track pending claims and investigate denials for resubmission.",
    actions: ["review", "send", "document"],
  },
  {
    id: "fin-02",
    title: "Accounts Payable Processing",
    department: "accounting-finance",
    assigned_agent_slug: "provision",
    category: "financial",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["invoices_processed", "payments_scheduled"],
    description: "Process vendor invoices, verify approvals, and schedule payments. Maintain AP aging within acceptable ranges.",
    actions: ["review", "document"],
  },
  {
    id: "fin-03",
    title: "Revenue Cycle Dashboard",
    department: "accounting-finance",
    assigned_agent_slug: "harvest",
    category: "kpi",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["days_in_ar", "collection_rate", "denial_rate"],
    description: "Update revenue cycle metrics: days in AR, collection rate, denial rate, and clean claim percentage.",
    actions: ["review", "summarize", "report"],
  },
  {
    id: "fin-04",
    title: "Bookkeeping & Reconciliation",
    department: "accounting-finance",
    assigned_agent_slug: "nurture",
    category: "financial",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["transactions_reconciled", "discrepancies_found"],
    description: "Record daily transactions and reconcile bank accounts. Investigate and resolve any discrepancies.",
    actions: ["review", "document"],
  },
  {
    id: "fin-05",
    title: "Payroll Hours Verification",
    department: "accounting-finance",
    assigned_agent_slug: "pledge",
    category: "financial",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["timesheets_verified", "payroll_discrepancies"],
    description: "Verify submitted timesheets against schedules. Flag discrepancies for caregiver staffing review.",
    actions: ["review", "report"],
  },
  {
    id: "fin-06",
    title: "Tax & Compliance Calendar",
    department: "accounting-finance",
    assigned_agent_slug: "foundation",
    category: "compliance",
    frequency: "daily",
    due_time: "08:00",
    metric_keys: ["tax_deadlines_upcoming", "filings_due"],
    description: "Review upcoming tax deadlines, filing requirements, and entity compliance obligations. Prepare as needed.",
    actions: ["review", "report"],
  },
  {
    id: "fin-07",
    title: "Finance Daily Summary",
    department: "accounting-finance",
    assigned_agent_slug: "steward",
    category: "financial",
    frequency: "daily",
    due_time: "17:00",
    metric_keys: ["daily_cash_position", "outstanding_ar", "outstanding_ap"],
    description: "Produce daily financial summary: cash position, AR/AP status, revenue vs. budget, and key financial alerts.",
    actions: ["summarize", "report", "document"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   EXECUTIVE TEMPLATES
   ═══════════════════════════════════════════════════════════════════ */

const executiveTemplates: readonly DailyTaskTemplate[] = [
  {
    id: "exec-01",
    title: "CEO Morning Briefing",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "07:00",
    metric_keys: ["briefing_items", "critical_alerts"],
    description: "Compile overnight developments, critical alerts, and key metrics into a concise CEO morning briefing.",
    actions: ["summarize", "report"],
  },
  {
    id: "exec-02",
    title: "Cross-Department Status Sync",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "meetings",
    frequency: "daily",
    due_time: "09:00",
    metric_keys: ["departments_reporting", "blockers_identified"],
    description: "Gather status updates from all department directors. Identify cross-department blockers and dependencies.",
    actions: ["review", "summarize", "report"],
  },
  {
    id: "exec-03",
    title: "Strategic Initiative Tracking",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "operations",
    frequency: "daily",
    due_time: "10:00",
    metric_keys: ["initiatives_on_track", "initiatives_at_risk"],
    description: "Review progress on active strategic initiatives. Flag at-risk items and reallocate resources as needed.",
    actions: ["review", "report"],
  },
  {
    id: "exec-04",
    title: "Stakeholder Communication",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "outreach",
    frequency: "daily",
    due_time: "11:00",
    metric_keys: ["stakeholder_touchpoints"],
    description: "Manage communications with co-founder, board, investors, and key external stakeholders.",
    actions: ["send", "follow_up", "document"],
  },
  {
    id: "exec-05",
    title: "Risk & Escalation Review",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "compliance",
    frequency: "daily",
    due_time: "14:00",
    metric_keys: ["risks_identified", "escalations_resolved"],
    description: "Review all escalated issues and organizational risks. Make decisions on critical matters requiring CEO intervention.",
    actions: ["review", "report", "document"],
  },
  {
    id: "exec-06",
    title: "CEO End-of-Day Summary",
    department: "executive",
    assigned_agent_slug: "diane",
    category: "kpi",
    frequency: "daily",
    due_time: "18:00",
    metric_keys: ["decisions_made", "tasks_delegated", "eod_score"],
    description: "Compile comprehensive end-of-day summary: decisions made, tasks delegated, metrics performance, and next-day priorities.",
    actions: ["summarize", "report", "document"],
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   COMBINED TEMPLATE LIBRARY
   ═══════════════════════════════════════════════════════════════════ */

export const dailyTaskTemplates: readonly DailyTaskTemplate[] = [
  ...universalEmailTemplates,
  ...universalDmTemplates,
  ...universalCalendarTemplates,
  ...universalMeetingTemplates,
  ...universalKpiTemplates,
  ...universalFinancialTemplates,
  ...universalSatisfactionTemplates,
  ...marketingTemplates,
  ...clinicalTemplates,
  ...admissionsTemplates,
  ...staffingTemplates,
  ...cxTemplates,
  ...complianceTemplates,
  ...financeTemplates,
  ...executiveTemplates,
] as const;

/* ═══════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════ */

export function getTemplatesByDepartment(
  dept: string
): readonly DailyTaskTemplate[] {
  return dailyTaskTemplates.filter((t) => t.department === dept);
}

export function getUniversalTemplates(): readonly DailyTaskTemplate[] {
  return dailyTaskTemplates.filter((t) => t.department === "universal");
}

/**
 * Generate daily task instances from templates for a given date.
 * Weekly tasks only appear on Mondays; monthly tasks only on the 1st.
 */
export function generateDailyTasks(
  date: Date,
  dept?: string
): readonly DailyTaskInstance[] {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const dateStr = date.toISOString().split("T")[0] ?? "";

  const templates =
    dept !== undefined
      ? dailyTaskTemplates.filter(
          (t) => t.department === dept || t.department === "universal"
        )
      : dailyTaskTemplates;

  return templates
    .filter((t) => {
      if (t.frequency === "daily") return true;
      if (t.frequency === "weekly") return dayOfWeek === 1;
      if (t.frequency === "monthly") return dayOfMonth === 1;
      return false;
    })
    .map((t) => ({
      id: `${t.id}-${dateStr}`,
      template_id: t.id,
      title: t.title,
      department: t.department,
      assigned_agent_slug: t.assigned_agent_slug,
      category: t.category,
      due_time: t.due_time,
      metric_keys: t.metric_keys,
      description: t.description,
      actions: t.actions,
      date: dateStr,
      completed: false,
      completed_at: null,
      completed_by: null,
      metric_values: {},
      is_custom: false,
    }));
}

/** Map department slugs to their director agent for universal task assignment. */
export const DEPT_DIRECTOR_MAP: Readonly<Record<string, string>> = {
  executive: "diane",
  marketing: "camila",
  "clinical-operations": "dr-elena",
  "admissions-intake": "river",
  "caregiver-staffing": "terra",
  "customer-experience": "serenity",
  "compliance-quality": "justice",
  "accounting-finance": "steward",
} as const;

/** Get all unique categories present in templates. */
export function getAllCategories(): readonly TaskCategory[] {
  const cats = new Set<TaskCategory>();
  for (const t of dailyTaskTemplates) {
    cats.add(t.category);
  }
  return [...cats] as const;
}

/** Get template count by department (including universal). */
export function getTemplateCountByDepartment(): Readonly<
  Record<string, number>
> {
  const counts: Record<string, number> = {};
  for (const t of dailyTaskTemplates) {
    counts[t.department] = (counts[t.department] ?? 0) + 1;
  }
  return counts;
}
