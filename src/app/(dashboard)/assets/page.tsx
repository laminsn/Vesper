"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Image, Table2, Presentation, Video, File, Loader2,
  CheckCircle2, XCircle, Clock, ExternalLink, Download, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAssets, useApproveAsset, useRejectAsset, type Asset } from "@/hooks/use-assets";
import { useAgents } from "@/hooks/use-agents";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { GlowCard, HudFrame, CircularGauge } from "@/components/jarvis";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TYPE_ICONS: Record<string, typeof FileText> = {
  image: Image, document: FileText, spreadsheet: Table2, presentation: Presentation,
  video: Video, pdf: FileText, design: Image, template: File, report: FileText, other: File,
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  revision_needed: "bg-purple-500/20 text-purple-400",
  exported: "bg-blue-500/20 text-blue-400",
};

export default function AssetsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: assets = [], isLoading } = useAssets();
  const { data: agents = [] } = useAgents();
  const approveMutation = useApproveAsset();
  const rejectMutation = useRejectAsset();

  useRealtimeSubscription("assets");

  const filtered = useMemo(() => {
    let items = assets;
    if (typeFilter !== "all") items = items.filter((a) => a.asset_type === typeFilter);
    if (statusFilter !== "all") items = items.filter((a) => a.approval_status === statusFilter);
    return items;
  }, [assets, typeFilter, statusFilter]);

  const pendingCount = assets.filter((a) => a.approval_status === "pending").length;
  const approvedCount = assets.filter((a) => a.approval_status === "approved").length;

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id, approvedBy: "Lamin" }, {
      onSuccess: () => toast.success("Asset approved"),
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ id, reason: "Does not meet quality standards" }, {
      onSuccess: () => toast.success("Asset rejected"),
    });
  };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp}>
        <h1 className="heading-display text-3xl text-[var(--jarvis-text-primary)]">Assets</h1>
        <p className="text-sm text-[var(--jarvis-text-muted)] mt-1">
          Agent-created assets — review, approve, and export to Google Drive
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <HudFrame title="Total">
          <div className="flex justify-center py-2">
            <CircularGauge value={assets.length} max={Math.max(assets.length, 1)} label="Assets" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Pending Review" color="#f59e0b">
          <div className="flex justify-center py-2">
            <CircularGauge value={pendingCount} max={Math.max(assets.length, 1)} label="Pending" color="#f59e0b" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Approved" color="#06d6a0">
          <div className="flex justify-center py-2">
            <CircularGauge value={approvedCount} max={Math.max(assets.length, 1)} label="Approved" color="#06d6a0" size="sm" />
          </div>
        </HudFrame>
        <HudFrame title="Types">
          <div className="flex justify-center py-2">
            <CircularGauge value={new Set(assets.map((a) => a.asset_type)).size} max={10} label="Types" size="sm" />
          </div>
        </HudFrame>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1 text-xs text-[var(--jarvis-text-primary)]"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="spreadsheet">Spreadsheets</option>
          <option value="presentation">Presentations</option>
          <option value="video">Videos</option>
          <option value="pdf">PDFs</option>
          <option value="design">Designs</option>
          <option value="report">Reports</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-2 py-1 text-xs text-[var(--jarvis-text-primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="exported">Exported</option>
        </select>
      </motion.div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--jarvis-accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
          <File className="h-10 w-10 text-[var(--jarvis-text-muted)] mb-3" />
          <p className="text-sm text-[var(--jarvis-text-muted)]">
            {assets.length === 0 ? "No assets yet. Agents will create assets as they work." : "No assets match your filters."}
          </p>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
          {filtered.map((asset) => {
            const agent = agents.find((a) => a.id === asset.created_by_agent_id);
            const Icon = TYPE_ICONS[asset.asset_type] ?? File;
            const statusCls = STATUS_STYLES[asset.approval_status] ?? STATUS_STYLES.pending;

            return (
              <motion.div key={asset.id} variants={fadeUp}>
                <GlowCard className="p-4 space-y-3" hover>
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--jarvis-bg-tertiary)]">
                      <Icon className="h-5 w-5 text-[var(--jarvis-accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--jarvis-text-primary)] truncate">{asset.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] uppercase text-[var(--jarvis-text-muted)]">{asset.asset_type}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusCls}`}>
                          {asset.approval_status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {asset.description && (
                    <p className="text-xs text-[var(--jarvis-text-secondary)] line-clamp-2">{asset.description}</p>
                  )}

                  {/* Thumbnail */}
                  {asset.thumbnail_url && (
                    <div className="rounded-lg overflow-hidden border border-[var(--jarvis-border)]">
                      <img src={asset.thumbnail_url} alt={asset.title} className="w-full h-32 object-cover" />
                    </div>
                  )}

                  {/* Tags */}
                  {asset.tags && (asset.tags as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(asset.tags as string[]).slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded bg-[var(--jarvis-bg-tertiary)] px-1.5 py-0.5 text-[9px] text-[var(--jarvis-text-muted)]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--jarvis-border)]">
                    <span className="text-[10px] text-[var(--jarvis-text-muted)]">
                      {agent?.name ?? "System"} &middot; {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {asset.approval_status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(asset.id)}
                            className="h-6 text-[10px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                            <ThumbsUp className="h-2.5 w-2.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(asset.id)}
                            className="h-6 text-[10px] border-red-500/40 text-red-400 hover:bg-red-500/10">
                            <ThumbsDown className="h-2.5 w-2.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {asset.file_url && (
                        <a href={asset.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] border-[var(--jarvis-border)] text-[var(--jarvis-text-secondary)]">
                            <ExternalLink className="h-2.5 w-2.5 mr-1" /> View
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
