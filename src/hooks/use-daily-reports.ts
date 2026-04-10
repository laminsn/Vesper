"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";

export interface DailyReport {
  readonly id: string;
  readonly report_date: string;
  readonly department: string;
  readonly submitted_by_agent_id: string | null;
  readonly report_type: string;
  readonly title: string;
  readonly body: string;
  readonly metrics: Record<string, unknown>;
  readonly status: "draft" | "submitted" | "reviewed" | "acknowledged";
  readonly reviewed_by: string | null;
  readonly reviewed_at: string | null;
  readonly created_at: string;
}

export function useDailyReports(date?: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const targetDate = date ?? new Date().toISOString().split("T")[0];

  return useQuery<DailyReport[]>({
    queryKey: ["daily_reports", orgId, targetDate],
    queryFn: async () => {
      let query = supabase
        .from("daily_reports")
        .select("*")
        .eq("report_date", targetDate)
        .order("created_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllRecentReports(days: number = 7) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  return useQuery<DailyReport[]>({
    queryKey: ["daily_reports_recent", orgId, days],
    queryFn: async () => {
      let query = supabase
        .from("daily_reports")
        .select("*")
        .gte("report_date", sinceStr)
        .order("created_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

interface CreateReportInput {
  readonly report_date?: string;
  readonly department: string;
  readonly submitted_by_agent_id?: string;
  readonly report_type: string;
  readonly title: string;
  readonly body: string;
  readonly metrics?: Record<string, unknown>;
}

export function useCreateDailyReport() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          ...input,
          report_date: input.report_date ?? new Date().toISOString().split("T")[0],
          status: "submitted",
        })
        .select()
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_reports"] });
    },
  });
}

export function useReviewReport() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reviewedBy }: { id: string; reviewedBy: string }) => {
      const { data, error } = await supabase
        .from("daily_reports")
        .update({
          status: "reviewed",
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as DailyReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_reports"] });
    },
  });
}
