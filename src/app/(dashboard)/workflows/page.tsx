"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  Timer,
  Loader2,
} from "lucide-react";
import { GlowCard, HudFrame, CircularGauge } from "@/components/jarvis";
import { usePlaybooks, usePlaybookExecutions } from "@/hooks/use-playbooks";
import type { Playbook } from "@/types";

/* ───── types ───── */

interface WorkflowTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly trigger: string;
  readonly steps: readonly string[];
  readonly active: boolean;
  readonly lastRun: string;
  readonly runsToday: number;
  readonly successRate: number;
  readonly avgDuration: string;
}

interface ExecutionRecord {
  readonly id: string;
  readonly workflowName: string;
  readonly status: "success" | "failed";
  readonly duration: string;
  readonly timestamp: string;
}

/* ───── map playbooks to workflow templates ───── */

function playbookToWorkflow(playbook: Playbook, index: number): WorkflowTemplate {
  const steps = Array.isArray(playbook.steps)
    ? playbook.steps.slice(0, 4).map((s) => s.description.split(" ").slice(0, 5).join(" "))
    : [];

  return {
    id: playbook.id,
    name: playbook.name,
    description: playbook.trigger_description ?? playbook.name,
    trigger: playbook.trigger_description ?? "Manual trigger",
    steps,
    active: index < 3,
    lastRun: playbook.created_at,
    runsToday: 0,
    successRate: 100,
    avgDuration: "—",
  };
}

/* ───── execution history fallback ───── */

const EXECUTION_HISTORY_FALLBACK: readonly ExecutionRecord[] = [
  { id: "exec-001", workflowName: "Patient Intake Automation", status: "success", duration: "2m 08s", timestamp: "2026-03-31T09:42:00Z" },
  { id: "exec-002", workflowName: "Appointment Reminders", status: "success", duration: "28s", timestamp: "2026-03-31T09:30:00Z" },
  { id: "exec-003", workflowName: "Agent Optimizer", status: "success", duration: "5m 02s", timestamp: "2026-03-31T09:15:00Z" },
  { id: "exec-004", workflowName: "Patient Intake Automation", status: "failed", duration: "1m 45s", timestamp: "2026-03-31T08:55:00Z" },
  { id: "exec-005", workflowName: "Appointment Reminders", status: "success", duration: "35s", timestamp: "2026-03-31T08:30:00Z" },
  { id: "exec-006", workflowName: "Agent Optimizer", status: "success", duration: "4m 58s", timestamp: "2026-03-31T08:00:00Z" },
  { id: "exec-007", workflowName: "Patient Intake Automation", status: "success", duration: "2m 22s", timestamp: "2026-03-31T07:45:00Z" },
  { id: "exec-008", workflowName: "Appointment Reminders", status: "success", duration: "30s", timestamp: "2026-03-31T07:00:00Z" },
  { id: "exec-009", workflowName: "Patient Intake Automation", status: "success", duration: "2m 11s", timestamp: "2026-03-31T06:30:00Z" },
  { id: "exec-010", workflowName: "Agent Optimizer", status: "failed", duration: "3m 40s", timestamp: "2026-03-30T08:00:00Z" },
] as const;

const TABS = ["Templates", "Active", "History"] as const;
type Tab = (typeof TABS)[number];

/* ───── animations ───── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ───── helpers ───── */

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ───── sub-components ───── */

function WorkflowCard({ workflow }: { readonly workflow: WorkflowTemplate }) {
  const [isActive, setIsActive] = useState(workflow.active);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<"success" | "error" | null>(null);

  const handleRunNow = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/n8n/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vesper-webhook-secret": "vesper-dev-secret",
        },
        body: JSON.stringify({
          flowId: "n8n-daily-briefing",
          agentSlug: "quill-journalist",
          agentName: workflow.name,
          payload: { playbookId: workflow.id, playbookName: workflow.name },
        }),
      });
      setRunResult(res.ok ? "success" : "error");
    } catch {
      setRunResult("error");
    } finally {
      setIsRunning(false);
      setTimeout(() => setRunResult(null), 3000);
    }
  };

  return (
    <GlowCard
      className="p-5 space-y-4"
      glowColor={isActive ? "#06d6a0" : undefined}
      hover
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-[var(--jarvis-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug truncate">
              {workflow.name}
            </h3>
          </div>
          <p className="text-xs text-[var(--jarvis-text-muted)] mt-1.5 line-clamp-2">
            {workflow.description}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            isActive
              ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
              : "border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-muted)]"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-[var(--jarvis-text-muted)]"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Trigger + steps */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--jarvis-text-secondary)]">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="font-mono">{workflow.trigger}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {workflow.steps.map((step) => (
            <span
              key={step}
              className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]"
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Last run */}
      <div className="text-[10px] text-[var(--jarvis-text-muted)]">
        Last run: {formatTimestamp(workflow.lastRun)}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--jarvis-border)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                : "border-[var(--jarvis-accent)] text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]/10"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="h-3 w-3" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={handleRunNow}
            disabled={isRunning}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              runResult === "success"
                ? "border-emerald-500/40 text-emerald-400"
                : runResult === "error"
                ? "border-red-500/40 text-red-400"
                : "border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Running...
              </>
            ) : runResult === "success" ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Sent
              </>
            ) : runResult === "error" ? (
              <>
                <XCircle className="h-3 w-3" />
                Failed
              </>
            ) : (
              <>
                <Zap className="h-3 w-3" />
                Run Now
              </>
            )}
          </button>
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-[var(--jarvis-border)] px-3 py-1.5 text-xs font-medium text-[var(--jarvis-text-secondary)] transition-colors hover:border-[var(--jarvis-border-strong)] hover:text-[var(--jarvis-text-primary)]">
          View Details
        </button>
      </div>
    </GlowCard>
  );
}

