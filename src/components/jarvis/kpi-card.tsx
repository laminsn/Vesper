"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { GlowCard } from "./glow-card";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "flat" | "unknown";
  trendValue?: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "var(--jarvis-accent)",
  className,
}: KpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-[var(--jarvis-success)]"
      : trend === "down"
        ? "text-[var(--jarvis-danger)]"
        : "text-[var(--jarvis-text-muted)]";

  return (
    <GlowCard className={cn("p-4", className)} glowColor={color} hover={false}>
      <div className="flex items-start justify-between mb-2">
        <span className="heading-mono">{title}</span>
        {Icon && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        )}
      </div>

      <p
        className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight"
        style={{ color }}
      >
        {value}
      </p>

      <div className="flex items-center justify-between mt-2">
        {subtitle && (
          <span className="text-xs text-[var(--jarvis-text-muted)]">
            {subtitle}
          </span>
        )}
        {trend && trend !== "unknown" && (
          <span className={cn("flex items-center gap-1 text-xs", trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        )}
      </div>
    </GlowCard>
  );
}
