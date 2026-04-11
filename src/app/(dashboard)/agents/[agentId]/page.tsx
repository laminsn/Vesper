"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, ListTodo, MessageSquare, Sparkles } from "lucide-react";
import { useAgents, useAgent } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useDirectives } from "@/hooks/use-directives";
import { useTasks } from "@/hooks/use-tasks";
import { useAgentComms } from "@/hooks/use-comms";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { useEvolutionProposals } from "@/hooks/use-evolution";
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

  // Filter queries server-side instead of fetching ALL then filtering client-side
  const { data: agentDirectives = [] } = useDirectives(
    agent ? { target_agent_id: agent.id } : undefined
  );
  const { data: agentTasks = [] } = useTasks();
  const { data: agentComms = [] } = useAgentComms(
    agent ? { from_agent_id: agent.id } : undefined
  );
  const { data: agentEvolution = [] } = useEvolutionProposals();

  const directReports = useMemo(
    () => (agent ? allAgents.filter((a) => a.parent_agent_id === agent.id) : []),
    [agent, allAgents]
  );

  const parentAgent = useMemo(
    () =>
      agent?.parent_agent_id
        ? allAgents.find((a) => a.id === agent.parent_agent_id) ?? null
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

  // Agent chat
  const { messages: chatMessages, sendMessage, isSending } = useAgentChat(agent?.id ?? null);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;
    setChatInput("");
    await sendMessage(text);
  };

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
                <h3 className="heading-mono">Directives ({agentDirectives.length})</h3>
                <button
                  type="button"
                  onClick={() => router.push("/command-station")}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-[var(--jarvis-accent)] text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]/10 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Issue Directive
                </button>
              </div>
              {agentDirectives.length === 0 ? (
                <EmptyState message="No directives yet — use Command Station to issue one" />
              ) : (
                <div className="space-y-2">
                  {agentDirectives.map((d) => (
                    <div key={d.id} className="flex items-start gap-3 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.status === "completed" ? "var(--jarvis-success)" : d.status === "pending" ? "var(--jarvis-warning)" : "var(--jarvis-accent-2)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--jarvis-text-primary)]">{d.instruction}</p>
                        <p className="text-[10px] text-[var(--jarvis-text-muted)] mt-1">
                          {d.status} &middot; {d.priority} &middot; {formatRelativeTime(d.created_at)}
                        </p>
                        {d.response && (
                          <p className="text-xs text-[var(--jarvis-accent)] mt-2 border-l-2 border-[var(--jarvis-accent)]/30 pl-2">
                            {d.response}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-4">Tasks ({agentTasks.length})</h3>
              {agentTasks.length === 0 ? (
                <EmptyState message="No tasks assigned to this agent" />
              ) : (
                <div className="space-y-2">
                  {agentTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.status === "done" ? "var(--jarvis-success)" : t.status === "in_progress" ? "var(--jarvis-accent-2)" : "var(--jarvis-warning)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--jarvis-text-primary)]">{t.title}</p>
                        <p className="text-[10px] text-[var(--jarvis-text-muted)]">
                          {t.status} &middot; {t.priority}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-4">
            <GlowCard className="p-0 overflow-hidden" hover={false}>
              {/* Chat messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && agentComms.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <EmptyState message={`Start a conversation with ${agent?.name ?? "this agent"}`} />
                  </div>
                ) : (
                  <>
                    {(chatMessages.length > 0 ? chatMessages : agentComms.map((c) => ({
                      id: c.id,
                      type: c.message_type as "directive",
                      from: c.from_agent_id === agent?.id ? (c.from_agent_id ?? "agent") : "user",
                      to: c.to_agent_id === agent?.id ? (c.to_agent_id ?? "agent") : "user",
                      content: c.body,
                      timestamp: c.created_at,
                      status: "delivered" as const,
                    }))).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                            msg.from === "user"
                              ? "bg-[var(--jarvis-accent)]/20 text-[var(--jarvis-text-primary)]"
                              : "bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-secondary)]"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-[10px] text-[var(--jarvis-text-muted)] mt-1">
                            {formatRelativeTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Chat input */}
              <div className="border-t border-[var(--jarvis-border)] p-3 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder={`Message ${agent?.name ?? "agent"}...`}
                  className="flex-1 bg-[var(--jarvis-bg-tertiary)] rounded-lg px-4 py-2 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] outline-none focus:ring-1 focus:ring-[var(--jarvis-accent)]"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isSending || !chatInput.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--jarvis-accent)] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </GlowCard>
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="mt-4">
            <GlowCard className="p-5" hover={false}>
              <h3 className="heading-mono mb-4">Evolution ({agentEvolution.length})</h3>
              {agentEvolution.length === 0 ? (
                <EmptyState message="No evolution proposals for this agent" />
              ) : (
                <div className="space-y-2">
                  {agentEvolution.map((e) => (
                    <div key={e.id} className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-4 py-3">
                      <p className="text-sm text-[var(--jarvis-text-primary)]">{e.title}</p>
                      <p className="text-[10px] text-[var(--jarvis-text-muted)] mt-1">
                        {e.category} &middot; {e.status} &middot; {formatRelativeTime(e.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
