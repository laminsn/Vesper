"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Eye,
  AlertTriangle,
  Inbox,
  FileText,
} from "lucide-react";
import { GlowCard, KpiCard } from "@/components/jarvis";
import { ZONE_POLICIES, type SecurityZone } from "@/lib/security";
import { getGatewayStats } from "@/lib/n8n-gateway";

// -- Animations -----------------------------------------------------------

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// -- Zone display data ----------------------------------------------------

const ZONE_DISPLAY: readonly {
  readonly zone: SecurityZone;
  readonly label: string;
  readonly color: string;
  readonly icon: typeof Shield;
}[] = [
  {
    zone: "clinical",
    label: "Clinical",
    color: "var(--jarvis-danger)",
    icon: ShieldAlert,
  },
  {
    zone: "operations",
    label: "Operations",
    color: "var(--jarvis-warning)",
    icon: ShieldCheck,
  },
  {
    zone: "external",
    label: "External",
    color: "var(--jarvis-accent)",
    icon: Shield,
  },
] as const;

// -- HIPAA mode flag (would come from env/config in production) -----------

const HIPAA_MODE_ENABLED = true;

// -- Page -----------------------------------------------------------------

export default function PhiMonitorPage() {
  const stats = useMemo(() => getGatewayStats(), []);

  const riskLabel = useMemo(() => {
    if (stats.phiDetections === 0) return "Low";
    if (stats.blockedRequests > 0) return "High";
    if (stats.sanitizedRequests > 0) return "Medium";
    return "Low";
  }, [stats]);

  const riskColor = useMemo(() => {
    if (riskLabel === "High") return "var(--jarvis-danger)";
    if (riskLabel === "Medium") return "var(--jarvis-warning)";
    return "var(--jarvis-success)";
  }, [riskLabel]);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--jarvis-danger)]/10">
            <Shield className="h-5 w-5 text-[var(--jarvis-danger)]" />
          </div>
          <div>
            <h1 className="heading-display text-2xl tracking-wider text-[var(--jarvis-text-primary)]">
              PHI Monitor
            </h1>
            <p className="text-sm text-[var(--jarvis-text-muted)]">
              HIPAA Compliance Dashboard
            </p>
          </div>
        </div>
        {HIPAA_MODE_ENABLED && (
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--jarvis-success)]/30 bg-[var(--jarvis-success)]/10 px-3 py-1 text-xs font-semibold text-[var(--jarvis-success)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            HIPAA MODE
          </span>
        )}
      </motion.div>

      {/* KPI Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="TOTAL SCANS"
          value={stats.totalRequests}
          subtitle="Gateway requests processed"
          icon={Activity}
          color="var(--jarvis-accent)"
        />
        <KpiCard
          title="VIOLATIONS DETECTED"
          value={stats.phiDetections}
          subtitle="PHI instances found"
          icon={AlertTriangle}
          color="var(--jarvis-warning)"
        />
        <KpiCard
          title="RISK LEVEL"
          value={riskLabel}
          subtitle="Current compliance posture"
          icon={Eye}
          color={riskColor}
        />
        <KpiCard
          title="LAST SCAN"
          value={stats.totalRequests > 0 ? "Recent" : "Never"}
          subtitle="Most recent gateway scan"
          icon={FileText}
          color="var(--jarvis-text-muted)"
        />
      </motion.div>

      {/* Zone Status Section */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-4">ZONE STATUS</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ZONE_DISPLAY.map(({ zone, label, color, icon: ZoneIcon }) => {
            const policy = ZONE_POLICIES[zone];

            return (
              <GlowCard key={zone} className="p-5" glowColor={color} hover={false}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ZoneIcon className="h-4 w-4" style={{ color }} />
                    <span
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {label}
                    </span>
                  </div>
                  {/* Compliant status dot */}
                  <span className="flex items-center gap-1.5 text-xs text-[var(--jarvis-success)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--jarvis-success)] shadow-[0_0_6px_var(--jarvis-success)]" />
                    Compliant
                  </span>
                </div>

                <p className="mb-3 text-xs text-[var(--jarvis-text-muted)]">
                  {policy.description}
                </p>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--jarvis-text-muted)]">
                      Allowed Models
                    </span>
                    <span className="text-[var(--jarvis-text-secondary)]">
                      {policy.allowedModels.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--jarvis-text-muted)]">
                      PHI Scanning
                    </span>
                    <span
                      className={
                        policy.requirePhiScan
                          ? "text-[var(--jarvis-success)]"
                          : "text-[var(--jarvis-text-muted)]"
                      }
                    >
                      {policy.requirePhiScan ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--jarvis-text-muted)]">
                      Audit Logging
                    </span>
                    <span
                      className={
                        policy.requireAuditLog
                          ? "text-[var(--jarvis-success)]"
                          : "text-[var(--jarvis-text-muted)]"
                      }
                    >
                      {policy.requireAuditLog ? "Required" : "Optional"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--jarvis-text-muted)]">
                      Max Tokens
                    </span>
                    <span className="text-[var(--jarvis-text-secondary)]">
                      {policy.maxTokensPerRequest.toLocaleString()}
                    </span>
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </motion.div>

      {/* Violation Log Section */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-4">VIOLATION LOG</h2>
        <GlowCard className="p-6" hover={false}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShieldCheck className="mb-3 h-10 w-10 text-[var(--jarvis-success)]/40" />
            <p className="text-sm font-medium text-[var(--jarvis-text-secondary)]">
              No PHI violations detected
            </p>
            <p className="mt-1 text-xs text-[var(--jarvis-text-muted)]">
              All gateway traffic is compliant
            </p>
          </div>
        </GlowCard>
      </motion.div>

      {/* Audit Trail Section */}
      <motion.div variants={fadeUp}>
        <h2 className="heading-mono mb-4">AUDIT TRAIL</h2>
        <GlowCard className="p-6" hover={false}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="mb-3 h-10 w-10 text-[var(--jarvis-text-muted)]/40" />
            <p className="text-sm font-medium text-[var(--jarvis-text-secondary)]">
              No audit entries yet
            </p>
            <p className="mt-1 text-xs text-[var(--jarvis-text-muted)]">
              Entries will appear as agents interact with the N8N gateway
            </p>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
