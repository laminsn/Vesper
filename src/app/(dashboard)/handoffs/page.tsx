"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Repeat2, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useHandoffs } from "@/hooks/use-handoffs";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import {
  GlowCard,
  KpiCard,
  StatusIndicator,
  SlaBar,
  DepartmentBadge,
} from "@/components/jarvis";
import { getDepartmentColor } from "@/lib/utils";
import type { Handoff, Agent, Department } from "@/types";

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

/* ───── handoff card ───── */

interface HandoffCardProps {
  readonly handoff: Handoff;
  readonly agents: readonly Agent[];
  readonly departments: readonly Department[];
}

function HandoffCard({ handoff, agents, departments }: HandoffCardProps) {
  const fromAgent = useMemo(
    () => agents.find((a) => a.id === handoff.from_agent_id),
    [handoff.from_agent_id, agents]
  );
  const toAgent = useMemo(
    () => agents.find((a) => a.id === handoff.to_agent_id),
    [handoff.to_agent_id, agents]
  );

  const fromDept = useMemo(
    () => departments.find((d) => d.slug === handoff.from_department),
    [handoff.from_department, departments]
  );
  const toDept = useMemo(
    () => departments.find((d) => d.slug === handoff.to_department),
    [handoff.to_department, departments]
  );

  const fromSlug = handoff.from_department;
  const toSlug = handoff.to_department;
  const fromColor = getDepartmentColor(fromSlug);

  return (
    <GlowCard className="p-5 space-y-4" hover={false}>
      {/* Header: number + name */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
          style={{
            backgroundColor: `${fromColor}20`,
            color: fromColor,
          }}
        >
          #{handoff.handoff_number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug">
            {handoff.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--jarvis-text-muted)]">
            <Clock className="h-3 w-3" />
            SLA: {handoff.sla_description ?? "N/A"}
          </div>
        </div>
      </div>

      {/* Department flow */}
      <div className="flex items-center gap-2">
        <DepartmentBadge slug={fromSlug} name={fromDept?.name ?? fromSlug} size="sm" />
        <ArrowRight
          className="h-4 w-4 text-[var(--jarvis-text-muted)] shrink-0"
        />
        <DepartmentBadge slug={toSlug} name={toDept?.name ?? toSlug} size="sm" />
      </div>

      {/* Agent flow */}
      <div className="flex items-center gap-3 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-2">
        {fromAgent && (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <StatusIndicator status={fromAgent.status} size="sm" />
            <span className="text-xs font-medium text-[var(--jarvis-text-primary)] truncate">
              {fromAgent.name}
            </span>
          </div>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-[var(--jarvis-accent)] shrink-0" />
        {toAgent && (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <StatusIndicator status={toAgent.status} size="sm" />
            <span className="text-xs font-medium text-[var(--jarvis-text-primary)] truncate">
              {toAgent.name}
            </span>
          </div>
        )}
      </div>

      {/* SLA bar */}
      <SlaBar
        label="SLA Performance"
        targetMinutes={60}
        actualMinutes={null}
      />

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--jarvis-border)]">
        <span className="text-[10px] text-[var(--jarvis-text-muted)] font-mono">
          0 executions
        </span>
      </div>
    </GlowCard>
  );
}

/* ───── page component ───── */

export default function HandoffsPage() {
  const { data: handoffs = [], isLoading: handoffsLoading } = useHandoffs();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();

  const isLoading = handoffsLoading || agentsLoading || deptsLoading;

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
          Handoff Tracker
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {handoffs.length} cross-department handoffs with SLA monitoring
        </p>
      </motion.div>

      {/* SLA Summary bar */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        variants={stagger}
      >
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Total Handoffs"
            value={handoffs.length}
            icon={Repeat2}
            color="var(--jarvis-accent)"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="SLA Met Rate"
            value="--&#37;"
            icon={CheckCircle2}
            color="var(--jarvis-success)"
            subtitle="No data yet"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <KpiCard
            title="Avg Response Time"
            value="--"
            icon={Clock}
            color="var(--jarvis-accent-2)"
            subtitle="No data yet"
          />
        </motion.div>
      </motion.div>

      {/* Handoff list */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        variants={stagger}
      >
        {handoffs.map((h) => (
          <motion.div key={h.id} variants={fadeUp}>
            <HandoffCard handoff={h} agents={agents} departments={departments} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
