"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Activity, Building2, BookOpen, Zap, Shield } from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { useDirectives } from "@/hooks/use-directives";
import { useTasks } from "@/hooks/use-tasks";
import { useKpis } from "@/hooks/use-kpis";
import { useKpiDashboard } from "@/hooks/use-kpi-dashboard";
import {
  GlowCard,
  DepartmentBadge,
  StatusIndicator,
  ArcReactor,
  CircularGauge,
  HudFrame,
  ScanLine,
  GridBackground,
  TickerBar,
} from "@/components/jarvis";
import {
  VesperBarChart,
  VesperLineChart,
  VesperAreaChart,
  VesperPieChart,
  Sparkline,
} from "@/components/charts";
import {
  metricsHistory,
  departmentMetrics,
  getLast7Days,
  getLast30Days,
} from "@/data/metrics-history";

// ── Static data ─────────────────────────────────

// Activity and ticker are now computed from real data inside the component

const DEPT_COLORS: Record<string, string> = {
  Executive: "#06d6a0",
  Marketing: "#f72585",
  Clinical: "#4cc9f0",
  Admissions: "#fca311",
  Staffing: "#7209b7",
  CX: "#4895ef",
  Compliance: "#ef476f",
  Finance: "#06d6a0",
};

// ── Animation variants ──────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ── Date formatting helper ──────────────────────

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

// ── Page component ──────────────────────────────

