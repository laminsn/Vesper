"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Kanban, CalendarDays, Table2, GanttChart, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAgentBySlug } from "@/data/agents";
import { departments } from "@/data/departments";
import {
  KanbanView,
  CalendarView,
  TableView,
  TimelineView,
  TaskDetailDrawer,
  AddTaskDialog,
} from "@/components/tasks";
import type { EnhancedTask, TaskOperations } from "@/components/tasks/task-types";
import { INITIAL_TASKS } from "@/components/tasks/mock-tasks";
import type { TaskPriority, TaskStatus } from "@/types";

/* ───── filter types ───── */

type FilterDept = string | "all";
type FilterPriority = TaskPriority | "all";
type FilterAgent = string | "all";

/* ───── animations ───── */

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/* ───── page component ───── */

export default function TaskBoardPage() {
  // Task state (mutable copy of initial immutable data)
  const [tasks, setTasks] = useState<readonly EnhancedTask[]>(INITIAL_TASKS);

  // Filters
  const [filterDept, setFilterDept] = useState<FilterDept>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterAgent, setFilterAgent] = useState<FilterAgent>("all");

  // Drawer state
  const [drawerTask, setDrawerTask] = useState<EnhancedTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add task dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  /* ─── immutable task operations ─── */

  const addTask = useCallback((task: EnhancedTask) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<EnhancedTask>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      // Also update the drawer task if it is the one being edited
      setDrawerTask((prev) =>
        prev && prev.id === id ? { ...prev, ...updates } : prev
      );
    },
    []
  );

  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    setDrawerTask((prev) =>
      prev && prev.id === id ? { ...prev, status: newStatus } : prev
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const viewTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              last_viewed_by: "Lamin",
              last_viewed_at: new Date().toISOString(),
            }
          : t
      )
    );
  }, []);

  const operations: TaskOperations = useMemo(
    () => ({ addTask, updateTask, moveTask, deleteTask, viewTask }),
    [addTask, updateTask, moveTask, deleteTask, viewTask]
  );

  /* ─── open task handler ─── */

  const handleOpenTask = useCallback(
    (task: EnhancedTask) => {
      viewTask(task.id);
      // Get fresh copy from state
      setDrawerTask({ ...task, last_viewed_by: "Lamin", last_viewed_at: new Date().toISOString() });
      setDrawerOpen(true);
    },
    [viewTask]
  );

  /* ─── filtered tasks ─── */

  const assignedAgentIds = useMemo(
    () => [...new Set(tasks.map((t) => t.assigned_agent_id))],
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterDept !== "all" && t.department_id !== filterDept) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority)
        return false;
      if (filterAgent !== "all" && t.assigned_agent_id !== filterAgent)
        return false;
      return true;
    });
  }, [tasks, filterDept, filterPriority, filterAgent]);

  /* ─── filter bar select classes ─── */

  const selectCls =
    "rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1 text-xs text-[var(--jarvis-text-primary)] focus:outline-none focus:border-[var(--jarvis-accent)]";

  const hasFilters =
    filterDept !== "all" || filterPriority !== "all" || filterAgent !== "all";

  return (
    <>
      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
              Task Board
            </h1>
            <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
              Manage, assign, and track tasks across all departments
            </p>
          </div>
          <button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--jarvis-accent)] bg-[var(--jarvis-accent)]20 px-4 py-2 text-sm font-medium text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-4 py-3"
        >
          <span className="text-xs font-semibold text-[var(--jarvis-text-muted)] uppercase tracking-wider">
            Filters
          </span>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className={selectCls}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) =>
              setFilterPriority(e.target.value as FilterPriority)
            }
            className={selectCls}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className={selectCls}
          >
            <option value="all">All Agents</option>
            {assignedAgentIds.map((slug) => {
              const agent = getAgentBySlug(slug);
              return (
                <option key={slug} value={slug}>
                  {agent?.name ?? slug}
                </option>
              );
            })}
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setFilterDept("all");
                setFilterPriority("all");
                setFilterAgent("all");
              }}
              className="text-xs text-[var(--jarvis-accent)] hover:underline"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-[var(--jarvis-text-muted)]">
            {filteredTasks.length} of {tasks.length} tasks
          </span>
        </motion.div>

        {/* View tabs */}
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="kanban">
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-1.5">
                <Kanban className="h-3.5 w-3.5" />
                Kanban
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-1.5"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1.5">
                <Table2 className="h-3.5 w-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="flex items-center gap-1.5"
              >
                <GanttChart className="h-3.5 w-3.5" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              <KanbanView
                tasks={filteredTasks}
                operations={operations}
                onOpenTask={handleOpenTask}
              />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView
                tasks={filteredTasks}
                operations={operations}
                onOpenTask={handleOpenTask}
              />
            </TabsContent>

            <TabsContent value="table">
              <TableView
                tasks={filteredTasks}
                operations={operations}
                onOpenTask={handleOpenTask}
              />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineView
                tasks={filteredTasks}
                operations={operations}
                onOpenTask={handleOpenTask}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Task detail drawer */}
      <TaskDetailDrawer
        task={drawerTask}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        operations={operations}
      />

      {/* Add task dialog */}
      <AddTaskDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        operations={operations}
      />
    </>
  );
}
