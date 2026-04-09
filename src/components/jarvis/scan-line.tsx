"use client";

import { cn } from "@/lib/utils";

const SPEEDS = {
  slow: 10,
  medium: 6,
  fast: 3,
} as const;

interface ScanLineProps {
  readonly speed?: keyof typeof SPEEDS;
  readonly color?: string;
  readonly className?: string;
}

export function ScanLine({
  speed = "slow",
  color = "var(--jarvis-accent)",
  className,
}: ScanLineProps) {
  const duration = SPEEDS[speed];

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none z-10", className)}
      aria-hidden="true"
    >
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.08,
          boxShadow: `0 0 12px 2px ${color}`,
          animation: `jarvis-scan ${duration}s linear infinite`,
        }}
      />
      <style jsx>{`
        @keyframes jarvis-scan {
          0% {
            top: -2px;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
