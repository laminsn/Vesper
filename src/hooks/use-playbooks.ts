"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Playbook, PlaybookExecution } from "@/types";

export function usePlaybooks() {
  const supabase = createClient();

  return useQuery<Playbook[]>({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .order("play_number");
      if (error) throw error;
      return data;
    },
  });
}

export function usePlaybookExecutions(playbookId?: string) {
  const supabase = createClient();

  return useQuery<PlaybookExecution[]>({
    queryKey: ["playbook_executions", playbookId],
    queryFn: async () => {
      let query = supabase
        .from("playbook_executions")
        .select("*")
        .order("started_at", { ascending: false });

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
