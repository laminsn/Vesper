"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface DashboardShellProps {
  readonly children: ReactNode;
}

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function DashboardShell({ children }: DashboardShellProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  const currentWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  return (
    <div className="flex min-h-screen bg-[var(--jarvis-bg-primary)]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: currentWidth }}
        transition={{ duration: 0.2, ease: "easeInOut" as const }}
        className="fixed left-0 top-0 z-30 h-screen border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]"
      >
        <Sidebar />
      </motion.aside>

      {/* Main area */}
      <motion.div
        animate={{ marginLeft: currentWidth }}
        transition={{ duration: 0.2, ease: "easeInOut" as const }}
        className="flex flex-1 flex-col"
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </motion.div>
    </div>
  );
}
