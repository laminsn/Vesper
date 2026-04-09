"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, ListTodo, MessageSquare, Sparkles } from "lucide-react";
import { useAgents, useAgent } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import {
  StatusIndicator,
  DepartmentBadge,
  GlowCard,
  AgentCard,
} from "@/components/jarvis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AgentDetailPage() {
  const params = useParams<{ agentId: string }>();
  const router = useRouter();
  const agentId = params.agentId;

  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const { data: allAgents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();

  const directReports = useMemo(
    () => (agent ? allAgents.filter((a) => a.parent_agent_id === agent.slug) : []),
    [agent, allAgents]
  );

  const parentAgent = useMemo(
    () =>
      agent?.parent_agent_id
        ? allAgents.find((a) => a.slug === agent.parent_agent_id) ?? null
        : null,
    [agent, allAgents]
  );

  const department = useMemo(
    () =>
      agent
        ? departments.find((d) => d.slug === agent.department) ?? null
        : null,
    [agent, departments]
  );

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading agent...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-[var(--jarvis-text-muted)]">
          Agent not found
        </p>
        <button
          type="button"
          onClick={() => router.push("/agents")}
          className="mt-4 text-sm text-[var(--jarvis-accent)] hover:underline"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
      }}
    >
      {/* Back nav */}
      <motion.button
        type="button"
        variants={fadeUp}
        onClick={() => router.push("/agents")}
        className="flex items-center gap-1.5 text-xs text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-accent)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Agents
      </motion.button>

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
            {agent.name}
          </h1>
          <p className="text-sm text-[var(--jarvis-text-secondary)] mt-0.5">
            {agent.role}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <DepartmentBadge
              slug={agent.department}
              name={department?.name}
              size="md"
            />
            <StatusIndicator status={agent.status} showLabel size="md" />
            <span className="text-xs text-[var(--jarvis-text-muted)]">
              Last seen {formatRelativeTime(agent.last_seen_at)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="directives">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Directives
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListTodo className="h-3.5 w-3.5 mr-1.5" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="communications">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="evolution">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Evolution
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Config Summary */}
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-3">Agent Configuration</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ConfigItem label="Tier" value={agent.tier} />
                <ConfigItem
                  label="Department"
                  value={department?.name ?? agent.department}
                />
                <ConfigItem
                  label="Soul File"
                  value={agent.soul_file_path ?? "—"}
                />
              </div>
            </GlowCard>

            {/* Reports To */}
            {parentAgent && (
              <GlowCard className="p-5" hover={false}>
                <h3 className="heading-mono mb-3">Reports To</h3>
                <AgentCard
                  agent={parentAgent}
                  compact
                  onClick={() =>
                    router.push(`/agents/${parentAgent.slug}`)
                  }
                />
              </GlowCard>
            )}

            {/* Direct Reports */}
            {directReports.length > 0 && (
              <GlowCard className="p-5" hover={false}>
                <h3 className="heading-mono mb-3">
                  Direct Reports ({directReports.length})
                </h3>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {directReports.map((r) => (
                    <AgentCard
                      key={r.slug}
                      agent={r}
                      compact
                      onClick={() => router.push(`/agents/${r.slug}`)}
                    />
                  ))}
                </div>
              </GlowCard>
            )}
          </TabsContent>

          {/* Directives Tab */}
          <TabsContent value="directives" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="heading-mono">Directives</h3>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--jarvis-border)] text-[var(--jarvis-text-muted)] opacity-50 cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                  Issue Directive
                </button>
              </div>
              <EmptyState message="No directives yet" />
            </GlowCard>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-4">Tasks</h3>
              <EmptyState message="No tasks assigned" />
            </GlowCard>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-4">Communications</h3>
              <EmptyState message="No communications" />
            </GlowCard>
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-4">Evolution</h3>
              <EmptyState message="No evolution proposals" />
            </GlowCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

/* ─── Helpers ────────────────────────────────────── */

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-[var(--jarvis-text-muted)] mb-0.5">
        {label}
      </p>
      <p className="text-sm text-[var(--jarvis-text-primary)] capitalize truncate">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-[var(--jarvis-bg-tertiary)] flex items-center justify-center mb-3">
        <span className="text-[var(--jarvis-text-muted)] text-lg">--</span>
      </div>
      <p className="text-sm text-[var(--jarvis-text-muted)]">{message}</p>
    </div>
  );
}
