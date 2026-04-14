"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Rocket, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { GlowCard } from "@/components/jarvis";
import { useOrgStore } from "@/stores/org-store";
import { createClient } from "@/lib/supabase/client";
import {
  agentTemplates,
  templateCategories,
  type AgentTemplate,
} from "@/data/agent-templates";
import {
  skills,
  skillCategories,
  type Skill,
} from "@/data/skills";

/* ───── constants ───── */

const TIER_COLORS: Record<string, string> = {
  starter: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  professional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  executive: "text-amber-400",
  marketing: "text-pink-400",
  sales: "text-emerald-400",
  healthcare: "text-red-400",
  hospice: "text-rose-400",
  operations: "text-blue-400",
  finance: "text-green-400",
  research: "text-cyan-400",
  development: "text-violet-400",
  clawbots: "text-orange-400",
  intelligence: "text-yellow-400",
  "marketing-suite": "text-fuchsia-400",
};

/* ───── animations ───── */

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

/* ───── template card ───── */

function TemplateCard({ template, onDeploy, deploying }: {
  readonly template: AgentTemplate;
  readonly onDeploy: (t: AgentTemplate) => void;
  readonly deploying: string | null;
}) {
  const catLabel = templateCategories.find((c) => c.id === template.category)?.name ?? template.category;
  const isDeploying = deploying === template.id;

  return (
    <GlowCard className="p-5 space-y-3" hover>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug">
          {template.name}
        </h3>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full border border-[var(--jarvis-border)] px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[template.category] ?? "text-[var(--jarvis-text-secondary)]"}`}
        >
          {catLabel}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${TIER_COLORS[template.tier] ?? ""}`}
        >
          {template.tier}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-0.5 text-[10px] font-medium text-[var(--jarvis-text-muted)]">
          {template.defaultModel}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--jarvis-text-muted)] line-clamp-2">
        {template.description}
      </p>

      {/* Skills badges */}
      <div className="flex flex-wrap gap-1.5">
        {template.skills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded bg-[var(--jarvis-accent)]/10 px-1.5 py-0.5 text-[10px] text-[var(--jarvis-accent)]"
          >
            {s}
          </span>
        ))}
        {template.skills.length > 3 && (
          <span className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-muted)]">
            +{template.skills.length - 3}
          </span>
        )}
      </div>

      {/* Deploy button */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--jarvis-border)]">
        <span className="text-[10px] text-[var(--jarvis-text-muted)] font-mono">
          {template.defaultZone}
        </span>
        <button
          onClick={() => onDeploy(template)}
          disabled={isDeploying}
          className="flex items-center gap-1.5 rounded-md border border-[var(--jarvis-accent)] bg-transparent px-3 py-1.5 text-xs font-medium text-[var(--jarvis-accent)] transition-colors hover:bg-[var(--jarvis-accent)]/10 disabled:opacity-50"
        >
          {isDeploying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Rocket className="h-3 w-3" />
          )}
          {isDeploying ? "Deploying..." : "Deploy Agent"}
        </button>
      </div>
    </GlowCard>
  );
}

/* ───── skill card ───── */

