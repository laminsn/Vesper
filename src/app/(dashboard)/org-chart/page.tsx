"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { StatusIndicator } from "@/components/jarvis";
import type { Agent, AgentTier, Department } from "@/types";

/* ───── constants ───── */

const NODE_W = 160;
const NODE_H = 70;
const H_GAP = 180;
const V_GAP = 140;

const CEO_W = 200;
const DIRECTOR_W = 170;

/* ───── department color map ───── */

function buildDeptColorMap(depts: Department[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const dept of depts) {
    map[dept.slug] = dept.color;
  }
  return map;
}

function deptColor(slug: string, colorMap: Record<string, string>): string {
  return colorMap[slug] ?? "var(--jarvis-accent)";
}

function deptName(slug: string, depts: Department[]): string {
  const dept = depts.find((d) => d.slug === slug);
  return dept?.name ?? slug.replace(/-/g, " ");
}

/* ───── status color ───── */

function statusColor(status: string): string {
  switch (status) {
    case "active":
      return "#22c55e";
    case "executing":
      return "#f59e0b";
    case "idle":
      return "#94a3b8";
    case "offline":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

/* ───── custom node component ───── */

interface AgentNodeData {
  agent: Agent;
  deptColor: string;
  deptLabel: string;
  tier: AgentTier;
  [key: string]: unknown;
}

function AgentOrgNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const { agent, deptColor: color, deptLabel, tier } = data;

  const isCeo = tier === "orchestrator";
  const isDirector = tier === "director";
  const width = isCeo ? CEO_W : isDirector ? DIRECTOR_W : NODE_W;
  const borderColor = isCeo ? "#f59e0b" : color;
  const borderWidth = isCeo ? 2 : isDirector ? 2 : 1;

  return (
    <div
      className="rounded-xl bg-[var(--jarvis-bg-secondary)] transition-all hover:shadow-lg relative"
      style={{
        width,
        minHeight: NODE_H,
        borderWidth,
        borderStyle: "solid",
        borderColor: "var(--jarvis-border)",
        borderLeftWidth: isCeo ? borderWidth : 4,
        borderLeftColor: borderColor,
        boxShadow: `0 2px 8px ${borderColor}15`,
        padding: "10px 12px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 1, height: 1 }}
      />

      {/* Name row */}
      <div className="flex items-center gap-2">
        <div
          className="shrink-0 rounded-full"
          style={{
            width: 8,
            height: 8,
            backgroundColor: statusColor(agent.status),
            boxShadow: `0 0 4px ${statusColor(agent.status)}80`,
          }}
        />
        <span
          className="font-semibold text-[var(--jarvis-text-primary)] truncate"
          style={{ fontSize: isCeo ? 14 : 12 }}
        >
          {agent.name}
        </span>
      </div>

      {/* Role */}
      <p
        className="text-[var(--jarvis-text-muted)] leading-tight mt-0.5 truncate"
        style={{ fontSize: 10 }}
      >
        {agent.role}
      </p>

      {/* Department badge */}
      <span
        className="inline-flex items-center gap-1 mt-1.5 rounded px-1.5 py-0.5 capitalize"
        style={{
          fontSize: 9,
          fontWeight: 500,
          backgroundColor: `${color}18`,
          color,
        }}
      >
        <span
          className="rounded-full shrink-0"
          style={{
            width: 5,
            height: 5,
            backgroundColor: color,
          }}
        />
        {deptLabel}
      </span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agentOrg: AgentOrgNode,
};

/* ───── tree layout algorithm ───── */

interface TreeNode {
  agent: Agent;
  children: TreeNode[];
}

function buildTree(agentList: Agent[]): TreeNode | null {
  // Find root (CEO)
  const root = agentList.find((a) => a.parent_agent_id === null);
  if (!root) return null;

  function buildSubtree(agent: Agent): TreeNode {
    const children = agentList
      .filter((a) => a.parent_agent_id === agent.id)
      .map((child) => buildSubtree(child));
    return { agent, children };
  }

  return buildSubtree(root);
}

/** Calculate the width (in px) that a subtree needs */
function subtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) {
    return NODE_W;
  }
  const childrenWidth = node.children.reduce(
    (sum, child) => sum + subtreeWidth(child),
    0
  );
  const gaps = (node.children.length - 1) * (H_GAP - NODE_W);
  return Math.max(NODE_W, childrenWidth + gaps);
}

function computeLayout(agentList: Agent[], deptList: Department[]): { nodes: Node<AgentNodeData>[]; edges: Edge[] } {
  const tree = buildTree(agentList);
  if (!tree) return { nodes: [], edges: [] };

  const colorMap = buildDeptColorMap(deptList);

  const nodes: Node<AgentNodeData>[] = [];
  const edges: Edge[] = [];

  /** Recursively position nodes. centerX is the center of the allocated space. */
  function positionNode(
    treeNode: TreeNode,
    centerX: number,
    level: number
  ): void {
    const { agent } = treeNode;
    const isCeo = agent.tier === "orchestrator";
    const isDirector = agent.tier === "director";
    const w = isCeo ? CEO_W : isDirector ? DIRECTOR_W : NODE_W;
    const x = centerX - w / 2;
    const y = level * V_GAP;

    nodes.push({
      id: agent.slug,
      type: "agentOrg",
      position: { x, y },
      data: {
        agent,
        deptColor: deptColor(agent.department, colorMap),
        deptLabel: deptName(agent.department, deptList),
        tier: agent.tier,
      },
    });

    // Build edge from parent
    if (agent.parent_agent_id) {
      const color = deptColor(agent.department, colorMap);
      edges.push({
        id: `${agent.parent_agent_id}->${agent.slug}`,
        source: agent.parent_agent_id,
        target: agent.slug,
        type: "smoothstep",
        animated: true,
        style: { stroke: color, strokeWidth: 1.5, opacity: 0.6 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: 16,
          height: 16,
        },
      });
    }

    // Position children
    if (treeNode.children.length === 0) return;

    const childWidths = treeNode.children.map((c) => subtreeWidth(c));
    const totalChildrenWidth =
      childWidths.reduce((a, b) => a + b, 0) +
      (treeNode.children.length - 1) * (H_GAP - NODE_W);

    let childX = centerX - totalChildrenWidth / 2;

    for (let i = 0; i < treeNode.children.length; i++) {
      const childW = childWidths[i];
      const childCenterX = childX + childW / 2;
      positionNode(treeNode.children[i], childCenterX, level + 1);
      childX += childW + (H_GAP - NODE_W);
    }
  }

  positionNode(tree, 0, 0);

  return { nodes, edges };
}

/* ───── page component ───── */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function OrgChartPage() {
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();

  const { nodes, edges } = useMemo(
    () => computeLayout(agents, departments),
    [agents, departments]
  );

  if (agentsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading org chart...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
          Org Chart
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {agents.length}-agent hierarchy across {departments.length} departments
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-xl border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] overflow-hidden"
        style={{ height: "calc(100vh - 180px)", minHeight: 500 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          }}
          proOptions={{ hideAttribution: true }}
          className="[&_.react-flow__background]:!bg-[var(--jarvis-bg-primary)]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="var(--jarvis-border)"
          />
          <MiniMap
            style={{
              backgroundColor: "var(--jarvis-bg-secondary)",
              border: "1px solid var(--jarvis-border)",
              borderRadius: 8,
            }}
            maskColor="rgba(0, 0, 0, 0.5)"
            nodeColor={(node) => {
              const data = node.data as AgentNodeData | undefined;
              return data?.deptColor ?? "var(--jarvis-accent)";
            }}
          />
          <Controls
            className="[&_button]:!bg-[var(--jarvis-bg-secondary)] [&_button]:!border-[var(--jarvis-border)] [&_button]:!fill-[var(--jarvis-text-secondary)] [&_button:hover]:!bg-[var(--jarvis-bg-tertiary)]"
          />
        </ReactFlow>
      </motion.div>
    </motion.div>
  );
}
