"use client";

import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface HexItem {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly status: "active" | "executing" | "idle" | "offline";
}

interface HexGridProps {
  readonly items: readonly HexItem[];
  readonly onItemClick?: (id: string) => void;
  readonly className?: string;
}

const HEX_WIDTH = 52;
const HEX_HEIGHT = 60;
const HEX_GAP_X = 4;
const HEX_GAP_Y = 4;

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

function getInitials(label: string): string {
  return label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusOpacity(status: string): number {
  switch (status) {
    case "active": return 1;
    case "executing": return 0.85;
    case "idle": return 0.5;
    case "offline": return 0.25;
    default: return 0.25;
  }
}

function HexCell({
  item,
  style,
  onClick,
}: {
  item: HexItem;
  style: React.CSSProperties;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      className="absolute transition-transform duration-200 cursor-pointer"
      style={{
        ...style,
        transform: hovered ? "scale(1.12)" : "scale(1)",
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      title={item.label}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: HEX_WIDTH,
          height: HEX_HEIGHT,
          clipPath: HEX_CLIP,
          background: `${item.color}${Math.round(statusOpacity(item.status) * 40).toString(16).padStart(2, "0")}`,
          border: "none",
          position: "relative",
        }}
      >
        {/* Inner border hex */}
        <div
          className="absolute inset-[1px]"
          style={{
            clipPath: HEX_CLIP,
            background: "var(--jarvis-bg-secondary)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <span
            className="font-mono font-bold text-xs leading-none"
            style={{
              color: item.color,
              opacity: statusOpacity(item.status),
            }}
          >
            {getInitials(item.label)}
          </span>
          {item.status === "active" && (
            <span
              className="w-1.5 h-1.5 rounded-full mt-1"
              style={{
                background: item.color,
                boxShadow: `0 0 6px ${item.color}`,
              }}
            />
          )}
        </div>
      </div>

      {/* Tooltip on hover */}
      {hovered && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20"
          style={{
            background: "var(--jarvis-bg-elevated)",
            border: `1px solid ${item.color}40`,
            fontSize: 10,
            color: "var(--jarvis-text-primary)",
            boxShadow: `0 0 12px ${item.color}20`,
          }}
        >
          {item.label}
        </div>
      )}
    </div>
  );
}

export function HexGrid({ items, onItemClick, className }: HexGridProps) {
  const cols = Math.ceil(Math.sqrt(items.length * 1.5));

  const positions = items.map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const offsetX = row % 2 === 1 ? (HEX_WIDTH + HEX_GAP_X) / 2 : 0;
    return {
      left: col * (HEX_WIDTH + HEX_GAP_X) + offsetX,
      top: row * (HEX_HEIGHT * 0.75 + HEX_GAP_Y),
    };
  });

  const maxLeft = Math.max(...positions.map((p) => p.left)) + HEX_WIDTH;
  const maxTop = Math.max(...positions.map((p) => p.top)) + HEX_HEIGHT;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: maxLeft, height: maxTop }}
    >
      {items.map((item, i) => (
        <HexCell
          key={item.id}
          item={item}
          style={{ left: positions[i].left, top: positions[i].top }}
          onClick={onItemClick ? () => onItemClick(item.id) : undefined}
        />
      ))}
    </div>
  );
}
