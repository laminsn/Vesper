"use client";

import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/types";

interface StatusIndicatorProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<
  AgentStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-[var(--jarvis-success)] shadow-[0_0_8px_var(--jarvis-success)] animate-pulse-glow",
  },
  executing: {
    label: "Executing",
    className: "bg-[var(--jarvis-accent-2)] shadow-[0_0_8px_var(--jarvis-accent-2)] animate-pulse-glow",
  },
  idle: {
    label: "Idle",
    className: "bg-[var(--jarvis-warning)] shadow-[0_0_4px_rgba(245,158,11,0.3)]",
  },
  offline: {
    label: "Offline",
    className: "bg-[var(--jarvis-text-muted)]",
  },
};

const sizeMap = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export function StatusIndicator({
  status,
  size = "md",
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("rounded-full", sizeMap[size], config.className)}
      />
      {showLabel && (
        <span className="text-xs text-[var(--jarvis-text-secondary)] capitalize">
          {config.label}
        </span>
      )}
    </span>
  );
}
