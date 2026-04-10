"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  Shield,
  AlertTriangle,
  Search,
  Clock,
  User,
  Download,
  Filter,
} from "lucide-react";
import { GlowCard, HudFrame } from "@/components/jarvis";
import { useAuditLog } from "@/hooks/use-audit-log";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const ACTION_CATEGORIES = [
  { value: "", label: "All Actions" },
  { value: "auth", label: "Authentication" },
  { value: "phi", label: "PHI Access" },
  { value: "agent", label: "Agent Activity" },
  { value: "task", label: "Tasks" },
  { value: "playbook", label: "Playbooks" },
] as const;

function getRiskBadge(metadata: Record<string, unknown>) {
  const level = (metadata?.risk_level as string) ?? "low";
  const colors: Record<string, string> = {
    low: "border-emerald-500/30 bg-emerald-500/20 text-emerald-400",
    medium: "border-amber-500/30 bg-amber-500/20 text-amber-400",
    high: "border-red-500/30 bg-red-500/20 text-red-400",
    critical: "border-fuchsia-500/30 bg-fuchsia-500/20 text-fuchsia-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${colors[level] ?? colors.low}`}>
      {level.toUpperCase()}
    </span>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditLogsPage() {
  const { recentLogs, recentLogsLoading } = useAuditLog();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const filtered = useMemo(() => {
    return recentLogs.filter((log) => {
      if (actionFilter && !log.action.startsWith(actionFilter)) return false;
      if (search) {
        const lower = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(lower) ||
          (log.details?.toLowerCase().includes(lower) ?? false)
        );
      }
      return true;
    });
  }, [recentLogs, search, actionFilter]);

  const phiCount = useMemo(
    () => recentLogs.filter((l) => (l.metadata as Record<string, unknown>)?.phi_accessed === true).length,
    [recentLogs]
  );

  const highRiskCount = useMemo(
    () => recentLogs.filter((l) => {
      const level = (l.metadata as Record<string, unknown>)?.risk_level;
      return level === "high" || level === "critical";
    }).length,
    [recentLogs]
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--jarvis-text-primary)] font-[family-name:var(--font-space-grotesk)]">
            Audit Logs
          </h1>
          <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
            HIPAA compliance trail — all system activity
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--jarvis-border)] px-3 py-2 text-xs text-[var(--jarvis-text-secondary)] hover:border-[var(--jarvis-accent)] transition-colors">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlowCard className="p-4" hover>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--jarvis-accent)]/20">
              <ScrollText className="h-5 w-5 text-[var(--jarvis-accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--jarvis-text-primary)]">{recentLogs.length}</p>
              <p className="text-xs text-[var(--jarvis-text-muted)]">Total Events</p>
            </div>
          </div>
        </GlowCard>
        <GlowCard className="p-4" glowColor="#ef4444" hover>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--jarvis-text-primary)]">{phiCount}</p>
              <p className="text-xs text-[var(--jarvis-text-muted)]">PHI Access Events</p>
            </div>
          </div>
        </GlowCard>
        <GlowCard className="p-4" glowColor="#f59e0b" hover>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--jarvis-text-primary)]">{highRiskCount}</p>
              <p className="text-xs text-[var(--jarvis-text-muted)]">High Risk Events</p>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jarvis-text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] pl-10 pr-4 py-2.5 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] outline-none focus:border-[var(--jarvis-accent)]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jarvis-text-muted)]" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="appearance-none rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] pl-10 pr-8 py-2.5 text-sm text-[var(--jarvis-text-primary)] outline-none focus:border-[var(--jarvis-accent)]"
          >
            {ACTION_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Log Table */}
      <motion.div variants={fadeUp}>
        <HudFrame title="Activity Log" color="#06d6a0">
          {recentLogsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--jarvis-accent)] border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--jarvis-text-muted)]">
              <ScrollText className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No audit logs found</p>
              <p className="text-xs mt-1">Activity will appear here as it occurs</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--jarvis-border)]">
              {filtered.map((log) => {
                const meta = log.metadata as Record<string, unknown>;
                const isPhi = meta?.phi_accessed === true;
                return (
                  <div
                    key={log.id}
                    className={`flex items-start gap-4 px-4 py-3 ${
                      isPhi ? "bg-red-500/5 border-l-2 border-l-red-500/50" : ""
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isPhi ? (
                        <Shield className="h-4 w-4 text-red-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-[var(--jarvis-text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono text-[var(--jarvis-accent)]">
                          {log.action}
                        </code>
                        {getRiskBadge(meta)}
                        {isPhi && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
                            PHI
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="mt-1 text-xs text-[var(--jarvis-text-secondary)] line-clamp-2">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-[var(--jarvis-text-muted)] whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </HudFrame>
      </motion.div>
    </motion.div>
  );
}
