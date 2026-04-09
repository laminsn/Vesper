"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DepartmentBadge } from "@/components/jarvis/department-badge";
import { getAgentBySlug } from "@/data/agents";
import type { DailyTaskInstance, TaskCategory, TaskAction } from "@/data/daily-task-templates";
import { CATEGORY_COLORS } from "@/data/daily-task-templates";

/* ───── Action chip color mapping ───── */

const ACTION_STYLES: Readonly<Record<TaskAction, string>> = {
  read: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  parse: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  summarize: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  report: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  reply: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  document: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  send: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  search: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  scrape: "bg-red-500/15 text-red-400 border-red-500/30",
  review: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  score: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  apply: "bg-green-500/15 text-green-400 border-green-500/30",
  follow_up: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

/* ───── Props ───── */

interface TaskRowProps {
  readonly task: DailyTaskInstance;
  readonly onToggleComplete: (taskId: string) => void;
  readonly onMetricChange: (
    taskId: string,
    metricKey: string,
    value: number
  ) => void;
  readonly compact?: boolean;
}

/* ───── Component ───── */

export function TaskRow({
  task,
  onToggleComplete,
  onMetricChange,
  compact = false,
}: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = getAgentBySlug(task.assigned_agent_slug);
  const catColor = CATEGORY_COLORS[task.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group rounded-lg border transition-all duration-200",
        task.completed
          ? "border-[var(--jarvis-success)]/20 bg-[var(--jarvis-success)]/5"
          : "border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] hover:border-[var(--jarvis-border-strong)]"
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
            task.completed
              ? "border-[var(--jarvis-success)] bg-[var(--jarvis-success)] text-black"
              : "border-[var(--jarvis-border-strong)] hover:border-[var(--jarvis-accent)] hover:shadow-[0_0_8px_var(--jarvis-accent)]"
          )}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>

        {/* Title + meta */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                task.completed
                  ? "text-[var(--jarvis-text-muted)] line-through"
                  : "text-[var(--jarvis-text-primary)]"
              )}
            >
              {task.title}
            </span>

            {/* Category badge */}
            <span
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
              style={{
                backgroundColor: `${catColor}15`,
                color: catColor,
              }}
            >
              {task.category.replace(/_/g, " ")}
            </span>
          </div>

          {!compact && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Agent name */}
              {agent && (
                <span className="text-[11px] text-[var(--jarvis-text-muted)]">
                  {agent.name}
                </span>
              )}

              {/* Department badge (for universal tasks) */}
              {task.department === "universal" && (
                <DepartmentBadge slug="executive" size="sm" />
              )}

              {/* Action chips */}
              {task.actions.map((action) => (
                <span
                  key={action}
                  className={cn(
                    "inline-flex items-center rounded border px-1.5 py-0 text-[9px] font-mono uppercase tracking-widest",
                    ACTION_STYLES[action]
                  )}
                >
                  {action}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Due time */}
        {task.due_time && (
          <span className="flex items-center gap-1 text-[11px] text-[var(--jarvis-text-muted)]">
            <Clock className="h-3 w-3" />
            {task.due_time}
          </span>
        )}

        {/* Completed timestamp */}
        {task.completed && task.completed_at && (
          <span className="text-[10px] text-[var(--jarvis-success)]">
            {new Date(task.completed_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}

        {/* Expand toggle for metrics */}
        {task.metric_keys.length > 0 && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="rounded p-1 text-[var(--jarvis-text-muted)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Metric inputs (expandable) */}
      <AnimatePresence>
        {expanded && task.metric_keys.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--jarvis-border)] px-3 py-2">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">
                Metrics
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {task.metric_keys.map((key) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={task.metric_values[key] ?? ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          onMetricChange(task.id, key, val);
                        }
                      }}
                      className="h-7 w-full rounded border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-primary)] px-2 text-xs text-[var(--jarvis-text-primary)] outline-none transition-colors focus:border-[var(--jarvis-accent)] focus:shadow-[0_0_6px_var(--jarvis-accent)]"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
