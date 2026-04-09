"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

export interface VesperScatterChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  sizeKey?: string;
  colorKey?: string;
  title?: string;
  height?: number;
  className?: string;
}

function VesperScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--jarvis-bg-secondary)",
        border: "1px solid var(--jarvis-accent-2)",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(0, 180, 216, 0.2)",
      }}
    >
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            color: "var(--jarvis-text-primary)",
            fontSize: "13px",
            margin: "2px 0",
          }}
        >
          <span style={{ color: "var(--jarvis-text-muted)" }}>{entry.name}:</span>{" "}
          {typeof entry.value === "number"
            ? entry.value.toLocaleString()
            : entry.value}
        </p>
      ))}
    </div>
  );
}

export function VesperScatterChart({
  data,
  xKey,
  yKey,
  sizeKey,
  title,
  height = 300,
  className = "",
}: VesperScatterChartProps) {
  return (
    <div className={className}>
      {title && (
        <h3
          style={{
            color: "var(--jarvis-text-primary)",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--jarvis-border)"
          />
          <XAxis
            dataKey={xKey}
            name={xKey}
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--jarvis-border)" }}
            tickLine={false}
          />
          <YAxis
            dataKey={yKey}
            name={yKey}
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {sizeKey && (
            <ZAxis dataKey={sizeKey} range={[40, 400]} name={sizeKey} />
          )}
          <Tooltip content={<VesperScatterTooltip />} />
          <Scatter
            data={data}
            fill="#06d6a0"
            fillOpacity={0.7}
            stroke="#06d6a0"
            strokeOpacity={0.3}
            strokeWidth={4}
            animationDuration={800}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
