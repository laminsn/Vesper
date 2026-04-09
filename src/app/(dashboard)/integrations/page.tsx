"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plug,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Activity,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";
import { GlowCard, HudFrame, CircularGauge } from "@/components/jarvis";
import {
  integrations as catalogIntegrations,
  integrationCategories,
  type Integration,
} from "@/data/integrations";
import { useIntegrations, useTestIntegration } from "@/hooks/use-integrations";

/* ───── constants ───── */

const TIER_COLORS: Record<string, string> = {
  starter: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  professional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const ALL_CATEGORY = { id: "all", name: "All" } as const;

/* ───── animations ───── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ───── integration card ───── */

interface IntegrationCardProps {
  readonly integration: Integration;
  readonly liveStatus?: "connected" | "disconnected" | "error" | "testing";
  readonly registryId?: string;
}

function IntegrationCard({ integration, liveStatus, registryId }: IntegrationCardProps) {
  const testMutation = useTestIntegration();
  const firstLetter = integration.name.charAt(0).toUpperCase();
  const isConnected = liveStatus === "connected";
  const isTesting = testMutation.isPending;

  const handleTest = () => {
    if (!registryId) {
      toast.info(`${integration.name} is not registered yet.`);
      return;
    }
    testMutation.mutate(registryId, {
      onSuccess: () => toast.success(`${integration.name} — connection healthy`),
      onError: () => toast.error(`${integration.name} — connection test failed`),
    });
  };

  return (
    <GlowCard
      className="p-5 space-y-4"
      glowColor={isConnected ? "#06d6a0" : integration.color}
      hover
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: integration.color }}
        >
          {firstLetter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug truncate">
              {integration.name}
            </h3>
            {liveStatus && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  isConnected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : liveStatus === "testing"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : liveStatus === "testing" ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                ) : (
                  <XCircle className="h-2.5 w-2.5" />
                )}
                {liveStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--jarvis-text-muted)] mt-0.5 line-clamp-2">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium bg-[var(--jarvis-bg-tertiary)] border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
          {integrationCategories.find((c) => c.id === integration.category)?.name ?? integration.category}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${TIER_COLORS[integration.tier] ?? ""}`}
        >
          {integration.tier}
        </span>
      </div>

      {/* Features (max 3) */}
      <div className="flex flex-wrap gap-1.5">
        {integration.features.slice(0, 3).map((f) => (
          <span
            key={f}
            className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]"
          >
            {f}
          </span>
        ))}
        {integration.features.length > 3 && (
          <span className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]">
            +{integration.features.length - 3} more
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--jarvis-border)]">
        {isConnected && registryId ? (
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-md border border-blue-500/40 bg-transparent px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10 disabled:opacity-50"
          >
            {isTesting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <TestTube className="h-3 w-3" />
            )}
            {isTesting ? "Testing..." : "Test"}
          </button>
        ) : (
          <div />
        )}
        <span
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium ${
            isConnected
              ? "border-emerald-500/40 text-emerald-400"
              : "border-[var(--jarvis-border)] text-[var(--jarvis-text-muted)]"
          }`}
        >
          <Plug className="h-3 w-3" />
          {isConnected ? "Connected" : liveStatus === "testing" ? "Testing..." : "Not Connected"}
        </span>
      </div>
    </GlowCard>
  );
}

/* ───── page component ───── */

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: registeredIntegrations = [], isLoading } = useIntegrations();

  // Build a lookup from integration_key → registry record
  const registryMap = useMemo(() => {
    const map = new Map<string, { id: string; status: string }>();
    for (const reg of registeredIntegrations) {
      map.set(reg.integration_key, { id: reg.id, status: reg.status });
    }
    return map;
  }, [registeredIntegrations]);

  const filtered = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return catalogIntegrations.filter((i) => {
      const matchesCategory = activeCategory === "all" || i.category === activeCategory;
      const matchesSearch =
        lower === "" ||
        i.name.toLowerCase().includes(lower) ||
        i.description.toLowerCase().includes(lower);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categories = [ALL_CATEGORY, ...integrationCategories];

  const connectedCount = registeredIntegrations.filter((r) => r.status === "connected").length;
  const disconnectedCount = registeredIntegrations.filter((r) => r.status !== "connected").length;

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
          Integrations
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Connect your tools and services &mdash; {catalogIntegrations.length} available, {registeredIntegrations.length} registered
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <HudFrame title="Registered">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={registeredIntegrations.length}
              max={catalogIntegrations.length}
              label="Registered"
              size="sm"
            />
          </div>
        </HudFrame>
        <HudFrame title="Connected" color="#06d6a0">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={connectedCount}
              max={registeredIntegrations.length || 1}
              label="Connected"
              color="#06d6a0"
              size="sm"
            />
          </div>
        </HudFrame>
        <HudFrame title="Disconnected" color="#ef4444">
          <div className="flex items-center justify-center py-2">
            <CircularGauge
              value={disconnectedCount}
              max={registeredIntegrations.length || 1}
              label="Disconnected"
              color="#ef4444"
              size="sm"
            />
          </div>
        </HudFrame>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jarvis-text-muted)]" />
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] py-2 pl-10 pr-4 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] focus:border-[var(--jarvis-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--jarvis-accent)]"
        />
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-[var(--jarvis-accent)] bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]"
                  : "border-[var(--jarvis-border)] bg-transparent text-[var(--jarvis-text-secondary)] hover:border-[var(--jarvis-border-strong)] hover:text-[var(--jarvis-text-primary)]"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <motion.div variants={fadeUp} className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--jarvis-accent)]" />
          <span className="ml-2 text-sm text-[var(--jarvis-text-muted)]">Loading integrations...</span>
        </motion.div>
      )}

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
      >
        {filtered.map((integration) => {
          const registry = registryMap.get(integration.id);
          return (
            <motion.div key={integration.id} variants={fadeUp}>
              <IntegrationCard
                integration={integration}
                liveStatus={registry?.status as "connected" | "disconnected" | "error" | "testing" | undefined}
                registryId={registry?.id}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && !isLoading && (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Plug className="h-10 w-10 text-[var(--jarvis-text-muted)] mb-3" />
          <p className="text-sm text-[var(--jarvis-text-muted)]">
            No integrations match your search.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
