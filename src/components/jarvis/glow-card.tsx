"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlowCard({
  children,
  className,
  glowColor,
  hover = true,
  onClick,
}: GlowCardProps) {
  const style = glowColor
    ? {
        "--card-glow": `0 0 20px ${glowColor}30`,
        "--card-border": `${glowColor}40`,
      }
    : {};

  return (
    <motion.div
      whileHover={hover ? { scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "rounded-xl border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-secondary)]",
        "transition-all duration-300",
        hover &&
          "cursor-pointer hover:border-[var(--card-border,var(--jarvis-border-strong))] hover:shadow-[var(--card-glow,var(--jarvis-glow))]",
        className
      )}
      style={style as React.CSSProperties}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