function SkillCard({ skill }: { readonly skill: Skill }) {
  const catLabel = skillCategories.find((c) => c.id === skill.category)?.name ?? skill.category;

  return (
    <GlowCard className="p-4 space-y-2" hover>
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-[var(--jarvis-text-primary)] leading-snug">
          {skill.name}
        </h3>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${TIER_COLORS[skill.tier] ?? ""}`}
        >
          {skill.tier}
        </span>
      </div>

      <span
        className={`inline-flex items-center text-[10px] font-medium ${CATEGORY_COLORS[skill.category] ?? "text-[var(--jarvis-text-secondary)]"}`}
      >
        {catLabel}
      </span>

      <p className="text-xs text-[var(--jarvis-text-muted)] line-clamp-3">
        {skill.description}
      </p>
    </GlowCard>
  );
}

/* ───── page component ───── */

type Tab = "templates" | "skills";

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deploying, setDeploying] = useState<string | null>(null);
  const orgId = useOrgStore((s) => s.currentOrgId);

  const handleDeploy = async (template: AgentTemplate) => {
    if (!orgId) {
      toast.error("Select an organization first");
      return;
    }
    setDeploying(template.id);
    try {
      const supabase = createClient();
      const slug = `${template.id}-${Date.now().toString(36)}`;
      const { error } = await supabase.from("agents").insert({
        slug,
        name: template.name,
        role: template.description,
        department: template.category,
        tier: template.tier === "enterprise" ? "orchestrator" : template.tier === "advanced" ? "director" : "specialist",
        status: "active",
        organization_id: orgId,
        soul_file_path: `templates/${template.id}.soul.md`,
        config: {
          model: template.defaultModel,
          zone: template.defaultZone,
          skills: template.skills,
          capabilities: template.capabilities,
          kpis: template.suggestedKpis,
          deployed_from_template: template.id,
        },
      });
      if (error) throw error;
      toast.success(`${template.name} deployed successfully`, {
        description: `Agent is now active in your organization`,
      });
    } catch (err) {
      toast.error("Failed to deploy agent", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeploying(null);
    }
  };

  const filteredTemplates = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return agentTemplates.filter((t) => {
      const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
      const matchesSearch =
        lower === "" ||
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, categoryFilter]);

  const filteredSkills = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return skills.filter((s) => {
      const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
      const matchesSearch =
        lower === "" ||
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, categoryFilter]);

  const tabCategories =
    activeTab === "templates"
      ? [{ id: "all", name: "All" }, ...templateCategories]
      : [{ id: "all", name: "All" }, ...skillCategories.map((c) => ({ id: c.id, name: c.name }))];

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
          Training Center
        </h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Agent templates and skill deployment &mdash; {agentTemplates.length} templates, {skills.length} skills
        </p>
      </motion.div>

      {/* Tab toggles */}
      <motion.div variants={fadeUp} className="flex gap-2">
        <button
          onClick={() => {
            setActiveTab("templates");
            setCategoryFilter("all");
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)] border border-[var(--jarvis-accent)]/30"
              : "bg-[var(--jarvis-bg-secondary)] text-[var(--jarvis-text-secondary)] border border-[var(--jarvis-border)] hover:text-[var(--jarvis-text-primary)]"
          }`}
        >
          <Rocket className="h-4 w-4" />
          Templates ({agentTemplates.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("skills");
            setCategoryFilter("all");
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "skills"
              ? "bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)] border border-[var(--jarvis-accent)]/30"
              : "bg-[var(--jarvis-bg-secondary)] text-[var(--jarvis-text-secondary)] border border-[var(--jarvis-border)] hover:text-[var(--jarvis-text-primary)]"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Skills ({skills.length})
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--jarvis-text-muted)]" />
        <input
          type="text"
          placeholder={activeTab === "templates" ? "Search templates..." : "Search skills..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] py-2 pl-10 pr-4 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] focus:border-[var(--jarvis-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--jarvis-accent)]"
        />
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {tabCategories.map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
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

      {/* Content grid */}
      {activeTab === "templates" ? (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          key="templates"
        >
          {filteredTemplates.map((t) => (
            <motion.div key={t.id} variants={fadeUp}>
              <TemplateCard template={t} onDeploy={handleDeploy} deploying={deploying} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          key="skills"
        >
          {filteredSkills.map((s) => (
            <motion.div key={s.id} variants={fadeUp}>
              <SkillCard skill={s} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {((activeTab === "templates" && filteredTemplates.length === 0) ||
        (activeTab === "skills" && filteredSkills.length === 0)) && (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Search className="h-10 w-10 text-[var(--jarvis-text-muted)] mb-3" />
          <p className="text-sm text-[var(--jarvis-text-muted)]">
            No {activeTab} match your search.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
