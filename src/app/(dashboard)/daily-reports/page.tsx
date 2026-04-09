"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  Users,
  Activity,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useDirectives } from "@/hooks/use-directives";
import { useAgentComms } from "@/hooks/use-comms";
import { useDailyReports, useCreateDailyReport, type DailyReport } from "@/hooks/use-daily-reports";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, StatusIndicator, CircularGauge } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ───── animations ───── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ───── helpers ───── */

function getDepartmentLabel(dept: string): string {
  return dept.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const REPORT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  morning_brief: { label: "Morning Brief", color: "#facc15" },
  end_of_day: { label: "End of Day", color: "#8b5cf6" },
  standup: { label: "Standup", color: "#06d6a0" },
  escalation: { label: "Escalation", color: "#ef4444" },
  weekly_summary: { label: "Weekly Summary", color: "#3b82f6" },
  clinical_review: { label: "Clinical Review", color: "#ec4899" },
  compliance_check: { label: "Compliance Check", color: "#f97316" },
  financial_update: { label: "Financial Update", color: "#14b8a6" },
  recruitment_update: { label: "Recruitment Update", color: "#8b5cf6" },
  marketing_update: { label: "Marketing Update", color: "#ec4899" },
};

const DEPT_COLORS: Record<string, string> = {
  executive: "#f59e0b",
  marketing: "#ec4899",
  "clinical-operations": "#ef4444",
  "admissions-intake": "#3b82f6",
  "caregiver-staffing": "#8b5cf6",
  "customer-experience": "#06d6a0",
  "compliance-quality": "#f97316",
  "accounting-finance": "#14b8a6",
};

/* ───── page ───── */

