import type { Node, Edge } from "@xyflow/react";
import type { Agent, Department, Playbook, Handoff } from "@/types";

/* ───── Node data types ───── */

export interface AgentNodeData {
  readonly nodeType: "agent";
  readonly agent: Agent;
  readonly deptColor: string;
  readonly deptLabel: string;
  readonly size: number;
  readonly [key: string]: unknown;
}

export interface DepartmentNodeData {
  readonly nodeType: "department";
  readonly department: Department;
  readonly agentCount: number;
  readonly [key: string]: unknown;
}

export interface PlaybookNodeData {
  readonly nodeType: "playbook";
  readonly playbook: Playbook;
  readonly [key: string]: unknown;
}

export type GraphNodeData = AgentNodeData | DepartmentNodeData | PlaybookNodeData;

export type GraphNode = Node<AgentNodeData> | Node<DepartmentNodeData> | Node<PlaybookNodeData>;

/* ───── Edge types ───── */

export type GraphEdgeType = "hierarchy" | "membership" | "handoff" | "playbook";

export interface GraphEdgeData {
  readonly edgeType: GraphEdgeType;
  readonly color: string;
  readonly [key: string]: unknown;
}

export type GraphEdge = Edge<GraphEdgeData>;

/* ───── Node sizing constants ───── */

export const TIER_SIZES: Record<string, number> = {
  orchestrator: 48,
  director: 36,
  specialist: 24,
};

export const DEPARTMENT_NODE_SIZE = 56;
export const PLAYBOOK_NODE_SIZE = 28;
