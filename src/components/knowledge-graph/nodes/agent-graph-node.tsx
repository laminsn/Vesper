"use client";

import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useRouter } from "next/navigation";
import type { AgentNodeData } from "../graph-types";

function statusColor(status: string): string {
  switch (status) {
    case "active": return "#22c55e";
    case "executing": return "#f59e0b";
    case "idle": return "#94a3b8";
    case "offline": return "#ef4444";
    default: return "#94a3b8";
  }
}

function AgentGraphNodeInner({ data }: NodeProps<Node<AgentNodeData>>) {
  const { agent, deptColor, deptLabel, size } = data;
  const router = useRouter();
  const sColor = statusColor(agent.status);

  const handleClick = useCallback(() => {
    router.push(`/agents/${agent.slug}`);
  }, [router, agent.slug]);

  return (
    <div
      className="group relative cursor-pointer"
      onClick={handleClick}
      title={`${agent.name}\n${agent.role}\n${deptLabel}`}
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

      {/* Outer glow ring (visible on hover) */}
      <div
        className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 0 16px ${deptColor}60, 0 0 32px ${deptColor}20`,
        }}
      />

      {/* Main circle */}
      <div
        className="rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
        style={{
          width: size,
          height: size,
          backgroundColor: `${deptColor}20`,
          border: `1.5px solid ${deptColor}`,
          boxShadow: `0 0 8px ${deptColor}25`,
        }}
      >
        <span
          className="font-semibold text-[var(--jarvis-text-primary)] select-none"
          style={{ fontSize: Math.max(size * 0.35, 9) }}
        >
          {agent.name.charAt(0)}
        </span>
      </div>

      {/* Status dot */}
      <div
        className="absolute rounded-full border border-[var(--jarvis-bg-primary)]"
        style={{
          width: 8,
          height: 8,
          backgroundColor: sColor,
          boxShadow: `0 0 4px ${sColor}80`,
          bottom: -1,
          right: -1,
        }}
      />

      {/* Name label (visible on hover) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <span className="text-[9px] font-medium text-[var(--jarvis-text-secondary)] bg-[var(--jarvis-bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--jarvis-border)]">
          {agent.name}
        </span>
      </div>
    </div>
  );
}

export const AgentGraphNode = memo(AgentGraphNodeInner);
