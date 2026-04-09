"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  Search,
  Send,
  Mic,
  Bot,
  CheckCircle2,
  Target,
  Clock,
  DollarSign,
  Cpu,
  Shield,
  Activity,
  Loader2,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, StatusIndicator, KpiCard } from "@/components/jarvis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agent, AgentStatus } from "@/types";

// ── Types ───────────────────────────────────────────────────────────────────────

interface ChatMessage {
  readonly id: string;
  readonly role: "system" | "user" | "agent";
  readonly content: string;
  readonly timestamp: string;
}

interface AgentMetrics {
  readonly tasksCompleted: number;
  readonly successRate: number;
  readonly avgResponse: string;
  readonly costToday: string;
}

interface RecentTask {
  readonly id: string;
  readonly title: string;
  readonly status: "completed" | "in_progress" | "failed";
  readonly timestamp: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────────

const MOCK_MESSAGES: readonly ChatMessage[] = [
  {
    id: "msg-1",
    role: "system",
    content: "Agent initialized and ready.",
    timestamp: "09:00 AM",
  },
  {
    id: "msg-2",
    role: "user",
    content: "Run compliance check on all active charts.",
    timestamp: "09:12 AM",
  },
  {
    id: "msg-3",
    role: "agent",
    content: "Acknowledged. Beginning chart compliance audit for 12 active patients.",
    timestamp: "09:12 AM",
  },
  {
    id: "msg-4",
    role: "agent",
    content: "Progress: 8/12 charts reviewed. 2 findings so far.",
    timestamp: "09:18 AM",
  },
  {
    id: "msg-5",
    role: "agent",
    content:
      "Complete. 10/12 compliant. 2 charts missing initial care plan signatures. Report generated.",
    timestamp: "09:24 AM",
  },
];

const MOCK_METRICS: AgentMetrics = {
  tasksCompleted: 47,
  successRate: 94,
  avgResponse: "2.3s",
  costToday: "$1.24",
};

const MOCK_RECENT_TASKS: readonly RecentTask[] = [
  {
    id: "t-1",
    title: "Chart compliance audit",
    status: "completed",
    timestamp: "9:24 AM",
  },
  {
    id: "t-2",
    title: "OASIS coding review",
    status: "in_progress",
    timestamp: "9:30 AM",
  },
  {
    id: "t-3",
    title: "Accreditation checklist update",
    status: "completed",
    timestamp: "8:45 AM",
  },
];

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

function getAgentModelLabel(tier: string): string {
  switch (tier) {
    case "orchestrator":
      return "Claude Opus 4";
    case "director":
      return "Claude Sonnet 4";
    case "specialist":
      return "Claude Haiku 4";
    default:
      return "Claude Sonnet 4";
  }
}

function getTaskStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "var(--jarvis-success)";
    case "in_progress":
      return "var(--jarvis-accent-2)";
    case "failed":
      return "var(--jarvis-danger)";
    default:
      return "var(--jarvis-text-muted)";
  }
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function CommandStationPage() {
  const { data: agents = [], isLoading } = useAgents();
  useRealtimeSubscription("agents");

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

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

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading || !selectedAgent) {
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
          Real-time agent monitoring and control
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
                    {deptAgents.map((agent) => (
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
                          <p className="truncate text-xs font-medium">
                            {agent.name}
                          </p>
                          <p className="truncate text-[10px] text-[var(--jarvis-text-muted)]">
                            {agent.role}
                          </p>
                        </div>
                        <span className="shrink-0 text-[9px] text-[var(--jarvis-text-muted)]">
                          {formatLastSeen(agent.last_seen_at)}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </HudFrame>

        {/* Center Panel - Agent Chat */}
        <HudFrame title="Agent Communication" className="flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="mb-3 flex items-center gap-3 border-b border-[var(--jarvis-border)] pb-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--jarvis-accent)15" }}
            >
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
            <StatusIndicator
              status={selectedAgent.status}
              showLabel
              size="sm"
              className="ml-auto"
            />
          </div>

          {/* Message List */}
          <ScrollArea className="flex-1 -mr-2 pr-2">
            <div className="flex flex-col gap-3">
              {MOCK_MESSAGES.map((msg) => (
                <MessageBubble key={msg.id} message={msg} agentName={selectedAgent.name} />
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--jarvis-border)] pt-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedAgent.name}...`}
              className="flex-1 border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              className="bg-[var(--jarvis-accent)] text-[var(--jarvis-bg-primary)] hover:bg-[var(--jarvis-accent)]/80"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled
              className="border-[var(--jarvis-border)] text-[var(--jarvis-text-muted)]"
              title="Voice input coming soon"
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </HudFrame>

        {/* Right Panel - Agent Metrics */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <HudFrame title="Performance">
            <div className="grid grid-cols-2 gap-2">
              <KpiCard
                title="Tasks Done"
                value={MOCK_METRICS.tasksCompleted}
                icon={CheckCircle2}
                color="var(--jarvis-success)"
                className="p-3"
              />
              <KpiCard
                title="Success"
                value={`${MOCK_METRICS.successRate}%`}
                icon={Target}
                color="var(--jarvis-accent)"
                className="p-3"
              />
              <KpiCard
                title="Avg Response"
                value={MOCK_METRICS.avgResponse}
                icon={Clock}
                color="var(--jarvis-accent-2)"
                className="p-3"
              />
              <KpiCard
                title="Cost Today"
                value={MOCK_METRICS.costToday}
                icon={DollarSign}
                color="var(--jarvis-warning)"
                className="p-3"
              />
            </div>
          </HudFrame>

          <HudFrame title="Recent Tasks">
            <div className="flex flex-col gap-2">
              {MOCK_RECENT_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-3 py-2"
                >
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getTaskStatusColor(task.status) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-[var(--jarvis-text-primary)]">
                      {task.title}
                    </p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {task.timestamp}
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
              <ConfigRow
                label="Status"
                value={selectedAgent.status}
              />
            </div>
          </HudFrame>
        </div>
      </div>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  agentName,
}: {
  readonly message: ChatMessage;
  readonly agentName: string;
}) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-[var(--jarvis-bg-tertiary)] px-3 py-1 text-[10px] text-[var(--jarvis-text-muted)]">
          {message.content}
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
      <span className="text-[10px] text-[var(--jarvis-text-muted)]">
        {isUser ? "You" : agentName} &middot; {message.timestamp}
      </span>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-[var(--jarvis-accent)]/15 text-[var(--jarvis-accent)]"
            : "bg-[var(--jarvis-bg-tertiary)] text-[var(--jarvis-text-primary)]"
        }`}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function ConfigRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[var(--jarvis-bg-tertiary)] px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--jarvis-text-muted)]">
        {label}
      </span>
      <span className="text-xs capitalize text-[var(--jarvis-text-primary)]">
        {value}
      </span>
    </div>
  );
}
