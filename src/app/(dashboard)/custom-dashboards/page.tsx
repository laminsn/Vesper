"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Crown,
  Activity,
  HeartPulse,
  DollarSign,
  Clock,
  Layers,
  Copy,
  ExternalLink,
  Pencil,
  BarChart3,
  LineChart,
  PieChart,
  Table2,
  Rss,
  CircleDot,
  Trophy,
  Gauge,
  Grid3x3,
  CreditCard,
} from "lucide-react";
import { GlowCard, HudFrame } from "@/components/jarvis";

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly widgets: readonly string[];
  readonly lastUpdated: string;
  readonly color: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface WidgetType {
  readonly id: string;
  readonly name: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PRESET_BUTTONS = [
  { label: "CEO View", icon: Crown, color: "var(--jarvis-warning)" },
  { label: "Operations", icon: Activity, color: "var(--jarvis-accent)" },
  { label: "Clinical", icon: HeartPulse, color: "var(--jarvis-danger)" },
  { label: "Financial", icon: DollarSign, color: "var(--jarvis-accent-2)" },
] as const;

const DASHBOARDS: readonly DashboardPreset[] = [
  {
    id: "ceo-overview",
    name: "CEO Overview",
    description: "Executive summary with key metrics across all departments",
    widgets: ["Agent Health", "Department KPIs", "Revenue Pipeline", "SLA Compliance"],
    lastUpdated: "2h ago",
    color: "var(--jarvis-warning)",
    icon: Crown,
  },
  {
    id: "operations",
    name: "Operations Dashboard",
    description: "Real-time operational metrics and task tracking",
    widgets: ["Task Volume", "Agent Workload Heatmap", "Active Playbooks", "Handoff Status"],
    lastUpdated: "30m ago",
    color: "var(--jarvis-accent)",
    icon: Activity,
  },
  {
    id: "clinical",
    name: "Clinical Performance",
    description: "Patient care metrics and clinical compliance",
    widgets: ["Census Board", "Visit Compliance", "Symptom Management", "Bereavement Pipeline"],
    lastUpdated: "1h ago",
    color: "var(--jarvis-danger)",
    icon: HeartPulse,
  },
  {
    id: "financial",
    name: "Financial Summary",
    description: "Revenue, billing, and cost tracking",
    widgets: ["Revenue Cycle", "Claims Status", "AP/AR", "Payroll Overview"],
    lastUpdated: "4h ago",
    color: "var(--jarvis-accent-2)",
    icon: DollarSign,
  },
] as const;

const WIDGET_PREVIEW_COLORS = [
  "var(--jarvis-accent)",
  "var(--jarvis-accent-2)",
  "var(--jarvis-accent-3)",
  "var(--jarvis-warning)",
] as const;

const WIDGET_TYPES: readonly WidgetType[] = [
  { id: "kpi-card", name: "KPI Card", icon: CreditCard, color: "var(--jarvis-accent)" },
  { id: "line-chart", name: "Line Chart", icon: LineChart, color: "var(--jarvis-accent-2)" },
  { id: "bar-chart", name: "Bar Chart", icon: BarChart3, color: "var(--jarvis-accent-3)" },
  { id: "pie-chart", name: "Pie Chart", icon: PieChart, color: "var(--jarvis-warning)" },
  { id: "table", name: "Table", icon: Table2, color: "var(--jarvis-success)" },
  { id: "activity-feed", name: "Activity Feed", icon: Rss, color: "var(--jarvis-danger)" },
  { id: "progress-ring", name: "Progress Ring", icon: CircleDot, color: "var(--jarvis-accent)" },
  { id: "leaderboard", name: "Leaderboard", icon: Trophy, color: "var(--jarvis-accent-2)" },
  { id: "gauge", name: "Gauge", icon: Gauge, color: "var(--jarvis-accent-3)" },
  { id: "heatmap", name: "Heatmap", icon: Grid3x3, color: "var(--jarvis-warning)" },
] as const;

// ── Components ────────────────────────────────────────────────────────────────

function WidgetPreviewGrid({ color }: { readonly color: string }) {
  return (
    <div className="grid grid-cols-2 gap-1 mt-4">
      {WIDGET_PREVIEW_COLORS.map((previewColor, i) => (
        <div
          key={i}
          className="h-6 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${i === 0 ? color : previewColor} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${i === 0 ? color : previewColor} 25%, transparent)`,
          }}
        />
      ))}
    </div>
  );
}

