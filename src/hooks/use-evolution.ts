"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { EvolutionProposal, EvolutionRetrospective } from "@/types";

export function useEvolutionProposals() {
  const supabase = createClient();

  return useQuery<EvolutionProposal[]>({
    queryKey: ["evolution_proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolution_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useEvolutionRetros() {
  const supabase = createClient();

  return useQuery<EvolutionRetrospective[]>({
    queryKey: ["evolution_retrospectives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolution_retrospectives")
        .select("*")
        .order("created_at", { ascending: false });
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
