"use client";

import { cn, getDepartmentColor } from "@/lib/utils";
import {
  Crown,
  Megaphone,
  HeartPulse,
  UserPlus,
  Users,
  Heart,
  Shield,
  Calculator,
  type LucideIcon,
} from "lucide-react";

const deptIcons: Record<string, LucideIcon> = {
  executive: Crown,
  marketing: Megaphone,
  "clinical-operations": HeartPulse,
  "admissions-intake": UserPlus,
  "caregiver-staffing": Users,
  "customer-experience": Heart,
  "compliance-quality": Shield,
  "accounting-finance": Calculator,
};

interface DepartmentBadgeProps {
  slug: string;
  name?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function DepartmentBadge({
  slug,
  name,
  size = "sm",
  showIcon = true,
  className,
}: DepartmentBadgeProps) {
  const color = getDepartmentColor(slug);
  const Icon = deptIcons[slug];
  const displayName = name ?? slug.replace(/-/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-medium capitalize",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {showIcon && Icon && (
        <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      )}
      {displayName}
    </span>
  );
}
