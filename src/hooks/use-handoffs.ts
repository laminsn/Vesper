"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { Handoff, HandoffExecution } from "@/types";

export function useHandoffs() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Handoff[]>({
    queryKey: ["handoffs", orgId],
    queryFn: async () => {
      let query = supabase
        .from("handoffs")
        .select("*")
        .order("handoff_number");
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useHandoffExecutions() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<HandoffExecution[]>({
    queryKey: ["handoff_executions", orgId],
    queryFn: async () => {
      let query = supabase
        .from("handoff_executions")
        .select("*")
        .order("started_at", { ascending: false });
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