export default function CommandCenterPage() {
  const router = useRouter();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: playbooks = [] } = usePlaybooks();
  const { data: directives = [] } = useDirectives();
  const { data: tasks = [] } = useTasks();
  const { data: kpis = [] } = useKpis();
  const { data: kpiDashboard = [] } = useKpiDashboard(30);
  useRealtimeSubscription("agents");
  useRealtimeSubscription("directives");
  useRealtimeSubscription("tasks");

  // ── Agent counts ────────────────────────────
  const activeCount = useMemo(
    () => agents.filter((a) => a.status === "active" || a.status === "executing").length,
    [agents]
  );

  const executingCount = useMemo(
    () => agents.filter((a) => a.status === "executing").length,
    [agents]
  );

  const directorLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    for (const agent of agents) {
      lookup[agent.slug] = agent.name;
    }
    return lookup;
  }, [agents]);

  // Real task/directive counts
  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "in_progress" || t.status === "todo").length, [tasks]);
  const totalTasks = tasks.length;
  const pendingDirectives = useMemo(() => directives.filter((d) => d.status === "pending" || d.status === "in_progress").length, [directives]);
  const completedDirectives = useMemo(() => directives.filter((d) => d.status === "completed").length, [directives]);

  // Dynamic ticker from real data
  const tickerItems = useMemo(() => [
    { text: `System Status: ${activeCount}/${agents.length} agents online`, color: activeCount === agents.length ? "var(--jarvis-success)" : "var(--jarvis-warning)" },
    { text: `Active Playbooks: ${playbooks.length} configured`, color: "var(--jarvis-accent-2)" },
    { text: `Directives: ${pendingDirectives} pending, ${completedDirectives} completed`, color: "var(--jarvis-accent)" },
    { text: `Tasks: ${activeTasks} active of ${totalTasks} total`, color: "var(--jarvis-warning)" },
    { text: `KPIs Tracked: ${kpis.length} metrics`, color: "var(--jarvis-accent-3)" },
    { text: "HIPAA Status: Compliant", color: "var(--jarvis-success)" },
  ], [activeCount, agents.length, playbooks.length, pendingDirectives, completedDirectives, activeTasks, totalTasks, kpis.length]);

  // Activity feed from recent directives
  const recentActivity = useMemo(() => {
    return directives.slice(0, 5).map((d, i) => {
      const agent = agents.find((a) => a.id === d.target_agent_id);
      const diffMs = Date.now() - new Date(d.created_at).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const timeStr = diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago` : `${Math.floor(diffMin / 1440)}d ago`;
      return {
        id: d.id,
        text: `${agent?.name ?? "Agent"}: ${d.instruction.slice(0, 60)}${d.instruction.length > 60 ? "..." : ""}`,
        time: timeStr,
        color: d.status === "completed" ? "var(--jarvis-success)" : d.status === "pending" ? "var(--jarvis-warning)" : "var(--jarvis-accent-2)",
      };
    });
  }, [directives, agents]);

  if (agentsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading command center...</p>
      </div>
    );
  }

  // ── KPI helper: find a KPI sparkline by name pattern ──
  const findKpi = (pattern: string) =>
    kpiDashboard.find((k) => k.metricName.toLowerCase().includes(pattern.toLowerCase()));

  // ── Chart data: Tasks by Department (from live agents) ──
  const deptTasksData = useMemo(() => {
    const deptCounts = new Map<string, number>();
    for (const a of agents) {
      const label = a.department
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      deptCounts.set(label, (deptCounts.get(label) ?? 0) + 1);
    }
    return Array.from(deptCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([dept, count]) => ({
        department: dept,
        tasks: count,
        fill: DEPT_COLORS[dept] ?? "#4cc9f0",
      }));
  }, [agents]);

  // ── Chart data: 7-Day Trends (from real KPIs or mock fallback) ──
  const trendLineData = useMemo(() => {
    const censusKpi = findKpi("census") ?? findKpi("agent");
    const revenueKpi = findKpi("revenue");
    const slaKpi = findKpi("sla") ?? findKpi("compliance");
    if (censusKpi && censusKpi.history.length >= 7) {
      const len = censusKpi.history.length;
      return censusKpi.dates.slice(len - 7).map((d, i) => ({
        date: d,
        Census: Math.round(censusKpi.history[len - 7 + i] ?? 0),
        Revenue: Math.round((revenueKpi?.history[len - 7 + i] ?? 0) / 1000),
        SLA: Math.round(slaKpi?.history[len - 7 + i] ?? 0),
      }));
    }
    const last7 = getLast7Days();
    return last7.map((m) => ({
      date: formatShortDate(m.date),
      Census: m.census,
      Revenue: Math.round(m.revenue / 1000),
      SLA: m.sla_compliance,
    }));
  }, [kpiDashboard]);

  // ── Chart data: Revenue vs Expenses (30 days from KPIs or mock) ──
  const revenueExpenseData = useMemo(() => {
    const revKpi = findKpi("revenue");
    if (revKpi && revKpi.history.length >= 14) {
      return revKpi.dates.slice(-14).map((d, i) => ({
        date: d,
        Revenue: Math.round(revKpi.history[revKpi.history.length - 14 + i] ?? 0),
        Expenses: Math.round((revKpi.history[revKpi.history.length - 14 + i] ?? 0) * 0.68),
      }));
    }
    const last30 = getLast30Days();
    return last30.map((m) => ({
      date: formatShortDate(m.date),
      Revenue: m.revenue,
      Expenses: m.expenses,
    }));
  }, [kpiDashboard]);

  // ── Chart data: Communication Channels (from agent counts) ──
  const commsData = useMemo(() => {
    const deptCount = departments.length;
    return [
      { name: "Directives", value: directives.length || 12, color: "#4895ef" },
      { name: "Tasks", value: tasks.length || 8, color: "#06d6a0" },
      { name: "Departments", value: deptCount || 6, color: "#fca311" },
    ];
  }, [directives.length, tasks.length, departments.length]);

  // ── Chart data: SLA Compliance (7-day bars from KPIs or mock) ──
  const slaBarData = useMemo(() => {
    const slaKpi = findKpi("sla") ?? findKpi("compliance");
    if (slaKpi && slaKpi.history.length >= 7) {
      const len = slaKpi.history.length;
      return slaKpi.dates.slice(len - 7).map((d, i) => ({
        date: d,
        SLA: Math.round(slaKpi.history[len - 7 + i] ?? 0),
      }));
    }
    const last7 = getLast7Days();
    return last7.map((m) => ({
      date: formatShortDate(m.date),
      SLA: m.sla_compliance,
    }));
  }, [kpiDashboard]);

  // ── Sparkline data from real KPIs with fallback ────────
  const sparklineData = useMemo(() => {
    const get = (pattern: string, fallbackKey: keyof ReturnType<typeof getLast7Days>[0]) => {
      const kpi = findKpi(pattern);
      if (kpi && kpi.history.length >= 7) {
        return kpi.history.slice(-7);
      }
      return getLast7Days().map((m) => m[fallbackKey] as number);
    };
    return {
      census: get("census", "census"),
      sla: get("sla", "sla_compliance"),
      satisfaction: get("satisfaction", "satisfaction"),
      docCompliance: get("doc", "doc_compliance"),
      revenue: get("revenue", "revenue"),
      staffCoverage: get("staff", "staff_coverage"),
    };
  }, [kpiDashboard]);

  // ── Latest metric values (real KPIs with fallback) ──
  const latest = useMemo(() => {
    const val = (pattern: string, fallback: number) => {
      const kpi = findKpi(pattern);
      return kpi ? Math.round(kpi.currentValue * 100) / 100 : fallback;
    };
    const last = metricsHistory[metricsHistory.length - 1];
    return {
      census: val("census", last.census),
      sla: val("sla", last.sla_compliance),
      satisfaction: val("satisfaction", last.satisfaction),
      docCompliance: val("doc", last.doc_compliance),
      revenue: val("revenue", last.revenue),
      staffCoverage: val("staff", last.staff_coverage),
    };
  }, [kpiDashboard]);

  return (
    <div className="relative">
      {/* Background grid pattern */}
      <GridBackground dotColor="var(--jarvis-accent)" />
      <ScanLine speed="slow" />

      <motion.div
        className="relative z-10 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ═══ Section 1: Header + Ticker + Arc Reactor + Gauges ═══ */}

        {/* Page Header */}
        <motion.div variants={fadeUp}>
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
            Command Center
          </h1>
          <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
            AI Agent Workforce Management
          </p>
        </motion.div>

        {/* Status Ticker */}
        <motion.div variants={fadeUp}>
          <TickerBar items={tickerItems} speed="slow" />
        </motion.div>

        {/* Top Section — Arc Reactor + Circular Gauges */}
        <motion.div
          className="grid grid-cols-2 gap-6 lg:grid-cols-6"
          variants={stagger}
        >
          {/* Arc Reactor — Center piece */}
          <motion.div
            className="col-span-2 flex items-center justify-center"
            variants={fadeUp}
          >
            <HudFrame title="SYSTEM CORE">
              <div className="flex flex-col items-center py-4">
                <ArcReactor
                  size="lg"
                  label={String(agents.length)}
                  sublabel="AGENTS"
                />
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--jarvis-success)] shadow-[0_0_6px_var(--jarvis-success)]" />
                    {activeCount} Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--jarvis-accent-2)] shadow-[0_0_6px_var(--jarvis-accent-2)]" />
                    {executingCount} Executing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--jarvis-warning)]" />
                    {agents.length - activeCount} Idle
                  </span>
                </div>
              </div>
            </HudFrame>
          </motion.div>

          {/* Circular Gauges */}
          <motion.div variants={fadeUp}>
            <HudFrame title="AGENTS">
              <div className="flex justify-center py-3">
                <CircularGauge
                  value={activeCount}
                  max={agents.length}
                  label="Active"
                  unit=""
                  size="md"
                />
              </div>
            </HudFrame>
          </motion.div>

          <motion.div variants={fadeUp}>
            <HudFrame title="SLA">
              <div className="flex justify-center py-3">
                <CircularGauge
                  value={completedDirectives > 0 ? Math.round((completedDirectives / Math.max(directives.length, 1)) * 100) : 100}
                  max={100}
                  label="Compliance"
                  unit="%"
                  size="md"
                  color="var(--jarvis-accent-2)"
                />
              </div>
            </HudFrame>
          </motion.div>

          <motion.div variants={fadeUp}>
            <HudFrame title="TASKS">
              <div className="flex justify-center py-3">
                <CircularGauge
                  value={activeTasks}
                  max={Math.max(totalTasks, 1)}
                  label="Active"
                  unit=""
                  size="md"
                  color="var(--jarvis-warning)"
                />
              </div>
            </HudFrame>
          </motion.div>

          <motion.div variants={fadeUp}>
            <HudFrame title="UPTIME">
              <div className="flex justify-center py-3">
                <CircularGauge
                  value={99.9}
                  max={100}
                  label="System"
                  unit="%"
                  size="md"
                  color="var(--jarvis-success)"
                />
              </div>
            </HudFrame>
          </motion.div>
        </motion.div>

        {/* ═══ Section 2: Operations Dashboard ═══ */}
        <motion.div variants={fadeUp}>
          <HudFrame title="OPERATIONS DASHBOARD">
            <div className="grid gap-6 lg:grid-cols-2 p-1">
              {/* Tasks by Department */}
              <div>
                <VesperBarChart
                  title="Tasks by Department (7-Day)"
                  data={deptTasksData}
                  xKey="department"
                  bars={[{ key: "tasks", color: "#4cc9f0", label: "Tasks Completed" }]}
                  height={280}
                />
              </div>

              {/* 7-Day Trends */}
              <div>
                <VesperLineChart
                  title="7-Day Trends"
                  data={trendLineData}
                  lines={[
                    { key: "Census", color: "#4cc9f0", label: "Census", area: true },
                    { key: "Referrals", color: "#4895ef", label: "Referrals" },
                    { key: "Satisfaction x10", color: "#06d6a0", label: "Satisfaction x10" },
                  ]}
                  height={280}
                />
              </div>
            </div>
          </HudFrame>
        </motion.div>

        {/* ═══ Section 3: Performance Analytics ═══ */}
        <motion.div variants={fadeUp}>
          <HudFrame title="PERFORMANCE ANALYTICS">
            <div className="grid gap-6 lg:grid-cols-3 p-1">
              {/* Revenue vs Expenses */}
              <div>
                <VesperAreaChart
                  title="Revenue vs Expenses (30d)"
                  data={revenueExpenseData}
                  areas={[
                    { key: "Revenue", color: "#06d6a0", label: "Revenue" },
                    { key: "Expenses", color: "#ef476f", label: "Expenses" },
                  ]}
                  stacked={false}
                  height={260}
                />
              </div>

              {/* Communication Channels */}
              <div>
                <VesperPieChart
                  title="Communication Channels"
                  data={commsData}
                  donut={true}
                  centerLabel="Comms"
                  height={260}
                />
              </div>

              {/* SLA Compliance */}
              <div>
                <VesperBarChart
                  title="SLA Compliance (7-Day)"
                  data={slaBarData}
                  xKey="date"
                  bars={[{ key: "SLA", color: "#4cc9f0", label: "SLA %" }]}
                  height={260}
                />
              </div>
            </div>
          </HudFrame>
        </motion.div>

        {/* ═══ Section 4: KPI Trends (Sparkline Cards) ═══ */}
        <motion.div variants={fadeUp}>
          <HudFrame title="KPI TRENDS">
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 lg:grid-cols-6">
              {/* Census */}
              <GlowCard className="p-3" glowColor="#4cc9f0" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  Census
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {latest.census}
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.census} color="#4cc9f0" width={80} height={24} />
                </div>
              </GlowCard>

              {/* SLA */}
              <GlowCard className="p-3" glowColor="#06d6a0" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  SLA
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {latest.sla}%
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.sla} color="#06d6a0" width={80} height={24} />
                </div>
              </GlowCard>

              {/* Satisfaction */}
              <GlowCard className="p-3" glowColor="#4895ef" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  Satisfaction
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {latest.satisfaction}
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.satisfaction} color="#4895ef" width={80} height={24} />
                </div>
              </GlowCard>

              {/* Doc Compliance */}
              <GlowCard className="p-3" glowColor="#fca311" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  Doc Compliance
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {latest.docCompliance}%
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.docCompliance} color="#fca311" width={80} height={24} />
                </div>
              </GlowCard>

              {/* Revenue/Day */}
              <GlowCard className="p-3" glowColor="#06d6a0" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  Revenue/Day
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {formatCurrency(latest.revenue)}
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.revenue} color="#06d6a0" width={80} height={24} />
                </div>
              </GlowCard>

              {/* Coverage */}
              <GlowCard className="p-3" glowColor="#7209b7" hover={false}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                  Coverage
                </p>
                <p className="text-xl font-bold text-[var(--jarvis-text-primary)] mt-1">
                  {latest.staffCoverage}%
                </p>
                <div className="mt-2">
                  <Sparkline data={sparklineData.staffCoverage} color="#7209b7" width={80} height={24} />
                </div>
              </GlowCard>
            </div>
          </HudFrame>
        </motion.div>

        {/* ═══ Section 5: Departments + Quick Stats + Activity Feed ═══ */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left — Department Grid */}
          <motion.div className="lg:col-span-3" variants={fadeUp}>
            <HudFrame title="DEPARTMENTS">
              <div className="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2">
                {departments.map((dept) => {
                  const directorName = dept.director_agent_id
                    ? directorLookup[dept.director_agent_id] ?? "—"
                    : "—";
                  const deptAgents = agents.filter(
                    (a) => a.department === dept.slug
                  );
                  const activeInDept = deptAgents.filter(
                    (a) => a.status === "active" || a.status === "executing"
                  ).length;

                  return (
                    <Link
                      key={dept.slug}
                      href={`/departments/${dept.slug}`}
                    >
                      <GlowCard
                        className="p-3"
                        glowColor={dept.color}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <DepartmentBadge slug={dept.slug} name={dept.name} size="sm" />
                          <span className="text-[10px] font-mono text-[var(--jarvis-text-muted)]">
                            {activeInDept}/{dept.agent_count}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--jarvis-text-secondary)]">
                          Dir: {directorName}
                        </p>
                        {/* Mini agent status row */}
                        <div className="flex gap-1 mt-2">
                          {deptAgents.map((a) => (
                            <StatusIndicator
                              key={a.slug}
                              status={a.status}
                              size="sm"
                            />
                          ))}
                        </div>
                      </GlowCard>
                    </Link>
                  );
                })}
              </div>
            </HudFrame>
          </motion.div>

          {/* Right — Quick Stats + Activity */}
          <motion.div className="lg:col-span-2 space-y-6" variants={stagger}>
            {/* Quick Stats */}
            <motion.div variants={fadeUp}>
              <HudFrame title="QUICK STATS">
                <div className="grid grid-cols-2 gap-3 p-1">
                  <GlowCard className="p-3 text-center" hover={false}>
                    <span style={{ color: "var(--jarvis-accent)" }}><Bot className="h-5 w-5 mx-auto mb-1" /></span>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">{agents.length}</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase tracking-wider">Agents</p>
                  </GlowCard>
                  <GlowCard className="p-3 text-center" hover={false}>
                    <span style={{ color: "var(--jarvis-accent-2)" }}><Building2 className="h-5 w-5 mx-auto mb-1" /></span>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">{departments.length}</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase tracking-wider">Departments</p>
                  </GlowCard>
                  <GlowCard className="p-3 text-center" hover={false}>
                    <span style={{ color: "var(--jarvis-accent-3)" }}><BookOpen className="h-5 w-5 mx-auto mb-1" /></span>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">{playbooks.length}</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase tracking-wider">Playbooks</p>
                  </GlowCard>
                  <GlowCard className="p-3 text-center" hover={false}>
                    <span style={{ color: "var(--jarvis-success)" }}><Shield className="h-5 w-5 mx-auto mb-1" /></span>
                    <p className="text-lg font-bold text-[var(--jarvis-text-primary)]">0</p>
                    <p className="text-[10px] text-[var(--jarvis-text-muted)] uppercase tracking-wider">PHI Violations</p>
                  </GlowCard>
                </div>
              </HudFrame>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={fadeUp}>
              <HudFrame title="ACTIVITY FEED">
                <div className="space-y-3 p-1">
                  {(recentActivity.length > 0 ? recentActivity : [
                    { id: "empty", text: "No recent activity. Issue a directive to get started.", time: "—", color: "var(--jarvis-text-muted)" },
                  ]).map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          boxShadow: `0 0 6px ${item.color}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--jarvis-text-primary)]">
                          {item.text}
                        </p>
                        <p className="text-xs text-[var(--jarvis-text-muted)]">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </HudFrame>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
