"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface RingData {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly color: string;
}

interface DataRingProps {
  readonly rings: readonly RingData[];
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const SIZES = {
  sm: { width: 140, baseRadius: 30, gap: 12, stroke: 6, fontSize: 9 },
  md: { width: 220, baseRadius: 48, gap: 16, stroke: 8, fontSize: 11 },
  lg: { width: 320, baseRadius: 72, gap: 20, stroke: 10, fontSize: 13 },
} as const;

const ARC_DEGREES = 270;
const START_ANGLE = 135;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function RingArc({
  cx,
  cy,
  radius,
  stroke,
  pct,
  color,
  index,
  glowId,
}: {
  cx: number;
  cy: number;
  radius: number;
  stroke: number;
  pct: number;
  color: string;
  index: number;
  glowId: string;
}) {
  const bgPath = describeArc(cx, cy, radius, START_ANGLE, START_ANGLE + ARC_DEGREES);
  const fillAngle = START_ANGLE + ARC_DEGREES * pct;
  const fillPath = pct > 0.005 ? describeArc(cx, cy, radius, START_ANGLE, fillAngle) : "";

  const rotationSpeed = 30 + index * 15;

  return (
    <g>
      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="var(--jarvis-bg-tertiary)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {fillPath && (
        <path
          d={fillPath}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          style={{
            transition: "d 1s ease-out",
          }}
        />
      )}
      {/* Rotating indicator dot on each ring */}
      <circle
        cx={cx}
        cy={cy - radius}
        r={stroke / 3}
        fill={color}
        fillOpacity="0.6"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `data-ring-orbit ${rotationSpeed}s linear infinite`,
        }}
      />
    </g>
  );
}

export function DataRing({ rings, size = "md", className }: DataRingProps) {
  const [animated, setAnimated] = useState(false);
  const s = SIZES[size];
  const cx = s.width / 2;
  const cy = s.width / 2;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const displayRings = rings.slice(0, 4);
  const glowId = "data-ring-glow";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={s.width} height={s.width} viewBox={`0 0 ${s.width} ${s.width}`}>
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {displayRings.map((ring, i) => {
          const radius = s.baseRadius + i * s.gap;
          const pct = animated ? Math.min(ring.value / ring.max, 1) : 0;

          return (
            <RingArc
              key={ring.label}
              cx={cx}
              cy={cy}
              radius={radius}
              stroke={s.stroke}
              pct={pct}
              color={ring.color}
              index={i}
              glowId={glowId}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 translate-y-6">
        {displayRings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: ring.color, boxShadow: `0 0 6px ${ring.color}` }}
            />
            <span className="font-mono uppercase" style={{ fontSize: s.fontSize, color: "var(--jarvis-text-muted)" }}>
              {ring.label}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes data-ring-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
