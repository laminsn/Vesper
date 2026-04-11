"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, Check, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgStore } from "@/stores/org-store";
import { useI18n } from "@/providers/i18n-provider";
import { useUiStore } from "@/stores/ui-store";
import { ALL_ORGS } from "@/data/organizations";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OrgIndustry, Organization } from "@/types";

// ─── Org Display Config ──────────────────────────────────────────────────────
// Color map for org badges (keyed by slug)
const ORG_COLORS: Record<string, string> = Object.fromEntries(
  ALL_ORGS.map((o) => [o.slug, o.color])
);

function getOrgColor(slug: string): string {
  return ORG_COLORS[slug] ?? "#6b7280";
}

interface DisplayOrg {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly industry: OrgIndustry;
  readonly hipaaMode: boolean;
  readonly color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIndustryLabel(industry: OrgIndustry): string {
  const labels: Record<OrgIndustry, string> = {
    healthcare: "Healthcare (HIPAA)",
    marketing: "Marketing",
    finance: "Finance",
    real_estate: "Real Estate",
    technology: "Technology",
    education: "Education",
    hospitality: "Hospitality",
    other: "Other",
  };
  return labels[industry];
}

function getFirstLetter(name: string): string {
  return name.charAt(0).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { currentOrgId, setCurrentOrg } = useOrgStore();
  const { t } = useI18n();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  // Use static org data — no Supabase query needed
  const displayOrgs: readonly DisplayOrg[] = useMemo(() =>
    ALL_ORGS.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      industry: o.industry,
      hipaaMode: o.hipaaMode,
      color: o.color,
    })),
  []);

  const activeOrg = displayOrgs.find((o) => o.id === currentOrgId) ?? displayOrgs[0];

  // Auto-select first org if none selected
  if (!currentOrgId && activeOrg) {
    setCurrentOrg(activeOrg.id, activeOrg.name, activeOrg.slug, activeOrg.hipaaMode);
  }

  const handleSelectOrg = (org: DisplayOrg) => {
    setCurrentOrg(org.id, org.name, org.slug, org.hipaaMode);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setOpen(false);
    router.push("/settings/upload-profile");
  };

  if (!activeOrg) {
    return (
      <div className="flex h-10 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--jarvis-text-muted)]" />
      </div>
    );
  }

  if (sidebarCollapsed) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors hover:bg-[var(--jarvis-bg-tertiary)]"
            title={activeOrg.name}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: activeOrg.color }}
            >
              {getFirstLetter(activeOrg.name)}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-72 p-0">
          <OrgList
            orgs={displayOrgs}
            activeOrgId={activeOrg.id}
            onSelect={handleSelectOrg}
            onCreateNew={handleCreateNew}
            t={t}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--jarvis-bg-tertiary)]">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: activeOrg.color }}
          >
            {getFirstLetter(activeOrg.name)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-[var(--jarvis-text-primary)]">
              {activeOrg.name}
            </p>
            <p className="truncate text-[10px] text-[var(--jarvis-text-muted)]">
              {getIndustryLabel(activeOrg.industry)}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[var(--jarvis-text-muted)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 p-0">
        <OrgList
          orgs={displayOrgs}
          activeOrgId={activeOrg.id}
          onSelect={handleSelectOrg}
          onCreateNew={handleCreateNew}
          t={t}
        />
      </PopoverContent>
    </Popover>
  );
}

// ─── Dropdown List ────────────────────────────────────────────────────────────

interface OrgListProps {
  readonly orgs: readonly DisplayOrg[];
  readonly activeOrgId: string;
  readonly onSelect: (org: DisplayOrg) => void;
  readonly onCreateNew: () => void;
  readonly t: (key: string) => string;
}

function OrgList({ orgs, activeOrgId, onSelect, onCreateNew, t }: OrgListProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--jarvis-border)] px-3 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--jarvis-text-muted)]">
          {t("orgSwitcher.title")}
        </p>
      </div>

      {/* Org items */}
      <div className="flex flex-col py-1">
        {orgs.map((org) => {
          const isActive = org.id === activeOrgId;
          return (
            <button
              key={org.id}
              onClick={() => onSelect(org)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-[var(--jarvis-accent)]/5"
                  : "hover:bg-[var(--jarvis-bg-tertiary)]"
              )}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: org.color }}
              >
                {getFirstLetter(org.name)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[var(--jarvis-text-primary)]">
                  {org.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[var(--jarvis-text-muted)]">
                  <span>{getIndustryLabel(org.industry)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: "var(--jarvis-success)",
                    boxShadow: "0 0 6px var(--jarvis-success)",
                  }}
                />
                {isActive && (
                  <Check className="h-4 w-4 text-[var(--jarvis-accent)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Create new */}
      <div className="border-t border-[var(--jarvis-border)] py-1">
        <button
          onClick={onCreateNew}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--jarvis-bg-tertiary)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-[var(--jarvis-border)] text-[var(--jarvis-text-muted)]">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm text-[var(--jarvis-text-secondary)]">
            {t("orgSwitcher.createNew")}
          </span>
        </button>
      </div>
    </div>
  );
}
