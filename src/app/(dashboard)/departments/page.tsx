"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Crown,
  Megaphone,
  HeartPulse,
  UserPlus,
  Users,
  Heart,
  Shield,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { GlowCard } from "@/components/jarvis";

const DEPT_ICONS: Record<string, LucideIcon> = {
  executive: Crown,
  marketing: Megaphone,
  "clinical-operations": HeartPulse,
  "admissions-intake": UserPlus,
  "caregiver-staffing": Users,
  "customer-experience": Heart,
  "compliance-quality": Shield,
  "accounting-finance": Calculator,
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

export default function DepartmentsPage() {
  const router = useRouter();
  const { data: agents = [], isLoading: agentsLoading } = useAgents();
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();

  const directorLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    for (const agent of agents) {
      lookup[agent.slug] = agent.name;
    }
    return lookup;
  }, [agents]);

  if (agentsLoading || deptsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--jarvis-text-muted)] animate-pulse">Loading departments...</p>
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
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">
          Departments
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          8 departments powering Happier Homes Comfort Care
        </p>
      </motion.div>

      {/* Department Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={stagger}
      >
        {departments.map((dept) => {
          const Icon = DEPT_ICONS[dept.slug];
          const directorName = dept.director_agent_id
            ? directorLookup[dept.director_agent_id] ?? "—"
            : "—";

          return (
            <motion.div key={dept.slug} variants={fadeUp}>
              <GlowCard
                className="p-5 relative overflow-hidden"
                glowColor={dept.color}
                onClick={() => router.push(`/departments/${dept.slug}`)}
              >
                {/* Accent top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: dept.color }}
                />

                {/* Icon */}
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: `${dept.color}15` }}
                >
                  {Icon && (
                    <span style={{ color: dept.color }}><Icon className="h-5 w-5" /></span>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] mb-0.5">
                  {dept.name}
                </h3>
                <p className="text-xs text-[var(--jarvis-text-secondary)] mb-3">
                  Director: {directorName}
                </p>

                {/* Agent count */}
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${dept.color}15`,
                      color: dept.color,
                    }}
                  >
                    {dept.agent_count} agent{dept.agent_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
