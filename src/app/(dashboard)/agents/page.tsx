"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { AgentCard } from "@/components/jarvis";
import type { AgentStatus } from "@/types";

const STATUS_OPTIONS: Array<{ label: string; value: AgentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Idle", value: "idle" },
  { label: "Executing", value: "executing" },
  { label: "Offline", value: "offline" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function AgentsPage() {
  const router = useRouter();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  useRealtimeSubscription("agents");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "all">("all");

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchesDept = deptFilter === "all" || a.department === deptFilter;
      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter;
      return matchesDept && matchesStatus;
    });
  }, [agents, deptFilter, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, idle: 0, executing: 0, offline: 0 };
    for (const a of filteredAgents) {
      counts[a.status] += 1;
    }
    return counts;
  }, [filteredAgents]);

  if (agentsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading agents...</p>
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
          Agents
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {agents.length} AI agents across {departments.length} departments
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div className="space-y-3" variants={fadeUp}>
        {/* Department Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={deptFilter === "all"}
            onClick={() => setDeptFilter("all")}
          >
            All
          </FilterButton>
          {departments.map((dept) => (
            <FilterButton
              key={dept.slug}
              active={deptFilter === dept.slug}
              onClick={() => setDeptFilter(dept.slug)}
              color={dept.color}
            >
              {dept.name}
            </FilterButton>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              active={statusFilter === opt.value}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </FilterButton>
          ))}
        </div>
      </motion.div>

      {/* Agent Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={stagger}
      >
        {filteredAgents.map((agent) => (
          <motion.div key={agent.slug} variants={fadeUp}>
            <AgentCard
              agent={agent}
              onClick={() => router.push(`/agents/${agent.slug}`)}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredAgents.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="text-center py-12 text-[var(--jarvis-text-muted)]"
        >
          No agents match the selected filters.
        </motion.div>
      )}

      {/* Stats Bar */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap gap-4 text-xs text-[var(--jarvis-text-muted)] border-t border-[var(--jarvis-border)] pt-4"
      >
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--jarvis-success)] mr-1.5" />
          {statusCounts.active} active
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--jarvis-warning)] mr-1.5" />
          {statusCounts.idle} idle
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--jarvis-accent-2)] mr-1.5" />
          {statusCounts.executing} executing
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--jarvis-text-muted)] mr-1.5" />
          {statusCounts.offline} offline
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ─── Filter Button ─────────────────────────────── */

function FilterButton({
  children,
  active,
  onClick,
  color,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
        border
        ${
          active
            ? "border-[var(--jarvis-border-strong)] bg-[var(--jarvis-bg-elevated)] text-[var(--jarvis-text-primary)]"
            : "border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-text-secondary)] hover:border-[var(--jarvis-border-strong)]"
        }
      `}
      style={
        active && color
          ? { borderColor: color, color, backgroundColor: `${color}10` }
          : undefined
      }
    >
      {children}
    </button>
  );
}
