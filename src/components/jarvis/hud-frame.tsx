"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HudFrameProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly color?: string;
  readonly className?: string;
}

const CORNER_SIZE = 20;
const CORNER_STROKE = 1.5;

function Corner({ position, color }: { position: string; color: string }) {
  const isTop = position.includes("top");
  const isLeft = position.includes("left");

  const animationName = `hud-corner-${position}`;
  const translateX = isLeft ? "-12px" : "12px";
  const translateY = isTop ? "-12px" : "12px";

  return (
    <svg
      width={CORNER_SIZE}
      height={CORNER_SIZE}
      className={cn(
        "absolute",
        isTop ? "top-0" : "bottom-0",
        isLeft ? "left-0" : "right-0"
      )}
      style={{
        animation: `${animationName} 0.6s ease-out forwards`,
      }}
    >
      <path
        d={
          isTop && isLeft
            ? `M 0 ${CORNER_SIZE} L 0 0 L ${CORNER_SIZE} 0`
            : isTop && !isLeft
            ? `M 0 0 L ${CORNER_SIZE} 0 L ${CORNER_SIZE} ${CORNER_SIZE}`
            : !isTop && isLeft
            ? `M 0 0 L 0 ${CORNER_SIZE} L ${CORNER_SIZE} ${CORNER_SIZE}`
            : `M ${CORNER_SIZE} 0 L ${CORNER_SIZE} ${CORNER_SIZE} L 0 ${CORNER_SIZE}`
        }
        fill="none"
        stroke={color}
        strokeWidth={CORNER_STROKE}
        strokeLinecap="square"
      />
      <style jsx>{`
        @keyframes ${animationName} {
          from {
            opacity: 0;
            transform: translate(${translateX}, ${translateY});
          }
          to {
            opacity: 1;
            transform: translate(0, 0);
          }
        }
      `}</style>
    </svg>
  );
}

export function HudFrame({
  children,
  title,
  color = "var(--jarvis-accent)",
  className,
}: HudFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {title && (
        <span
          className="font-mono uppercase tracking-widest text-[10px] mb-2 block"
          style={{ color }}
        >
          {title}
        </span>
      )}
      <div
        className="relative p-4"
        style={{
          border: `1px solid ${color}15`,
        }}
      >
        <Corner position="top-left" color={color} />
        <Corner position="top-right" color={color} />
        <Corner position="bottom-left" color={color} />
        <Corner position="bottom-right" color={color} />
        {children}
      </div>
    </div>
  );
}
