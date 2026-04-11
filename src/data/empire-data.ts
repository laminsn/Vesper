/**
 * Empire Data — Static bundle of all company data.
 *
 * This file embeds agent, department, and org data directly in the
 * client bundle so the dashboard renders INSTANTLY without waiting
 * for Supabase. Supabase still syncs in the background for live
 * updates, but the initial paint uses this data.
 *
 * To update: re-export from the individual agent files.
 */

import type { Agent, Department } from "@/types";
import { agents as hhccAgents } from "@/data/agents";
import { agentsFnf } from "@/data/agents-fnf";
import { agentsBet } from "@/data/agents-bet";
import { agentsHaa } from "@/data/agents-haa";
import { agentsRam } from "@/data/agents-ram";
import { agentsCb } from "@/data/agents-cb";
import { ALL_ORGS, type OrgDefinition } from "@/data/organizations";

// ─── Org-keyed agent map ─────────────────────────────────────────────────────

const AGENT_MAP: Readonly<Record<string, readonly Agent[]>> = {
  "00000000-0000-4000-a000-000000000001": hhccAgents,
  "00000000-0000-4000-a000-000000000002": agentsFnf,
  "00000000-0000-4000-a000-000000000003": agentsBet,
  "00000000-0000-4000-a000-000000000004": agentsHaa,
  "00000000-0000-4000-a000-000000000005": agentsRam,
  "00000000-0000-4000-a000-000000000007": agentsCb,
};

export function getStaticAgents(orgId: string | null): readonly Agent[] {
  if (!orgId) return hhccAgents;
  return AGENT_MAP[orgId] ?? [];
}

export function getStaticAgent(orgId: string | null, slug: string): Agent | undefined {
  return getStaticAgents(orgId).find((a) => a.slug === slug);
}

export function getStaticAgentsByDepartment(orgId: string | null, dept: string): readonly Agent[] {
  return getStaticAgents(orgId).filter((a) => a.department === dept);
}

// ─── Static departments (derived from agents) ───────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  executive: "#f97316",
  marketing: "#ec4899",
  sales: "#3b82f6",
  operations: "#6366f1",
  "clinical-operations": "#4cc9f0",
  "admissions-intake": "#fca311",
  "caregiver-staffing": "#7209b7",
  "customer-experience": "#06b6d4",
  "compliance-quality": "#ef4444",
  compliance: "#ef4444",
  "accounting-finance": "#10b981",
  wholesaling: "#f59e0b",
  product: "#8b5cf6",
  legal: "#64748b",
  closing: "#f59e0b",
  content: "#a855f7",
  partnerships: "#f472b6",
  "ai-solutions": "#7c3aed",
  "campaign-management": "#e11d48",
  "web-design": "#0ea5e9",
  coaching: "#d97706",
  "client-success": "#059669",
  "sales-growth": "#3b82f6",
  "contractor-operations": "#6366f1",
  "homeowner-experience": "#06b6d4",
  "contractor-success": "#059669",
  "trust-safety": "#ef4444",
  "legal-compliance": "#64748b",
  "empire-leadership": "#f97316",
};

function buildDepartments(agents: readonly Agent[], orgId: string): readonly Department[] {
  const deptMap = new Map<string, { agents: Agent[]; director: Agent | undefined }>();
  for (const a of agents) {
    const existing = deptMap.get(a.department) ?? { agents: [], director: undefined };
    deptMap.set(a.department, {
      agents: [...existing.agents, a],
      director: a.tier === "director" ? a : existing.director,
    });
  }

  return Array.from(deptMap.entries()).map(([slug, info]) => ({
    id: `${orgId}-dept-${slug}`,
    organization_id: orgId,
    slug,
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    director_agent_id: info.director?.id ?? null,
    color: DEPT_COLORS[slug] ?? "#6b7280",
    icon: "Building2",
    agent_count: info.agents.length,
    created_at: "2026-03-06T00:00:00Z",
  }));
}

const DEPT_MAP: Readonly<Record<string, readonly Department[]>> = Object.fromEntries(
  Object.entries(AGENT_MAP).map(([orgId, agents]) => [
    orgId,
    buildDepartments(agents, orgId),
  ])
);

export function getStaticDepartments(orgId: string | null): readonly Department[] {
  if (!orgId) return DEPT_MAP["00000000-0000-4000-a000-000000000001"] ?? [];
  return DEPT_MAP[orgId] ?? [];
}

// ─── Organizations ───────────────────────────────────────────────────────────

export function getStaticOrganizations(): readonly OrgDefinition[] {
  return ALL_ORGS;
}

export function getStaticOrgAgentCount(orgId: string): number {
  return getStaticAgents(orgId).length;
}
