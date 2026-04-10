"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useUiStore } from "@/stores/ui-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/** Vesper BEAST MODE startup sound — 5-layer synthesis, deep AI engine ignition */
function useStartupSound() {
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    // Master compressor — keeps everything punchy without clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, now);
    compressor.knee.setValueAtTime(10, now);
    compressor.ratio.setValueAtTime(8, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.15, now);
    compressor.connect(ctx.destination);

    // Layer 1: SUB-BASS RUMBLE — chest-vibrating foundation (20-35Hz)
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(20, now);
    sub.frequency.exponentialRampToValueAtTime(35, now + 1.0);
    sub.frequency.exponentialRampToValueAtTime(25, now + 2.2);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    subGain.gain.linearRampToValueAtTime(0.15, now + 1.5);
    subGain.gain.linearRampToValueAtTime(0, now + 2.5);
    sub.connect(subGain).connect(compressor);
    sub.start(now);
    sub.stop(now + 2.6);

    // Layer 2: ENGINE GROWL — sawtooth through bandpass filter (50-200Hz)
    const growl = ctx.createOscillator();
    growl.type = "sawtooth";
    growl.frequency.setValueAtTime(50, now);
    growl.frequency.exponentialRampToValueAtTime(200, now + 0.8);
    growl.frequency.exponentialRampToValueAtTime(80, now + 2.0);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(120, now);
    bandpass.frequency.exponentialRampToValueAtTime(250, now + 0.8);
    bandpass.Q.setValueAtTime(3, now);
    const growlGain = ctx.createGain();
    growlGain.gain.setValueAtTime(0, now);
    growlGain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    growlGain.gain.linearRampToValueAtTime(0.08, now + 1.2);
    growlGain.gain.linearRampToValueAtTime(0, now + 2.4);
    growl.connect(bandpass).connect(growlGain).connect(compressor);
    growl.start(now);
    growl.stop(now + 2.5);

    // Layer 3: POWER SURGE — square wave through resonant lowpass (100-400Hz)
    const surge = ctx.createOscillator();
    surge.type = "square";
    surge.frequency.setValueAtTime(100, now + 0.1);
    surge.frequency.exponentialRampToValueAtTime(400, now + 0.6);
    surge.frequency.exponentialRampToValueAtTime(150, now + 1.8);
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(200, now);
    lowpass.frequency.exponentialRampToValueAtTime(800, now + 0.6);
    lowpass.frequency.exponentialRampToValueAtTime(300, now + 1.8);
    lowpass.Q.setValueAtTime(8, now);
    const surgeGain = ctx.createGain();
    surgeGain.gain.setValueAtTime(0, now);
    surgeGain.gain.linearRampToValueAtTime(0.06, now + 0.15);
    surgeGain.gain.linearRampToValueAtTime(0.04, now + 1.0);
    surgeGain.gain.linearRampToValueAtTime(0, now + 2.2);
    surge.connect(lowpass).connect(surgeGain).connect(compressor);
    surge.start(now + 0.1);
    surge.stop(now + 2.3);

    // Layer 4: HARMONIC SHIMMER — sine with waveshaper distortion (600-1800Hz)
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(600, now + 0.4);
    shimmer.frequency.exponentialRampToValueAtTime(1800, now + 1.0);
    shimmer.frequency.exponentialRampToValueAtTime(800, now + 2.0);
    const waveshaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
    }
    waveshaper.curve = curve;
    waveshaper.oversample = "4x";
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.setValueAtTime(0, now + 0.4);
    shimmerGain.gain.linearRampToValueAtTime(0.04, now + 0.7);
    shimmerGain.gain.linearRampToValueAtTime(0.02, now + 1.5);
    shimmerGain.gain.linearRampToValueAtTime(0, now + 2.3);
    shimmer.connect(waveshaper).connect(shimmerGain).connect(compressor);
    shimmer.start(now + 0.4);
    shimmer.stop(now + 2.4);

    // Layer 5: IMPACT HIT — noise burst through highpass (mechanical ignition)
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(2000, now);
    highpass.frequency.exponentialRampToValueAtTime(400, now + 0.15);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(highpass).connect(noiseGain).connect(compressor);
    noise.start(now);

    // Delay feedback for spaciousness
    const delay = ctx.createDelay(0.5);
    delay.delayTime.setValueAtTime(0.12, now);
    const delayGain = ctx.createGain();
    delayGain.gain.setValueAtTime(0.15, now);
    delayGain.gain.linearRampToValueAtTime(0, now + 2.0);
    compressor.connect(delay).connect(delayGain).connect(ctx.destination);

    setTimeout(() => ctx.close(), 3500);
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
