"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  readonly dotColor?: string;
  readonly dotSize?: number;
  readonly gap?: number;
  readonly className?: string;
}

export function GridBackground({
  dotColor = "var(--jarvis-accent)",
  dotSize = 1,
  gap = 24,
  className,
}: GridBackgroundProps) {
  const patternId = `jarvis-grid-${gap}-${dotSize}`;

  return (
    <div
      className={cn("absolute inset-0 pointer-events-none z-0", className)}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={dotColor} opacity="0.04" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
