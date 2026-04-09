"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface VesperPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
  donut?: boolean;
  centerLabel?: string;
  height?: number;
  className?: string;
}

function VesperPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number; color: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
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
          color: entry.payload.color,
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {entry.payload.name}: {entry.value.toLocaleString()}
      </p>
    </div>
  );
}

export function VesperPieChart({
  data,
  title,
  donut = false,
  centerLabel,
  height = 300,
  className = "",
}: VesperPieChartProps) {
  const innerRadius = donut ? "55%" : 0;
  const outerRadius = "80%";

  return (
    <div className={className} style={{ position: "relative" }}>
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
        <PieChart>
          <Pie
            data={data}
            cx="45%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.3))" }}
              />
            ))}
          </Pie>
          <Tooltip content={<VesperPieTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: "12px", paddingLeft: "10px" }}
            formatter={(value: string) => (
              <span style={{ color: "var(--jarvis-text-secondary)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {donut && centerLabel && (
        <div
          style={{
            position: "absolute",
            top: title ? "calc(50% + 14px)" : "50%",
            left: "45%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: "var(--jarvis-text-primary)",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            {centerLabel}
          </span>
        </div>
      )}
    </div>
  );
}