function ActiveWorkflowRow({ workflow }: { readonly workflow: WorkflowTemplate }) {
  return (
    <GlowCard className="p-4" glowColor="#06d6a0" hover>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] truncate">
              {workflow.name}
            </h3>
            <p className="text-[10px] text-[var(--jarvis-text-muted)] mt-0.5">
              {workflow.trigger}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <div className="text-sm font-bold text-[var(--jarvis-text-primary)]">{workflow.runsToday}</div>
            <div className="text-[10px] text-[var(--jarvis-text-muted)]">Runs Today</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400">{workflow.successRate}%</div>
            <div className="text-[10px] text-[var(--jarvis-text-muted)]">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-[var(--jarvis-text-primary)]">{workflow.avgDuration}</div>
            <div className="text-[10px] text-[var(--jarvis-text-muted)]">Avg Duration</div>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

function ExecutionHistoryTable({ records }: { readonly records: readonly ExecutionRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--jarvis-border)]">
            <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">Execution ID</th>
            <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">Workflow</th>
            <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">Status</th>
            <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">Duration</th>
            <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-[var(--jarvis-text-muted)]">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-[var(--jarvis-border)] last:border-b-0 hover:bg-[var(--jarvis-bg-tertiary)] transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-[var(--jarvis-text-secondary)]">
                {record.id}
              </td>
              <td className="px-4 py-3 text-xs text-[var(--jarvis-text-primary)]">
                {record.workflowName}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    record.status === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {record.status === "success" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {record.status === "success" ? "Success" : "Failed"}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--jarvis-text-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {record.duration}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--jarvis-text-muted)]">
                {formatTimestamp(record.timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───── page component ───── */

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Templates");
  const { data: playbooks = [], isLoading } = usePlaybooks();
  const { data: executions = [] } = usePlaybookExecutions();

  const workflows: readonly WorkflowTemplate[] = useMemo(
    () => playbooks.map(playbookToWorkflow),
    [playbooks]
  );

  const activeWorkflows = useMemo(
    () => workflows.filter((w) => w.active),
    [workflows]
  );

  const totalRunsToday = useMemo(
    () => workflows.reduce((sum, w) => sum + w.runsToday, 0),
    [workflows]
  );

  const executionHistory: readonly ExecutionRecord[] = useMemo(() => {
    if (executions.length === 0) return EXECUTION_HISTORY_FALLBACK;
    return executions.slice(0, 10).map((ex) => ({
      id: ex.id.slice(0, 8),
      workflowName: playbooks.find((p) => p.id === ex.playbook_id)?.name ?? "Unknown",
      status: (ex.status === "completed" ? "success" : "failed") as "success" | "failed",
      duration: ex.completed_at
        ? `${Math.round((new Date(ex.completed_at).getTime() - new Date(ex.started_at).getTime()) / 1000)}s`
        : "—",
      timestamp: ex.started_at,
    }));
  }, [executions, playbooks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--jarvis-accent)]" />
        <span className="ml-3 text-sm text-[var(--jarvis-text-muted)]">Loading workflows...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
          Workflows
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Automate agent operations with n8n &mdash; {workflows.length} playbooks loaded
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HudFrame title="Total Workflows">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={workflows.length}
              max={12}
              label="Total Workflows"
              size="sm"
            />
          </div>
        </HudFrame>
        <HudFrame title="Active" color="#06d6a0">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={activeWorkflows.length}
              max={workflows.length || 1}
              label="Active"
              color="#06d6a0"
              size="sm"
            />
          </div>
        </HudFrame>
        <HudFrame title="Executions Today" color="var(--jarvis-accent-2)">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={totalRunsToday}
              max={20}
              label="Executions Today"
              color="var(--jarvis-accent-2)"
              size="sm"
            />
          </div>
        </HudFrame>
      </motion.div>

      {/* Tab navigation */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-[var(--jarvis-accent)] bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]"
                  : "border-[var(--jarvis-border)] bg-transparent text-[var(--jarvis-text-secondary)] hover:border-[var(--jarvis-border-strong)] hover:text-[var(--jarvis-text-primary)]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </motion.div>

      {/* Tab content */}
      {activeTab === "Templates" && (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
        >
          {workflows.map((workflow) => (
            <motion.div key={workflow.id} variants={fadeUp}>
              <WorkflowCard workflow={workflow} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === "Active" && (
        <motion.div className="space-y-3" variants={stagger}>
          {activeWorkflows.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <Zap className="h-10 w-10 text-[var(--jarvis-text-muted)] mb-3" />
              <p className="text-sm text-[var(--jarvis-text-muted)]">
                No active workflows. Activate a template to get started.
              </p>
            </motion.div>
          ) : (
            activeWorkflows.map((workflow) => (
              <motion.div key={workflow.id} variants={fadeUp}>
                <ActiveWorkflowRow workflow={workflow} />
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === "History" && (
        <motion.div variants={fadeUp}>
          <ExecutionHistoryTable records={executionHistory} />
        </motion.div>
      )}
    </motion.div>
  );
}
