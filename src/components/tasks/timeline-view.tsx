"use client";

import { useMemo, useRef } from "react";
import { getDepartmentBySlug } from "@/data/departments";
import { getAgentBySlug } from "@/data/agents";
import type { EnhancedTask, TaskOperations } from "./task-types";

/* ───── props ───── */

interface TimelineViewProps {
  readonly tasks: readonly EnhancedTask[];
  readonly operations: TaskOperations;
  readonly onOpenTask: (task: EnhancedTask) => void;
}

/* ───── priority bar colors ───── */

const BAR_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  normal: "#3b82f6",
  low: "#64748b",
};

/* ───── constants ───── */

const WEEK_WIDTH = 120; // px per week
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 48;
const DEPT_LABEL_WIDTH = 200;

/* ───── helpers ───── */

function startOfWeek(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function weeksBetween(start: Date, end: Date): number {
  return Math.ceil(
    (end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
}

function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ───── component ───── */

export function TimelineView({
  tasks,
  operations,
  onOpenTask,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute timeline range
  const { timelineStart, totalWeeks, weekDates } = useMemo(() => {
    const now = new Date();
    const allDates: Date[] = [];
    for (const t of tasks) {
      allDates.push(new Date(t.created_at));
      if (t.deadline) allDates.push(new Date(t.deadline));
    }
    if (allDates.length === 0) allDates.push(now);

    const earliest = allDates.reduce(
      (min, d) => (d < min ? d : min),
      allDates[0]
    );
    const latest = allDates.reduce(
      (max, d) => (d > max ? d : max),
      allDates[0]
    );

    // Add 2 weeks padding on each side
    const padded_start = new Date(earliest);
    padded_start.setDate(padded_start.getDate() - 14);
    const padded_end = new Date(latest);
    padded_end.setDate(padded_end.getDate() + 14);

    const start = startOfWeek(padded_start);
    const weeks = weeksBetween(start, padded_end) + 1;
    const dates: Date[] = [];
    for (let i = 0; i < weeks; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      dates.push(d);
    }

    return { timelineStart: start, totalWeeks: weeks, weekDates: dates };
  }, [tasks]);

  // Group tasks by department
  const groupedTasks = useMemo(() => {
    const map: Record<string, EnhancedTask[]> = {};
    for (const task of tasks) {
      const dept = task.department_id;
      map[dept] = [...(map[dept] ?? []), task];
    }
    // Sort departments
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  // Today marker position
  const todayOffset = useMemo(() => {
    const now = new Date();
    const diffMs = now.getTime() - timelineStart.getTime();
    const diffWeeks = diffMs / (7 * 24 * 60 * 60 * 1000);
    return diffWeeks * WEEK_WIDTH;
  }, [timelineStart]);

  // Calculate bar position for a task
  const getBarStyle = (task: EnhancedTask) => {
    const createdMs =
      new Date(task.created_at).getTime() - timelineStart.getTime();
    const startX =
      (createdMs / (7 * 24 * 60 * 60 * 1000)) * WEEK_WIDTH;

    if (!task.deadline) {
      // No deadline — render as dot
      return { left: startX, width: 8, isDot: true };
    }

    const deadlineMs =
      new Date(task.deadline).getTime() - timelineStart.getTime();
    const endX =
      (deadlineMs / (7 * 24 * 60 * 60 * 1000)) * WEEK_WIDTH;
    const width = Math.max(endX - startX, 12);

    return { left: startX, width, isDot: false };
  };

  // Count total rows
  let totalRows = 0;
  const rowOffsets: Record<string, number> = {};
  for (const [dept, deptTasks] of groupedTasks) {
    rowOffsets[dept] = totalRows;
    totalRows += deptTasks.length;
  }

  const contentHeight = totalRows * ROW_HEIGHT + HEADER_HEIGHT;
  const contentWidth = totalWeeks * WEEK_WIDTH;

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--jarvis-text-muted)]">
        Scroll horizontally to navigate the timeline. Click a bar to open task details.
      </p>
      <div
        ref={scrollRef}
        className="rounded-lg border border-[var(--jarvis-border)] overflow-auto"
        style={{ maxHeight: "70vh" }}
      >
        <div className="relative" style={{ minWidth: DEPT_LABEL_WIDTH + contentWidth }}>
          {/* Sticky department labels column */}
          <div
            className="absolute left-0 top-0 z-20 bg-[var(--jarvis-bg-primary)]"
            style={{ width: DEPT_LABEL_WIDTH, height: contentHeight }}
          >
            {/* Header spacer */}
            <div
              className="border-b border-r border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 flex items-center"
              style={{ height: HEADER_HEIGHT }}
            >
              <span className="text-xs font-semibold text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                Department / Task
              </span>
            </div>

            {/* Department + task labels */}
            {groupedTasks.map(([dept, deptTasks]) => {
              const deptData = getDepartmentBySlug(dept);
              const offset = rowOffsets[dept];
              return deptTasks.map((task, i) => {
                const agent = getAgentBySlug(task.assigned_agent_id);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 border-b border-r border-[var(--jarvis-border)] px-3 cursor-pointer hover:bg-[var(--jarvis-bg-secondary)] transition-colors"
                    style={{
                      height: ROW_HEIGHT,
                      top: HEADER_HEIGHT + (offset + i) * ROW_HEIGHT,
                      position: "absolute",
                      width: DEPT_LABEL_WIDTH,
                    }}
                    onClick={() => onOpenTask(task)}
                  >
                    {i === 0 && deptData && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: deptData.color }}
                      />
                    )}
                    {i !== 0 && <span className="w-2 shrink-0" />}
                    <span className="text-xs text-[var(--jarvis-text-primary)] truncate">
                      {i === 0
                        ? `${deptData?.name ?? dept}`
                        : ""}
                    </span>
                    <span className="text-[10px] text-[var(--jarvis-text-muted)] truncate ml-auto">
                      {agent?.name ?? ""} — {task.title.slice(0, 20)}{task.title.length > 20 ? "..." : ""}
                    </span>
                  </div>
                );
              });
            })}
          </div>

          {/* Timeline content area */}
          <div style={{ marginLeft: DEPT_LABEL_WIDTH }}>
            {/* Week headers */}
            <div
              className="flex border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] sticky top-0 z-10"
              style={{ height: HEADER_HEIGHT }}
            >
              {weekDates.map((wd, i) => (
                <div
                  key={i}
                  className="shrink-0 flex items-center justify-center border-r border-[var(--jarvis-border)] text-[10px] text-[var(--jarvis-text-muted)]"
                  style={{ width: WEEK_WIDTH }}
                >
                  {formatWeekLabel(wd)}
                </div>
              ))}
            </div>

            {/* Rows with bars */}
            <div className="relative" style={{ height: totalRows * ROW_HEIGHT }}>
              {/* Grid lines (vertical per week) */}
              {weekDates.map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute top-0 bottom-0 border-r border-[var(--jarvis-border)]"
                  style={{ left: i * WEEK_WIDTH, opacity: 0.3 }}
                />
              ))}

              {/* Horizontal row lines */}
              {Array.from({ length: totalRows }, (_, i) => (
                <div
                  key={`row-${i}`}
                  className="absolute left-0 right-0 border-b border-[var(--jarvis-border)]"
                  style={{ top: (i + 1) * ROW_HEIGHT, opacity: 0.3 }}
                />
              ))}

              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: todayOffset }}
              >
                <div className="absolute -top-0 -left-2.5 rounded-b bg-red-500 px-1 text-[8px] text-white font-bold whitespace-nowrap">
                  Today
                </div>
              </div>

              {/* Task bars */}
              {groupedTasks.map(([dept, deptTasks]) => {
                const offset = rowOffsets[dept];
                return deptTasks.map((task, i) => {
                  const bar = getBarStyle(task);
                  const color = BAR_COLORS[task.priority] ?? BAR_COLORS.normal;
                  const y = (offset + i) * ROW_HEIGHT + 8;

                  if (bar.isDot) {
                    return (
                      <div
                        key={task.id}
                        className="absolute rounded-full cursor-pointer hover:ring-2 hover:ring-white/30 transition-shadow"
                        style={{
                          left: bar.left - 4,
                          top: y,
                          width: 8,
                          height: ROW_HEIGHT - 16,
                          backgroundColor: color,
                        }}
                        onClick={() => onOpenTask(task)}
                        title={task.title}
                      />
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-1.5 overflow-hidden"
                      style={{
                        left: bar.left,
                        top: y,
                        width: bar.width,
                        height: ROW_HEIGHT - 16,
                        backgroundColor: `${color}cc`,
                      }}
                      onClick={() => onOpenTask(task)}
                      title={task.title}
                    >
                      <span className="text-[10px] text-white font-medium truncate">
                        {task.title}
                      </span>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
