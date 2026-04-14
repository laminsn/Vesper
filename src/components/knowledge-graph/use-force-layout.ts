"use client";

import { useMemo } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { GraphNode, GraphEdge, GraphEdgeData } from "./graph-types";

/* ───── Simulation types ───── */

interface ForceNode extends SimulationNodeDatum {
  readonly id: string;
  readonly group: string;
  readonly radius: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  readonly edgeType: string;
}

/* ───── Cluster centers ───── */

function buildClusterCenters(
  nodes: readonly GraphNode[]
): Record<string, { x: number; y: number }> {
  const deptNodes = nodes.filter((n) => n.id.startsWith("dept-"));
  const count = deptNodes.length;
  if (count === 0) return {};

  const centers: Record<string, { x: number; y: number }> = {};
  const radius = Math.max(200, count * 40);

  deptNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    centers[node.id] = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return centers;
}

function getNodeGroup(node: GraphNode): string {
  if (node.id.startsWith("dept-")) return node.id;
  if (node.id.startsWith("pb-")) return "playbooks";
  const data = node.data as { agent?: { department?: string } };
  return data.agent?.department ? `dept-${data.agent.department}` : "unknown";
}

function getNodeRadius(node: GraphNode): number {
  if (node.id.startsWith("dept-")) return 32;
  if (node.id.startsWith("pb-")) return 16;
  const data = node.data as { size?: number };
  return (data.size ?? 24) / 2;
}

/* ───── Force layout hook ───── */

export function useForceLayout(
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
  width: number,
  height: number
): readonly GraphNode[] {
  return useMemo(() => {
    if (nodes.length === 0) return [];

    const clusterCenters = buildClusterCenters(nodes);

    const simNodes: ForceNode[] = nodes.map((node) => {
      const group = getNodeGroup(node);
      const center = clusterCenters[group];
      return {
        id: node.id,
        group,
        radius: getNodeRadius(node),
        x: center?.x ?? (Math.random() - 0.5) * 400,
        y: center?.y ?? (Math.random() - 0.5) * 400,
      };
    });

    const nodeIdSet = new Set(simNodes.map((n) => n.id));

    const simLinks: ForceLink[] = edges
      .filter((e) => nodeIdSet.has(e.source as string) && nodeIdSet.has(e.target as string))
      .map((edge) => ({
        source: edge.source,
        target: edge.target,
        edgeType: (edge.data as GraphEdgeData)?.edgeType ?? "hierarchy",
      }));

    const simulation = forceSimulation<ForceNode>(simNodes)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(simLinks)
          .id((d) => d.id)
          .distance((link) => {
            switch (link.edgeType) {
              case "hierarchy": return 80;
              case "membership": return 60;
              case "handoff": return 140;
              case "playbook": return 100;
              default: return 80;
            }
          })
          .strength((link) => {
            switch (link.edgeType) {
              case "hierarchy": return 0.7;
              case "membership": return 0.3;
              case "handoff": return 0.2;
              case "playbook": return 0.15;
              default: return 0.3;
            }
          })
      )
      .force("charge", forceManyBody<ForceNode>().strength(-120).distanceMax(400))
      .force("center", forceCenter(width / 2, height / 2).strength(0.05))
      .force(
        "collide",
        forceCollide<ForceNode>().radius((d) => d.radius + 8).strength(0.8)
      )
      .force(
        "clusterX",
        forceX<ForceNode>((d) => clusterCenters[d.group]?.x ?? width / 2).strength(0.08)
      )
      .force(
        "clusterY",
        forceY<ForceNode>((d) => clusterCenters[d.group]?.y ?? height / 2).strength(0.08)
      )
      .stop();

    // Run ticks synchronously for stable initial layout
    for (let i = 0; i < 300; i++) {
      simulation.tick();
    }

    // Build positioned nodes (immutable)
    const positionMap = new Map<string, { x: number; y: number }>();
    for (const sn of simNodes) {
      positionMap.set(sn.id, { x: sn.x ?? 0, y: sn.y ?? 0 });
    }

    return nodes.map((node) => {
      const pos = positionMap.get(node.id) ?? { x: 0, y: 0 };
      return { ...node, position: { x: pos.x, y: pos.y } };
    });
  }, [nodes, edges, width, height]);
}
