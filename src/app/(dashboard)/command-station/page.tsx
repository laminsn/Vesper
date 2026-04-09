"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Search,
  Send,
  Bot,
  CheckCircle2,
  Target,
  Clock,
  AlertTriangle,
  Cpu,
  Activity,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/hooks/use-agents";
import { useDirectives, useCreateDirective } from "@/hooks/use-directives";
import { useAgentComms, useCreateComm } from "@/hooks/use-comms";
import { useTasks } from "@/hooks/use-tasks";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, StatusIndicator, KpiCard } from "@/components/jarvis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent, Directive, AgentCommunication } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────────────────

function getDepartmentLabel(dept: string): string {
  return dept
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupAgentsByDepartment(agentList: readonly Agent[]): ReadonlyMap<string, readonly Agent[]> {
  const grouped = new Map<string, Agent[]>();
  for (const agent of agentList) {
    const existing = grouped.get(agent.department) ?? [];
    grouped.set(agent.department, [...existing, agent]);
  }
  return grouped;
}

function formatLastSeen(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getAgentModelLabel(tier: string): string {
  switch (tier) {
    case "orchestrator": return "Claude Opus 4";
    case "director": return "Claude Sonnet 4";
    case "specialist": return "Claude Haiku 4";
    default: return "Claude Sonnet 4";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed": case "done": return "var(--jarvis-success)";
    case "in_progress": case "executing": case "acknowledged": return "var(--jarvis-accent-2)";
    case "failed": case "cancelled": return "var(--jarvis-danger)";
    case "pending": return "var(--jarvis-warning)";
    default: return "var(--jarvis-text-muted)";
  }
}

// ── Build unified timeline from directives + comms ───────────────────────────

interface TimelineEntry {
  readonly id: string;
  readonly role: "system" | "user" | "agent";
  readonly content: string;
  readonly timestamp: string;
  readonly type: "directive" | "response" | "comm" | "status";
  readonly priority?: string;
  readonly status?: string;
}

function buildTimeline(
  directives: readonly Directive[],
  comms: readonly AgentCommunication[],
  agentId: string
): readonly TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  for (const d of directives) {
    if (d.target_agent_id !== agentId) continue;

    entries.push({
      id: `dir-${d.id}`,
      role: "user",
      content: d.instruction,
      timestamp: d.created_at,
      type: "directive",
      priority: d.priority,
      status: d.status,
    });

    if (d.response) {
      entries.push({
        id: `dir-resp-${d.id}`,
        role: "agent",
        content: d.response,
        timestamp: d.completed_at ?? d.created_at,
        type: "response",
      });
    }

    if (d.status === "acknowledged" && !d.response) {
      entries.push({
        id: `dir-ack-${d.id}`,
        role: "system",
        content: `Directive acknowledged at ${d.acknowledged_at ? formatTimestamp(d.acknowledged_at) : "unknown"}`,
        timestamp: d.acknowledged_at ?? d.created_at,
        type: "status",
      });
    }
  }

  for (const c of comms) {
    if (c.from_agent_id !== agentId && c.to_agent_id !== agentId) continue;

    entries.push({
      id: `comm-${c.id}`,
      role: c.to_agent_id === agentId ? "user" : "agent",
      content: c.body,
      timestamp: c.created_at,
      type: "comm",
      priority: c.priority,
    });
  }

  return [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function CommandStationPage() {
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: allDirectives = [] } = useDirectives();
  const { data: allComms = [] } = useAgentComms();
  const { data: allTasks = [] } = useTasks();
  const createDirective = useCreateDirective();
  const createComm = useCreateComm();

  useRealtimeSubscription("agents");
  useRealtimeSubscription("directives");
  useRealtimeSubscription("agent_communications");

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<"directive" | "message">("directive");
  const [priority, setPriority] = useState<"normal" | "high" | "critical">("normal");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const effectiveSelectedId = selectedAgentId || agents[0]?.id || "";
  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === effectiveSelectedId) ?? agents[0],
    [effectiveSelectedId, agents]
  );

  const filteredAgents = useMemo(() => {
    if (searchQuery.trim() === "") return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.role.toLowerCase().includes(query) ||
        a.department.toLowerCase().includes(query)
    );
  }, [searchQuery, agents]);

  const groupedAgents = useMemo(
    () => groupAgentsByDepartment(filteredAgents),
    [filteredAgents]
  );

  const timeline = useMemo(
    () => buildTimeline(allDirectives, allComms, effectiveSelectedId),
    [allDirectives, allComms, effectiveSelectedId]
  );

  // Agent-specific metrics
  const agentDirectives = useMemo(
    () => allDirectives.filter((d) => d.target_agent_id === effectiveSelectedId),
    [allDirectives, effectiveSelectedId]
  );
  const agentTasks = useMemo(
    () => allTasks.filter((t) => t.assigned_agent_id === effectiveSelectedId),
    [allTasks, effectiveSelectedId]
  );

  const completedCount = agentDirectives.filter((d) => d.status === "completed").length;
  const pendingCount = agentDirectives.filter((d) => d.status === "pending" || d.status === "in_progress").length;
  const totalCount = agentDirectives.length;
  const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline.length]);

  const handleSend = async () => {
    if (messageInput.trim() === "" || !selectedAgent) return;

    try {
      if (messageType === "directive") {
        await createDirective.mutateAsync({
          target_agent_id: selectedAgent.id,
          target_department: selectedAgent.department,
          instruction: messageInput.trim(),
          priority,
          status: "pending",
        });
        toast.success(`Directive sent to ${selectedAgent.name}`);
      } else {
        await createComm.mutateAsync({
          to_agent_id: selectedAgent.id,
          to_department: selectedAgent.department,
          message_type: "notification",
          subject: null,
          body: messageInput.trim(),
          priority,
          metadata: {},
        });
        toast.success(`Message sent to ${selectedAgent.name}`);
      }
      setMessageInput("");
    } catch {
      toast.error("Failed to send. Check your permissions.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (agentsLoading || !selectedAgent) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--jarvis-accent)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="heading-display text-3xl tracking-wider text-[var(--jarvis-text-primary)]">
          Command Station
        </h1>
        <p className="mt-1 text-sm text-[var(--jarvis-text-muted)]">
          Issue directives, monitor agents, and track execution in real-time
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-4 py-2">
          <Bot className="h-4 w-4 text-[var(--jarvis-accent)]" />
          <span className="text-sm font-medium text-[var(--jarvis-text-primary)]">
            {selectedAgent.name}
          </span>
          <span className="text-xs text-[var(--jarvis-text-muted)]">
            {selectedAgent.role}
          </span>
          <StatusIndicator status={selectedAgent.status} showLabel size="sm" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--jarvis-text-muted)]">
          <Activity className="h-3 w-3" />
          <span>
            {agents.filter((a) => a.status === "active" || a.status === "executing").length} / {agents.length} agents online
          </span>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="grid flex-1 grid-cols-[250px_1fr_300px] gap-4 overflow-hidden">
        {/* Left Panel - Agent Roster */}
        <HudFrame title="Agent Roster" className="flex flex-col overflow-hidden">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--jarvis-text-muted)]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="h-8 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] pl-8 text-xs text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 -mr-2 pr-2">
            <div className="flex flex-col gap-3">
              {Array.from(groupedAgents.entries()).map(([dept, deptAgents]) => (
                <div key={dept}>
                  <span className="heading-mono mb-1.5 block text-[10px] text-[var(--jarvis-accent)]">
                    {getDepartmentLabel(dept).toUpperCase()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {deptAgents.map((agent) => {
                      const dirCount = allDirectives.filter((d) => d.target_agent_id === agent.id && d.status === "pending").length;
                      return (
                        <motion.button
                          key={agent.id}
                          onClick={() => setSelectedAgentId(agent.id)}
                          whileHover={{ x: 2 }}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                            effectiveSelectedId === agent.id
                              ? "bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]"
                              : "text-[var(--jarvis-text-secondary)] hover:bg-[var(--jarvis-bg-tertiary)]"
                          }`}
                        >
                          <StatusIndicator status={agent.status} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">{agent.name}</p>
                            <p className="truncate text-[10px] text-[var(--jarvis-text-muted)]">{agent.role}</p>
                          </div>
                          {dirCount > 0 && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">
                              {dirCount}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </HudFrame>

        {/* Center Panel - Communication */}
        <HudFrame title="Agent Communication" className="flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="mb-3 flex items-center gap-3 border-b border-[var(--jarvis-border)] pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--jarvis-accent)]/15">
              <Bot className="h-4 w-4 text-[var(--jarvis-accent)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                {selectedAgent.name}
              </p>
              <p className="text-xs text-[var(--jarvis-text-muted)]">
                {selectedAgent.role} &middot; {getDepartmentLabel(selectedAgent.department)}
              </p>
            </div>
            <StatusIndicator status={selectedAgent.status} showLabel size="sm" className="ml-auto" />
          </div>

          {/* Timeline */}
          <ScrollArea className="flex-1 -mr-2 pr-2">
            <div className="flex flex-col gap-3">
              {timeline.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Terminal className="h-8 w-8 text-[var(--jarvis-text-muted)] mb-2" />
                  <p className="text-xs text-[var(--jarvis-text-muted)]">
                    No communications yet. Send a directive to {selectedAgent.name}.
                  </p>
                </div>
              )}
              {timeline.map((entry) => (
                <TimelineBubble key={entry.id} entry={entry} agentName={selectedAgent.name} />
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-3 space-y-2 border-t border-[var(--jarvis-border)] pt-3">
            <div className="flex items-center gap-2">
              <Select value={messageType} onValueChange={(v) => setMessageType(v as "directive" | "message")}>
                <SelectTrigger className="h-8 w-32 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-xs text-[var(--jarvis-text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                  <SelectItem value="directive" className="text-[var(--jarvis-text-primary)]">Directive</SelectItem>
                  <SelectItem value="message" className="text-[var(--jarvis-text-primary)]">Message</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(v) => setPriority(v as "normal" | "high" | "critical")}>
                <SelectTrigger className="h-8 w-24 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-xs text-[var(--jarvis-text-primary)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--jarvis-bg-secondary)] border-[var(--jarvis-border)]">
                  <SelectItem value="normal" className="text-[var(--jarvis-text-primary)]">Normal</SelectItem>
                  <SelectItem value="high" className="text-[var(--jarvis-text-primary)]">High</SelectItem>
                  <SelectItem value="critical" className="text-[var(--jarvis-text-primary)]">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messageType === "directive" ? `Issue directive to ${selectedAgent.name}...` : `Message ${selectedAgent.name}...`}
                className="flex-1 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={createDirective.isPending || createComm.isPending || messageInput.trim() === ""}
                className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)] hover:bg-[var(--jarvis-accent)]/80"
              >
                {(createDirective.isPending || createComm.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </HudFrame>

        {/* Right Panel - Metrics & Tasks */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <HudFrame title="Performance">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard
                title="Completed"
                value={completedCount}
                icon={CheckCircle2}
                color="var(--jarvis-success)"
                className="p-3"
              />
              <KpiCard
                title="Success"
                value={totalCount > 0 ? `${successRate}%` : "—"}
                icon={Target}
                color="var(--jarvis-accent)"
                className="p-3"
              />
              <KpiCard
                title="Pending"
                value={pendingCount}
                icon={Clock}
                color="var(--jarvis-accent-2)"
                className="p-3"
              />
              <KpiCard
                title="Total"
                value={totalCount}
                icon={Cpu}
                color="var(--jarvis-warning)"
                className="p-3"
              />
            </div>
          </HudFrame>

          <HudFrame title="Directives">
            <div className="flex flex-col gap-2">
              {agentDirectives.length === 0 && (
                <p className="text-center text-[10px] text-[var(--jarvis-text-muted)] py-4">
                  No directives issued yet
                </p>
              )}
              {agentDirectives.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-2"
                >
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getStatusColor(d.status) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-[var(--jarvis-text-primary)]">
                      {d.instruction}
                    </p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {d.status} &middot; {formatTimestamp(d.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </HudFrame>

          <HudFrame title="Agent Config">
            <div className="flex flex-col gap-2">
              <ConfigRow label="Model" value={getAgentModelLabel(selectedAgent.tier)} />
              <ConfigRow label="Department" value={getDepartmentLabel(selectedAgent.department)} />
              <ConfigRow label="Tier" value={selectedAgent.tier} />
              <ConfigRow label="Status" value={selectedAgent.status} />
              <ConfigRow label="Last Seen" value={formatLastSeen(selectedAgent.last_seen_at)} />
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────────

function TimelineBubble({
  entry,
  agentName,
}: {
  readonly entry: TimelineEntry;
  readonly agentName: string;
}) {
  const isUser = entry.role === "user";
  const isSystem = entry.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-[var(--jarvis-bg-tertiary)] px-3 py-1 text-[10px] text-[var(--jarvis-text-muted)]">
          {entry.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
          {isUser ? "You" : agentName} &middot; {formatTimestamp(entry.timestamp)}
        </span>
        {entry.type === "directive" && (
          <span className="rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-bold text-blue-400 uppercase">
            directive
          </span>
        )}
        {entry.priority === "critical" && (
          <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[8px] font-bold text-red-400 uppercase">
            critical
          </span>
        )}
        {entry.priority === "high" && (
          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[8px] font-bold text-amber-400 uppercase">
            high
          </span>
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-[var(--jarvis-accent)]/15 text-[var(--jarvis-accent)]"
            : "bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-primary)]"
        }`}
      >
        {entry.content}
      </div>
      {entry.status && entry.type === "directive" && (
        <span
          className="text-[9px] font-medium capitalize"
          style={{ color: getStatusColor(entry.status) }}
        >
          {entry.status}
        </span>
      )}
    </motion.div>
  );
}

function ConfigRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[var(--jarvis-bg-tertiary)] px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--jarvis-text-muted)]">
        {label}
      </span>
      <span className="text-xs capitalize text-[var(--jarvis-text-primary)]">{value}</span>
    </div>
  );
}