function DashboardCard({ dashboard }: { readonly dashboard: DashboardPreset }) {
  const Icon = dashboard.icon;

  return (
    <GlowCard className="p-5" glowColor={dashboard.color} hover={false}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `color-mix(in srgb, ${dashboard.color} 15%, transparent)` }}
          >
            <span style={{ color: dashboard.color }}><Icon className="h-5 w-5" /></span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--jarvis-text-primary)]">
              {dashboard.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${dashboard.color} 12%, transparent)`,
                  color: dashboard.color,
                }}
              >
                <Layers className="h-2.5 w-2.5" />
                {dashboard.widgets.length} widgets
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[var(--jarvis-text-muted)]">
                <Clock className="h-2.5 w-2.5" />
                {dashboard.lastUpdated}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--jarvis-text-muted)] leading-relaxed mb-3">
        {dashboard.description}
      </p>

      <div className="flex flex-wrap gap-1 mb-1">
        {dashboard.widgets.map((widget) => (
          <span
            key={widget}
            className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-secondary)]"
          >
            {widget}
          </span>
        ))}
      </div>

      <WidgetPreviewGrid color={dashboard.color} />

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--jarvis-border)]">
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: `color-mix(in srgb, ${dashboard.color} 15%, transparent)`,
            color: dashboard.color,
          }}
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--jarvis-text-secondary)] transition-colors hover:text-[var(--jarvis-text-primary)]">
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-[var(--jarvis-bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--jarvis-text-secondary)] transition-colors hover:text-[var(--jarvis-text-primary)]">
          <Copy className="h-3 w-3" />
          Duplicate
        </button>
      </div>
    </GlowCard>
  );
}

function WidgetTypeCard({ widget }: { readonly widget: WidgetType }) {
  const Icon = widget.icon;

  return (
    <GlowCard className="p-3 flex flex-col items-center gap-2" glowColor={widget.color}>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${widget.color} 15%, transparent)` }}
      >
        <span style={{ color: widget.color }}><Icon className="h-4 w-4" /></span>
      </div>
      <span className="text-[11px] font-medium text-[var(--jarvis-text-secondary)]">
        {widget.name}
      </span>
    </GlowCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomDashboardsPage() {
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
          Custom Dashboards
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Build personalized dashboards with drag-and-drop widgets
        </p>
      </motion.div>

      {/* Action Bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <button className="flex items-center gap-2 rounded-lg bg-[var(--jarvis-accent)] px-4 py-2 text-sm font-medium text-[var(--jarvis-bg-primary)] transition-colors hover:opacity-90">
          <Plus className="h-4 w-4" />
          Create Dashboard
        </button>
        {PRESET_BUTTONS.map((preset) => {
          const PresetIcon = preset.icon;
          return (
            <button
              key={preset.label}
              className="flex items-center gap-2 rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] px-3 py-2 text-xs font-medium text-[var(--jarvis-text-secondary)] transition-colors hover:border-[var(--jarvis-border-strong)] hover:text-[var(--jarvis-text-primary)]"
            >
              <span style={{ color: preset.color }}><PresetIcon className="h-3.5 w-3.5" /></span>
              {preset.label}
            </button>
          );
        })}
      </motion.div>

      {/* Dashboard Gallery */}
      <motion.div variants={fadeUp}>
        <HudFrame title="Dashboard Gallery" color="var(--jarvis-accent)">
          <div className="grid gap-4 md:grid-cols-2">
            {DASHBOARDS.map((dashboard) => (
              <motion.div key={dashboard.id} variants={fadeUp}>
                <DashboardCard dashboard={dashboard} />
              </motion.div>
            ))}
          </div>
        </HudFrame>
      </motion.div>

      {/* Widget Types */}
      <motion.div variants={fadeUp}>
        <HudFrame title="Available Widget Types" color="var(--jarvis-accent-2)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
            {WIDGET_TYPES.map((widget) => (
              <motion.div key={widget.id} variants={fadeUp}>
                <WidgetTypeCard widget={widget} />
              </motion.div>
            ))}
          </div>
        </HudFrame>
      </motion.div>
    </motion.div>
  );
}
