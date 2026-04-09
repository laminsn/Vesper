"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  BarChart3,
  Users,
  ClipboardList,
  Building2,
  Plus,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import {
  generateDailyTasks,
  getTemplateCountByDepartment,
  type DailyTaskInstance,
  type CompletedMetric,
} from "@/data/daily-task-templates";
import { GlowCard, HudFrame, DepartmentBadge } from "@/components/jarvis";
import { TaskRow } from "@/components/daily-tasks/task-row";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DailyTasksPage() {
  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [tasks, setTasks] = useState<DailyTaskInstance[]>(() =>
    [...generateDailyTasks(new Date())]
  );
  const [metrics, setMetrics] = useState<Array<{ metric_key: string; value: number; department: string; agent_slug: string; timestamp: string }>>([]);
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  const dateStr = formatDate(selectedDate);
  const isToday = dateStr === formatDate(new Date());

  const navigateDay = useCallback(
    (offset: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + offset);
      setSelectedDate(newDate);
      setTasks([...generateDailyTasks(newDate)]);
      setMetrics([]);
    },
    [selectedDate]
  );

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completed_at: !t.completed ? new Date().toISOString() : null,
              completed_by: !t.completed ? "Lamin" : null,
            }
          : t
      )
    );
  }, []);

  const logMetric = useCallback(
    (taskId: string, metricKey: string, value: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, metric_values: { ...t.metric_values, [metricKey]: value } }
            : t
        )
      );
      setMetrics((prev) => [
        ...prev,
        {
          metric_key: metricKey,
          value,
          department: task.department,
          agent_slug: task.assigned_agent_slug,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [tasks]
  );

  const toggleDept = useCallback((dept: string) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  }, []);

  // Group tasks by department
  const tasksByDept = useMemo(() => {
    const grouped: Record<string, DailyTaskInstance[]> = {};
    for (const task of tasks) {
      const key = task.department === "universal" ? "universal" : task.department;
      grouped[key] = [...(grouped[key] ?? []), task];
    }
    return grouped;
  }, [tasks]);

  // Group tasks by agent
  const tasksByAgent = useMemo(() => {
    const grouped: Record<string, DailyTaskInstance[]> = {};
    for (const task of tasks) {
      grouped[task.assigned_agent_slug] = [
        ...(grouped[task.assigned_agent_slug] ?? []),
        task,
      ];
    }
    return grouped;
  }, [tasks]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const templateCounts = useMemo(() => getTemplateCountByDepartment(), []);

  const deptOrder = ["universal", ...departments.map((d) => d.slug)];

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
            Daily Tasks
          </h1>
          <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
            Operational task tracking — complete tasks to log metrics
          </p>
        </div>

        {/* Date nav */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
              {formatDisplayDate(selectedDate)}
            </p>
            {isToday && (
              <span className="text-[10px] text-[var(--jarvis-accent)] uppercase tracking-wider">
                Today
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-4" hover={false}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" style={{ color: "var(--jarvis-accent)" }} />
              <span className="text-lg font-bold text-[var(--jarvis-text-primary)]">
                {completedCount}/{tasks.length}
              </span>
              <span className="text-sm text-[var(--jarvis-text-muted)]">tasks completed</span>
            </div>
            <div className="flex-1">
              <Progress value={completionPct} className="h-2" />
            </div>
            <span className="text-sm font-mono text-[var(--jarvis-accent)]">
              {completionPct}%
            </span>
            <span className="text-xs text-[var(--jarvis-text-muted)]">
              {metrics.length} metrics logged
            </span>
          </div>
        </GlowCard>
      </motion.div>

      {/* View Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="department">
          <TabsList>
            <TabsTrigger value="department" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              By Department
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              By Agent
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Metrics Log
            </TabsTrigger>
          </TabsList>

          {/* By Department */}
          <TabsContent value="department" className="space-y-4 mt-4">
            {deptOrder.map((deptSlug) => {
              const deptTasks = tasksByDept[deptSlug];
              if (!deptTasks || deptTasks.length === 0) return null;
              const dept = departments.find((d) => d.slug === deptSlug);
              const deptCompleted = deptTasks.filter((t) => t.completed).length;
              const isCollapsed = collapsedDepts.has(deptSlug);
              const pct = Math.round((deptCompleted / deptTasks.length) * 100);

              return (
                <GlowCard key={deptSlug} className="overflow-hidden" hover={false}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleDept(deptSlug)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--jarvis-border)] hover:bg-[var(--jarvis-bg-tertiary)]/50 transition-colors"
                  >
                    {deptSlug === "universal" ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--jarvis-accent)]">
                        Universal Workflows
                      </span>
                    ) : (
                      <DepartmentBadge slug={deptSlug} name={dept?.name} size="md" />
                    )}
                    <span className="text-xs text-[var(--jarvis-text-muted)]">
                      {deptCompleted}/{deptTasks.length}
                    </span>
                    <div className="flex-1 mx-2">
                      <div className="h-1 rounded-full bg-[var(--jarvis-bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct === 100 ? "var(--jarvis-success)" : "var(--jarvis-accent)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--jarvis-text-muted)]">
                      {pct}%
                    </span>
                    <ChevronLeft
                      className={cn(
                        "h-4 w-4 text-[var(--jarvis-text-muted)] transition-transform",
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      )}
                    />
                  </button>

                  {/* Tasks */}
                  {!isCollapsed && (
                    <div className="divide-y divide-[var(--jarvis-border)]">
                      {deptTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggleComplete={toggleTask}
                          onMetricChange={logMetric}
                        />
                      ))}
                    </div>
                  )}
                </GlowCard>
              );
            })}
          </TabsContent>

          {/* By Agent */}
          <TabsContent value="agent" className="space-y-4 mt-4">
            {Object.entries(tasksByAgent)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([agentSlug, agentTasks]) => {
                const agent = agents.find((a) => a.slug === agentSlug);
                const completed = agentTasks.filter((t) => t.completed).length;
                return (
                  <GlowCard key={agentSlug} className="p-4" hover={false}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--jarvis-accent)" }}
                      >
                        {agent?.name?.[0] ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                          {agent?.name ?? agentSlug}
                        </p>
                        <p className="text-xs text-[var(--jarvis-text-muted)]">
                          {completed}/{agentTasks.length} completed
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {agentTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-2 text-sm px-2 py-1 rounded",
                            task.completed
                              ? "text-[var(--jarvis-text-muted)] line-through"
                              : "text-[var(--jarvis-text-secondary)]"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              task.completed
                                ? "bg-[var(--jarvis-success)]"
                                : "bg-[var(--jarvis-text-muted)]"
                            )}
                          />
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                );
              })}
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="mt-4">
            <GlowCard className="divide-y divide-[var(--jarvis-border)]" hover={false}>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggleComplete={toggleTask}
                  onMetricChange={logMetric}
                />
              ))}
            </GlowCard>
          </TabsContent>

          {/* Metrics Log */}
          <TabsContent value="metrics" className="mt-4">
            <HudFrame title="METRICS LOG">
              <div className="p-1">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <GlowCard className="p-3 text-center" hover={false}>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">{metrics.length}</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase">Metrics Logged</p>
                  </GlowCard>
                  <GlowCard className="p-3 text-center" hover={false}>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">
                      {new Set(metrics.map((m) => m.department)).size}
                    </p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase">Depts Reporting</p>
                  </GlowCard>
                  <GlowCard className="p-3 text-center" hover={false}>
                    <p className="text-lg font-bold text-[var(--jarvis-accent)]">{completionPct}%</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase">Completion Rate</p>
                  </GlowCard>
                </div>

                {/* Metrics table */}
                {metrics.length === 0 ? (
                  <div className="text-center py-12 text-[var(--jarvis-text-muted)]">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No metrics logged yet</p>
                    <p className="text-xs mt-1">Complete tasks to start logging metrics</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[var(--jarvis-text-muted)] heading-mono border-b border-[var(--jarvis-border)]">
                          <th className="pb-2 pr-4">Metric</th>
                          <th className="pb-2 pr-4">Value</th>
                          <th className="pb-2 pr-4">Department</th>
                          <th className="pb-2 pr-4">Agent</th>
                          <th className="pb-2">Logged At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--jarvis-border)]">
                        {metrics.map((m, i) => {
                          const agent = agents.find((a) => a.slug === m.agent_slug);
                          return (
                            <tr key={`${m.metric_key}-${i}`} className="text-[var(--jarvis-text-secondary)]">
                              <td className="py-2 pr-4 font-mono text-xs text-[var(--jarvis-accent)]">
                                {m.metric_key}
                              </td>
                              <td className="py-2 pr-4 font-bold">{m.value}</td>
                              <td className="py-2 pr-4">
                                <DepartmentBadge slug={m.department} size="sm" />
                              </td>
                              <td className="py-2 pr-4">{agent?.name ?? m.agent_slug}</td>
                              <td className="py-2 text-xs text-[var(--jarvis-text-muted)]">
                                {new Date(m.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </HudFrame>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
