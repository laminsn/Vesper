"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Quote,
  Zap,
  Image,
  TrendingUp,
  LayoutGrid,
  Loader2,
  ExternalLink,
  Flame,
  Clock,
  CheckCircle2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useContentVault, useUpdateVaultItem, type ContentVaultItem } from "@/hooks/use-content-vault";
import { useAgents } from "@/hooks/use-agents";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, CircularGauge } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ───── constants ───── */

const VIRAL_COLORS: Record<string, string> = {
  viral: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  extracted: "bg-purple-500/20 text-purple-400",
  drafted: "bg-blue-500/20 text-blue-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  scheduled: "bg-amber-500/20 text-amber-400",
  posted: "bg-green-500/20 text-green-400",
  archived: "bg-gray-500/20 text-gray-400",
};

const SOURCE_ICONS: Record<string, string> = {
  youtube: "YT", podcast: "POD", instagram: "IG", tiktok: "TT",
  interview: "INT", webinar: "WEB", live: "LIVE", blog: "BLG",
  newsletter: "NL", other: "OTH",
};

/* ───── animations ───── */

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

/* ───── page ───── */

export default function ContentVaultPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viralFilter, setViralFilter] = useState("all");

  const { data: allItems = [], isLoading } = useContentVault();
  const { data: agents = [] } = useAgents();
  const updateItem = useUpdateVaultItem();

  useRealtimeSubscription("content_vault");

  // Filter by tab
  const filtered = useMemo(() => {
    let items = allItems;
    if (activeTab === "quotes") items = items.filter((i) => i.content_type === "quote" || i.content_type === "key_phrase");
    if (activeTab === "viral") items = items.filter((i) => i.content_type === "viral_topic" || i.viral_potential === "viral" || i.viral_potential === "high");
    if (activeTab === "static") items = items.filter((i) => i.content_type === "static_post" || i.content_type === "carousel");
    if (activeTab === "thumbnails") items = items.filter((i) => i.content_type === "thumbnail" || i.content_type === "clip_timestamp");
    if (activeTab === "hooks") items = items.filter((i) => i.content_type === "hook" || i.content_type === "cta");
    if (statusFilter !== "all") items = items.filter((i) => i.post_status === statusFilter);
    if (viralFilter !== "all") items = items.filter((i) => i.viral_potential === viralFilter);
    return items;
  }, [allItems, activeTab, statusFilter, viralFilter]);

  // Stats
  const totalQuotes = allItems.filter((i) => i.content_type === "quote" || i.content_type === "key_phrase").length;
  const viralCount = allItems.filter((i) => i.viral_potential === "viral" || i.viral_potential === "high").length;
  const staticReady = allItems.filter((i) => i.content_type === "static_post" || i.content_type === "carousel").length;
  const posted = allItems.filter((i) => i.post_status === "posted").length;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateItem.mutate(
      { id, post_status: newStatus as ContentVaultItem["post_status"] },
      { onSuccess: () => toast.success(`Status updated to ${newStatus}`) }
    );
  };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">Content Vault</h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Extracted quotes, viral topics, and static post assets from all content channels
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HudFrame title="Quotes">
          <div className="flex justify-center py-2">
            <CircularGauge value={totalQuotes} max={Math.max(totalQuotes, 1)} label="Extracted" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Viral Potential" color="#ef4444">
          <div className="flex justify-center py-2">
            <CircularGauge value={viralCount} max={Math.max(allItems.length, 1)} label="High/Viral" color="#ef4444" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Static Posts" color="#8b5cf6">
          <div className="flex justify-center py-2">
            <CircularGauge value={staticReady} max={Math.max(totalQuotes, 1)} label="Ready" color="#8b5cf6" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Posted" color="#06d6a0">
          <div className="flex justify-center py-2">
            <CircularGauge value={posted} max={Math.max(allItems.length, 1)} label="Live" color="#06d6a0" size="sm" />
          </div>
        </HudFrame>
      </motion.div>

      {/* Tabs + Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--jarvis-bg-tertiary)] border border-[var(--jarvis-border)]">
            <TabsTrigger value="all" className="text-xs">All ({allItems.length})</TabsTrigger>
            <TabsTrigger value="quotes" className="text-xs">Quotes ({totalQuotes})</TabsTrigger>
            <TabsTrigger value="viral" className="text-xs">Viral ({viralCount})</TabsTrigger>
            <TabsTrigger value="static" className="text-xs">Static Posts ({staticReady})</TabsTrigger>
            <TabsTrigger value="thumbnails" className="text-xs">Thumbnails</TabsTrigger>
            <TabsTrigger value="hooks" className="text-xs">Hooks & CTAs</TabsTrigger>
          </TabsList>
        </Tabs>

        <select
          value={viralFilter}
          onChange={(e) => setViralFilter(e.target.value)}
          className="rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1 text-xs text-[var(--jarvis-text-primary)]"
        >
          <option value="all">All Viral Levels</option>
          <option value="viral">Viral</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1 text-xs text-[var(--jarvis-text-primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="extracted">Extracted</option>
          <option value="drafted">Drafted</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="posted">Posted</option>
        </select>
      </motion.div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--jarvis-accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
          <Quote className="h-10 w-10 text-[var(--jarvis-text-muted)] mb-3" />
          <p className="text-sm text-[var(--jarvis-text-muted)]">
            {allItems.length === 0
              ? "Content Vault is empty. Journalist agents will extract quotes and viral topics from your content channels."
              : "No items match your filters."}
          </p>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
          {filtered.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <VaultCard item={item} agents={agents} onStatusChange={handleStatusChange} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ───── Vault Card ───── */

function VaultCard({
  item,
  agents,
  onStatusChange,
}: {
  readonly item: ContentVaultItem;
  readonly agents: readonly { id: string; name: string }[];
  readonly onStatusChange: (id: string, status: string) => void;
}) {
  const agent = agents.find((a) => a.id === item.extracted_by_agent_id);
  const viralCls = VIRAL_COLORS[item.viral_potential] ?? VIRAL_COLORS.medium;
  const statusCls = STATUS_COLORS[item.post_status] ?? STATUS_COLORS.extracted;
  const sourceIcon = SOURCE_ICONS[item.source_type] ?? "OTH";

  const nextStatus: Record<string, string> = {
    extracted: "drafted",
    drafted: "approved",
    approved: "scheduled",
    scheduled: "posted",
  };

  return (
    <GlowCard
      className="p-4 space-y-3"
      glowColor={item.viral_potential === "viral" ? "#ef4444" : item.viral_potential === "high" ? "#f97316" : undefined}
      hover
    >
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--jarvis-text-muted)] uppercase">
          {sourceIcon}
        </span>
        <span className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[9px] text-[var(--jarvis-text-muted)] uppercase">
          {item.content_type.replace("_", " ")}
        </span>
        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${viralCls}`}>
          {item.viral_potential === "viral" ? "VIRAL" : item.viral_potential}
        </span>
        <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusCls}`}>
          {item.post_status}
        </span>
      </div>

      {/* Quote body */}
      <div className="relative">
        {(item.content_type === "quote" || item.content_type === "key_phrase") && (
          <Quote className="absolute -left-1 -top-1 h-4 w-4 text-[var(--jarvis-accent)]/30" />
        )}
        <p className={`text-sm text-[var(--jarvis-text-primary)] ${
          item.content_type === "quote" || item.content_type === "key_phrase"
            ? "italic pl-4 border-l-2 border-[var(--jarvis-accent)]/30"
            : ""
        }`}>
          {item.body.length > 200 ? `${item.body.slice(0, 200)}...` : item.body}
        </p>
      </div>

      {/* Speaker + Source */}
      <div className="flex items-center gap-2 text-[10px] text-[var(--jarvis-text-muted)]">
        {item.speaker && (
          <span className="font-medium text-[var(--jarvis-text-secondary)]">— {item.speaker}</span>
        )}
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-[var(--jarvis-accent)] hover:underline ml-auto"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Source
          </a>
        )}
      </div>

      {/* Timestamps */}
      {item.timestamp_start && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--jarvis-text-muted)]">
          <Clock className="h-2.5 w-2.5" />
          {item.timestamp_start}{item.timestamp_end ? ` — ${item.timestamp_end}` : ""}
        </div>
      )}

      {/* Tags */}
      {item.tags && (item.tags as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(item.tags as string[]).slice(0, 5).map((tag) => (
            <span key={tag} className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[9px] text-[var(--jarvis-text-muted)]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Visual treatment suggestion */}
      {item.visual_treatment && (
        <div className="rounded bg-purple-500/10 px-2 py-1.5 text-[10px] text-purple-400">
          <Image className="inline h-3 w-3 mr-1" />
          {item.visual_treatment}
        </div>
      )}

      {/* Footer: agent + advance button */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--jarvis-border)]">
        <span className="text-[10px] text-[var(--jarvis-text-muted)]">
          {agent?.name ?? "System"} &middot; {new Date(item.created_at).toLocaleDateString()}
        </span>
        {nextStatus[item.post_status] && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStatusChange(item.id, nextStatus[item.post_status])}
            className="h-6 text-[10px] border-[var(--jarvis-accent)]/40 text-[var(--jarvis-accent)] hover:bg-[var(--jarvis-accent)]/10"
          >
            <Send className="h-2.5 w-2.5 mr-1" />
            {nextStatus[item.post_status]}
          </Button>
        )}
      </div>
    </GlowCard>
  );
}
