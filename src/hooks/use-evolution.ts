"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { EvolutionProposal, EvolutionRetrospective } from "@/types";

export function useEvolutionProposals() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<EvolutionProposal[]>({
    queryKey: ["evolution_proposals", orgId],
    queryFn: async () => {
      let query = supabase
        .from("evolution_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60_000,
    initialData: [],
  });
}

export function useEvolutionRetros() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<EvolutionRetrospective[]>({
    queryKey: ["evolution_retrospectives", orgId],
    queryFn: async () => {
      let query = supabase
        .from("evolution_retrospectives")
        .select("*")
        .order("created_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProposal() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: Partial<EvolutionProposal>) => {
      const { data, error } = await supabase
        .from("evolution_proposals")
        .insert(proposal)
        .select()
        .single();
      if (error) throw error;
      return data as EvolutionProposal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["evolution_proposals"],
      });
    },
  });
}
