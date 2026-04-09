"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/types";

export function useDepartments() {
  const supabase = createClient();

  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useDepartment(slug: string) {
  const supabase = createClient();

  return useQuery<Department>({
    queryKey: ["departments", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(slug),
  });
}
