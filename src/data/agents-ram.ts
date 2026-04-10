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

export const agentsRam: Agent[] = [
  // Executive
  makeAgent("corvus", "Corvus", "CEO", "executive", "orchestrator", null, "active"),

  // Partnerships & Community
  makeAgent("ibis", "Ibis", "Partnerships & Community Director", "partnerships", "director", "corvus", "active"),

  // Marketing (Plume + 5)
  makeAgent("plume", "Plume", "Marketing Director", "marketing", "director", "corvus", "active"),
  makeAgent("wren-ram", "Wren", "Content Strategist", "marketing", "specialist", "plume", "active"),
  makeAgent("starling", "Starling", "Social Media Specialist", "marketing", "specialist", "plume", "active"),
  makeAgent("osprey", "Osprey", "Paid Ads Specialist", "marketing", "specialist", "plume", "executing"),
  makeAgent("lark", "Lark", "SEO Specialist", "marketing", "specialist", "plume", "idle"),
  makeAgent("piper-ram", "Piper", "Email Marketing Specialist", "marketing", "specialist", "plume", "active"),

  // Sales (Hawk + 4)
  makeAgent("hawk", "Hawk", "Sales Director", "sales", "director", "corvus", "active"),
  makeAgent("falcon", "Falcon", "Account Executive — Enterprise", "sales", "specialist", "hawk", "active"),
  makeAgent("merlin-ram", "Merlin", "Account Executive — SMB", "sales", "specialist", "hawk", "active"),
  makeAgent("swift", "Swift", "Inside Sales / Lead Qualifier", "sales", "specialist", "hawk", "executing"),
  makeAgent("shrike", "Shrike", "Proposal & Pitch Specialist", "sales", "specialist", "hawk", "idle"),

  // AI Solutions & Automation (Raptor + 5)
  makeAgent("raptor", "Raptor", "AI Solutions & Automation Director", "ai-solutions", "director", "corvus", "active"),
  makeAgent("peregrine", "Peregrine", "AI Agent Developer", "ai-solutions", "specialist", "raptor", "executing"),
  makeAgent("harrier", "Harrier", "Automation Architect", "ai-solutions", "specialist", "raptor", "active"),
  makeAgent("kite", "Kite", "Integration Specialist", "ai-solutions", "specialist", "raptor", "idle"),
  makeAgent("goshawk", "Goshawk", "AI Quality & Testing", "ai-solutions", "specialist", "raptor", "active"),
  makeAgent("sparrowhawk", "Sparrowhawk", "CAIO Delivery Specialist", "ai-solutions", "specialist", "raptor", "idle"),

  // Campaign Management (Blaze + 5)
  makeAgent("blaze-ram", "Blaze", "Campaign Management Director", "campaign-management", "director", "corvus", "active"),
  makeAgent("robin", "Robin", "Campaign Strategist", "campaign-management", "specialist", "blaze-ram", "active"),
  makeAgent("tanager", "Tanager", "Paid Media Manager", "campaign-management", "specialist", "blaze-ram", "executing"),
  makeAgent("bunting", "Bunting", "Email & Nurture Campaign Manager", "campaign-management", "specialist", "blaze-ram", "idle"),
  makeAgent("oriole", "Oriole", "Content Production Specialist", "campaign-management", "specialist", "blaze-ram", "active"),
  makeAgent("cardinal", "Cardinal", "Analytics & Reporting Specialist", "campaign-management", "specialist", "blaze-ram", "active"),

  // Web & Design (Avis + 5)
  makeAgent("avis", "Avis", "Web & Design Director", "web-design", "director", "corvus", "active"),
  makeAgent("jay", "Jay", "UI/UX Designer", "web-design", "specialist", "avis", "active"),
  makeAgent("kingfisher", "Kingfisher", "Frontend Developer", "web-design", "specialist", "avis", "executing"),
  makeAgent("magpie", "Magpie", "Graphic Designer / Brand Identity", "web-design", "specialist", "avis", "active"),
  makeAgent("finwren", "Finwren", "Motion & Animation Designer", "web-design", "specialist", "avis", "idle"),
  makeAgent("dove", "Dove", "Copywriter / UX Writer", "web-design", "specialist", "avis", "idle"),

  // Coaching & Strategy (Condor + 3)
  makeAgent("condor", "Condor", "Coaching & Strategy Director", "coaching", "director", "corvus", "active"),
  makeAgent("albatross", "Albatross", "1:1 Coaching Facilitator", "coaching", "specialist", "condor", "active"),
  makeAgent("pelican", "Pelican", "Group Program Coordinator", "coaching", "specialist", "condor", "idle"),
  makeAgent("nighthawk", "Nighthawk", "Workshop & Event Specialist", "coaching", "specialist", "condor", "idle"),

  // Client Success (Crane + 4)
  makeAgent("crane", "Crane", "Client Success Director", "client-success", "director", "corvus", "active"),
  makeAgent("heron", "Heron", "Client Success Manager — Retainer", "client-success", "specialist", "crane", "active"),
  makeAgent("egret", "Egret", "Client Success Manager — Project", "client-success", "specialist", "crane", "active"),
  makeAgent("flamingo", "Flamingo", "Review & Reputation Specialist", "client-success", "specialist", "crane", "idle"),
  makeAgent("sandpiper", "Sandpiper", "Onboarding Specialist", "client-success", "specialist", "crane", "active"),

  // Operations (Kestrel + 3)
  makeAgent("kestrel", "Kestrel", "Operations Director", "operations", "director", "corvus", "active"),
  makeAgent("sparrow", "Sparrow", "Project Manager", "operations", "specialist", "kestrel", "active"),
  makeAgent("raven", "Raven", "Resource & Capacity Planner", "operations", "specialist", "kestrel", "idle"),
  makeAgent("crow", "Crow", "Platform & Tools Manager", "operations", "specialist", "kestrel", "idle"),

  // Accounting & Finance (Ledgerbird + 5)
  makeAgent("ledgerbird", "Ledgerbird", "CFO / Finance Director", "accounting-finance", "director", "corvus", "active"),
  makeAgent("swallow", "Swallow", "Billing & Invoice Specialist", "accounting-finance", "specialist", "ledgerbird", "active"),
  makeAgent("waxwing", "Waxwing", "Bookkeeper & Reconciliation", "accounting-finance", "specialist", "ledgerbird", "idle"),
  makeAgent("tern", "Tern", "Accounts Payable & Bill Payment", "accounting-finance", "specialist", "ledgerbird", "idle"),
  makeAgent("nuthatch", "Nuthatch", "Tax & Entity Compliance", "accounting-finance", "specialist", "ledgerbird", "idle"),
  makeAgent("warbler", "Warbler", "Financial Reporting & Profitability", "accounting-finance", "specialist", "ledgerbird", "executing"),

  // Compliance (Aegis + 2)
  makeAgent("aegis", "Aegis", "Compliance Director", "compliance", "director", "corvus", "active"),
  makeAgent("owl", "Owl", "Contract & Legal Review Specialist", "compliance", "specialist", "aegis", "idle"),
  makeAgent("stork", "Stork", "Data Privacy & IP Compliance Officer", "compliance", "specialist", "aegis", "idle"),
];
