"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Handoff, HandoffExecution } from "@/types";

export function useHandoffs() {
  const supabase = createClient();

  return useQuery<Handoff[]>({
    queryKey: ["handoffs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handoffs")
        .select("*")
        .order("handoff_number");
      if (error) throw error;
      return data;
    },
  });
}

export function useHandoffExecutions() {
  const supabase = createClient();

  return useQuery<HandoffExecution[]>({
    queryKey: ["handoff_executions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handoff_executions")
        .select("*")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
