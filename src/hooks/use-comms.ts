"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { AgentCommunication, MessageType } from "@/types";

interface CommsFilters {
  readonly from_agent_id?: string;
  readonly message_type?: MessageType;
}

export function useAgentComms(filters?: CommsFilters) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<AgentCommunication[]>({
    queryKey: ["agent_communications", orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from("agent_communications")
        .select("*")
        .order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (filters?.from_agent_id) {
        query = query.eq("from_agent_id", filters.from_agent_id);
      }
      if (filters?.message_type) {
        query = query.eq("message_type", filters.message_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateComm() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comm: Partial<AgentCommunication>) => {
      const { data, error } = await supabase
        .from("agent_communications")
        .insert(comm)
        .select()
        .single();
      if (error) throw error;
      return data as AgentCommunication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agent_communications"],
      });
    },
  });
}
