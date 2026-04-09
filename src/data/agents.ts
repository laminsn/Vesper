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

export const agents: Agent[] = [
  // Executive
  makeAgent("diane", "Diane", "CEO", "executive", "orchestrator", null, "active"),

  // Marketing (Camila + 6)
  makeAgent("camila", "Camila", "Marketing Director", "marketing", "director", "diane", "active"),
  makeAgent("haven", "Haven", "Market Research Specialist", "marketing", "specialist", "camila", "idle"),
  makeAgent("beacon", "Beacon", "Paid Ads Specialist", "marketing", "specialist", "camila", "executing"),
  makeAgent("roots", "Roots", "SEO Specialist", "marketing", "specialist", "camila", "idle"),
  makeAgent("ember", "Ember", "Email Marketing Specialist", "marketing", "specialist", "camila", "active"),
  makeAgent("gather", "Gather", "Event Coordinator", "marketing", "specialist", "camila", "idle"),
  makeAgent("grace", "Grace", "Community Manager", "marketing", "specialist", "camila", "active"),

  // Clinical Operations (Dr. Elena + 6)
  makeAgent("dr-elena", "Dr. Elena", "Clinical Director", "clinical-operations", "director", "diane", "active"),
  makeAgent("nurse-riley", "Nurse Riley", "Director of Nursing", "clinical-operations", "specialist", "dr-elena", "active"),
  makeAgent("solace", "Solace", "Hospice Nurse (RN)", "clinical-operations", "specialist", "nurse-riley", "executing"),
  makeAgent("comfort", "Comfort", "Certified Nursing Assistant", "clinical-operations", "specialist", "nurse-riley", "active"),
  makeAgent("spirit", "Spirit", "Chaplain / Spiritual Care", "clinical-operations", "specialist", "dr-elena", "idle"),
  makeAgent("harmony", "Harmony", "Social Worker (MSW)", "clinical-operations", "specialist", "dr-elena", "active"),
  makeAgent("bereavement", "Bereavement", "Bereavement Coordinator", "clinical-operations", "specialist", "dr-elena", "idle"),

  // Admissions & Intake (River + 3)
  makeAgent("river", "River", "Admissions Director", "admissions-intake", "director", "diane", "active"),
  makeAgent("bridge", "Bridge", "Intake Coordinator", "admissions-intake", "specialist", "river", "executing"),
  makeAgent("verify", "Verify", "Insurance & Eligibility Specialist", "admissions-intake", "specialist", "river", "active"),
  makeAgent("triage", "Triage", "Clinical Intake Nurse", "admissions-intake", "specialist", "river", "idle"),

  // Caregiver Staffing (Terra + 4)
  makeAgent("terra", "Terra", "Staffing Director", "caregiver-staffing", "director", "diane", "active"),
  makeAgent("recruit", "Recruit", "Caregiver Recruiter", "caregiver-staffing", "specialist", "terra", "active"),
  makeAgent("shift", "Shift", "Scheduling Coordinator", "caregiver-staffing", "specialist", "terra", "executing"),
  makeAgent("train", "Train", "Training & Development", "caregiver-staffing", "specialist", "terra", "idle"),
  makeAgent("retain", "Retain", "Employee Relations", "caregiver-staffing", "specialist", "terra", "idle"),

  // Customer Experience (Serenity + 5)
  makeAgent("serenity", "Serenity", "CX Director", "customer-experience", "director", "diane", "active"),
  makeAgent("embrace", "Embrace", "Family Success Manager", "customer-experience", "specialist", "serenity", "active"),
  makeAgent("memory", "Memory", "Review & Testimonial Specialist", "customer-experience", "specialist", "serenity", "idle"),
  makeAgent("gratitude", "Gratitude", "Referral Coordinator", "customer-experience", "specialist", "serenity", "idle"),
  makeAgent("reflect", "Reflect", "Engagement Content Specialist", "customer-experience", "specialist", "serenity", "active"),
  makeAgent("listen", "Listen", "Feedback & Insights Analyst", "customer-experience", "specialist", "serenity", "idle"),

  // Compliance & Quality (Justice + 4)
  makeAgent("justice", "Justice", "Compliance Director", "compliance-quality", "director", "diane", "active"),
  makeAgent("guardian", "Guardian", "Regulatory Compliance Officer", "compliance-quality", "specialist", "justice", "active"),
  makeAgent("chart", "Chart", "Medical Records Specialist", "compliance-quality", "specialist", "justice", "executing"),
  makeAgent("shield-agent", "Shield", "HIPAA Privacy Officer", "compliance-quality", "specialist", "justice", "idle"),
  makeAgent("quality", "Quality", "QI Coordinator", "compliance-quality", "specialist", "justice", "idle"),

  // Accounting & Finance (Steward + 5)
  makeAgent("steward", "Steward", "CFO / Finance Director", "accounting-finance", "director", "diane", "active"),
  makeAgent("nurture", "Nurture", "Bookkeeper & GL Specialist", "accounting-finance", "specialist", "steward", "active"),
  makeAgent("provision", "Provision", "Accounts Payable", "accounting-finance", "specialist", "steward", "idle"),
  makeAgent("harvest", "Harvest", "Revenue Cycle & Billing", "accounting-finance", "specialist", "steward", "executing"),
  makeAgent("pledge", "Pledge", "Payroll & Benefits", "accounting-finance", "specialist", "steward", "idle"),
  makeAgent("foundation", "Foundation", "Tax & Entity Compliance", "accounting-finance", "specialist", "steward", "idle"),
];

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((a) => a.slug === slug);
}

export function getAgentsByDepartment(dept: string): Agent[] {
  return agents.filter((a) => a.department === dept);
}

export function getDirectReports(agentSlug: string): Agent[] {
  return agents.filter((a) => a.parent_agent_id === agentSlug);
}
