"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAgents, useAgentsByDepartment } from "@/hooks/use-agents";
import { useDepartment } from "@/hooks/use-departments";
import { useKpis } from "@/hooks/use-kpis";
import {
  DepartmentBadge,
  GlowCard,
  AgentCard,
  KpiGauge,
} from "@/components/jarvis";

/* ─── Department-specific KPI definitions ───────── */

interface DeptKpi {
  label: string;
  value: number | null;
  target: number | null;
  unit: string;
  trend: "up" | "down" | "flat" | "unknown";
}

const DEPT_KPIS: Record<string, DeptKpi[]> = {
  executive: [
    { label: "Revenue Growth", value: null, target: 15, unit: "%", trend: "unknown" },
    { label: "Employee Satisfaction", value: null, target: 90, unit: "%", trend: "unknown" },
    { label: "Strategic Goals Met", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "Operating Margin", value: null, target: 20, unit: "%", trend: "unknown" },
  ],
  marketing: [
    { label: "Referral Growth", value: null, target: 25, unit: "%", trend: "unknown" },
    { label: "Email Open Rate", value: null, target: 30, unit: "%", trend: "unknown" },
    { label: "Event Attendance", value: null, target: 50, unit: "", trend: "unknown" },
    { label: "Ad Cost / Inquiry", value: null, target: 25, unit: "$", trend: "unknown" },
    { label: "Website Leads", value: null, target: 100, unit: "", trend: "unknown" },
    { label: "Social Engagement", value: null, target: 500, unit: "", trend: "unknown" },
  ],
  "clinical-operations": [
    { label: "Time to First Visit", value: null, target: 48, unit: "h", trend: "unknown" },
    { label: "Pain Response", value: null, target: 95, unit: "%", trend: "unknown" },
    { label: "Care Plan Completion", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "Symptom Mgmt Score", value: null, target: 90, unit: "%", trend: "unknown" },
    { label: "Family Satisfaction", value: null, target: 95, unit: "%", trend: "unknown" },
  ],
  "admissions-intake": [
    { label: "Intake Response Time", value: null, target: 2, unit: "h", trend: "unknown" },
    { label: "Eligibility Verify", value: null, target: 24, unit: "h", trend: "unknown" },
    { label: "Conversion Rate", value: null, target: 70, unit: "%", trend: "unknown" },
    { label: "Referral to Admit", value: null, target: 48, unit: "h", trend: "unknown" },
  ],
  "caregiver-staffing": [
    { label: "Fill Rate", value: null, target: 95, unit: "%", trend: "unknown" },
    { label: "Time to Hire", value: null, target: 14, unit: "d", trend: "unknown" },
    { label: "Retention Rate", value: null, target: 85, unit: "%", trend: "unknown" },
    { label: "Training Completion", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "Schedule Coverage", value: null, target: 98, unit: "%", trend: "unknown" },
  ],
  "customer-experience": [
    { label: "NPS Score", value: null, target: 80, unit: "", trend: "unknown" },
    { label: "Response Time", value: null, target: 30, unit: "min", trend: "unknown" },
    { label: "Family Satisfaction", value: null, target: 95, unit: "%", trend: "unknown" },
    { label: "Review Score", value: null, target: 4.8, unit: "/5", trend: "unknown" },
  ],
  "compliance-quality": [
    { label: "Audit Pass Rate", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "HIPAA Compliance", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "Chart Accuracy", value: null, target: 98, unit: "%", trend: "unknown" },
    { label: "Incident Reports", value: null, target: 0, unit: "", trend: "unknown" },
    { label: "QI Score", value: null, target: 95, unit: "%", trend: "unknown" },
  ],
  "accounting-finance": [
    { label: "Collections Rate", value: null, target: 95, unit: "%", trend: "unknown" },
    { label: "Days in AR", value: null, target: 30, unit: "d", trend: "unknown" },
    { label: "Claim Denial Rate", value: null, target: 5, unit: "%", trend: "unknown" },
    { label: "Payroll Accuracy", value: null, target: 100, unit: "%", trend: "unknown" },
    { label: "Budget Variance", value: null, target: 5, unit: "%", trend: "unknown" },
  ],
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DepartmentDashboardPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const { data: department, isLoading: deptLoading } = useDepartment(slug);
  const { data: deptAgents = [], isLoading: agentsLoading } = useAgentsByDepartment(slug);
  const { data: allAgents = [] } = useAgents();
  const { data: supabaseKpis = [] } = useKpis(department?.id);

  const director = useMemo(
    () =>
      department?.director_agent_id
        ? allAgents.find((a) => a.slug === department.director_agent_id) ?? null
        : null,
    [department, allAgents]
  );

  const kpis = useMemo(() => {
    // Prefer Supabase KPIs if available, fall back to static DEPT_KPIS
    if (supabaseKpis.length > 0) {
      return supabaseKpis.map((k) => ({
        label: k.metric_name,
        value: k.current_value,
        target: k.target_value,
        unit: k.unit ?? "",
        trend: "unknown" as const,
      }));
    }
    return slug ? DEPT_KPIS[slug] ?? [] : [];
  }, [slug, supabaseKpis]);

  if (deptLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading department...</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-[var(--jarvis-text-muted)]">
          Department not found
        </p>
        <button
          type="button"
          onClick={() => router.push("/departments")}
          className="mt-4 text-sm text-[var(--jarvis-accent)] hover:underline"
        >
          Back to Departments
        </button>
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
      {/* Back nav */}
      <motion.button
        type="button"
        variants={fadeUp}
        onClick={() => router.push("/departments")}
        className="flex items-center gap-1.5 text-xs text-[var(--jarvis-text-muted)] hover:text-[var(--jarvis-accent)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Departments
      </motion.button>

      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
            {department.name}
          </h1>
          <DepartmentBadge slug={department.slug} name={department.name} size="md" />
        </div>
        {director && (
          <p className="text-sm text-[var(--jarvis-text-secondary)] mt-1">
            Director: {director.name} — {director.role}
          </p>
        )}
      </motion.div>

      {/* KPI Section */}
      {kpis.length > 0 && (
        <motion.div variants={fadeUp}>
          <GlowCard className="p-5" hover={false} glowColor={department.color}>
            <h2 className="heading-mono mb-4">Key Performance Indicators</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {kpis.map((kpi) => (
                <KpiGauge
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  target={kpi.target}
                  unit={kpi.unit}
                  trend={kpi.trend}
                  size="md"
                />
              ))}
            </div>
          </GlowCard>
        </motion.div>
      )}

      {/* Agent Roster */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-5" hover={false}>
          <h2 className="heading-mono mb-4">
            Agent Roster ({deptAgents.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {deptAgents.map((agent) => (
              <AgentCard
                key={agent.slug}
                agent={agent}
                onClick={() => router.push(`/agents/${agent.slug}`)}
              />
            ))}
          </div>
        </GlowCard>
      </motion.div>

      {/* Activity Placeholder */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-5" hover={false}>
          <h2 className="heading-mono mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-[var(--jarvis-bg-tertiary)] flex items-center justify-center mb-3">
              <span className="text-[var(--jarvis-text-muted)] text-lg">--</span>
            </div>
            <p className="text-sm text-[var(--jarvis-text-muted)]">
              No recent activity
            </p>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
