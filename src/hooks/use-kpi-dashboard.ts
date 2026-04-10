"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";

export interface KpiSparklineData {
  readonly metricName: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly trend: "up" | "down" | "flat" | "unknown";
  readonly unit: string;
  readonly history: readonly number[];
  readonly dates: readonly string[];
}

export function useKpiDashboard(days: number = 30) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<readonly KpiSparklineData[]>({
    queryKey: ["kpi-dashboard", orgId, days],
    queryFn: async () => {
      if (!orgId) return [];

      // Fetch all KPIs for this org
      const { data: kpis, error: kpiError } = await supabase
        .from("kpis")
        .select("*")
        .eq("organization_id", orgId)
        .order("metric_name");
      if (kpiError) throw kpiError;
      if (!kpis || kpis.length === 0) return [];

      // Fetch history for all KPIs in one query
      const kpiIds = kpis.map((k) => k.id);
      const since = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: history, error: histError } = await supabase
        .from("kpi_history")
        .select("kpi_id, value, recorded_at")
        .in("kpi_id", kpiIds)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });
      if (histError) throw histError;

      // Group history by KPI id
      const histByKpi = new Map<string, { value: number; date: string }[]>();
      for (const h of history ?? []) {
        const existing = histByKpi.get(h.kpi_id) ?? [];
        histByKpi.set(h.kpi_id, [
          ...existing,
          {
            value: h.value,
            date: new Date(h.recorded_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          },
        ]);
      }

      return kpis.map((k) => {
        const kpiHistory = histByKpi.get(k.id) ?? [];
        return {
          metricName: k.metric_name,
          currentValue: k.current_value ?? 0,
          targetValue: k.target_value ?? 0,
          trend: (k.trend ?? "unknown") as "up" | "down" | "flat" | "unknown",
          unit: k.unit ?? "",
          history: kpiHistory.map((h) => h.value),
          dates: kpiHistory.map((h) => h.date),
        };
      });
    },
    staleTime: 60_000,
  });
}
