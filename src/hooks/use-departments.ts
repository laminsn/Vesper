"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import { getStaticDepartments } from "@/data/empire-data";
import type { Department } from "@/types";

export function useDepartments() {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<Department[]>({
    queryKey: ["departments", orgId],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*")
        .order("name");
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    initialData: () => [...getStaticDepartments(orgId)] as Department[],
    staleTime: 5 * 60_000,
  });
}

export function useDepartment(slug: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const staticDept = getStaticDepartments(orgId).find((d) => d.slug === slug);

  return useQuery<Department>({
    queryKey: ["departments", orgId, slug],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*")
        .eq("slug", slug);
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    },
    initialData: staticDept as Department | undefined,
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}
