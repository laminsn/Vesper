"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const TABLE_TO_QUERY_KEYS: Record<string, string[][]> = {
  agents: [["agents"]],
  departments: [["departments"]],
  tasks: [["tasks"]],
  task_comments: [["tasks"]],
  kpis: [["kpis"]],
  kpi_history: [["kpis"], ["kpi_history"]],
  playbooks: [["playbooks"]],
  playbook_executions: [["playbook_executions"]],
  handoffs: [["handoffs"]],
  handoff_executions: [["handoff_executions"]],
  directives: [["directives"]],
  agent_communications: [["agent_communications"]],
  evolution_proposals: [["evolution_proposals"]],
  evolution_retrospectives: [["evolution_retrospectives"]],
  user_roles: [["user_roles"]],
  user_invites: [["user_invites"]],
};

// Single Supabase client instance — prevents creating a new client (and WebSocket)
// on every render, which was the root cause of the memory leak.
const supabase = createClient();

export function useRealtimeSubscription(
  table: string,
  callback?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const queryClient = useQueryClient();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const queryKeys = TABLE_TO_QUERY_KEYS[table] ?? [[table]];
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }

          callbackRef.current?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient]);
}
