"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/** Vesper synth engine rev — plays once on first dashboard load */
function useStartupSound() {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;
    // Low rumble sweep
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(40, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.6);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 1.2);
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain1.gain.linearRampToValueAtTime(0.04, now + 0.8);
    gain1.gain.linearRampToValueAtTime(0, now + 1.4);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.5);
    // High-end shimmer
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(800, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.7);
    osc2.frequency.exponentialRampToValueAtTime(600, now + 1.2);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.3);
    gain2.gain.linearRampToValueAtTime(0.03, now + 0.5);
    gain2.gain.linearRampToValueAtTime(0, now + 1.3);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 1.4);
    setTimeout(() => ctx.close(), 2000);
  }, []);
}

interface DashboardShellProps {
  readonly children: ReactNode;
}

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function DashboardShell({ children }: DashboardShellProps) {
  useStartupSound();
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
