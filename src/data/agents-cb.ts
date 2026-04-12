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
    created_at: "2026-04-10T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

export const agentsCb: Agent[] = [
  // Empire Leadership (shared orchestrators)
  makeAgent("leona", "Leona", "Executive Assistant", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("nova", "Nova", "Tech Lead", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("marcus", "Marcus", "GHL / CRM Lead", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("sage", "Sage", "Documentation Lead", "empire-leadership", "orchestrator", null, "active"),
  makeAgent("atlas", "Atlas", "Analytics Lead", "empire-leadership", "orchestrator", null, "active"),

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
  makeAgent("iris-campos", "Iris Campos", "Market Research Specialist", "marketing", "specialist", "diana-sousa"),
  makeAgent("rex-teixeira", "Rex Teixeira", "Paid Ads Specialist", "marketing", "specialist", "diana-sousa"),
  makeAgent("finn-azevedo", "Finn Azevedo", "SEO & Local Search Specialist", "marketing", "specialist", "diana-sousa"),
  makeAgent("lyra-mendonca", "Lyra Mendonça", "Email Marketing Specialist", "marketing", "specialist", "diana-sousa"),
  makeAgent("summit-faria", "Summit Faria", "Partnerships Coordinator", "marketing", "specialist", "diana-sousa"),

  // Content specialists (parent: jordan-pinto)
  makeAgent("blaze-correia", "Blaze Correia", "Short-Form Video Specialist", "content", "specialist", "jordan-pinto"),
  makeAgent("wren-batista", "Wren Batista", "Blog & Written Content", "content", "specialist", "jordan-pinto"),
  makeAgent("lux-oliveira", "Lux Oliveira", "Graphic Designer", "content", "specialist", "jordan-pinto"),
  makeAgent("cleo-marques", "Cleo Marques", "Social Media Manager", "content", "specialist", "jordan-pinto"),
  makeAgent("quill-tavares", "Quill Tavares", "Community Manager (PT/EN)", "content", "specialist", "jordan-pinto"),

  // Sales & Growth specialists (parent: victor-drummond)
  makeAgent("cassidy-rocha", "Cassidy Rocha", "Sales Copywriter", "sales-growth", "specialist", "victor-drummond"),
  makeAgent("drake-nunes", "Drake Nunes", "Contractor Acquisition Rep", "sales-growth", "specialist", "victor-drummond"),
  makeAgent("vera-santana", "Vera Santana", "Homeowner Growth Specialist", "sales-growth", "specialist", "victor-drummond"),
  makeAgent("trace-cavalcanti", "Trace Cavalcanti", "CRM Admin", "sales-growth", "specialist", "victor-drummond"),

  // Contractor Operations specialists (parent: rook-ferreira)
  makeAgent("maven-prado", "Maven Prado", "Contractor Vetting Specialist", "contractor-operations", "specialist", "rook-ferreira"),
  makeAgent("anchor-lima", "Anchor Lima", "Quality Assurance Agent", "contractor-operations", "specialist", "rook-ferreira"),
  makeAgent("scout-vasconcelos", "Scout Vasconcelos", "Contractor Recruiter", "contractor-operations", "specialist", "rook-ferreira"),
  makeAgent("grid-moura", "Grid Moura", "Platform Manager", "contractor-operations", "specialist", "rook-ferreira"),

  // Homeowner Experience specialists (parent: celeste-duarte)
  makeAgent("ana-ferreira", "Ana Ferreira", "Homeowner Success Manager", "homeowner-experience", "specialist", "celeste-duarte"),
  makeAgent("haven-ribeiro", "Haven Ribeiro", "Booking Concierge", "homeowner-experience", "specialist", "celeste-duarte"),
  makeAgent("mirror-gomes", "Mirror Gomes", "Reviews & Reputation Specialist", "homeowner-experience", "specialist", "celeste-duarte"),
  makeAgent("kin-aragao", "Kin Aragão", "Referral Program Coordinator", "homeowner-experience", "specialist", "celeste-duarte"),

  // Contractor Success specialists (parent: lucas-oliveira)
  makeAgent("coach-souza", "Coach Souza", "Performance Coaching Agent", "contractor-success", "specialist", "lucas-oliveira"),
  makeAgent("dash-pereira", "Dash Pereira", "Payout & Payments Support", "contractor-success", "specialist", "lucas-oliveira"),
  makeAgent("rue-monteiro", "Rue Monteiro", "Contractor Community Manager", "contractor-success", "specialist", "lucas-oliveira"),
  makeAgent("pulse-barros", "Pulse Barros", "Engagement Agent", "contractor-success", "specialist", "lucas-oliveira"),

  // Trust & Safety specialists (parent: fernanda-rocha)
  makeAgent("sentinel-cruz", "Sentinel Cruz", "Fraud Detection Agent", "trust-safety", "specialist", "fernanda-rocha"),
  makeAgent("arbiter-lopes", "Arbiter Lopes", "Dispute Resolution Specialist", "trust-safety", "specialist", "fernanda-rocha"),
  makeAgent("warden-freitas", "Warden Freitas", "Risk Management Analyst", "trust-safety", "specialist", "fernanda-rocha"),

  // Finance specialists (parent: isabela-mendes)
  makeAgent("thiago-cardoso", "Thiago Cardoso", "Payments & PIX Specialist", "finance", "specialist", "isabela-mendes"),
  makeAgent("gauge-albuquerque", "Gauge Albuquerque", "Pricing Analyst", "finance", "specialist", "isabela-mendes"),

  // Legal & Compliance specialists (parent: carolina-vieira)
  makeAgent("parity-soares", "Parity Soares", "LGPD & Data Privacy Officer", "legal-compliance", "specialist", "carolina-vieira"),
  makeAgent("scribe-leal", "Scribe Leal", "Contracts & Terms Specialist", "legal-compliance", "specialist", "carolina-vieira"),

  // Product specialists (parent: diego-barbosa)
  makeAgent("milo-queiroz", "Milo Queiroz", "Feature Development Specialist", "product", "specialist", "diego-barbosa"),
  makeAgent("nora-campos", "Nora Campos", "UX Research Agent", "product", "specialist", "diego-barbosa"),
  makeAgent("knox-assis", "Knox Assis", "Platform & Integration Manager", "product", "specialist", "diego-barbosa"),
];
