"use client";

import { useMemo } from "react";
import type { Agent, Department, Playbook, Handoff } from "@/types";
import {
  TIER_SIZES,
  type AgentNodeData,
  type DepartmentNodeData,
  type PlaybookNodeData,
  type GraphNode,
  type GraphEdge,
  type GraphEdgeData,
} from "./graph-types";

/* ───── helpers ───── */

function buildDeptColorMap(depts: readonly Department[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const dept of depts) {
    map[dept.slug] = dept.color;
  }
  return map;
}

function getDeptColor(slug: string, colorMap: Record<string, string>): string {
  return colorMap[slug] ?? "#06d6a0";
}

function getDeptLabel(slug: string, depts: readonly Department[]): string {
  const dept = depts.find((d) => d.slug === slug);
  return dept?.name ?? slug.replace(/-/g, " ");
}

/* ───── main hook ───── */

interface KnowledgeGraphInput {
  readonly agents: readonly Agent[];
  readonly departments: readonly Department[];
  readonly playbooks: readonly Playbook[];
  readonly handoffs: readonly Handoff[];
}

interface KnowledgeGraphOutput {
  readonly nodes: GraphNode[];
  readonly edges: GraphEdge[];
}

export function useKnowledgeGraphData({
  agents,
  departments,
  playbooks,
  handoffs,
}: KnowledgeGraphInput): KnowledgeGraphOutput {
  return useMemo(() => {
    const deptColorMap = buildDeptColorMap(departments);
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // ── Department nodes (cluster centers) ──
    for (const dept of departments) {
      const agentCount = agents.filter((a) => a.department === dept.slug).length;
      nodes.push({
        id: `dept-${dept.slug}`,
        type: "departmentGraph",
        position: { x: 0, y: 0 },
        data: {
          nodeType: "department",
          department: dept,
          agentCount,
        } satisfies DepartmentNodeData,
      });
    }

    // ── Agent nodes ──
    for (const agent of agents) {
      const color = getDeptColor(agent.department, deptColorMap);
      const size = TIER_SIZES[agent.tier] ?? 24;

      nodes.push({
        id: agent.slug,
        type: "agentGraph",
        position: { x: 0, y: 0 },
        data: {
          nodeType: "agent",
          agent,
          deptColor: color,
          deptLabel: getDeptLabel(agent.department, departments),
          size,
        } satisfies AgentNodeData,
      });

      // Hierarchy edge (parent -> child)
      if (agent.parent_agent_id) {
        const parentAgent = agents.find((a) => a.id === agent.parent_agent_id);
        if (parentAgent) {
          edges.push({
            id: `hier-${parentAgent.slug}-${agent.slug}`,
            source: parentAgent.slug,
            target: agent.slug,
            type: "glowEdge",
            data: {
              edgeType: "hierarchy",
              color,
            } satisfies GraphEdgeData,
          });
        }
      }

      // Membership edge (agent -> department)
      edges.push({
        id: `memb-${agent.slug}-${agent.department}`,
        source: agent.slug,
        target: `dept-${agent.department}`,
        type: "glowEdge",
        data: {
          edgeType: "membership",
          color,
        } satisfies GraphEdgeData,
      });
    }

    // ── Playbook nodes ──
    for (const playbook of playbooks) {
      nodes.push({
        id: `pb-${playbook.id}`,
        type: "playbookGraph",
        position: { x: 0, y: 0 },
        data: {
          nodeType: "playbook",
          playbook,
        } satisfies PlaybookNodeData,
      });

      // Link playbook to its playmaker agent
      if (playbook.playmaker_agent_id) {
        const maker = agents.find((a) => a.id === playbook.playmaker_agent_id);
        if (maker) {
          edges.push({
            id: `pb-edge-${playbook.id}-${maker.slug}`,
            source: `pb-${playbook.id}`,
            target: maker.slug,
            type: "glowEdge",
            data: {
              edgeType: "playbook",
              color: "#7c3aed",
            } satisfies GraphEdgeData,
          });
        }
      }
    }

    // ── Handoff edges ──
    for (const handoff of handoffs) {
      const fromAgent = handoff.from_agent_id
        ? agents.find((a) => a.id === handoff.from_agent_id)
        : null;
      const toAgent = handoff.to_agent_id
        ? agents.find((a) => a.id === handoff.to_agent_id)
        : null;

      const source = fromAgent
        ? fromAgent.slug
        : `dept-${handoff.from_department}`;
      const target = toAgent
        ? toAgent.slug
        : `dept-${handoff.to_department}`;

      const sourceExists = nodes.some((n) => n.id === source);
      const targetExists = nodes.some((n) => n.id === target);

      if (sourceExists && targetExists) {
        edges.push({
          id: `ho-${handoff.id}`,
          source,
          target,
          type: "glowEdge",
          data: {
            edgeType: "handoff",
            color: "#f59e0b",
          } satisfies GraphEdgeData,
        });
      }
    }

    return { nodes, edges };
  }, [agents, departments, playbooks, handoffs]);
}
