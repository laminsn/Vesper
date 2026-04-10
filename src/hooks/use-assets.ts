"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Asset {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly asset_type: string;
  readonly file_url: string | null;
  readonly thumbnail_url: string | null;
  readonly mime_type: string | null;
  readonly file_size_bytes: number | null;
  readonly department: string | null;
  readonly created_by_agent_id: string | null;
  readonly approval_status: "pending" | "approved" | "rejected" | "revision_needed" | "exported";
  readonly approved_by: string | null;
  readonly approved_at: string | null;
  readonly rejection_reason: string | null;
  readonly export_destination: string | null;
  readonly google_drive_id: string | null;
  readonly tags: readonly string[];
  readonly metadata: Record<string, unknown>;
  readonly created_at: string;
}

export function useAssets(filters?: { asset_type?: string; approval_status?: string }) {
  const supabase = createClient();
  return useQuery<Asset[]>({
    queryKey: ["assets", filters],
    queryFn: async () => {
      let query = supabase.from("assets").select("*").order("created_at", { ascending: false });
      if (filters?.asset_type) query = query.eq("asset_type", filters.asset_type);
      if (filters?.approval_status) query = query.eq("approval_status", filters.approval_status);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useApproveAsset() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
      const { data, error } = await supabase
        .from("assets")
        .update({ approval_status: "approved", approved_by: approvedBy, approved_at: new Date().toISOString() })
        .eq("id", id).select().single();
      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); },
  });
}

export function useRejectAsset() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from("assets")
        .update({ approval_status: "rejected", rejection_reason: reason })
        .eq("id", id).select().single();
      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); },
  });
}

export function useCreateAsset() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Asset>) => {
      const { data, error } = await supabase.from("assets").insert({ ...input, approval_status: "pending" }).select().single();
      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); },
  });
}
