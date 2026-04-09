"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Kanban, CalendarDays, Table2, GanttChart, Plus, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
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
import type { Task, TaskPriority, TaskStatus } from "@/types";

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

// Map Supabase Task → EnhancedTask for UI compatibility
function taskToEnhanced(t: Task): EnhancedTask {
  const meta = (t.metadata ?? {}) as Record<string, unknown>;
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    priority: t.priority,
    assigned_agent_id: t.assigned_agent_id ?? "",
    department_id: t.department_id ?? "",
    deadline: t.due_date,
    created_at: t.created_at,
    last_viewed_by: (meta.last_viewed_by as string) ?? null,
    last_viewed_at: (meta.last_viewed_at as string) ?? null,
    sign_off_required: t.sign_off_required,
    signed_off_by: t.signed_off_by,
    signed_off_at: t.signed_off_at,
    tags: t.tags ?? [],
    subtasks: (meta.subtasks as EnhancedTask["subtasks"]) ?? [],
    comments: (meta.comments as EnhancedTask["comments"]) ?? [],
  };
}

export default function TaskBoardPage() {
  // Real data from Supabase
  const { data: dbTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Map DB tasks to EnhancedTask format, fallback to mock if DB is empty
  const tasks: readonly EnhancedTask[] = useMemo(() => {
    if (dbTasks.length > 0) return dbTasks.map(taskToEnhanced);
    return INITIAL_TASKS;
  }, [dbTasks]);

  // Filters
  const [filterDept, setFilterDept] = useState<FilterDept>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterAgent, setFilterAgent] = useState<FilterAgent>("all");

  // Drawer state
  const [drawerTask, setDrawerTask] = useState<EnhancedTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add task dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  /* ─── task operations (persist to Supabase) ─── */

  const addTask = useCallback((task: EnhancedTask) => {
    createTaskMutation.mutate({
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      assigned_agent_id: task.assigned_agent_id || null,
      department_id: task.department_id || null,
      due_date: task.deadline,
      tags: [...task.tags],
      sign_off_required: task.sign_off_required,
      metadata: { subtasks: task.subtasks, comments: task.comments },
    });
  }, [createTaskMutation]);

  const updateTask = useCallback(
    (id: string, updates: Partial<EnhancedTask>) => {
      const dbUpdates: Partial<Task> & { id: string } = { id };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.deadline !== undefined) dbUpdates.due_date = updates.deadline;
      if (updates.tags !== undefined) dbUpdates.tags = [...updates.tags];
      updateTaskMutation.mutate(dbUpdates);
      setDrawerTask((prev) => prev && prev.id === id ? { ...prev, ...updates } : prev);
    },
    [updateTaskMutation]
  );

  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({ id, status: newStatus });
    setDrawerTask((prev) => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
  }, [updateTaskMutation]);

  const deleteTask = useCallback((id: string) => {
    deleteTaskMutation.mutate(id);
  }, [deleteTaskMutation]);

  const viewTask = useCallback((id: string) => {
    updateTaskMutation.mutate({
      id,
      metadata: { last_viewed_by: "Lamin", last_viewed_at: new Date().toISOString() },
    });
  }, [updateTaskMutation]);

  const operations: TaskOperations = useMemo(
    () => ({ addTask, updateTask, moveTask, deleteTask, viewTask }),
    [addTask, updateTask, moveTask, deleteTask, viewTask]
  );

  /* ─── open task handler ─── */

  const handleOpenTask = useCallback(
    (task: EnhancedTask) => {
      viewTask(task.id);
      setDrawerTask({ ...task, last_viewed_by: "Lamin", last_viewed_at: new Date().toISOString() });
      setDrawerOpen(true);
    },
    [viewTask]
  );

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--jarvis-accent)]" />
      </div>
    );
  }

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
              <option key={d.slug} value={d.slug ?? d.id}>
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
            {assignedAgentIds.map((agentId) => {
              const agent = agents.find((a) => a.id === agentId);
              return (
                <option key={agentId} value={agentId}>
                  {agent?.name ?? agentId}
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
