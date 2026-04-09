"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { PriorityBadge, DepartmentBadge, StatusIndicator } from "@/components/jarvis";
import { getAgentBySlug } from "@/data/agents";
import { formatRelativeTime } from "@/lib/utils";
import type { EnhancedTask, TaskOperations } from "./task-types";
import {
  getDeadlineStatus,
  getDeadlineColor,
  formatDeadline,
} from "./task-types";

/* ───── props ───── */

interface TableViewProps {
  readonly tasks: readonly EnhancedTask[];
  readonly operations: TaskOperations;
  readonly onOpenTask: (task: EnhancedTask) => void;
}

/* ───── sort types ───── */

type SortKey =
  | "title"
  | "status"
  | "priority"
  | "agent"
  | "department"
  | "deadline"
  | "last_viewed"
  | "created";

type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const STATUS_ORDER: Record<string, number> = {
  in_progress: 0,
  review: 1,
  todo: 2,
  backlog: 3,
  blocked: 4,
  done: 5,
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
};

/* ───── component ───── */

export function TableView({ tasks, operations, onOpenTask }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set()
  );

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const sortedTasks = useMemo(() => {
    const arr = [...tasks];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      switch (sortKey) {
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "status":
          return (
            dir *
            ((STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
          );
        case "priority":
          return (
            dir *
            ((PRIORITY_ORDER[a.priority] ?? 99) -
              (PRIORITY_ORDER[b.priority] ?? 99))
          );
        case "agent": {
          const aName = getAgentBySlug(a.assigned_agent_id)?.name ?? "";
          const bName = getAgentBySlug(b.assigned_agent_id)?.name ?? "";
          return dir * aName.localeCompare(bName);
        }
        case "department":
          return dir * a.department_id.localeCompare(b.department_id);
        case "deadline": {
          const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return dir * (aTime - bTime);
        }
        case "last_viewed": {
          const aTime = a.last_viewed_at
            ? new Date(a.last_viewed_at).getTime()
            : 0;
          const bTime = b.last_viewed_at
            ? new Date(b.last_viewed_at).getTime()
            : 0;
          return dir * (bTime - aTime);
        }
        case "created":
          return (
            dir *
            (new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime())
          );
        default:
          return 0;
      }
    });

    return arr;
  }, [tasks, sortKey, sortDir]);

  const allSelected =
    tasks.length > 0 && selectedIds.size === tasks.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)));
    }
  }, [allSelected, tasks]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-[var(--jarvis-accent)]" />
    ) : (
      <ArrowDown className="h-3 w-3 text-[var(--jarvis-accent)]" />
    );
  };

  const headerCls =
    "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)] cursor-pointer hover:text-[var(--jarvis-text-primary)] select-none";

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      backlog: "bg-slate-500/15 text-slate-400 border-slate-500/30",
      todo: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      in_progress: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      review: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      blocked: "bg-red-500/15 text-red-400 border-red-500/30",
      done: "bg-green-500/15 text-green-400 border-green-500/30",
    };
    return (
      <span
        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${colors[status] ?? colors.backlog}`}
      >
        {STATUS_LABELS[status] ?? status}
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--jarvis-bg-secondary)] border-b border-[var(--jarvis-border)]">
              {/* Checkbox */}
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-[var(--jarvis-border)] accent-[var(--jarvis-accent)]"
                />
              </th>
              <th className={headerCls} onClick={() => toggleSort("title")}>
                <span className="flex items-center gap-1">
                  Title <SortIcon col="title" />
                </span>
              </th>
              <th className={headerCls} onClick={() => toggleSort("status")}>
                <span className="flex items-center gap-1">
                  Status <SortIcon col="status" />
                </span>
              </th>
              <th className={headerCls} onClick={() => toggleSort("priority")}>
                <span className="flex items-center gap-1">
                  Priority <SortIcon col="priority" />
                </span>
              </th>
              <th className={headerCls} onClick={() => toggleSort("agent")}>
                <span className="flex items-center gap-1">
                  Agent <SortIcon col="agent" />
                </span>
              </th>
              <th
                className={headerCls}
                onClick={() => toggleSort("department")}
              >
                <span className="flex items-center gap-1">
                  Department <SortIcon col="department" />
                </span>
              </th>
              <th className={headerCls} onClick={() => toggleSort("deadline")}>
                <span className="flex items-center gap-1">
                  Deadline <SortIcon col="deadline" />
                </span>
              </th>
              <th
                className={headerCls}
                onClick={() => toggleSort("last_viewed")}
              >
                <span className="flex items-center gap-1">
                  Last Seen <SortIcon col="last_viewed" />
                </span>
              </th>
              <th className={headerCls} onClick={() => toggleSort("created")}>
                <span className="flex items-center gap-1">
                  Created <SortIcon col="created" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task, idx) => {
              const agent = getAgentBySlug(task.assigned_agent_id);
              const dStatus = getDeadlineStatus(task.deadline);
              const dColor = getDeadlineColor(dStatus);
              const isSelected = selectedIds.has(task.id);

              return (
                <tr
                  key={task.id}
                  onClick={() => onOpenTask(task)}
                  className={`border-b border-[var(--jarvis-border)] cursor-pointer hover:bg-[var(--jarvis-bg-secondary)] transition-colors ${
                    idx % 2 === 0
                      ? "bg-[var(--jarvis-bg-primary)]"
                      : "bg-[var(--jarvis-bg-tertiary)]"
                  } ${isSelected ? "bg-[var(--jarvis-accent)]10" : ""}`}
                >
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(task.id)}
                      className="rounded border-[var(--jarvis-border)] accent-[var(--jarvis-accent)]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                      {task.title}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{statusBadge(task.status)}</td>
                  <td className="px-3 py-2.5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-3 py-2.5">
                    {agent && (
                      <div className="flex items-center gap-1.5">
                        <StatusIndicator status={agent.status} size="sm" />
                        <span className="text-xs text-[var(--jarvis-text-secondary)]">
                          {agent.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <DepartmentBadge slug={task.department_id} size="sm" />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-medium ${dColor}`}>
                      {formatDeadline(task.deadline)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {task.last_viewed_at ? (
                      <div className="flex items-center gap-1 text-xs text-[var(--jarvis-text-muted)]">
                        <Eye className="h-3 w-3" />
                        {formatRelativeTime(task.last_viewed_at)}
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--jarvis-text-muted)]">
                        --
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-[var(--jarvis-text-muted)]">
                      {formatRelativeTime(task.created_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {sortedTasks.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-12 text-center text-sm text-[var(--jarvis-text-muted)]"
                >
                  No tasks match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
