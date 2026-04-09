"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, Circle, X, SkipForward } from "lucide-react";
import type { StepStatus } from "@/types";

interface PlaybookStepTrackerProps {
  steps: Array<{
    step_number: number;
    description: string;
    agent_slug: string;
    sla: string | null;
  }>;
  stepStatuses: StepStatus[];
  currentStep: number;
  className?: string;
}

const statusIcons = {
  pending: Circle,
  running: Loader2,
  completed: Check,
  failed: X,
  skipped: SkipForward,
};

const statusColors = {
  pending: "text-[var(--jarvis-text-muted)] border-[var(--jarvis-text-muted)]",
  running:
    "text-[var(--jarvis-accent-2)] border-[var(--jarvis-accent-2)] shadow-[0_0_8px_var(--jarvis-accent-2)]",
  completed:
    "text-[var(--jarvis-success)] border-[var(--jarvis-success)]",
  failed: "text-[var(--jarvis-danger)] border-[var(--jarvis-danger)]",
  skipped: "text-[var(--jarvis-text-muted)] border-[var(--jarvis-text-muted)]",
};

export function PlaybookStepTracker({
  steps,
  stepStatuses,
  currentStep,
  className,
}: PlaybookStepTrackerProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, idx) => {
        const stepStatus = stepStatuses.find((s) => s.step === step.step_number);
        const status = stepStatus?.status ?? "pending";
        const Icon = statusIcons[status];
        const isLast = idx === steps.length - 1;
        const isCurrent = step.step_number === currentStep;

        return (
          <div key={step.step_number} className="flex gap-3">
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2",
                  statusColors[status],
                  isCurrent && "ring-2 ring-[var(--jarvis-accent-2)]/30"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    status === "running" && "animate-spin"
                  )}
                />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1 min-h-[24px]",
                    status === "completed"
                      ? "bg-[var(--jarvis-success)]"
                      : "bg-[var(--jarvis-border)]"
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-[var(--jarvis-text-primary)]"
                    : "text-[var(--jarvis-text-secondary)]"
                )}
              >
                Step {step.step_number}: {step.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[var(--jarvis-text-muted)]">
                  {step.agent_slug}
                </span>
                {step.sla && (
                  <span className="text-[10px] text-[var(--jarvis-text-muted)] font-mono">
                    SLA: {step.sla}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
