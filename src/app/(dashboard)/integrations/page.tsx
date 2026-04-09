"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plug } from "lucide-react";
import { GlowCard } from "@/components/jarvis";
import {
  integrations,
  integrationCategories,
  type Integration,
} from "@/data/integrations";

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

function IntegrationCard({ integration }: { readonly integration: Integration }) {
  const firstLetter = integration.name.charAt(0).toUpperCase();

  return (
    <GlowCard className="p-5 space-y-4" glowColor={integration.color} hover>
      <div className="flex items-start gap-3">
        {/* Icon circle */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: integration.color }}
        >
          {firstLetter}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug truncate">
            {integration.name}
          </h3>
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

      {/* Connect button */}
      <div className="flex items-center justify-end pt-1 border-t border-[var(--jarvis-border)]">
        <button
          disabled
          className="flex items-center gap-1.5 rounded-md border border-[var(--jarvis-accent)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--jarvis-accent)] opacity-60 cursor-not-allowed transition-colors"
        >
          <Plug className="h-3 w-3" />
          Connect
        </button>
      </div>
    </GlowCard>
  );
}

/* ───── page component ───── */

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return integrations.filter((i) => {
      const matchesCategory = activeCategory === "all" || i.category === activeCategory;
      const matchesSearch =
        lower === "" ||
        i.name.toLowerCase().includes(lower) ||
        i.description.toLowerCase().includes(lower);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categories = [ALL_CATEGORY, ...integrationCategories];

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
          Connect your tools and services &mdash; {integrations.length} integrations available
        </p>
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
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap gap-2"
      >
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

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
      >
        {filtered.map((integration) => (
          <motion.div key={integration.id} variants={fadeUp}>
            <IntegrationCard integration={integration} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
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