export default function DailyReportsPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: reports = [], isLoading: reportsLoading } = useDailyReports(selectedDate);
  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();
  const { data: directives = [] } = useDirectives();
  const { data: comms = [] } = useAgentComms();

  useRealtimeSubscription("daily_reports");

  // Date navigation
  const goDay = (offset: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Group reports by department
  const reportsByDept = useMemo(() => {
    const map = new Map<string, DailyReport[]>();
    for (const r of reports) {
      const existing = map.get(r.department) ?? [];
      map.set(r.department, [...existing, r]);
    }
    return map;
  }, [reports]);

  // Today's activity stats
  const todayDirectives = useMemo(() => {
    const dayStart = selectedDate + "T00:00:00";
    const dayEnd = selectedDate + "T23:59:59";
    return directives.filter((d) => d.created_at >= dayStart && d.created_at <= dayEnd);
  }, [directives, selectedDate]);

  const todayComms = useMemo(() => {
    const dayStart = selectedDate + "T00:00:00";
    const dayEnd = selectedDate + "T23:59:59";
    return comms.filter((c) => c.created_at >= dayStart && c.created_at <= dayEnd);
  }, [comms, selectedDate]);

  const activeAgents = agents.filter((a) => a.status === "active" || a.status === "executing").length;
  const reviewedReports = reports.filter((r) => r.status === "reviewed" || r.status === "acknowledged").length;
  const pendingReports = reports.filter((r) => r.status === "submitted").length;

  // Build activity timeline from directives + comms + reports for the day
  const activityTimeline = useMemo(() => {
    const items: { id: string; time: string; text: string; color: string; type: string }[] = [];

    for (const d of todayDirectives) {
      const agent = agents.find((a) => a.id === d.target_agent_id);
      items.push({
        id: `dir-${d.id}`,
        time: d.created_at,
        text: `Directive to ${agent?.name ?? "agent"}: ${d.instruction.slice(0, 50)}${d.instruction.length > 50 ? "..." : ""}`,
        color: d.status === "completed" ? "var(--jarvis-success)" : "var(--jarvis-warning)",
        type: "directive",
      });
    }

    for (const c of todayComms) {
      const fromAgent = agents.find((a) => a.id === c.from_agent_id);
      items.push({
        id: `comm-${c.id}`,
        time: c.created_at,
        text: `${fromAgent?.name ?? "Agent"}: ${c.body.slice(0, 50)}${c.body.length > 50 ? "..." : ""}`,
        color: "var(--jarvis-accent-2)",
        type: "comm",
      });
    }

    for (const r of reports) {
      const agent = agents.find((a) => a.id === r.submitted_by_agent_id);
      items.push({
        id: `report-${r.id}`,
        time: r.created_at,
        text: `${agent?.name ?? getDepartmentLabel(r.department)}: ${r.title}`,
        color: DEPT_COLORS[r.department] ?? "var(--jarvis-accent)",
        type: "report",
      });
    }

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [todayDirectives, todayComms, reports, agents]);

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header + Date Nav */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">Daily Reports</h1>
          <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
            Hierarchy communications and daily status updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => goDay(-1)} className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-4 py-2">
            <Calendar className="h-4 w-4 text-[var(--jarvis-accent)]" />
            <span className="text-sm font-medium text-[var(--jarvis-text-primary)]">
              {formatDate(selectedDate)}
            </span>
            {isToday && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">TODAY</span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => goDay(1)} disabled={isToday} className="border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HudFrame title="Reports">
          <div className="flex justify-center py-2">
            <CircularGauge value={reports.length} max={Math.max(departments.length, 1)} label="Submitted" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Reviewed" color="#06d6a0">
          <div className="flex justify-center py-2">
            <CircularGauge value={reviewedReports} max={Math.max(reports.length, 1)} label="Reviewed" color="#06d6a0" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Directives" color="var(--jarvis-accent-2)">
          <div className="flex justify-center py-2">
            <CircularGauge value={todayDirectives.length} max={20} label="Today" color="var(--jarvis-accent-2)" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Agents Online" color="var(--jarvis-warning)">
          <div className="flex justify-center py-2">
            <CircularGauge value={activeAgents} max={agents.length || 1} label="Active" color="var(--jarvis-warning)" size="sm" />
          </div>
        </HudFrame>
      </motion.div>

      {/* Main Content: Department Reports + Activity Timeline */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — Department Reports */}
        <motion.div className="lg:col-span-3 space-y-4" variants={stagger}>
          <motion.div variants={fadeUp}>
            <h2 className="heading-mono text-sm text-[var(--jarvis-accent)] mb-3">
              DEPARTMENT REPORTS
            </h2>
          </motion.div>

          {reportsLoading && (
            <motion.div variants={fadeUp} className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--jarvis-accent)]" />
            </motion.div>
          )}

          {!reportsLoading && departments.map((dept) => {
            const deptReports = reportsByDept.get(dept.slug) ?? [];
            const deptAgents = agents.filter((a) => a.department === dept.slug);
            const director = deptAgents.find((a) => a.tier === "director");

            return (
              <motion.div key={dept.slug} variants={fadeUp}>
                <GlowCard className="p-4" glowColor={dept.color} hover>
                  {/* Department Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span className="text-sm font-semibold text-[var(--jarvis-text-primary)]">
                        {dept.name}
                      </span>
                      {director && (
                        <span className="text-xs text-[var(--jarvis-text-muted)]">
                          — {director.name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {deptReports.length} report{deptReports.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Reports */}
                  {deptReports.length === 0 ? (
                    <p className="text-xs text-[var(--jarvis-text-muted)] italic py-2">
                      No reports submitted for {formatDate(selectedDate).split(",")[0]}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {deptReports.map((r) => {
                        const typeInfo = REPORT_TYPE_LABELS[r.report_type] ?? { label: r.report_type, color: "#666" };
                        const submitter = agents.find((a) => a.id === r.submitted_by_agent_id);
                        return (
                          <div key={r.id} className="rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
                                style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                                {submitter?.name ?? "System"} &middot; {formatTime(r.created_at)}
                              </span>
                              <span
                                className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                                  r.status === "reviewed" || r.status === "acknowledged"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-[var(--jarvis-text-primary)]">{r.title}</p>
                            <p className="text-xs text-[var(--jarvis-text-secondary)] mt-1 line-clamp-3">{r.body}</p>
                            {r.metrics && Object.keys(r.metrics).length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(r.metrics).map(([key, val]) => (
                                  <span key={key} className="rounded bg-[var(--jarvis-bg-secondary)] px-1.5 py-0.5 text-[9px] text-[var(--jarvis-text-muted)]">
                                    {key}: {String(val)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Right — Activity Timeline */}
        <motion.div className="lg:col-span-2" variants={fadeUp}>
          <HudFrame title="ACTIVITY TIMELINE" className="h-full">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-2">
                {activityTimeline.length === 0 && (
                  <p className="text-xs text-[var(--jarvis-text-muted)] text-center py-8">
                    No activity for this day
                  </p>
                )}
                {activityTimeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--jarvis-text-primary)]">{item.text}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                          {formatTime(item.time)}
                        </span>
                        <span className="rounded-full bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[8px] text-[var(--jarvis-text-muted)] uppercase">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </HudFrame>
        </motion.div>
      </div>
    </motion.div>
  );
}
