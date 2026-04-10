"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { Kpi, KpiHistory } from "@/types";

export function useKpis(departmentId?: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Kpi[]>({
    queryKey: ["kpis", orgId, departmentId],
    queryFn: async () => {
      let query = supabase
        .from("kpis")
        .select("*")
        .order("metric_name");

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (departmentId) {
        query = query.eq("department_id", departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useKpiHistory(kpiId: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<KpiHistory[]>({
    queryKey: ["kpi_history", orgId, kpiId],
    queryFn: async () => {
      let query = supabase
        .from("kpi_history")
        .select("*")
        .eq("kpi_id", kpiId)
        .order("recorded_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: Boolean(kpiId),
  });
}

interface RecordKpiInput {
  readonly kpiId: string;
  readonly value: number;
  readonly recorded_by?: string;
  readonly notes?: string;
}

export function useRecordKpi() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kpiId, value, recorded_by, notes }: RecordKpiInput) => {
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("kpis")
        .update({ current_value: value, measured_at: now })
        .eq("id", kpiId);
      if (updateError) throw updateError;

      const { data, error: insertError } = await supabase
        .from("kpi_history")
        .insert({
          kpi_id: kpiId,
          value,
          recorded_at: now,
          recorded_by: recorded_by ?? null,
          notes: notes ?? null,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      return data as KpiHistory;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({
        queryKey: ["kpi_history", variables.kpiId],
      });
    },
  });
}
