import type { Agent, AgentStatus } from "@/types";

function makeAgent(
  slug: string,
  name: string,
  role: string,
  department: string,
  tier: "orchestrator" | "director" | "specialist",
  parentSlug: string | null,
  status: AgentStatus = "idle"
): Agent {
  return {
    id: slug,
    slug,
    name,
    role,
    department,
    tier,
    parent_agent_id: parentSlug,
    status,
    last_seen_at: new Date(
      Date.now() - Math.floor(Math.random() * 86400000)
    ).toISOString(),
    avatar_url: null,
    soul_file_path: `souls/${slug}.soul.md`,
    config: {},
    created_at: "2026-03-06T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

export const agentsHaa: Agent[] = [
  // Executive
  makeAgent("maxwell", "Maxwell", "CEO", "executive", "orchestrator", null, "active"),

  // Marketing (Diana + 5)
  makeAgent("diana", "Diana", "Marketing Director", "marketing", "director", "maxwell", "active"),
  makeAgent("iris", "Iris", "Market Research Specialist", "marketing", "specialist", "diana", "idle"),
  makeAgent("rex", "Rex", "Paid Ads Specialist", "marketing", "specialist", "diana", "executing"),
  makeAgent("finn", "Finn", "SEO Specialist", "marketing", "specialist", "diana", "idle"),
  makeAgent("lyra", "Lyra", "Email Marketing Specialist", "marketing", "specialist", "diana", "active"),
  makeAgent("piper-haa", "Piper", "Webinar Coordinator", "marketing", "specialist", "diana", "idle"),

  // Content (Jordan + 6)
  makeAgent("jordan", "Jordan", "Content Director", "content", "director", "maxwell", "active"),
  makeAgent("blaze-haa", "Blaze", "Short-Form Video Specialist", "content", "specialist", "jordan", "active"),
  makeAgent("lennox", "Lennox", "Long-Form Video Specialist", "content", "specialist", "jordan", "idle"),
  makeAgent("wren-haa", "Wren", "Blog & Written Content Specialist", "content", "specialist", "jordan", "executing"),
  makeAgent("lux", "Lux", "Graphic Designer", "content", "specialist", "jordan", "active"),
  makeAgent("cleo", "Cleo", "Social Media Manager", "content", "specialist", "jordan", "active"),
  makeAgent("spark", "Spark", "Community Manager", "content", "specialist", "jordan", "idle"),

  // Sales (Victor + 4)
  makeAgent("victor", "Victor", "Sales Director", "sales", "director", "maxwell", "active"),
  makeAgent("cassidy", "Cassidy", "Sales Copywriter", "sales", "specialist", "victor", "idle"),
  makeAgent("drake", "Drake", "Sales Development Rep", "sales", "specialist", "victor", "active"),
  makeAgent("vera", "Vera", "Enrollment Specialist", "sales", "specialist", "victor", "executing"),
  makeAgent("trace", "Trace", "CRM Admin", "sales", "specialist", "victor", "idle"),

  // Product (Priya + 3)
  makeAgent("priya", "Priya", "Product Director", "product", "director", "maxwell", "active"),
  makeAgent("milo", "Milo", "Curriculum Developer", "product", "specialist", "priya", "active"),
  makeAgent("nora", "Nora", "Assessment Designer", "product", "specialist", "priya", "idle"),
  makeAgent("remy", "Remy", "LMS Administrator", "product", "specialist", "priya", "idle"),

  // Operations (Sterling + 3)
  makeAgent("sterling-haa", "Sterling", "Operations Director", "operations", "director", "maxwell", "active"),
  makeAgent("skye", "Skye", "Student Onboarding Specialist", "operations", "specialist", "sterling-haa", "active"),
  makeAgent("knox", "Knox", "Platform Manager", "operations", "specialist", "sterling-haa", "idle"),
  makeAgent("bree", "Bree", "Customer Support Rep", "operations", "specialist", "sterling-haa", "active"),

  // Risk & Compliance
  makeAgent("vesper-haa", "Vesper", "Risk Analyst", "compliance", "specialist", "maxwell", "active"),

  // Accounting & Finance (Aspen + 3)
  makeAgent("aspen", "Aspen", "CFO / Finance Director", "accounting-finance", "director", "maxwell", "active"),
  makeAgent("cedar", "Cedar", "Bookkeeper & AP/AR Specialist", "accounting-finance", "specialist", "aspen", "active"),
  makeAgent("quartz", "Quartz", "Tax & Entity Compliance", "accounting-finance", "specialist", "aspen", "idle"),
  makeAgent("summit-haa", "Summit", "Financial Reporting & Planning", "accounting-finance", "specialist", "aspen", "idle"),

  // Customer Experience (Celeste + 5)
  makeAgent("celeste", "Celeste", "CX Director", "customer-experience", "director", "maxwell", "active"),
  makeAgent("haven-haa", "Haven", "Student Success Manager", "customer-experience", "specialist", "celeste", "active"),
  makeAgent("echo-haa", "Echo", "Review & Reputation Specialist", "customer-experience", "specialist", "celeste", "idle"),
  makeAgent("dash", "Dash", "Referral Program Coordinator", "customer-experience", "specialist", "celeste", "idle"),
  makeAgent("rue", "Rue", "Engagement Content Specialist", "customer-experience", "specialist", "celeste", "active"),
  makeAgent("vex", "Vex", "Feedback & Insights Analyst", "customer-experience", "specialist", "celeste", "idle"),
];
