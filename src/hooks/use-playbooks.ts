"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type { Playbook, PlaybookExecution } from "@/types";

export function usePlaybooks() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Playbook[]>({
    queryKey: ["playbooks", orgId],
    queryFn: async () => {
      let query = supabase
        .from("playbooks")
        .select("*")
        .order("play_number");
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

export function usePlaybookExecutions(playbookId?: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<PlaybookExecution[]>({
    queryKey: ["playbook_executions", orgId, playbookId],
    queryFn: async () => {
      let query = supabase
        .from("playbook_executions")
        .select("*")
        .order("started_at", { ascending: false });

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (playbookId) {
        query = query.eq("playbook_id", playbookId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

interface ExecutePlaybookInput {
  readonly playbook_id: string;
  readonly triggered_by: string;
  readonly context?: Record<string, unknown>;
}

export function useExecutePlaybook() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExecutePlaybookInput) => {
      const { data, error } = await supabase
        .from("playbook_executions")
        .insert({
          playbook_id: input.playbook_id,
          triggered_by: input.triggered_by,
          status: "running",
          current_step: 1,
          step_statuses: [],
          context: input.context ?? {},
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as PlaybookExecution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_executions"] });
    },
  });
}
