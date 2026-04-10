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

export const agentsFnf: Agent[] = [
  // Executive
  makeAgent("magnus", "Magnus", "CEO", "executive", "orchestrator", null, "active"),

  // Marketing (Marisol + 6)
  makeAgent("marisol", "Marisol", "Marketing Director", "marketing", "director", "magnus", "active"),
  makeAgent("talon", "Talon", "Market Research Specialist", "marketing", "specialist", "marisol", "idle"),
  makeAgent("ignite", "Ignite", "Paid Ads Specialist", "marketing", "specialist", "marisol", "executing"),
  makeAgent("onyx", "Onyx", "SEO Specialist", "marketing", "specialist", "marisol", "idle"),
  makeAgent("cipher-fnf", "Cipher", "Email Marketing Specialist", "marketing", "specialist", "marisol", "active"),
  makeAgent("summit-fnf", "Summit", "Event Coordinator", "marketing", "specialist", "marisol", "idle"),
  makeAgent("quill-fnf", "Quill", "Community Manager", "marketing", "specialist", "marisol", "active"),

  // Sales / Loan Origination (Kael + 5)
  makeAgent("kael", "Kael", "Sales Director / Loan Origination", "sales", "director", "magnus", "active"),
  makeAgent("siren", "Siren", "Loan Officer Recruiter", "sales", "specialist", "kael", "idle"),
  makeAgent("titan", "Titan", "Top Producer Loan Officer", "sales", "specialist", "kael", "executing"),
  makeAgent("echo-fnf", "Echo", "Refinance Specialist", "sales", "specialist", "kael", "active"),
  makeAgent("canyon", "Canyon", "Branch Manager", "sales", "specialist", "kael", "idle"),
  makeAgent("flicker", "Flicker", "Inside Sales Rep", "sales", "specialist", "kael", "active"),

  // Operations (Rook + 5)
  makeAgent("rook", "Rook", "Operations Director", "operations", "director", "magnus", "active"),
  makeAgent("maven", "Maven", "Loan Processor", "operations", "specialist", "rook", "executing"),
  makeAgent("anchor", "Anchor", "Underwriting Coordinator", "operations", "specialist", "rook", "active"),
  makeAgent("finch-fnf", "Finch", "Closing Coordinator", "operations", "specialist", "rook", "idle"),
  makeAgent("vault", "Vault", "Post-Closing Specialist", "operations", "specialist", "rook", "idle"),
  makeAgent("grid", "Grid", "Platform Manager", "operations", "specialist", "rook", "active"),

  // Wholesaling (Flint + 10)
  makeAgent("flint", "Flint", "Wholesaling Director", "wholesaling", "director", "magnus", "active"),
  makeAgent("vulture", "Vulture", "Property Finder", "wholesaling", "specialist", "flint", "active"),
  makeAgent("monocle", "Monocle", "Market Data & Comparable Sales Analyst", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("forge", "Forge", "Rehab Development & Construction Manager", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("cypher-fnf", "Cypher", "Underwriting Analyst", "wholesaling", "specialist", "flint", "executing"),
  makeAgent("sleuth", "Sleuth", "Due Diligence Specialist", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("blueprint", "Blueprint", "Construction Records Analyst", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("meridian-fnf", "Meridian", "Land & Survey Specialist", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("gambit", "Gambit", "Acquisition Negotiator", "wholesaling", "specialist", "flint", "active"),
  makeAgent("pivot", "Pivot", "Disposition Manager", "wholesaling", "specialist", "flint", "idle"),
  makeAgent("notary", "Notary", "Transaction Coordinator", "wholesaling", "specialist", "flint", "active"),

  // Customer Experience (Stella + 5)
  makeAgent("stella", "Stella", "CX Director", "customer-experience", "director", "magnus", "active"),
  makeAgent("aura", "Aura", "Borrower Success Manager", "customer-experience", "specialist", "stella", "active"),
  makeAgent("mirror", "Mirror", "Review & Reputation Specialist", "customer-experience", "specialist", "stella", "idle"),
  makeAgent("kin", "Kin", "Referral Program Coordinator", "customer-experience", "specialist", "stella", "idle"),
  makeAgent("pulse", "Pulse", "Engagement Content Specialist", "customer-experience", "specialist", "stella", "active"),
  makeAgent("oracle", "Oracle", "Feedback & Insights Analyst", "customer-experience", "specialist", "stella", "idle"),

  // Compliance & Risk (Justus + 4)
  makeAgent("justus", "Justus", "Compliance Director", "compliance", "director", "magnus", "active"),
  makeAgent("sentinel", "Sentinel", "Regulatory Compliance Officer", "compliance", "specialist", "justus", "active"),
  makeAgent("scribe", "Scribe", "Quality Control Specialist", "compliance", "specialist", "justus", "executing"),
  makeAgent("warden", "Warden", "Risk Management Analyst", "compliance", "specialist", "justus", "idle"),
  makeAgent("parity", "Parity", "Fair Lending Officer", "compliance", "specialist", "justus", "idle"),

  // Product & Pricing (Sterling + 3)
  makeAgent("sterling-fnf", "Sterling", "Product & Pricing Director", "product", "director", "magnus", "active"),
  makeAgent("gauge", "Gauge", "Pricing Analyst", "product", "specialist", "sterling-fnf", "idle"),
  makeAgent("compass", "Compass", "Loan Program Specialist", "product", "specialist", "sterling-fnf", "active"),
  makeAgent("leverage", "Leverage", "Investor Relations Manager", "product", "specialist", "sterling-fnf", "idle"),

  // Accounting & Finance (Bastion + 5)
  makeAgent("bastion", "Bastion", "CFO / Finance Director", "accounting-finance", "director", "magnus", "active"),
  makeAgent("ledger", "Ledger", "Bookkeeper & Bank Reconciliation", "accounting-finance", "specialist", "bastion", "active"),
  makeAgent("tribute", "Tribute", "Accounts Payable Specialist", "accounting-finance", "specialist", "bastion", "idle"),
  makeAgent("yield", "Yield", "Accounts Receivable & Revenue", "accounting-finance", "specialist", "bastion", "executing"),
  makeAgent("writ", "Writ", "Tax & Entity Compliance", "accounting-finance", "specialist", "bastion", "idle"),
  makeAgent("bulwark", "Bulwark", "Financial Reporting & Audit Readiness", "accounting-finance", "specialist", "bastion", "idle"),

  // Legal Division (Phoenix + 6)
  makeAgent("phoenix", "Phoenix", "Chief Legal Officer USA", "legal", "director", "magnus", "active"),
  makeAgent("callum", "Callum", "New England & Mid-Atlantic Legal", "legal", "specialist", "phoenix", "idle"),
  makeAgent("savannah", "Savannah", "FL, GA, Carolinas Legal", "legal", "specialist", "phoenix", "idle"),
  makeAgent("tex", "Tex", "TX, AZ, NV Legal", "legal", "specialist", "phoenix", "idle"),
  makeAgent("pacific", "Pacific", "CA, OR, WA Legal", "legal", "specialist", "phoenix", "idle"),
  makeAgent("prairie", "Prairie", "IL, OH, MI Legal", "legal", "specialist", "phoenix", "idle"),
  makeAgent("summit-legal", "Summit", "CO, UT, MT Legal", "legal", "specialist", "phoenix", "idle"),
];
