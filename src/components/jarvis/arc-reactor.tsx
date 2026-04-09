"use client";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: { width: 120, outer: 52, middle: 40, inner: 24, core: 12, fontSize: 20, subSize: 10 },
  md: { width: 200, outer: 88, middle: 68, inner: 40, core: 20, fontSize: 32, subSize: 12 },
  lg: { width: 300, outer: 132, middle: 102, inner: 60, core: 30, fontSize: 48, subSize: 14 },
} as const;

interface ArcReactorProps {
  readonly size?: keyof typeof SIZES;
  readonly label?: string;
  readonly sublabel?: string;
  readonly color?: string;
  readonly className?: string;
}

export function ArcReactor({
  size = "md",
  label,
  sublabel,
  color = "var(--jarvis-accent)",
  className,
}: ArcReactorProps) {
  const s = SIZES[size];
  const cx = s.width / 2;
  const cy = s.width / 2;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: s.width, height: s.width }}
    >
      {/* Glow backdrop */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
      />

      <svg
        width={s.width}
        height={s.width}
        viewBox={`0 0 ${s.width} ${s.width}`}
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id={`arc-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--jarvis-accent-2)" stopOpacity="0.8" />
          </linearGradient>
          <filter id={`arc-glow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer rotating ring — dashed */}
        <circle
          cx={cx}
          cy={cy}
          r={s.outer}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="8 6"
          strokeOpacity="0.5"
          style={{ animation: "arc-spin 20s linear infinite" }}
          transform-origin={`${cx}px ${cy}px`}
        />

        {/* Middle pulsing ring */}
        <circle
          cx={cx}
          cy={cy}
          r={s.middle}
          fill="none"
          stroke={`url(#arc-grad-${size})`}
          strokeWidth="2.5"
          strokeOpacity="0.7"
          filter={`url(#arc-glow-${size})`}
          style={{ animation: "arc-pulse 3s ease-in-out infinite" }}
          transform-origin={`${cx}px ${cy}px`}
        />

        {/* Tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = s.middle + 6;
          const r2 = s.middle + (i % 3 === 0 ? 12 : 8);
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(angle)}
              y1={cy + r1 * Math.sin(angle)}
              x2={cx + r2 * Math.cos(angle)}
              y2={cy + r2 * Math.sin(angle)}
              stroke={color}
              strokeWidth={i % 3 === 0 ? "1.2" : "0.6"}
              strokeOpacity={i % 3 === 0 ? "0.6" : "0.3"}
            />
          );
        })}

        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={s.inner}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Core glow */}
        <circle
          cx={cx}
          cy={cy}
          r={s.core}
          fill={color}
          fillOpacity="0.15"
          stroke={color}
          strokeWidth="2"
          filter={`url(#arc-glow-${size})`}
          style={{ animation: "arc-core-pulse 2s ease-in-out infinite" }}
        />

        {/* Center bright dot */}
        <circle cx={cx} cy={cy} r={s.core / 3} fill={color} fillOpacity="0.9" />
      </svg>

      {/* Center label overlay */}
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: s.fontSize, color }}
          >
            {label}
          </span>
          {sublabel && (
            <span
              className="font-mono uppercase tracking-widest mt-1"
              style={{
                fontSize: s.subSize,
                color: "var(--jarvis-text-secondary)",
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes arc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes arc-pulse {
          0%, 100% { stroke-opacity: 0.7; }
          50% { stroke-opacity: 0.35; }
        }
        @keyframes arc-core-pulse {
          0%, 100% { fill-opacity: 0.15; stroke-opacity: 1; }
          50% { fill-opacity: 0.3; stroke-opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
