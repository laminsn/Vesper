"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";

export interface ContentVaultItem {
  readonly id: string;
  readonly source_type: string;
  readonly source_url: string | null;
  readonly source_title: string;
  readonly content_type: string;
  readonly body: string;
  readonly speaker: string | null;
  readonly timestamp_start: string | null;
  readonly timestamp_end: string | null;
  readonly thumbnail_url: string | null;
  readonly tags: readonly string[];
  readonly viral_potential: "low" | "medium" | "high" | "viral";
  readonly post_status: "extracted" | "drafted" | "approved" | "scheduled" | "posted" | "archived";
  readonly platform_target: string | null;
  readonly visual_treatment: string | null;
  readonly department: string | null;
  readonly extracted_by_agent_id: string | null;
  readonly created_at: string;
}

interface VaultFilters {
  readonly content_type?: string;
  readonly source_type?: string;
  readonly post_status?: string;
  readonly viral_potential?: string;
}

export function useContentVault(filters?: VaultFilters) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<ContentVaultItem[]>({
    queryKey: ["content_vault", orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from("content_vault")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (filters?.content_type) query = query.eq("content_type", filters.content_type);
      if (filters?.source_type) query = query.eq("source_type", filters.source_type);
      if (filters?.post_status) query = query.eq("post_status", filters.post_status);
      if (filters?.viral_potential) query = query.eq("viral_potential", filters.viral_potential);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

interface CreateVaultInput {
  readonly source_type: string;
  readonly source_url?: string;
  readonly source_title: string;
  readonly content_type: string;
  readonly body: string;
  readonly speaker?: string;
  readonly timestamp_start?: string;
  readonly timestamp_end?: string;
  readonly thumbnail_url?: string;
  readonly tags?: readonly string[];
  readonly viral_potential?: string;
  readonly platform_target?: string;
  readonly visual_treatment?: string;
  readonly department?: string;
}

export function useCreateVaultItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVaultInput) => {
      const { data, error } = await supabase
        .from("content_vault")
        .insert({ ...input, post_status: "extracted" })
        .select()
        .single();
      if (error) throw error;
      return data as ContentVaultItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_vault"] });
    },
  });
}

export function useUpdateVaultItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ContentVaultItem>) => {
      const { data, error } = await supabase
        .from("content_vault")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ContentVaultItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_vault"] });
    },
  });
}
