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

export const agentsCb: Agent[] = [
  // Empire Leadership (shared orchestrators)
  makeAgent("leona", "Leona", "Chief of Staff", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("nova", "Nova", "Marketing Intelligence", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("marcus", "Marcus", "Revenue Intelligence", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("sage", "Sage", "Knowledge & Research", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("atlas", "Atlas", "Operations Intelligence", "empire-leadership", "orchestrator", null, "active"),

  // Executive
  makeAgent("valentina-cruz", "Valentina Cruz", "Chief Executive Officer", "executive", "orchestrator", null, "active"),

  // Directors (parent: valentina-cruz)
  makeAgent("diana-sousa", "Diana Sousa", "Marketing Director", "marketing", "director", "valentina-cruz", "active"),
  makeAgent("jordan-pinto", "Jordan Pinto", "Content Director", "content", "director", "valentina-cruz", "active"),
  makeAgent("victor-drummond", "Victor Drummond", "Sales Director", "sales-growth", "director", "valentina-cruz", "active"),
  makeAgent("rook-ferreira", "Rook Ferreira", "Operations Director", "contractor-operations", "director", "valentina-cruz", "active"),
  makeAgent("celeste-duarte", "Celeste Duarte", "CX Director — Homeowners", "homeowner-experience", "director", "valentina-cruz", "active"),
  makeAgent("lucas-oliveira", "Lucas Oliveira", "Contractor Success Director", "contractor-success", "director", "valentina-cruz", "active"),
  makeAgent("fernanda-rocha", "Fernanda Rocha", "Trust & Safety Director", "trust-safety", "director", "valentina-cruz", "active"),
  makeAgent("isabela-mendes", "Isabela Mendes", "Chief Financial Officer", "finance", "director", "valentina-cruz", "active"),
  makeAgent("carolina-vieira", "Carolina Vieira", "Legal & Compliance Director", "legal-compliance", "director", "valentina-cruz", "active"),
  makeAgent("diego-barbosa", "Diego Barbosa", "Product Director", "product", "director", "valentina-cruz", "active"),

  // Marketing specialists (parent: diana-sousa)
  makeAgent("iris-campos", "Iris Campos", "Market Research Specialist", "marketing", "specialist", "diana-sousa", "idle"),
  makeAgent("rex-teixeira", "Rex Teixeira", "Paid Ads Specialist", "marketing", "specialist", "diana-sousa", "executing"),
  makeAgent("finn-azevedo", "Finn Azevedo", "SEO Specialist", "marketing", "specialist", "diana-sousa", "idle"),
  makeAgent("lyra-mendonca", "Lyra Mendonca", "Email Marketing Specialist", "marketing", "specialist", "diana-sousa", "active"),
  makeAgent("summit-faria", "Summit Faria", "Event Coordinator", "marketing", "specialist", "diana-sousa", "idle"),

  // Content specialists (parent: jordan-pinto)
  makeAgent("blaze-correia", "Blaze Correia", "Short-Form Video Specialist", "content", "specialist", "jordan-pinto", "active"),
  makeAgent("wren-batista", "Wren Batista", "Blog & Written Content Specialist", "content", "specialist", "jordan-pinto", "idle"),
  makeAgent("lux-oliveira", "Lux Oliveira", "Graphic Designer", "content", "specialist", "jordan-pinto", "active"),
  makeAgent("cleo-marques", "Cleo Marques", "Social Media Manager", "content", "specialist", "jordan-pinto", "active"),
  makeAgent("quill-tavares", "Quill Tavares", "Community Manager", "content", "specialist", "jordan-pinto", "idle"),

  // Sales specialists (parent: victor-drummond)
  makeAgent("cassidy-rocha", "Cassidy Rocha", "Account Executive — Homeowners", "sales-growth", "specialist", "victor-drummond", "active"),
  makeAgent("drake-nunes", "Drake Nunes", "Account Executive — Contractors", "sales-growth", "specialist", "victor-drummond", "active"),
  makeAgent("vera-santana", "Vera Santana", "Inside Sales Rep", "sales-growth", "specialist", "victor-drummond", "idle"),
  makeAgent("trace-cavalcanti", "Trace Cavalcanti", "Proposal & Pitch Specialist", "sales-growth", "specialist", "victor-drummond", "idle"),

  // Contractor Ops specialists (parent: rook-ferreira)
  makeAgent("maven-prado", "Maven Prado", "Job Dispatch Coordinator", "contractor-operations", "specialist", "rook-ferreira", "active"),
  makeAgent("anchor-lima", "Anchor Lima", "Contractor Vetting Specialist", "contractor-operations", "specialist", "rook-ferreira", "idle"),
  makeAgent("scout-vasconcelos", "Scout Vasconcelos", "Field Quality Inspector", "contractor-operations", "specialist", "rook-ferreira", "idle"),
  makeAgent("grid-moura", "Grid Moura", "Platform & Tools Manager", "contractor-operations", "specialist", "rook-ferreira", "idle"),

  // Homeowner CX specialists (parent: celeste-duarte)
  makeAgent("ana-ferreira", "Ana Ferreira", "Homeowner Onboarding Specialist", "homeowner-experience", "specialist", "celeste-duarte", "active"),
  makeAgent("haven-ribeiro", "Haven Ribeiro", "Support & Escalation Manager", "homeowner-experience", "specialist", "celeste-duarte", "idle"),
  makeAgent("mirror-gomes", "Mirror Gomes", "Review & Reputation Specialist", "homeowner-experience", "specialist", "celeste-duarte", "idle"),
  makeAgent("kin-aragao", "Kin Aragao", "Retention & Renewal Specialist", "homeowner-experience", "specialist", "celeste-duarte", "idle"),

  // Contractor Success specialists (parent: lucas-oliveira)
  makeAgent("coach-souza", "Coach Souza", "Contractor Onboarding Coach", "contractor-success", "specialist", "lucas-oliveira", "active"),
  makeAgent("dash-pereira", "Dash Pereira", "Performance & Ratings Specialist", "contractor-success", "specialist", "lucas-oliveira", "idle"),
  makeAgent("rue-monteiro", "Rue Monteiro", "Contractor Communications Manager", "contractor-success", "specialist", "lucas-oliveira", "idle"),
  makeAgent("pulse-barros", "Pulse Barros", "Contractor Feedback Analyst", "contractor-success", "specialist", "lucas-oliveira", "idle"),

  // Trust & Safety specialists (parent: fernanda-rocha)
  makeAgent("sentinel-cruz", "Sentinel Cruz", "Fraud & Abuse Investigator", "trust-safety", "specialist", "fernanda-rocha", "active"),
  makeAgent("arbiter-lopes", "Arbiter Lopes", "Dispute Resolution Specialist", "trust-safety", "specialist", "fernanda-rocha", "idle"),
  makeAgent("warden-freitas", "Warden Freitas", "Policy & Compliance Officer", "trust-safety", "specialist", "fernanda-rocha", "idle"),

  // Finance specialists (parent: isabela-mendes)
  makeAgent("thiago-cardoso", "Thiago Cardoso", "Bookkeeper & Reconciliation", "finance", "specialist", "isabela-mendes", "idle"),
  makeAgent("gauge-albuquerque", "Gauge Albuquerque", "Financial Reporting & Profitability", "finance", "specialist", "isabela-mendes", "idle"),

  // Legal specialists (parent: carolina-vieira)
  makeAgent("parity-soares", "Parity Soares", "Contract & Legal Review Specialist", "legal-compliance", "specialist", "carolina-vieira", "idle"),
  makeAgent("scribe-leal", "Scribe Leal", "Regulatory Compliance Officer", "legal-compliance", "specialist", "carolina-vieira", "idle"),

  // Product specialists (parent: diego-barbosa)
  makeAgent("milo-queiroz", "Milo Queiroz", "Product Manager", "product", "specialist", "diego-barbosa", "active"),
  makeAgent("nora-campos", "Nora Campos", "UX Designer", "product", "specialist", "diego-barbosa", "idle"),
  makeAgent("knox-assis", "Knox Assis", "QA & Testing Specialist", "product", "specialist", "diego-barbosa", "idle"),
];
