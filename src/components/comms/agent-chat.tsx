"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { agents, getAgentBySlug } from "@/data/agents";
import { departments } from "@/data/departments";
import { GlowCard, StatusIndicator, DepartmentBadge } from "@/components/jarvis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRelativeTime } from "@/lib/utils";

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface Message {
  readonly id: string;
  readonly type: "directive" | "response" | "status_update" | "system";
  readonly from: "user" | string; // "user" or agent slug
  readonly to: "user" | string;
  readonly content: string;
  readonly timestamp: string;
  readonly status: "sent" | "delivered" | "read" | "pending";
  readonly metadata?: {
    readonly task_id?: string;
    readonly playbook_id?: string;
    readonly priority?: string;
  };
}

interface Conversation {
  readonly agent_slug: string;
  readonly messages: readonly Message[];
  readonly unread_count: number;
  readonly last_message_at: string;
}

// ═══════════════════════════════════════════════════
// Mock conversation data
// ═══════════════════════════════════════════════════

const MOCK_CONVERSATIONS: Record<string, readonly Message[]> = {
  diane: [
    { id: "d1", type: "directive", from: "user", to: "diane", content: "Diane, I need a full status report across all departments by end of day.", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "read" },
    { id: "d2", type: "response", from: "diane", to: "user", content: "Acknowledged, Lamin. I'll coordinate with all department directors and compile a comprehensive report. Expected delivery: 5:00 PM.", timestamp: new Date(Date.now() - 3400000).toISOString(), status: "delivered" },
    { id: "d3", type: "status_update", from: "diane", to: "user", content: "Status update: 5/7 department reports received. Waiting on Marketing (Camila) and Finance (Steward). Following up now.", timestamp: new Date(Date.now() - 1800000).toISOString(), status: "delivered" },
    { id: "d4", type: "response", from: "diane", to: "user", content: "Full report complete. All 7 departments reporting. Key highlights: Census at 24 patients, 96% SLA compliance, 2 open CNA positions, Q1 revenue on track. Detailed report attached to your dashboard.", timestamp: new Date(Date.now() - 600000).toISOString(), status: "delivered" },
  ],
  camila: [
    { id: "c1", type: "directive", from: "user", to: "camila", content: "Camila, what's the status on the Q2 marketing budget proposal?", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "read" },
    { id: "c2", type: "response", from: "camila", to: "user", content: "Working on it now. Beacon has the Google Ads projections ready, and Ember has the email campaign costs. I'm consolidating everything. Should have a draft to you by tomorrow morning.", timestamp: new Date(Date.now() - 7000000).toISOString(), status: "delivered" },
    { id: "c3", type: "status_update", from: "camila", to: "user", content: "Draft budget ready for review. Total Q2 projection: $12,400. Breakdown: Google Ads $5,200, Community Events $3,800, Email Campaigns $1,200, SEO Tools $900, Social Media $1,300. Sending to your dashboard now.", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "delivered" },
  ],
  justice: [
    { id: "j1", type: "directive", from: "user", to: "justice", content: "Justice, run a pre-survey compliance check on all active patient charts. Priority: high.", timestamp: new Date(Date.now() - 86400000).toISOString(), status: "read" },
    { id: "j2", type: "response", from: "justice", to: "user", content: "Acknowledged. Initiating comprehensive chart audit. Chart and Guardian are mobilized. Estimated completion: 48 hours for all 24 active charts.", timestamp: new Date(Date.now() - 85000000).toISOString(), status: "delivered" },
    { id: "j3", type: "status_update", from: "justice", to: "user", content: "Progress: 16/24 charts reviewed. 14 fully compliant. 2 charts have minor documentation gaps (missing initial care plan signatures). Remediation in progress.", timestamp: new Date(Date.now() - 43200000).toISOString(), status: "delivered" },
    { id: "j4", type: "response", from: "justice", to: "user", content: "Audit complete. Results: 22/24 charts fully compliant (91.7%). 2 charts remediated — signatures obtained from Nurse Riley. Survey readiness score: 96%. Full report filed.", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "delivered" },
  ],
  terra: [
    { id: "t1", type: "directive", from: "user", to: "terra", content: "Terra, we need to fill the open CNA positions urgently. What's the recruitment pipeline look like?", timestamp: new Date(Date.now() - 172800000).toISOString(), status: "read" },
    { id: "t2", type: "response", from: "terra", to: "user", content: "On it. Recruit has 7 candidates in pipeline: 3 from Indeed, 2 from community college partnerships, 2 referrals. Scheduling interviews for this week.", timestamp: new Date(Date.now() - 170000000).toISOString(), status: "delivered" },
    { id: "t3", type: "status_update", from: "terra", to: "user", content: "Update: 4 interviews completed. 2 strong candidates — both CNAs with hospice experience. Background checks initiated. Expected start date: next Monday if cleared.", timestamp: new Date(Date.now() - 86400000).toISOString(), status: "delivered" },
  ],
  steward: [
    { id: "s1", type: "system", from: "steward", to: "user", content: "Monthly financial package for March 2026 has been delivered. Revenue: $142,000 | Expenses: $98,000 | Net: $44,000 | Hospice Cap: 72% utilized.", timestamp: new Date(Date.now() - 259200000).toISOString(), status: "delivered" },
    { id: "s2", type: "directive", from: "user", to: "steward", content: "Steward, the net margin looks strong. Can you project Q2 based on current census trends?", timestamp: new Date(Date.now() - 172800000).toISOString(), status: "read" },
    { id: "s3", type: "response", from: "steward", to: "user", content: "Based on current ADC of 24 and projected growth to 28 by June, Q2 projection: Revenue $468,000, Expenses $312,000, Net $156,000. Key assumption: 2 new CNAs hired by April to support census growth. Detailed model available on demand.", timestamp: new Date(Date.now() - 160000000).toISOString(), status: "delivered" },
  ],
};

