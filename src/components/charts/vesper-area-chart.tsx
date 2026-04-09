"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface VesperAreaChartProps {
  data: Array<Record<string, string | number>>;
  areas: Array<{ key: string; color: string; label: string }>;
  title?: string;
  height?: number;
  stacked?: boolean;
  className?: string;
}

function VesperAreaTooltip({
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

export function VesperAreaChart({
  data,
  areas,
  title,
  height = 300,
  stacked = false,
  className = "",
}: VesperAreaChartProps) {
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
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={`gradient-${area.key}`}
                id={`area-gradient-${area.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={area.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--jarvis-border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--jarvis-border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--jarvis-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<VesperAreaTooltip />} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
            formatter={(value: string) => (
              <span style={{ color: "var(--jarvis-text-secondary)" }}>{value}</span>
            )}
          />
          {areas.map((area) => (
            <Area
              key={area.key}
              type="monotone"
              dataKey={area.key}
              name={area.label}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#area-gradient-${area.key})`}
              stackId={stacked ? "stack" : undefined}
              animationDuration={1000}
              animationBegin={0}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
