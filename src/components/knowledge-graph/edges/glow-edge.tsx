"use client";

import { memo } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import type { GraphEdgeData } from "../graph-types";

/* ───── Edge style presets by type ───── */

function getEdgeStyle(edgeType: string): {
  strokeWidth: number;
  opacity: number;
  dashArray: string;
  animated: boolean;
  glowOpacity: number;
} {
  switch (edgeType) {
    case "hierarchy":
      return {
        strokeWidth: 1.5,
        opacity: 0.7,
        dashArray: "none",
        animated: false,
        glowOpacity: 0.25,
      };
    case "membership":
      return {
        strokeWidth: 0.8,
        opacity: 0.12,
        dashArray: "4 4",
        animated: false,
        glowOpacity: 0.08,
      };
    case "handoff":
      return {
        strokeWidth: 1.2,
        opacity: 0.6,
        dashArray: "6 3",
        animated: true,
        glowOpacity: 0.3,
      };
    case "playbook":
      return {
        strokeWidth: 0.8,
        opacity: 0.4,
        dashArray: "2 3",
        animated: false,
        glowOpacity: 0.15,
      };
    default:
      return {
        strokeWidth: 1,
        opacity: 0.5,
        dashArray: "none",
        animated: false,
        glowOpacity: 0.2,
      };
  }
}

/* ───── Component ───── */

function GlowEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<GraphEdgeData>>) {
  const edgeType = data?.edgeType ?? "hierarchy";
  const color = data?.color ?? "var(--jarvis-accent)";
  const style = getEdgeStyle(edgeType);

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const glowFilterId = `glow-${id}`;

  return (
    <>
      <defs>
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Glow layer */}
      <BaseEdge
        id={`${id}-glow`}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: style.strokeWidth * 3,
          opacity: style.glowOpacity,
          filter: `url(#${glowFilterId})`,
          strokeDasharray: style.dashArray,
        }}
      />

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: style.strokeWidth,
          opacity: style.opacity,
          strokeDasharray: style.dashArray,
          ...(style.animated
            ? {
                animation: "glow-edge-flow 1.5s linear infinite",
              }
            : {}),
        }}
      />
    </>
  );
}

export const GlowEdge = memo(GlowEdgeInner);

/* CSS keyframe injected once */
if (typeof document !== "undefined") {
  const styleId = "glow-edge-flow-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes glow-edge-flow {
        to { stroke-dashoffset: -24; }
      }
    `;
    document.head.appendChild(style);
  }
}
