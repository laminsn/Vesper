"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { Agent, AgentStatus } from "@/types";

export function useAgents() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Agent[]>({
    queryKey: ["agents", orgId],
    queryFn: async () => {
      let query = supabase
        .from("agents")
        .select("*")
        .order("department")
        .order("name");
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAgent(slug: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Agent>({
    queryKey: ["agents", orgId, slug],
    queryFn: async () => {
      let query = supabase
        .from("agents")
        .select("*")
        .eq("slug", slug);
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(slug),
  });
}

export function useAgentsByDepartment(dept: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Agent[]>({
    queryKey: ["agents", orgId, "department", dept],
    queryFn: async () => {
      let query = supabase
        .from("agents")
        .select("*")
        .eq("department", dept)
        .order("name");
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: Boolean(dept),
  });
}

interface UpdateAgentStatusInput {
  readonly agentId: string;
  readonly status: AgentStatus;
}

export function useUpdateAgentStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, status }: UpdateAgentStatusInput) => {
      const { data, error } = await supabase
        .from("agents")
        .update({ status, last_seen_at: new Date().toISOString() })
        .eq("id", agentId)
        .select()
        .single();
      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
