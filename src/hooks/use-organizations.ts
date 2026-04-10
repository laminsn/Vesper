"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/types";

export function useOrganizations() {
  const supabase = createClient();

  return useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // orgs rarely change — cache 5 min
  });
}

export function useOrganization(slug: string) {
  const supabase = createClient();

  return useQuery<Organization>({
    queryKey: ["organizations", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(slug),
  });
}
