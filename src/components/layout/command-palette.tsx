"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  Building2,
  BookOpen,
  Command,
  ArrowRight,
  Sparkles,
  ListChecks,
  Settings,
  Moon,
  Sun,
  Layers,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useDepartments } from "@/hooks/use-departments";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { useUiStore } from "@/stores/ui-store";
import { useTheme } from "@/providers/theme-provider";

interface PaletteItem {
  readonly id: string;
  readonly label: string;
  readonly sublabel?: string;
  readonly category: "page" | "agent" | "department" | "playbook" | "action";
  readonly icon: React.ReactNode;
  readonly href?: string;
  readonly action?: () => void;
}

const PAGES: readonly PaletteItem[] = [
  { id: "p-dashboard", label: "Dashboard", category: "page", icon: <Command className="h-4 w-4" />, href: "/" },
  { id: "p-agents", label: "Agents", category: "page", icon: <Bot className="h-4 w-4" />, href: "/agents" },
  { id: "p-command-station", label: "Command Station", category: "page", icon: <Command className="h-4 w-4" />, href: "/command-station" },
  { id: "p-tasks", label: "Task Board", category: "page", icon: <ListChecks className="h-4 w-4" />, href: "/tasks" },
  { id: "p-playbooks", label: "Playbooks", category: "page", icon: <BookOpen className="h-4 w-4" />, href: "/playbooks" },
  { id: "p-evolution", label: "Evolution", category: "page", icon: <Sparkles className="h-4 w-4" />, href: "/evolution" },
  { id: "p-departments", label: "Departments", category: "page", icon: <Building2 className="h-4 w-4" />, href: "/departments" },
  { id: "p-workflows", label: "Workflows", category: "page", icon: <Layers className="h-4 w-4" />, href: "/workflows" },
  { id: "p-settings", label: "Settings", category: "page", icon: <Settings className="h-4 w-4" />, href: "/settings" },
  { id: "p-audit", label: "Audit Logs", category: "page", icon: <ListChecks className="h-4 w-4" />, href: "/audit-logs" },
];

const CATEGORY_LABELS: Record<string, string> = {
  page: "Pages",
  agent: "Agents",
  department: "Departments",
  playbook: "Playbooks",
  action: "Quick Actions",
};

export function CommandPalette() {
  const router = useRouter();
  const { toggleTheme, theme } = useTheme();
  const open = useUiStore((s) => s.globalSearchOpen);
  const setOpen = useUiStore((s) => s.setGlobalSearchOpen);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: agents = [] } = useAgents();
  const { data: departments = [] } = useDepartments();
  const { data: playbooks = [] } = usePlaybooks();

  // Build searchable items
  const allItems: readonly PaletteItem[] = useMemo(() => {
    const agentItems: PaletteItem[] = agents.slice(0, 50).map((a) => ({
      id: `a-${a.slug}`,
      label: a.name,
      sublabel: `${a.role} — ${a.department}`,
      category: "agent" as const,
      icon: <Bot className="h-4 w-4" />,
      href: `/agents/${a.slug}`,
    }));

    const deptItems: PaletteItem[] = departments.map((d) => ({
      id: `d-${d.slug}`,
      label: d.name,
      sublabel: `${d.agent_count} agents`,
      category: "department" as const,
      icon: <Building2 className="h-4 w-4" />,
      href: `/departments/${d.slug}`,
    }));

    const playbookItems: PaletteItem[] = playbooks.map((p) => ({
      id: `pb-${p.id}`,
      label: p.name,
      sublabel: p.trigger_description ?? "",
      category: "playbook" as const,
      icon: <BookOpen className="h-4 w-4" />,
      href: "/playbooks",
    }));

    const actions: PaletteItem[] = [
      {
        id: "act-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "action",
        icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        action: toggleTheme,
      },
    ];

    return [...PAGES, ...agentItems, ...deptItems, ...playbookItems, ...actions];
  }, [agents, departments, playbooks, theme, toggleTheme]);

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 20);
    const lower = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(lower) ||
          (item.sublabel?.toLowerCase().includes(lower) ?? false)
      )
      .slice(0, 20);
  }, [allItems, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const existing = groups.get(item.category) ?? [];
      groups.set(item.category, [...existing, item]);
    }
    return groups;
  }, [filtered]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item.action) {
          item.action();
        } else if (item.href) {
          router.push(item.href);
        }
        setOpen(false);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [filtered, selectedIndex, router, setOpen]
  );

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
      setOpen(false);
    },
    [router, setOpen]
  );

  if (!open) return null;

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)] shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-[var(--jarvis-border)] px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-[var(--jarvis-text-muted)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search agents, pages, playbooks..."
                  className="flex-1 bg-transparent text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)] outline-none"
                />
                <kbd className="hidden rounded border border-[var(--jarvis-border)] px-1.5 py-0.5 text-[10px] text-[var(--jarvis-text-muted)] sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-[var(--jarvis-text-muted)]">
                    No results found
                  </p>
                )}

                {Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category} className="mb-2">
                    <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--jarvis-text-muted)]">
                      {CATEGORY_LABELS[category] ?? category}
                    </p>
                    {items.map((item) => {
                      flatIndex++;
                      const isSelected = flatIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isSelected
                              ? "bg-[var(--jarvis-accent)]/10 text-[var(--jarvis-accent)]"
                              : "text-[var(--jarvis-text-primary)] hover:bg-[var(--jarvis-bg-tertiary)]"
                          }`}
                        >
                          <span className="shrink-0 text-[var(--jarvis-text-muted)]">
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate font-medium">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="block truncate text-xs text-[var(--jarvis-text-muted)]">
                                {item.sublabel}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--jarvis-accent)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--jarvis-border)] px-4 py-2 text-[10px] text-[var(--jarvis-text-muted)]">
                <div className="flex items-center gap-3">
                  <span><kbd className="rounded border border-[var(--jarvis-border)] px-1 py-0.5">↑↓</kbd> navigate</span>
                  <span><kbd className="rounded border border-[var(--jarvis-border)] px-1 py-0.5">↵</kbd> select</span>
                </div>
                <span>{filtered.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
