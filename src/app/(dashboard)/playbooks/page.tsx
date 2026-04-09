"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Clock, Footprints, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlaybooks, usePlaybookExecutions, useExecutePlaybook } from "@/hooks/use-playbooks";
import { useAgents } from "@/hooks/use-agents";
import { GlowCard, StatusIndicator } from "@/components/jarvis";
import type { Playbook, Agent } from "@/types";

/* ───── animations ───── */

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ───── playbook card ───── */

interface PlaybookCardProps {
  readonly playbook: Playbook;
  readonly agents: readonly Agent[];
}

function PlaybookCard({ playbook, agents }: PlaybookCardProps) {
  const agent = useMemo(
    () => agents.find((a) => a.id === playbook.playmaker_agent_id),
    [playbook.playmaker_agent_id, agents]
  );

  return (
    <GlowCard className="p-5 space-y-4" hover>
      {/* Top row: number + name */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--jarvis-accent)] text-sm font-bold text-[var(--jarvis-accent)]"
          style={{
            boxShadow: "0 0 10px var(--jarvis-accent)30",
          }}
        >
          {playbook.play_number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug">
            {playbook.name}
          </h3>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--jarvis-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[var(--jarvis-accent-2)]" />
          {playbook.duration_target ?? "N/A"}
        </span>
        <span className="flex items-center gap-1.5">
          <Footprints className="h-3.5 w-3.5 text-[var(--jarvis-accent-3)]" />
          {playbook.steps?.length ?? 0} steps
        </span>
      </div>

      {/* Playmaker */}
      {agent && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--jarvis-text-muted)]">
            Playmaker
          </span>
          <div className="flex items-center gap-1.5">
            <StatusIndicator status={agent.status} size="sm" />
            <span className="text-xs font-medium text-[var(--jarvis-text-primary)]">
              {agent.name}
            </span>
            <span className="text-[10px] text-[var(--jarvis-text-muted)]">
              ({agent.role})
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--jarvis-border)]">
        <span className="text-[10px] text-[var(--jarvis-text-muted)] font-mono">
          {playbook.id ? "Ready" : "0 executions"}
        </span>
        <RunPlayButton playbookId={playbook.id} />
      </div>
    </GlowCard>
  );
}

/* ───── run button ───── */

function RunPlayButton({ playbookId }: { readonly playbookId: string }) {
  const executeMutation = useExecutePlaybook();
  const isRunning = executeMutation.isPending;

  const handleRun = () => {
    executeMutation.mutate(
      { playbook_id: playbookId, triggered_by: "user" },
      {
        onSuccess: () => toast.success("Playbook execution started"),
        onError: () => toast.error("Failed to start playbook"),
      }
    );
  };

  return (
    <button
      onClick={handleRun}
      disabled={isRunning}
      className="flex items-center gap-1.5 rounded-md border border-[var(--jarvis-accent)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--jarvis-accent)] transition-colors hover:bg-[var(--jarvis-accent)]/10 disabled:opacity-50"
    >
      {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
      {isRunning ? "Running..." : "Run Play"}
    </button>
  );
}

/* ───── page component ───── */

export default function PlaybooksPage() {
  const { data: playbooks = [], isLoading: playbooksLoading } = usePlaybooks();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();

  const isLoading = playbooksLoading || agentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--jarvis-accent)]" />
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
          Playbooks
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {playbooks.length} repeatable plays with SLA tracking
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        variants={stagger}
      >
        {playbooks.map((pb) => (
          <motion.div key={pb.id} variants={fadeUp}>
            <PlaybookCard playbook={pb} agents={agents} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
