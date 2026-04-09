"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUp, Minus, ArrowDown } from "lucide-react";
import type { TaskPriority } from "@/types";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; icon: typeof AlertTriangle; className: string }
> = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    className: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  normal: {
    label: "Normal",
    icon: Minus,
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  low: {
    label: "Low",
    icon: ArrowDown,
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
