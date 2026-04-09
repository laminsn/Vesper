"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Key,
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
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

interface ApiKey {
  readonly id: string;
  readonly name: string;
  readonly maskedKey: string;
  readonly createdAt: string;
  readonly status: "Active" | "Revoked";
}

const API_KEYS: readonly ApiKey[] = [
  {
    id: "key-1",
    name: "Production",
    maskedKey: "nx_live_...7f3a",
    createdAt: "Mar 1, 2026",
    status: "Active",
  },
  {
    id: "key-2",
    name: "Development",
    maskedKey: "nx_test_...2b1c",
    createdAt: "Mar 15, 2026",
    status: "Active",
  },
] as const;

type HttpMethod = "GET" | "POST" | "PATCH";

interface Endpoint {
  readonly method: HttpMethod;
  readonly path: string;
  readonly description: string;
}

interface EndpointGroup {
  readonly category: string;
  readonly endpoints: readonly Endpoint[];
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "var(--jarvis-success)",
  POST: "var(--jarvis-accent-2)",
  PATCH: "var(--jarvis-warning)",
} as const;

const ENDPOINT_GROUPS: readonly EndpointGroup[] = [
  {
    category: "Agents",
    endpoints: [
      { method: "GET", path: "/api/agents", description: "List all agents" },
      { method: "POST", path: "/api/agents", description: "Create a new agent" },
      { method: "GET", path: "/api/agents/:id", description: "Get agent details" },
      { method: "PATCH", path: "/api/agents/:id", description: "Update an agent" },
    ],
  },
  {
    category: "Tasks",
    endpoints: [
      { method: "GET", path: "/api/tasks", description: "List all tasks" },
      { method: "POST", path: "/api/tasks", description: "Create a new task" },
      { method: "PATCH", path: "/api/tasks/:id", description: "Update task status" },
    ],
  },
  {
    category: "Directives",
    endpoints: [
      { method: "POST", path: "/api/directives", description: "Issue a new directive" },
      { method: "GET", path: "/api/directives/:id", description: "Get directive details" },
    ],
  },
  {
    category: "Playbooks",
    endpoints: [
      { method: "GET", path: "/api/playbooks", description: "List all playbooks" },
      { method: "POST", path: "/api/playbooks/:id/execute", description: "Execute a playbook" },
    ],
  },
  {
    category: "KPIs",
    endpoints: [
      { method: "GET", path: "/api/kpis", description: "List all KPIs" },
      { method: "POST", path: "/api/kpis/:id/record", description: "Record a KPI measurement" },
    ],
  },
] as const;

const RATE_LIMIT = { max: 10000, used: 2450 };

// ─── Components ────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { readonly method: HttpMethod }) {
  const color = METHOD_COLORS[method];
  return (
    <span
      className="inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider min-w-[50px]"
      style={{
        color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {method}
    </span>
  );
}

function EndpointGroupSection({ group }: { readonly group: EndpointGroup }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-[var(--jarvis-border)] last:border-b-0">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--jarvis-text-primary)] hover:bg-[var(--jarvis-bg-tertiary)] transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-[var(--jarvis-text-muted)]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[var(--jarvis-text-muted)]" />
        )}
        {group.category}
        <span className="ml-auto text-xs text-[var(--jarvis-text-muted)]">
          {group.endpoints.length} endpoints
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[var(--jarvis-border)]">
          {group.endpoints.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--jarvis-bg-tertiary)]/50 transition-colors"
            >
              <MethodBadge method={ep.method} />
              <code className="font-mono text-xs text-[var(--jarvis-text-primary)]">
                {ep.path}
              </code>
              <span className="ml-auto text-xs text-[var(--jarvis-text-muted)] hidden sm:inline">
                {ep.description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApiPortalPage() {
  const { t } = useI18n();

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
          {t("apiPortal.title")}
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          {t("apiPortal.subtitle")}
        </p>
      </motion.div>

      {/* API Keys */}
      <motion.div variants={fadeUp}>
        <HudFrame title={t("apiPortal.apiKeys")}>
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)]">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                      Key
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-[var(--jarvis-text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {API_KEYS.map((apiKey) => (
                    <tr
                      key={apiKey.id}
                      className="border-b border-[var(--jarvis-border)] last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Key className="h-3.5 w-3.5 text-[var(--jarvis-accent)]" />
                          <span className="font-medium text-[var(--jarvis-text-primary)]">
                            {apiKey.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-[var(--jarvis-text-secondary)] bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 rounded">
                          {apiKey.maskedKey}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-[var(--jarvis-text-muted)] text-xs">
                        {apiKey.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-[var(--jarvis-success)]/10 border border-[var(--jarvis-success)]/30 px-2 py-0.5 text-xs font-medium text-[var(--jarvis-success)]">
                          {apiKey.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" title="Copy key">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Revoke key">
                            <Trash2 className="h-3.5 w-3.5 text-[var(--jarvis-danger)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t("apiPortal.generateKey")}
            </Button>
          </div>
        </HudFrame>
      </motion.div>

      {/* Endpoints */}
      <motion.div variants={fadeUp}>
        <HudFrame title={t("apiPortal.endpoints")}>
          <div className="rounded-lg border border-[var(--jarvis-border)] overflow-hidden">
            {ENDPOINT_GROUPS.map((group) => (
              <EndpointGroupSection key={group.category} group={group} />
            ))}
          </div>
        </HudFrame>
      </motion.div>

      {/* Rate Limits */}
      <motion.div variants={fadeUp}>
        <GlowCard className="p-5" hover={false}>
          <h3 className="heading-mono mb-4">{t("apiPortal.rateLimits")}</h3>
          <div className="flex flex-wrap items-center gap-8">
            <CircularGauge
              value={RATE_LIMIT.used}
              max={RATE_LIMIT.max}
              label="Requests Today"
              size="sm"
              color="var(--jarvis-accent)"
            />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[var(--jarvis-text-muted)]">Current tier:</span>
                <span className="font-medium text-[var(--jarvis-text-primary)]">
                  {RATE_LIMIT.max.toLocaleString()} requests/day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--jarvis-text-muted)]">Used today:</span>
                <span className="font-medium text-[var(--jarvis-accent)]">
                  {RATE_LIMIT.used.toLocaleString()} requests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--jarvis-text-muted)]">Remaining:</span>
                <span className="font-medium text-[var(--jarvis-text-secondary)]">
                  {(RATE_LIMIT.max - RATE_LIMIT.used).toLocaleString()} requests
                </span>
              </div>
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
