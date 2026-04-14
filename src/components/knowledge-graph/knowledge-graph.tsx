"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react";

import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { useHandoffs } from "@/hooks/use-handoffs";
import { HudFrame } from "@/components/jarvis";

import { useKnowledgeGraphData } from "./use-knowledge-graph-data";
import { useForceLayout } from "./use-force-layout";
import { AgentGraphNode } from "./nodes/agent-graph-node";
import { DepartmentGraphNode } from "./nodes/department-graph-node";
import { PlaybookGraphNode } from "./nodes/playbook-graph-node";
import { GlowEdge } from "./edges/glow-edge";
import type { GraphEdgeData } from "./graph-types";

/* ───── Node & edge type registries ───── */

const nodeTypes: NodeTypes = {
  agentGraph: AgentGraphNode,
  departmentGraph: DepartmentGraphNode,
  playbookGraph: PlaybookGraphNode,
};

const edgeTypes: EdgeTypes = {
  glowEdge: GlowEdge,
};

/* ───── Legend items ───── */

const LEGEND = [
  { label: "Agent", shape: "circle", color: "#06d6a0" },
  { label: "Department", shape: "hexagon", color: "#4cc9f0" },
  { label: "Playbook", shape: "diamond", color: "#7c3aed" },
  { label: "Hierarchy", shape: "line-solid", color: "#06d6a0" },
  { label: "Handoff", shape: "line-dashed", color: "#f59e0b" },
] as const;

/* ───── Component ───── */

const GRAPH_HEIGHT = 500;

export function KnowledgeGraph() {
  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();
  const { data: playbooks = [] } = usePlaybooks();
  const { data: handoffs = [] } = useHandoffs();

  const [expanded, setExpanded] = useState(true);
  const [showMembership, setShowMembership] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: GRAPH_HEIGHT });

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: GRAPH_HEIGHT,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Build graph data
  const { nodes: rawNodes, edges: rawEdges } = useKnowledgeGraphData({
    agents,
    departments,
    playbooks,
    handoffs,
  });

  // Compute force layout
  const positionedNodes = useForceLayout(
    rawNodes,
    rawEdges,
    dimensions.width,
    dimensions.height
  );

  // Filter edges: hide membership by default, apply hover dimming
  const visibleEdges = useMemo(() => {
    return rawEdges
      .filter((edge) => {
        if (!showMembership && (edge.data as GraphEdgeData)?.edgeType === "membership") {
          return false;
        }
        return true;
      })
      .map((edge) => {
        if (!hoveredNodeId) return edge;

        const isConnected =
          edge.source === hoveredNodeId || edge.target === hoveredNodeId;

        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: isConnected ? 1 : 0.08,
            transition: "opacity 0.2s ease",
          },
        };
      });
  }, [rawEdges, showMembership, hoveredNodeId]);

  // Dim nodes that aren't connected to hovered node
  const styledNodes = useMemo(() => {
    if (!hoveredNodeId) return positionedNodes;

    const connectedNodeIds = new Set<string>([hoveredNodeId]);
    for (const edge of rawEdges) {
      if (edge.source === hoveredNodeId) connectedNodeIds.add(edge.target as string);
      if (edge.target === hoveredNodeId) connectedNodeIds.add(edge.source as string);
    }

    return positionedNodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        opacity: connectedNodeIds.has(node.id) ? 1 : 0.15,
        transition: "opacity 0.2s ease",
      },
    }));
  }, [positionedNodes, hoveredNodeId, rawEdges]);

  // Hover handlers
  const handleNodeMouseEnter: NodeMouseHandler = useCallback((_event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const toggleExpanded = useCallback(() => setExpanded((p) => !p), []);
  const toggleMembership = useCallback(() => setShowMembership((p) => !p), []);

  const isEmpty = rawNodes.length === 0;

  return (
    <HudFrame title="KNOWLEDGE GRAPH" color="var(--jarvis-accent-2)">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Network size={16} className="text-[var(--jarvis-accent-2)]" />
          <span className="text-xs text-[var(--jarvis-text-secondary)]">
            {agents.length} agents &middot; {departments.length} depts
            {playbooks.length > 0 && ` · ${playbooks.length} playbooks`}
            {handoffs.length > 0 && ` · ${handoffs.length} handoffs`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMembership}
            className="p-1.5 rounded hover:bg-[var(--jarvis-bg-tertiary)] transition-colors"
            title={showMembership ? "Hide membership links" : "Show membership links"}
          >
            {showMembership ? (
              <EyeOff size={14} className="text-[var(--jarvis-text-muted)]" />
            ) : (
              <Eye size={14} className="text-[var(--jarvis-text-muted)]" />
            )}
          </button>
          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded hover:bg-[var(--jarvis-bg-tertiary)] transition-colors"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <Minimize2 size={14} className="text-[var(--jarvis-text-muted)]" />
            ) : (
              <Maximize2 size={14} className="text-[var(--jarvis-text-muted)]" />
            )}
          </button>
        </div>
      </div>

      {/* Graph container */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            ref={containerRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: GRAPH_HEIGHT, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-primary)] overflow-hidden relative"
          >
            {isEmpty ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">
                  Loading knowledge graph...
                </p>
              </div>
            ) : (
              <ReactFlow
                nodes={[...styledNodes] as Node[]}
                edges={visibleEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeMouseEnter={handleNodeMouseEnter}
                onNodeMouseLeave={handleNodeMouseLeave}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
                className="[&_.react-flow__background]:!bg-[var(--jarvis-bg-primary)]"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={24}
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
                    if (node.id.startsWith("dept-")) return "#4cc9f0";
                    if (node.id.startsWith("pb-")) return "#7c3aed";
                    const data = node.data as { deptColor?: string } | undefined;
                    return data?.deptColor ?? "#06d6a0";
                  }}
                />
                <Controls
                  className="[&_button]:!bg-[var(--jarvis-bg-secondary)] [&_button]:!border-[var(--jarvis-border)] [&_button]:!fill-[var(--jarvis-text-secondary)] [&_button:hover]:!bg-[var(--jarvis-bg-tertiary)]"
                />
              </ReactFlow>
            )}

            {/* Legend overlay */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-[var(--jarvis-bg-secondary)]/80 backdrop-blur-sm rounded px-3 py-1.5 border border-[var(--jarvis-border)]">
              {LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  {item.shape === "circle" && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 4px ${item.color}40` }}
                    />
                  )}
                  {item.shape === "hexagon" && (
                    <div
                      className="w-3 h-3"
                      style={{
                        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                        backgroundColor: item.color,
                      }}
                    />
                  )}
                  {item.shape === "diamond" && (
                    <div
                      className="w-2.5 h-2.5"
                      style={{
                        transform: "rotate(45deg)",
                        backgroundColor: item.color,
                      }}
                    />
                  )}
                  {item.shape === "line-solid" && (
                    <div className="w-4 h-[1.5px]" style={{ backgroundColor: item.color }} />
                  )}
                  {item.shape === "line-dashed" && (
                    <div
                      className="w-4 h-[1.5px]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 3px, transparent 3px, transparent 5px)`,
                      }}
                    />
                  )}
                  <span className="text-[8px] text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HudFrame>
  );
}
