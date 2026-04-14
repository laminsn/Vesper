"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { PlaybookNodeData } from "../graph-types";

function PlaybookGraphNodeInner({ data }: NodeProps<Node<PlaybookNodeData>>) {
  const { playbook } = data;

  return (
    <div
      className="group relative"
      title={`Play #${playbook.play_number}: ${playbook.name}`}
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

      {/* Diamond shape */}
      <div
        className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{
          width: 28,
          height: 28,
          transform: "rotate(45deg)",
          backgroundColor: "rgba(124, 58, 237, 0.2)",
          border: "1.5px solid rgba(124, 58, 237, 0.7)",
          boxShadow: "0 0 8px rgba(124, 58, 237, 0.25)",
        }}
      >
        <span
          className="font-bold text-[var(--jarvis-text-primary)] select-none"
          style={{ fontSize: 10, transform: "rotate(-45deg)" }}
        >
          {playbook.play_number}
        </span>
      </div>

      {/* Name tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <span className="text-[9px] font-medium text-[var(--jarvis-text-secondary)] bg-[var(--jarvis-bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--jarvis-border)]">
          {playbook.name}
        </span>
      </div>
    </div>
  );
}

export const PlaybookGraphNode = memo(PlaybookGraphNodeInner);
