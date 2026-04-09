"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EnhancedTask, TaskOperations } from "./task-types";
import { getDeadlineStatus } from "./task-types";

/* ───── props ───── */

interface CalendarViewProps {
  readonly tasks: readonly EnhancedTask[];
  readonly operations: TaskOperations;
  readonly onOpenTask: (task: EnhancedTask) => void;
}

/* ───── priority colors for chips ───── */

const PRIORITY_CHIP_COLORS: Record<string, string> = {
  critical: "bg-red-500/80 text-white",
  high: "bg-orange-500/80 text-white",
  normal: "bg-blue-500/80 text-white",
  low: "bg-slate-500/80 text-white",
};

/* ───── helpers ───── */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  // 0 = Sunday => shift to Monday-based (0 = Mon)
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/* ───── component ───── */

export function CalendarView({
  tasks,
  operations,
  onOpenTask,
}: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOffset = getFirstDayOfWeek(viewYear, viewMonth);

  // Group tasks by day-of-month
  const tasksByDay = useMemo(() => {
    const map: Record<number, EnhancedTask[]> = {};
    for (const task of tasks) {
      if (!task.deadline) continue;
      const d = new Date(task.deadline);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const day = d.getDate();
        map[day] = [...(map[day] ?? []), task];
      }
    }
    return map;
  }, [tasks, viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalCells = firstDayOffset + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-md p-1.5 text-[var(--jarvis-text-muted)] hover:bg-[var(--jarvis-bg-secondary)] hover:text-[var(--jarvis-text-primary)] transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-[var(--jarvis-text-primary)]">
          {monthLabel}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-md p-1.5 text-[var(--jarvis-text-muted)] hover:bg-[var(--jarvis-bg-secondary)] hover:text-[var(--jarvis-text-primary)] transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
        {/* Weekday headers */}
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="bg-[var(--jarvis-bg-secondary)] px-2 py-2 text-center text-xs font-semibold text-[var(--jarvis-text-muted)] uppercase tracking-wider border-b border-[var(--jarvis-border)]"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {Array.from({ length: rows * 7 }, (_, i) => {
          const dayNum = i - firstDayOffset + 1;
          const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
          const cellDate = isValidDay
            ? new Date(viewYear, viewMonth, dayNum)
            : null;
          const isToday = cellDate ? isSameDay(cellDate, today) : false;
          const dayTasks = isValidDay ? tasksByDay[dayNum] ?? [] : [];
          const hasOverdue = dayTasks.some(
            (t) => getDeadlineStatus(t.deadline) === "overdue"
          );

          return (
            <div
              key={i}
              className={`min-h-[100px] border-b border-r border-[var(--jarvis-border)] p-1.5 transition-colors ${
                isValidDay
                  ? "bg-[var(--jarvis-bg-primary)]"
                  : "bg-[var(--jarvis-bg-tertiary)]"
              } ${isToday ? "ring-2 ring-inset ring-[var(--jarvis-accent)]" : ""} ${
                hasOverdue ? "bg-red-500/5" : ""
              }`}
            >
              {isValidDay && (
                <>
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? "text-[var(--jarvis-accent)] font-bold"
                        : "text-[var(--jarvis-text-secondary)]"
                    }`}
                  >
                    {dayNum}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onOpenTask(task)}
                        className={`w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-left ${
                          PRIORITY_CHIP_COLORS[task.priority] ?? PRIORITY_CHIP_COLORS.normal
                        } hover:opacity-80 transition-opacity`}
                        title={task.title}
                      >
                        {task.title}
                      </button>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-[var(--jarvis-text-muted)] pl-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
