"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface VesperBarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  bars: Array<{ key: string; color: string; label: string }>;
  title?: string;
  height?: number;
  className?: string;
}

function VesperBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
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
      <p
        style={{
          color: "var(--jarvis-text-secondary)",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            color: entry.color,
            fontSize: "13px",
            fontWeight: 600,
            margin: "2px 0",
          }}
        >
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function VesperBarChart({
  data,
  xKey,
  bars,
  title,
  height = 300,
  className = "",
}: VesperBarChartProps) {
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
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            {bars.map((bar) => (
              <filter
                key={`glow-${bar.key}`}
                id={`bar-glow-${bar.key}`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor={bar.color} floodOpacity="0.3" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--jarvis-border)"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--jarvis-border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<VesperBarTooltip />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
            formatter={(value: string) => (
              <span style={{ color: "var(--jarvis-text-secondary)" }}>{value}</span>
            )}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.label}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
              filter={`url(#bar-glow-${bar.key})`}
              animationDuration={800}
              animationBegin={0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
