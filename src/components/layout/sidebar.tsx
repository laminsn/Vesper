"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command,
  Bot,
  GitFork,
  Building2,
  BookOpen,
  ArrowRightLeft,
  ListChecks,
  Calendar as CalendarIcon,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Sparkles,
  Settings,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  Puzzle,
  GraduationCap,
  LayoutDashboard,
  Workflow,
  Terminal,
  CreditCard,
  Code,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/providers/i18n-provider";
import type { UserRole } from "@/types";
import type { TranslationKey } from "@/i18n";
import { LanguageSelector } from "@/components/layout/language-selector";
import { OrgSwitcher } from "@/components/layout/org-switcher";

interface SidebarNavItem {
  readonly labelKey: TranslationKey;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly roles?: readonly UserRole[];
}

interface SidebarSection {
  readonly labelKey: TranslationKey;
  readonly items: readonly SidebarNavItem[];
}

const NAV_SECTIONS: readonly SidebarSection[] = [
  {
    labelKey: "nav.command",
    items: [
      { labelKey: "nav.commandCenter", href: "/", icon: Command },
      { labelKey: "nav.agents", href: "/agents", icon: Bot },
      { labelKey: "nav.orgChart", href: "/org-chart", icon: GitFork },
      { labelKey: "nav.commandStation", href: "/command-station", icon: Terminal },
    ],
  },
  {
    labelKey: "nav.operations",
    items: [
      { labelKey: "nav.departments", href: "/departments", icon: Building2 },
      { labelKey: "nav.playbooks", href: "/playbooks", icon: BookOpen },
      { labelKey: "nav.handoffs", href: "/handoffs", icon: ArrowRightLeft },
      { labelKey: "nav.taskBoard", href: "/tasks", icon: ListChecks },
      { labelKey: "nav.calendar", href: "/calendar", icon: CalendarIcon },
      { labelKey: "nav.dailyTasks", href: "/daily-tasks", icon: ClipboardCheck },
      { labelKey: "nav.integrations", href: "/integrations", icon: Puzzle },
      { labelKey: "nav.training", href: "/training", icon: GraduationCap },
      { labelKey: "nav.workflows", href: "/workflows", icon: Workflow },
    ],
  },
  {
    labelKey: "nav.intelligence",
    items: [
      { labelKey: "nav.assets", href: "/assets", icon: FileText },
      { labelKey: "nav.contentVault", href: "/content-vault", icon: Sparkles },
      { labelKey: "nav.dailyReports", href: "/daily-reports", icon: FileText },
      { labelKey: "nav.commsHub", href: "/comms", icon: MessageSquare },
      { labelKey: "nav.evolution", href: "/evolution", icon: Sparkles },
      { labelKey: "nav.dashboards", href: "/custom-dashboards", icon: LayoutDashboard },
      { labelKey: "nav.notifications", href: "/notifications", icon: BellRing },
    ],
  },
  {
    labelKey: "nav.admin",
    items: [
      {
        labelKey: "nav.phiMonitor",
        href: "/phi-monitor",
        icon: ShieldCheck,
        roles: ["owner", "cofounder"],
      },
      {
        labelKey: "nav.settings",
        href: "/settings",
        icon: Settings,
        roles: ["owner", "cofounder"],
      },
      {
        labelKey: "nav.billing",
        href: "/billing",
        icon: CreditCard,
        roles: ["owner", "cofounder"],
      },
      {
        labelKey: "nav.apiPortal",
        href: "/api-portal",
        icon: Code,
        roles: ["owner", "cofounder"],
      },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { role } = useAuth();
  const { t } = useI18n();

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Org Switcher */}
      <div className="border-b border-[var(--sidebar-border)] px-2 py-2">
        <OrgSwitcher />
      </div>

      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
        {!sidebarCollapsed && (
          <span className="heading-display text-xl tracking-wider text-[var(--jarvis-accent)] drop-shadow-[0_0_8px_rgba(6,214,160,0.4)]">
            VESPER
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-[var(--jarvis-text-muted)] transition-colors hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex flex-col gap-6">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => {
              if (!item.roles) return true;
              return role !== null && item.roles.includes(role);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.labelKey} className="flex flex-col gap-1">
                {!sidebarCollapsed && (
                  <span className="heading-mono mb-1 px-3">
                    {t(section.labelKey).toUpperCase()}
                  </span>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const label = t(item.labelKey);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]"
                          : "text-[var(--jarvis-text-secondary)] hover:bg-[var(--jarvis-bg-tertiary)] hover:text-[var(--jarvis-text-primary)]",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      title={sidebarCollapsed ? label : undefined}
                    >
                      {/* Active indicator */}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-[var(--jarvis-accent)] shadow-[0_0_6px_var(--jarvis-accent)]" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Language Selector + Version */}
      {!sidebarCollapsed && (
        <div className="border-t border-[var(--sidebar-border)] px-3 py-3 space-y-2">
          <LanguageSelector />
          <p className="text-[9px] text-center text-[var(--sidebar-text-muted)] font-mono">
            Vesper v1.0.0
          </p>
        </div>
      )}
    </div>
  );
}
