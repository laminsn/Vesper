// ═══════════════════════════════════════════════════
// Task Board — Enhanced Task Types & Mock Data
// ═══════════════════════════════════════════════════

import type { TaskPriority, TaskStatus } from "@/types";

/* ───── enhanced task type ───── */

export interface Subtask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

export interface TaskComment {
  readonly id: string;
  readonly author: string;
  readonly text: string;
  readonly created_at: string;
}

export interface EnhancedTask {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly assigned_agent_id: string;
  readonly department_id: string;
  readonly deadline: string | null;
  readonly created_at: string;
  readonly last_viewed_by: string | null;
  readonly last_viewed_at: string | null;
  readonly sign_off_required: boolean;
  readonly signed_off_by: string | null;
  readonly signed_off_at: string | null;
  readonly tags: readonly string[];
  readonly subtasks: readonly Subtask[];
  readonly comments: readonly TaskComment[];
}

/* ───── column config ───── */

export interface ColumnDef {
  readonly id: TaskStatus;
  readonly label: string;
  readonly accent: string;
}

export const DEFAULT_COLUMNS: readonly ColumnDef[] = [
  { id: "backlog", label: "Backlog", accent: "var(--jarvis-text-muted)" },
  { id: "todo", label: "To Do", accent: "var(--jarvis-accent-2)" },
  { id: "in_progress", label: "In Progress", accent: "var(--jarvis-accent)" },
  { id: "review", label: "Review", accent: "var(--jarvis-accent-3)" },
  { id: "blocked", label: "Blocked", accent: "var(--jarvis-danger)" },
  { id: "done", label: "Done", accent: "var(--jarvis-success)" },
] as const;

/* ───── task operations (callbacks) ───── */

export interface TaskOperations {
  readonly addTask: (task: EnhancedTask) => void;
  readonly updateTask: (id: string, updates: Partial<EnhancedTask>) => void;
  readonly moveTask: (id: string, newStatus: TaskStatus) => void;
  readonly deleteTask: (id: string) => void;
  readonly viewTask: (id: string) => void;
}

/* ───── deadline helpers ───── */

export function getDeadlineStatus(
  deadline: string | null
): "overdue" | "soon" | "ok" | "none" {
  if (!deadline) return "none";
  const now = new Date();
  const due = new Date(deadline);
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "overdue";
  if (diffDays < 3) return "soon";
  return "ok";
}

export function getDeadlineColor(status: ReturnType<typeof getDeadlineStatus>): string {
  switch (status) {
    case "overdue":
      return "text-red-400";
    case "soon":
      return "text-yellow-400";
    case "ok":
      return "text-green-400";
    case "none":
      return "text-[var(--jarvis-text-muted)]";
  }
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return "No deadline";
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ───── id generator ───── */

export function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
