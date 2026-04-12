// ═══════════════════════════════════════════════════
// Empire Organizations — Deterministic IDs for Supabase
// ═══════════════════════════════════════════════════
// These UUIDs are used in both the seed migration and
// the client-side data layer.

import type { OrgIndustry } from "@/types";

export interface OrgDefinition {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly industry: OrgIndustry;
  readonly hipaaMode: boolean;
  readonly color: string;
}

export const ORG_HHCC: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000001",
  name: "Happier Homes Comfort Care",
  slug: "hhcc",
  industry: "healthcare",
  hipaaMode: true,
  color: "#06d6a0",
};

export const ORG_FNF: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000002",
  name: "First Nation Fidelity",
  slug: "fnf",
  industry: "real_estate",
  hipaaMode: false,
  color: "#f59e0b",
};

export const ORG_BET: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000003",
  name: "Brazil International Escrow Title",
  slug: "bet",
  industry: "real_estate",
  hipaaMode: false,
  color: "#10b981",
};

export const ORG_HAA: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000004",
  name: "Healthcare AI Academy",
  slug: "haa",
  industry: "education",
  hipaaMode: false,
  color: "#3b82f6",
};

export const ORG_RAM: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000005",
  name: "Rara Avis Marketing",
  slug: "ram",
  industry: "marketing",
  hipaaMode: false,
  color: "#8b5cf6",
};

export const ORG_CB: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000007",
  name: "Casa Baise",
  slug: "cb",
  industry: "technology",
  hipaaMode: false,
  color: "#10b981",
};

export const ORG_MB: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000008",
  name: "Medical Baise",
  slug: "mb",
  industry: "healthcare",
  hipaaMode: true,
  color: "#3b82f6",
};

export const ORG_LB: OrgDefinition = {
  id: "00000000-0000-4000-a000-000000000009",
  name: "Legal Baise",
  slug: "lb",
  industry: "other",
  hipaaMode: false,
  color: "#8b5cf6",
};

export const ALL_ORGS: readonly OrgDefinition[] = [
  ORG_HHCC,
  ORG_FNF,
  ORG_BET,
  ORG_HAA,
  ORG_RAM,
  ORG_CB,
  ORG_MB,
  ORG_LB,
] as const;
