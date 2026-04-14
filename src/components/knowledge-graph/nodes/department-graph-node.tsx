"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { DepartmentNodeData } from "../graph-types";

function DepartmentGraphNodeInner({ data }: NodeProps<Node<DepartmentNodeData>>) {
  const { department, agentCount } = data;
  const color = department.color;

  return (
    <div
      className="group relative"
      title={`${department.name} — ${agentCount} agents`}
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

      {/* Pulsing glow ring */}
      <div
        className="absolute inset-[-6px] rounded-full"
        style={{
          animation: "pulse-glow 3s ease-in-out infinite",
          boxShadow: `0 0 20px ${color}30, 0 0 40px ${color}10`,
        }}
      />

      {/* Hexagonal node */}
      <div
        className="flex flex-col items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{
          width: 56,
          height: 56,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          backgroundColor: `${color}18`,
          boxShadow: `inset 0 0 12px ${color}15, 0 0 12px ${color}30`,
        }}
      >
        <span
          className="font-bold text-[var(--jarvis-text-primary)]"
          style={{ fontSize: 14 }}
        >
          {agentCount}
        </span>
      </div>

      {/* Border overlay (since clip-path clips the border) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          width: 56,
          height: 56,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          border: `2px solid ${color}60`,
        }}
      />

      {/* Department name label */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap">
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ color, backgroundColor: `${color}10` }}
        >
          {department.name}
        </span>
      </div>
    </div>
  );
}

export const DepartmentGraphNode = memo(DepartmentGraphNodeInner);
