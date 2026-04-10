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

export const agentsBet: Agent[] = [
  // Executive
  makeAgent("ricardo", "Ricardo", "CEO", "executive", "orchestrator", null, "active"),

  // Marketing (Isadora + 6)
  makeAgent("isadora", "Isadora", "Marketing Director", "marketing", "director", "ricardo", "active"),
  makeAgent("radar", "Radar", "Market Research Specialist", "marketing", "specialist", "isadora", "idle"),
  makeAgent("fogo", "Fogo", "Paid Ads Specialist", "marketing", "specialist", "isadora", "executing"),
  makeAgent("raiz", "Raiz", "SEO Specialist", "marketing", "specialist", "isadora", "idle"),
  makeAgent("onda", "Onda", "Email Marketing Specialist", "marketing", "specialist", "isadora", "active"),
  makeAgent("palco", "Palco", "Event Coordinator", "marketing", "specialist", "isadora", "idle"),
  makeAgent("rio", "Rio", "Community Manager", "marketing", "specialist", "isadora", "active"),

  // Sales / Realtor Relations (Thor + 4)
  makeAgent("thor", "Thor", "Sales / Realtor Relations Director", "sales", "director", "ricardo", "active"),
  makeAgent("atracao", "Atracao", "Realtor Recruiter", "sales", "specialist", "thor", "idle"),
  makeAgent("ponte", "Ponte", "Realtor Relations Manager", "sales", "specialist", "thor", "active"),
  makeAgent("ancora", "Ancora", "New Development Specialist", "sales", "specialist", "thor", "idle"),
  makeAgent("vista", "Vista", "Inside Sales Rep", "sales", "specialist", "thor", "active"),

  // Title & Escrow Operations (Forte + 5)
  makeAgent("forte", "Forte", "Title & Escrow Operations Director", "operations", "director", "ricardo", "active"),
  makeAgent("pesquisa", "Pesquisa", "Title Search Specialist", "operations", "specialist", "forte", "executing"),
  makeAgent("limpo", "Limpo", "Title Curative Specialist", "operations", "specialist", "forte", "active"),
  makeAgent("documento", "Documento", "Document Preparation Specialist", "operations", "specialist", "forte", "idle"),
  makeAgent("cofre", "Cofre", "Escrow Officer", "operations", "specialist", "forte", "active"),
  makeAgent("mapa", "Mapa", "Survey & Property Records Specialist", "operations", "specialist", "forte", "idle"),

  // Closing (Chave + 4)
  makeAgent("chave", "Chave", "Closing Director", "closing", "director", "ricardo", "active"),
  makeAgent("agenda", "Agenda", "Closing Coordinator", "closing", "specialist", "chave", "active"),
  makeAgent("assinatura", "Assinatura", "Notary Liaison", "closing", "specialist", "chave", "idle"),
  makeAgent("fechamento", "Fechamento", "Final Review Specialist", "closing", "specialist", "chave", "executing"),
  makeAgent("repasse", "Repasse", "Funding Coordinator", "closing", "specialist", "chave", "idle"),

  // Customer Experience (Luz + 5)
  makeAgent("luz", "Luz", "Customer Experience Director", "customer-experience", "director", "ricardo", "active"),
  makeAgent("guia", "Guia", "Client Success Manager", "customer-experience", "specialist", "luz", "active"),
  makeAgent("eco", "Eco", "Review & Reputation Specialist", "customer-experience", "specialist", "luz", "idle"),
  makeAgent("laco", "Laco", "Referral Program Coordinator", "customer-experience", "specialist", "luz", "idle"),
  makeAgent("brilho", "Brilho", "Engagement Content Specialist", "customer-experience", "specialist", "luz", "active"),
  makeAgent("sentinela", "Sentinela", "Feedback & Insights Analyst", "customer-experience", "specialist", "luz", "idle"),

  // Compliance & Legal (Justo + 3)
  makeAgent("justo", "Justo", "Compliance & Legal Director", "compliance", "director", "ricardo", "active"),
  makeAgent("escudo", "Escudo", "Regulatory Compliance Officer", "compliance", "specialist", "justo", "active"),
  makeAgent("verificacao", "Verificacao", "AML & Fraud Prevention Specialist", "compliance", "specialist", "justo", "idle"),
  makeAgent("registro", "Registro", "Document Compliance Specialist", "compliance", "specialist", "justo", "idle"),

  // Accounting & Finance (Tesouro + 4)
  makeAgent("tesouro", "Tesouro", "CFO / Finance Director", "accounting-finance", "director", "ricardo", "active"),
  makeAgent("balanco", "Balanço", "Bookkeeper & Reconciliation", "accounting-finance", "specialist", "tesouro", "active"),
  makeAgent("pagamento", "Pagamento", "Accounts Payable & Bill Payment", "accounting-finance", "specialist", "tesouro", "idle"),
  makeAgent("cobranca", "Cobrança", "Accounts Receivable", "accounting-finance", "specialist", "tesouro", "executing"),
  makeAgent("fiscal", "Fiscal", "Tax & Regulatory Compliance", "accounting-finance", "specialist", "tesouro", "idle"),

  // Legal Division (Themis + 6)
  makeAgent("themis", "Themis", "Chief Legal Officer Brazil", "legal", "director", "ricardo", "active"),
  makeAgent("carioca", "Carioca", "RJ Legal Specialist", "legal", "specialist", "themis", "idle"),
  makeAgent("paulista", "Paulista", "SP Legal Specialist", "legal", "specialist", "themis", "idle"),
  makeAgent("baiano", "Baiano", "BA Legal Specialist", "legal", "specialist", "themis", "idle"),
  makeAgent("brasilia", "Brasília", "DF Federal Capital Legal", "legal", "specialist", "themis", "idle"),
  makeAgent("mineiro", "Mineiro", "MG Legal Specialist", "legal", "specialist", "themis", "idle"),
  makeAgent("gaucho", "Gaúcho", "RS Legal Specialist", "legal", "specialist", "themis", "idle"),
];
