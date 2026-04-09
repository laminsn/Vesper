"use client";

import { Bot, Crown, Building2 } from "lucide-react";
import { cn, formatRelativeTime, getDepartmentColor } from "@/lib/utils";
import { StatusIndicator } from "./status-indicator";
import { GlowCard } from "./glow-card";
import type { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  onClick?: (agent: Agent) => void;
  compact?: boolean;
  className?: string;
}

const tierIcons = {
  orchestrator: Crown,
  director: Building2,
  specialist: Bot,
};

export function AgentCard({
  agent,
  onClick,
  compact = false,
  className,
}: AgentCardProps) {
  const TierIcon = tierIcons[agent.tier];
  const deptColor = getDepartmentColor(agent.department);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2",
          "border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)]",
          "hover:border-[var(--jarvis-border-strong)] transition-colors cursor-pointer",
          className
        )}
        onClick={() => onClick?.(agent)}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${deptColor}20` }}
        >
          <TierIcon className="h-4 w-4" style={{ color: deptColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--jarvis-text-primary)] truncate">
            {agent.name}
          </p>
          <p className="text-xs text-[var(--jarvis-text-muted)] truncate">
            {agent.role}
          </p>
        </div>
        <StatusIndicator status={agent.status} size="sm" />
      </div>
    );
  }

  return (
    <GlowCard
      className={cn("p-4", className)}
      glowColor={deptColor}
      onClick={() => onClick?.(agent)}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${deptColor}15` }}
        >
          <TierIcon className="h-5 w-5" style={{ color: deptColor }} />
        </div>
        <StatusIndicator status={agent.status} showLabel />
      </div>

      <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] mb-0.5">
        {agent.name}
      </h3>
      <p className="text-xs text-[var(--jarvis-text-secondary)] mb-3">
        {agent.role}
      </p>

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: `${deptColor}15`,
            color: deptColor,
          }}
        >
          {agent.department.replace(/-/g, " ")}
        </span>
        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
          {formatRelativeTime(agent.last_seen_at)}
        </span>
      </div>
    </GlowCard>
  );
}
