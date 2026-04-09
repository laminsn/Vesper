import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface AuditEntry {
  readonly action: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly description?: string;
  readonly phiAccessed?: boolean;
  readonly riskLevel?: RiskLevel;
  readonly metadata?: Record<string, unknown>;
}

interface AuditLogRow {
  readonly id: string;
  readonly user_id: string;
  readonly org_id: string | null;
  readonly action: string;
  readonly details: string | null;
  readonly ip_address: string | null;
  readonly metadata: Record<string, unknown>;
  readonly created_at: string;
}

const AUDIT_QUERY_KEY = "audit-log";

/**
 * Hook for writing to and reading from the HIPAA audit log.
 * Wraps the Supabase audit_log table with typed helpers and
 * uses TanStack Query for caching reads.
 *
 * Usage:
 *   const { logAction, logPhiAccess, logAuthEvent, recentLogs } = useAuditLog();
 *   await logAction({ action: "task.create", resourceType: "task", resourceId: "123" });
 *   await logPhiAccess("patient_record", "rec-456", "Viewed patient chart");
 */
export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logAction = useCallback(
    async (entry: AuditEntry) => {
      if (!user) return;

      try {
        const supabase = createClient();
        const details = [
          entry.description,
          entry.resourceType ? `resource_type=${entry.resourceType}` : null,
          entry.resourceId ? `resource_id=${entry.resourceId}` : null,
          entry.phiAccessed ? "phi_accessed=true" : null,
          entry.riskLevel ? `risk_level=${entry.riskLevel}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("audit_log").insert({
          user_id: user.id,
          org_id: null,
          action: entry.action,
          details: details || null,
          ip_address: null,
          metadata: {
            ...entry.metadata,
            phi_accessed: entry.phiAccessed ?? false,
            risk_level: entry.riskLevel ?? "low",
            resource_type: entry.resourceType ?? null,
            resource_id: entry.resourceId ?? null,
          },
        });

        // Invalidate cache so reads pick up the new entry
        queryClient.invalidateQueries({ queryKey: [AUDIT_QUERY_KEY] });
      } catch (err) {
        // Audit logging should never break the app
        // eslint-disable-next-line no-console
        console.error("Audit log write failed:", err);
      }
    },
    [user, queryClient]
  );

  const logPhiAccess = useCallback(
    async (resourceType: string, resourceId: string, description: string) => {
      await logAction({
        action: "phi.access",
        resourceType,
        resourceId,
        description,
        phiAccessed: true,
        riskLevel: "high",
      });
    },
    [logAction]
  );

  const logAuthEvent = useCallback(
    async (
      eventType: "login" | "logout" | "signup" | "password_reset",
      success: boolean
    ) => {
      await logAction({
        action: `auth.${eventType}`,
        resourceType: "user",
        description: `${eventType} ${success ? "succeeded" : "failed"}`,
        riskLevel: success ? "low" : "medium",
        metadata: { success },
      });
    },
    [logAction]
  );

  const logAgentExecution = useCallback(
    async (agentId: string, taskDescription: string, zone: string) => {
      await logAction({
        action: "agent.invoke",
        resourceType: "agent",
        resourceId: agentId,
        description: taskDescription,
        phiAccessed: zone === "clinical",
        riskLevel: zone === "clinical" ? "high" : "low",
        metadata: { zone },
      });
    },
    [logAction]
  );

  // -- Query: Recent logs ---------------------------------------------------

  const recentLogsQuery = useQuery<readonly AuditLogRow[]>({
    queryKey: [AUDIT_QUERY_KEY, "recent"],
    queryFn: async () => {
      if (!user) return [];
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as AuditLogRow[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  // -- Query: Logs by action ------------------------------------------------

  const getLogsByAction = useCallback(
    (action: string) => ({
      queryKey: [AUDIT_QUERY_KEY, "by-action", action],
      queryFn: async () => {
        if (!user) return [];
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("audit_log")
          .select("*")
          .eq("action", action)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return (data ?? []) as AuditLogRow[];
      },
      enabled: !!user,
      staleTime: 30_000,
    }),
    [user]
  );

  return {
    logAction,
    logPhiAccess,
    logAuthEvent,
    logAgentExecution,
    recentLogs: recentLogsQuery.data ?? [],
    recentLogsLoading: recentLogsQuery.isLoading,
    getLogsByAction,
  };
}
