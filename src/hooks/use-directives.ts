"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { Directive, DirectiveStatus } from "@/types";

interface DirectiveFilters {
  readonly status?: DirectiveStatus;
  readonly target_agent_id?: string;
}

export function useDirectives(filters?: DirectiveFilters) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Directive[]>({
    queryKey: ["directives", orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from("directives")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.target_agent_id) {
        query = query.eq("target_agent_id", filters.target_agent_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDirective() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (directive: Partial<Directive>) => {
      const { data, error } = await supabase
        .from("directives")
        .insert(directive)
        .select()
        .single();
      if (error) throw error;
      return data as Directive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directives"] });
    },
  });
}

interface UpdateDirectiveInput {
  readonly id: string;
  readonly status?: DirectiveStatus;
  readonly response?: string;
  readonly acknowledged_at?: string;
  readonly completed_at?: string;
}

export function useUpdateDirective() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDirectiveInput) => {
      const { data, error } = await supabase
        .from("directives")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Directive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directives"] });
    },
  });
}
