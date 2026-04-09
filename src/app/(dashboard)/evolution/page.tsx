"use client";

import { motion } from "framer-motion";
import {
  FileCheck,
  CheckCircle2,
  Rocket,
  Gauge,
  Brain,
  Workflow,
  Share2,
  RotateCcw,
  Inbox,
  Info,
  Loader2,
} from "lucide-react";
import { useEvolutionProposals, useEvolutionRetros } from "@/hooks/use-evolution";
import { GlowCard, KpiCard } from "@/components/jarvis";

// ─── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const VALIDATION_LEVELS = [
  {
    level: "GREEN",
    label: "Agent-Level",
    description: "Agent-level improvements. Approved by Department Director.",
    color: "var(--jarvis-success)",
  },
  {
    level: "YELLOW",
    label: "Department-Level",
    description: "Department-level improvements. Approved by CEO + Achilles.",
    color: "var(--jarvis-warning)",
  },
  {
    level: "RED",
    label: "Empire-Level",
    description: "Empire-level improvements. Approved by Lamin only.",
    color: "var(--jarvis-danger)",
  },
] as const;

const EVOLUTION_LOOPS = [
  {
    number: 1,
    title: "Agent Self-Improvement",
    description: "Individual agent reflection after task completion",
    icon: Brain,
    color: "var(--jarvis-accent)",
  },
  {
    number: 2,
    title: "Process Evolution",
    description: "Department-level workflow optimization",
    icon: Workflow,
    color: "var(--jarvis-accent-2)",
  },
  {
    number: 3,
    title: "Cross-Domain Transfer",
    description: "Patterns proven in 3+ executions transfer across companies",
    icon: Share2,
    color: "var(--jarvis-accent-3)",
  },
  {
    number: 4,
    title: "Meta-Improvement",
    description: "Quarterly recursive review of the improvement system itself",
    icon: RotateCcw,
    color: "var(--jarvis-warning)",
  },
] as const;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function EvolutionPage() {
  const { data: proposals = [], isLoading: proposalsLoading } = useEvolutionProposals();
  const { data: retros = [], isLoading: retrosLoading } = useEvolutionRetros();

  const isLoading = proposalsLoading || retrosLoading;

  const approvedCount = proposals.filter((p) => p.status === "approved").length;
  const implementedCount = proposals.filter((p) => p.status === "implemented").length;

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
          Evolution
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          HyperAgent self-improvement system
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <Info className="h-3 w-3 text-[var(--jarvis-text-muted)]" />
          <span className="text-[10px] text-[var(--jarvis-text-muted)] italic">
            Inspired by Meta&apos;s HyperAgents (arXiv:2603.19461)
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Total Proposals"
            value={proposals.length}
            icon={FileCheck}
            color="var(--jarvis-accent)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            color="var(--jarvis-success)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Implemented"
            value={implementedCount}
            icon={Rocket}
            color="var(--jarvis-accent-2)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Improvement Velocity"
            value={`${implementedCount}/month`}
            icon={Gauge}
            color="var(--jarvis-accent-3)"
          />
        </motion.div>
      </motion.div>

      {/* Proposals — Empty State or List */}
      <motion.div variants={fadeUp}>
        {proposals.length === 0 ? (
          <GlowCard className="p-8" hover={false}>
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)] mb-4">
                <Inbox className="h-6 w-6 text-[var(--jarvis-text-muted)]" />
              </div>
              <h3 className="heading-mono text-lg mb-2">No Evolution Proposals Yet</h3>
              <p className="text-sm text-[var(--jarvis-text-muted)] max-w-md">
                Agents will submit improvement proposals after playbook executions.
                Each proposal goes through validation based on its impact level.
              </p>
            </div>
          </GlowCard>
        ) : (
          <div className="space-y-3">
            <h2 className="heading-mono mb-2">Proposals ({proposals.length})</h2>
            {proposals.map((proposal) => (
              <GlowCard key={proposal.id} className="p-4" hover={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-[var(--jarvis-text-muted)] mt-1">
                      {proposal.description}
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--jarvis-accent)]">
                    {proposal.status}
                  </span>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Validation Levels */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-4">Validation Levels</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {VALIDATION_LEVELS.map((level) => (
            <GlowCard
              key={level.level}
              className="p-5"
              glowColor={level.color}
              hover={false}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: level.color,
                    boxShadow: `0 0 8px ${level.color}`,
                  }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: level.color }}
                >
                  {level.level}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--jarvis-text-primary)] mb-1">
                {level.label}
              </p>
              <p className="text-xs text-[var(--jarvis-text-muted)] leading-relaxed">
                {level.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </motion.div>

      {/* Evolution Loops */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-4">Evolution Loops</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {EVOLUTION_LOOPS.map((loop) => {
            const LoopIcon = loop.icon;
            return (
              <GlowCard
                key={loop.number}
                className="p-5"
                glowColor={loop.color}
                hover={false}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${loop.color}15` }}
                  >
                    <span style={{ color: loop.color }}><LoopIcon className="h-5 w-5" /></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: loop.color }}
                      >
                        Loop {loop.number}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--jarvis-text-primary)] mb-1">
                      {loop.title}
                    </p>
                    <p className="text-xs text-[var(--jarvis-text-muted)] leading-relaxed">
                      {loop.description}
                    </p>
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
