import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return target.toLocaleDateString();
}

export function getDepartmentColor(slug: string): string {
  const colors: Record<string, string> = {
    executive: "var(--dept-executive)",
    marketing: "var(--dept-marketing)",
    "clinical-operations": "var(--dept-clinical)",
    "admissions-intake": "var(--dept-admissions)",
    "caregiver-staffing": "var(--dept-staffing)",
    "customer-experience": "var(--dept-cx)",
    "compliance-quality": "var(--dept-compliance)",
    "accounting-finance": "var(--dept-finance)",
  };
  return colors[slug] ?? "var(--jarvis-accent)";
}

export function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    active: "status-active",
    executing: "status-executing",
    idle: "status-idle",
    offline: "status-offline",
  };
  return classes[status] ?? "status-offline";
}