// ═══════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════

export function AgentChat() {
  const [selectedAgent, setSelectedAgent] = useState<string>("diane");
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [searchFilter, setSearchFilter] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = conversations[selectedAgent] ?? [];
  const currentAgent = getAgentBySlug(selectedAgent);

  const conversationList = useMemo(() => {
    const list = Object.entries(conversations).map(([slug, msgs]) => {
      const agent = getAgentBySlug(slug);
      const lastMsg = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => m.from !== "user" && m.status !== "read"
      ).length;
      return { slug, agent, lastMsg, unread, lastAt: lastMsg?.timestamp ?? "" };
    });
    return list
      .filter((c) => {
        if (!searchFilter) return true;
        const name = c.agent?.name ?? "";
        return name.toLowerCase().includes(searchFilter.toLowerCase());
      })
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [conversations, searchFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      type: "directive",
      from: "user",
      to: selectedAgent,
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    setConversations((prev) => ({
      ...prev,
      [selectedAgent]: [...(prev[selectedAgent] ?? []), newMsg],
    }));
    setInputValue("");
  }, [inputValue, selectedAgent]);

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 h-[calc(100vh-220px)]">
      {/* Left — Conversation List */}
      <div className="flex flex-col border border-[var(--jarvis-border)] rounded-xl bg-[var(--jarvis-bg-secondary)] overflow-hidden">
        <div className="p-3 border-b border-[var(--jarvis-border)]">
          <Input
            placeholder="Search agents..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1">
            {conversationList.map((conv) => {
              if (!conv.agent) return null;
              const isActive = conv.slug === selectedAgent;
              return (
                <button
                  key={conv.slug}
                  onClick={() => setSelectedAgent(conv.slug)}
                  className={cn(
                    "w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-[var(--jarvis-accent)]/10 border border-[var(--jarvis-accent)]/20"
                      : "hover:bg-[var(--jarvis-bg-tertiary)]"
                  )}
                >
                  <div className="relative mt-0.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: departments.find((d) => d.slug === conv.agent!.department)?.color ?? "var(--jarvis-accent)" }}
                    >
                      {conv.agent.name[0]}
                    </div>
                    <StatusIndicator status={conv.agent.status} size="sm" className="absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--jarvis-text-primary)] truncate">
                        {conv.agent.name}
                      </span>
                      {conv.unread > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--jarvis-accent)] px-1 text-[10px] font-bold text-[var(--jarvis-bg-primary)]">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] truncate">
                      {conv.lastMsg?.content.slice(0, 50)}...
                    </p>
                    <p className="text-[9px] text-[var(--jarvis-text-muted)] mt-0.5">
                      {conv.lastMsg ? formatRelativeTime(conv.lastMsg.timestamp) : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Right — Chat Area */}
      <div className="flex flex-col border border-[var(--jarvis-border)] rounded-xl bg-[var(--jarvis-bg-secondary)] overflow-hidden">
        {/* Chat header */}
        {currentAgent && (
          <div className="flex items-center gap-3 border-b border-[var(--jarvis-border)] px-4 py-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: departments.find((d) => d.slug === currentAgent.department)?.color ?? "var(--jarvis-accent)" }}
            >
              {currentAgent.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--jarvis-text-primary)]">
                {currentAgent.name}
              </p>
              <div className="flex items-center gap-2">
                <StatusIndicator status={currentAgent.status} size="sm" showLabel />
                <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                  {currentAgent.role}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              <DepartmentBadge slug={currentAgent.department} />
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <AnimatePresence>
              {currentMessages.map((msg) => {
                const isUser = msg.from === "user";
                const agentData = !isUser ? getAgentBySlug(msg.from) : null;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
                  >
                    {!isUser && (
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-1"
                        style={{ backgroundColor: departments.find((d) => d.slug === agentData?.department)?.color ?? "var(--jarvis-accent)" }}
                      >
                        {agentData?.name[0] ?? "A"}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-xl px-3.5 py-2.5",
                        isUser
                          ? "bg-[var(--jarvis-accent)]/15 border border-[var(--jarvis-accent)]/20"
                          : "bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]"
                      )}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-medium text-[var(--jarvis-accent)]">
                            {agentData?.name ?? "Agent"}
                          </span>
                          {msg.type === "status_update" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--jarvis-accent-2)]/15 text-[var(--jarvis-accent-2)]">
                              Status Update
                            </span>
                          )}
                          {msg.type === "system" && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--jarvis-warning)]/15 text-[var(--jarvis-warning)]">
                              System
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-[var(--jarvis-text-primary)] leading-relaxed">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <span className="text-[9px] text-[var(--jarvis-text-muted)]">
                          {formatRelativeTime(msg.timestamp)}
                        </span>
                        {isUser && (
                          <span>
                            {msg.status === "read" ? (
                              <CheckCircle2 className="h-3 w-3 text-[var(--jarvis-accent)]" />
                            ) : msg.status === "delivered" ? (
                              <CheckCircle2 className="h-3 w-3 text-[var(--jarvis-text-muted)]" />
                            ) : (
                              <Clock className="h-3 w-3 text-[var(--jarvis-text-muted)]" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    {isUser && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--jarvis-accent)] text-[10px] font-bold text-[var(--jarvis-bg-primary)] mt-1">
                        L
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t border-[var(--jarvis-border)] p-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${currentAgent?.name ?? "agent"}...`}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
