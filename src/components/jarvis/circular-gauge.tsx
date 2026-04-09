"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const SIZES = {
  sm: { width: 100, stroke: 6, radius: 40, fontSize: 20, labelSize: 10 },
  md: { width: 160, stroke: 8, radius: 64, fontSize: 32, labelSize: 12 },
  lg: { width: 240, stroke: 10, radius: 96, fontSize: 48, labelSize: 14 },
} as const;

const ARC_DEGREES = 270;
const START_ANGLE = 135;

interface CircularGaugeProps {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly unit?: string;
  readonly color?: string;
  readonly size?: keyof typeof SIZES;
  readonly className?: string;
}

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

export function CircularGauge({
  value,
  max,
  label,
  unit = "",
  color = "var(--jarvis-accent)",
  size = "md",
  className,
}: CircularGaugeProps) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const s = SIZES[size];
  const cx = s.width / 2;
  const cy = s.width / 2;
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(pct), 50);
    return () => clearTimeout(timer);
  }, [pct]);

  const bgPath = describeArc(cx, cy, s.radius, START_ANGLE, START_ANGLE + ARC_DEGREES);
  const fillAngle = START_ANGLE + ARC_DEGREES * animatedPct;
  const fillPath = animatedPct > 0.005
    ? describeArc(cx, cy, s.radius, START_ANGLE, fillAngle)
    : "";

  const gradientId = `gauge-grad-${label.replace(/\s/g, "-")}`;
  const glowId = `gauge-glow-${label.replace(/\s/g, "-")}`;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={s.width} height={s.width} viewBox={`0 0 ${s.width} ${s.width}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="var(--jarvis-accent-2)" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--jarvis-bg-tertiary)"
          strokeWidth={s.stroke}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
            style={{
              transition: "d 1s ease-out",
            }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-display font-bold leading-none" style={{ fontSize: s.fontSize, color }}>
          {value}
          {unit && (
            <span style={{ fontSize: s.fontSize * 0.5, opacity: 0.7 }}>{unit}</span>
          )}
        </span>
      </div>

      {/* Label below */}
      <span
        className="font-mono uppercase tracking-widest mt-1 text-center"
        style={{
          fontSize: s.labelSize,
          color: "var(--jarvis-text-secondary)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
