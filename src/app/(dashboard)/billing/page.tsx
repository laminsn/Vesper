"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Download,
  Zap,
  Building2,
  Shield,
  Headphones,
  Puzzle,
  Users,
} from "lucide-react";
import { GlowCard, HudFrame, CircularGauge } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";

// ─── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Data ──────────────────────────────────────────────────────────────────────

interface PlanFeature {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface Plan {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly priceNote: string;
  readonly features: readonly PlanFeature[];
  readonly highlighted: boolean;
  readonly color: string;
}

const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "/mo",
    features: [
      { label: "5 agents", icon: Users },
      { label: "2 departments", icon: Building2 },
      { label: "Community support", icon: Headphones },
    ],
    highlighted: false,
    color: "var(--jarvis-text-muted)",
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    priceNote: "/mo",
    features: [
      { label: "15 agents", icon: Users },
      { label: "5 departments", icon: Building2 },
      { label: "Email support", icon: Headphones },
    ],
    highlighted: false,
    color: "var(--jarvis-accent-2)",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    priceNote: "/mo",
    features: [
      { label: "50 agents", icon: Users },
      { label: "10 departments", icon: Building2 },
      { label: "HIPAA mode", icon: Shield },
      { label: "Priority support", icon: Headphones },
    ],
    highlighted: true,
    color: "var(--jarvis-accent)",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "",
    features: [
      { label: "Unlimited agents", icon: Users },
      { label: "Unlimited departments", icon: Building2 },
      { label: "HIPAA + SOC2", icon: Shield },
      { label: "Dedicated support", icon: Headphones },
      { label: "Custom integrations", icon: Puzzle },
    ],
    highlighted: false,
    color: "var(--jarvis-warning)",
  },
] as const;

interface Invoice {
  readonly id: string;
  readonly date: string;
  readonly amount: string;
  readonly status: "Paid" | "Pending" | "Failed";
}

const INVOICES: readonly Invoice[] = [
  { id: "INV-2026-003", date: "March 1, 2026", amount: "$99.00", status: "Paid" },
  { id: "INV-2026-002", date: "February 1, 2026", amount: "$99.00", status: "Paid" },
  { id: "INV-2026-001", date: "January 1, 2026", amount: "$99.00", status: "Paid" },
] as const;

const CURRENT_PLAN_ID = "professional";
const AGENT_USAGE = { used: 39, total: 50 };

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { t } = useI18n();
  const [selectedPlan] = useState(CURRENT_PLAN_ID);
  const agentPct = Math.round((AGENT_USAGE.used / AGENT_USAGE.total) * 100);

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
          {t("billing.title")}
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {t("billing.subtitle")}
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-6" glowColor="#06d6a0" hover={false}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--jarvis-accent)]/10">
                  <Zap className="h-5 w-5 text-[var(--jarvis-accent)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    {t("billing.currentPlan")}
                  </p>
                  <p className="text-xl font-bold text-[var(--jarvis-accent)]">
                    Professional
                  </p>
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-[var(--jarvis-text-primary)]">
                $99
                <span className="text-sm font-normal text-[var(--jarvis-text-muted)]">
                  /month
                </span>
              </p>
              <ul className="space-y-1.5 text-sm text-[var(--jarvis-text-secondary)]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                  Up to 50 agents
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                  10 departments
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                  HIPAA mode
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                  Priority support
                </li>
              </ul>
              <Button variant="outline" size="sm">
                {t("billing.managePlan")}
              </Button>
            </div>

            {/* Agent usage bar */}
            <div className="min-w-[200px]">
              <p className="text-xs text-[var(--jarvis-text-muted)] uppercase tracking-wider mb-2">
                {t("billing.agentUsage")}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--jarvis-text-secondary)]">
                    {AGENT_USAGE.used}/{AGENT_USAGE.total} agents
                  </span>
                  <span className="text-[var(--jarvis-accent)] font-mono text-xs">
                    {agentPct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--jarvis-bg-tertiary)]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${agentPct}%`,
                      background: "linear-gradient(90deg, var(--jarvis-accent), var(--jarvis-accent-2))",
                      boxShadow: "0 0 8px var(--jarvis-accent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Plan Comparison */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-3">{t("billing.plans")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === selectedPlan;
            return (
              <GlowCard
                key={plan.id}
                className="p-5 flex flex-col"
                glowColor={isCurrent ? "#06d6a0" : undefined}
                hover={false}
              >
                <div className="flex-1 space-y-3">
                  <p
                    className="text-sm font-medium uppercase tracking-wider"
                    style={{ color: plan.color }}
                  >
                    {plan.name}
                  </p>
                  <p className="text-2xl font-display font-bold text-[var(--jarvis-text-primary)]">
                    {plan.price}
                    <span className="text-sm font-normal text-[var(--jarvis-text-muted)]">
                      {plan.priceNote}
                    </span>
                  </p>
                  <ul className="space-y-1.5 text-sm text-[var(--jarvis-text-secondary)]">
                    {plan.features.map((feat) => {
                      const FeatIcon = feat.icon;
                      return (
                        <li key={feat.label} className="flex items-center gap-2">
                          <span style={{ color: plan.color }}><FeatIcon className="h-3.5 w-3.5" /></span>
                          {feat.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-4">
                  {isCurrent ? (
                    <span className="inline-flex items-center rounded-md bg-[var(--jarvis-accent)]/10 border border-[var(--jarvis-accent)]/30 px-3 py-1.5 text-xs font-medium text-[var(--jarvis-accent)]">
                      {t("billing.currentPlanBadge")}
                    </span>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full">
                      {t("billing.upgrade")}
                    </Button>
                  )}
                </div>
              </GlowCard>
            );
          })}
        </div>
      </motion.div>

      {/* Usage Section */}
      <motion.div variants={fadeUp}>
        <HudFrame title={t("billing.usage")}>
          <div className="flex flex-wrap items-center justify-around gap-6 py-2">
            <CircularGauge
              value={2450}
              max={10000}
              label="API Calls"
              size="sm"
              color="var(--jarvis-accent)"
            />
            <CircularGauge
              value={1.2}
              max={5}
              label="Storage (GB)"
              unit="GB"
              size="sm"
              color="var(--jarvis-accent-2)"
            />
            <CircularGauge
              value={156}
              max={500}
              label="Agent Hours"
              size="sm"
              color="var(--jarvis-warning)"
            />
          </div>
        </HudFrame>
      </motion.div>

      {/* Invoice History */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-5" hover={false}>
          <h3 className="heading-mono mb-4">{t("billing.invoiceHistory")}</h3>
          <div className="rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)]">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-[var(--jarvis-border)] last:border-b-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--jarvis-text-primary)]">
                      {invoice.id}
                    </td>
                    <td className="px-4 py-3 text-[var(--jarvis-text-secondary)]">
                      {invoice.date}
                    </td>
                    <td className="px-4 py-3 text-[var(--jarvis-text-primary)] font-medium">
                      {invoice.amount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-[var(--jarvis-success)]/10 border border-[var(--jarvis-success)]/30 px-2 py-0.5 text-xs font-medium text-[var(--jarvis-success)]">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
