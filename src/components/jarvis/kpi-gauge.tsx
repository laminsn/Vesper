"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiGaugeProps {
  label: string;
  value: number | null;
  target: number | null;
  unit: string;
  trend: "up" | "down" | "flat" | "unknown";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KpiGauge({
  label,
  value,
  target,
  unit,
  trend,
  size = "md",
  className,
}: KpiGaugeProps) {
  const percentage =
    value != null && target != null && target > 0
      ? Math.min((value / target) * 100, 100)
      : 0;

  const radius = size === "sm" ? 30 : size === "md" ? 40 : 50;
  const strokeWidth = size === "sm" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return "var(--jarvis-success)";
    if (percentage >= 70) return "var(--jarvis-accent)";
    if (percentage >= 50) return "var(--jarvis-warning)";
    return "var(--jarvis-danger)";
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-[var(--jarvis-success)]"
      : trend === "down"
        ? "text-[var(--jarvis-danger)]"
        : "text-[var(--jarvis-text-muted)]";

  const displayValue = value != null ? `${value}${unit}` : "--";

  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="var(--jarvis-bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${getColor()})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-semibold text-[var(--jarvis-text-primary)]",
              size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
            )}
          >
            {displayValue}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p
          className={cn(
            "text-[var(--jarvis-text-secondary)] font-medium",
            size === "sm" ? "text-[10px]" : "text-xs"
          )}
        >
          {label}
        </p>
        {target != null && (
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-[10px] text-[var(--jarvis-text-muted)]">
              Target: {target}{unit}
            </span>
            <TrendIcon className={cn("h-3 w-3", trendColor)} />
          </div>
        )}
      </div>
    </div>
  );
}
