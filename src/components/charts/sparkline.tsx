"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = "#06d6a0",
  height = 20,
  width = 60,
  className = "",
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const gradientId = `sparkline-gradient-${color.replace("#", "")}`;

  return (
    <div className={className} style={{ width, height, display: "inline-block" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
