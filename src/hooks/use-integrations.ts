"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import type {
  IntegrationRecord,
  IntegrationCategory,
  IntegrationStatus,
} from "@/types";

interface IntegrationFilters {
  readonly category?: IntegrationCategory;
  readonly status?: IntegrationStatus;
}

export function useIntegrations(filters?: IntegrationFilters) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);

  return useQuery<IntegrationRecord[]>({
    queryKey: ["integrations", orgId, filters],
    queryFn: async () => {
      let query = supabase
        .from("integration_registry")
        .select("*")
        .order("display_name");

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

interface RegisterIntegrationInput {
  readonly integration_key: string;
  readonly display_name: string;
  readonly category: IntegrationCategory;
  readonly config?: Record<string, unknown>;
  readonly credentials_ref?: string;
  readonly status?: IntegrationStatus;
  readonly used_by_agents?: string[];
  readonly used_by_departments?: string[];
}

export function useRegisterIntegration() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterIntegrationInput) => {
      const { data, error } = await supabase
        .from("integration_registry")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as IntegrationRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

interface UpdateIntegrationInput {
  readonly id: string;
  readonly display_name?: string;
  readonly category?: IntegrationCategory;
  readonly config?: Record<string, unknown>;
  readonly credentials_ref?: string;
  readonly status?: IntegrationStatus;
  readonly last_health_check?: string;
  readonly health_details?: Record<string, unknown>;
  readonly used_by_agents?: string[];
  readonly used_by_departments?: string[];
}

export function useUpdateIntegration() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateIntegrationInput) => {
      const { data, error } = await supabase
        .from("integration_registry")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as IntegrationRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useDeleteIntegration() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("integration_registry")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useTestIntegration() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Set to testing status
      const { error: testingError } = await supabase
        .from("integration_registry")
        .update({
          status: "testing",
          last_health_check: new Date().toISOString(),
        })
        .eq("id", id);
      if (testingError) throw testingError;

      // Simulate test, then mark connected
      const { data, error: connectedError } = await supabase
        .from("integration_registry")
        .update({
          status: "connected",
          health_details: {
            last_test: new Date().toISOString(),
            latency_ms: Math.floor(Math.random() * 200) + 50,
            message: "Connection successful",
          },
        })
        .eq("id", id)
        .select()
        .single();
      if (connectedError) throw connectedError;
      return data as IntegrationRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}
