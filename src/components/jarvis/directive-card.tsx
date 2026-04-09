"use client";

import { cn, formatRelativeTime } from "@/lib/utils";
import { Send, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { GlowCard } from "./glow-card";
import type { Directive, DirectiveStatus } from "@/types";

interface DirectiveCardProps {
  directive: Directive;
  agentName?: string;
  className?: string;
}

const statusConfig: Record<
  DirectiveStatus,
  { icon: typeof Send; label: string; color: string }
> = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "var(--jarvis-warning)",
  },
  acknowledged: {
    icon: AlertCircle,
    label: "Acknowledged",
    color: "var(--jarvis-accent-2)",
  },
  in_progress: {
    icon: Send,
    label: "In Progress",
    color: "var(--jarvis-accent)",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "var(--jarvis-success)",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "var(--jarvis-text-muted)",
  },
};

export function DirectiveCard({
  directive,
  agentName,
  className,
}: DirectiveCardProps) {
  const config = statusConfig[directive.status];
  const StatusIcon = config.icon;

  return (
    <GlowCard className={cn("p-4", className)} hover={false}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon
            className="h-4 w-4"
            style={{ color: config.color }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
          {formatRelativeTime(directive.created_at)}
        </span>
      </div>

      {agentName && (
        <p className="text-xs text-[var(--jarvis-text-muted)] mb-1">
          To: <span className="text-[var(--jarvis-text-secondary)]">{agentName}</span>
        </p>
      )}

      <p className="text-sm text-[var(--jarvis-text-primary)] leading-relaxed">
        {directive.instruction}
      </p>

      {directive.response && (
        <div className="mt-3 rounded-lg bg-[var(--jarvis-bg-tertiary)] p-3 border border-[var(--jarvis-border)]">
          <p className="text-xs text-[var(--jarvis-text-muted)] mb-1">Response:</p>
          <p className="text-sm text-[var(--jarvis-text-secondary)]">
            {directive.response}
          </p>
        </div>
      )}
    </GlowCard>
  );
}
