"use client";

import { cn } from "@/lib/utils";

interface TickerItem {
  readonly text: string;
  readonly color: string;
  readonly icon?: string;
}

interface TickerBarProps {
  readonly items: readonly TickerItem[];
  readonly speed?: "slow" | "medium" | "fast";
  readonly className?: string;
}

const SPEEDS = {
  slow: 40,
  medium: 25,
  fast: 12,
} as const;

function TickerContent({ items }: { items: readonly TickerItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 mx-4 whitespace-nowrap">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: item.color,
              boxShadow: `0 0 6px ${item.color}`,
            }}
          />
          <span
            className="font-mono text-xs"
            style={{ color: "var(--jarvis-text-secondary)" }}
          >
            {item.text}
          </span>
        </span>
      ))}
    </>
  );
}

export function TickerBar({ items, speed = "medium", className }: TickerBarProps) {
  if (items.length === 0) return null;

  const duration = SPEEDS[speed];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y",
        className
      )}
      style={{
        borderColor: "var(--jarvis-border)",
        background: "var(--jarvis-bg-secondary)",
      }}
    >
      <div
        className="flex py-2"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          width: "max-content",
        }}
      >
        {/* Duplicate content for seamless loop */}
        <TickerContent items={items} />
        <TickerContent items={items} />
      </div>

      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-12 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, var(--jarvis-bg-secondary), transparent)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-12 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(270deg, var(--jarvis-bg-secondary), transparent)",
        }}
      />

      <style jsx>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
