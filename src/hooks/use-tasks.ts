"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/types";

interface TaskFilters {
  readonly status?: TaskStatus;
  readonly department_id?: string;
  readonly assigned_agent_id?: string;
}

export function useTasks(filters?: TaskFilters) {
  const supabase = createClient();

  return useQuery<Task[]>({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.department_id) {
        query = query.eq("department_id", filters.department_id);
      }
      if (filters?.assigned_agent_id) {
        query = query.eq("assigned_agent_id", filters.assigned_agent_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTask(id: string) {
  const supabase = createClient();

  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Task> & { readonly id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
