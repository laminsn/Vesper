"use client";

import { cn } from "@/lib/utils";

interface SlaBarProps {
  label: string;
  targetMinutes: number;
  actualMinutes: number | null;
  className?: string;
}

export function SlaBar({
  label,
  targetMinutes,
  actualMinutes,
  className,
}: SlaBarProps) {
  const percentage =
    actualMinutes != null
      ? Math.min((actualMinutes / targetMinutes) * 100, 150)
      : 0;

  const isMet = actualMinutes != null && actualMinutes <= targetMinutes;
  const isWarning =
    actualMinutes != null &&
    actualMinutes > targetMinutes * 0.8 &&
    actualMinutes <= targetMinutes;

  const barColor = !actualMinutes
    ? "var(--jarvis-text-muted)"
    : isMet && !isWarning
      ? "var(--jarvis-success)"
      : isWarning
        ? "var(--jarvis-warning)"
        : "var(--jarvis-danger)";

  const displayActual =
    actualMinutes != null
      ? actualMinutes < 60
        ? `${actualMinutes}m`
        : `${(actualMinutes / 60).toFixed(1)}h`
      : "--";

  const displayTarget =
    targetMinutes < 60
      ? `${targetMinutes}m`
      : `${(targetMinutes / 60).toFixed(1)}h`;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--jarvis-text-secondary)]">
          {label}
        </span>
        <span className="text-xs font-mono" style={{ color: barColor }}>
          {displayActual} / {displayTarget}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--jarvis-bg-tertiary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: barColor,
            boxShadow: `0 0 6px ${barColor}`,
          }}
        />
      </div>
    </div>
  );
}
