"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import type { AgentCommunication } from "@/types";

export interface ChatMessage {
  readonly id: string;
  readonly type: "directive" | "response" | "status_update" | "system";
  readonly from: "user" | string;
  readonly to: "user" | string;
  readonly content: string;
  readonly timestamp: string;
  readonly status: "sent" | "delivered" | "read" | "pending";
}

function commToMessage(comm: AgentCommunication, agentId: string): ChatMessage {
  const isFromAgent = comm.from_agent_id === agentId;
  return {
    id: comm.id,
    type: (comm.message_type ?? "directive") as ChatMessage["type"],
    from: isFromAgent ? (comm.from_agent_id ?? "agent") : "user",
    to: isFromAgent ? "user" : (comm.to_agent_id ?? "agent"),
    content: comm.body,
    timestamp: comm.created_at,
    status: comm.read_at ? "read" : "delivered",
  };
}

export function useAgentChat(agentId: string | null) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const queryClient = useQueryClient();

  useRealtimeSubscription("agent_communications");

  const messagesQuery = useQuery<readonly ChatMessage[]>({
    queryKey: ["agent-chat", orgId, agentId],
    queryFn: async () => {
      if (!agentId) return [];

      let query = supabase
        .from("agent_communications")
        .select("*")
        .or(`from_agent_id.eq.${agentId},to_agent_id.eq.${agentId}`)
        .order("created_at", { ascending: true });

      if (orgId) {
        query = query.eq("organization_id", orgId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((c: AgentCommunication) => commToMessage(c, agentId));
    },
    enabled: Boolean(agentId),
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!agentId) throw new Error("No agent selected");

      const { data, error } = await supabase
        .from("agent_communications")
        .insert({
          to_agent_id: agentId,
          to_department: null,
          message_type: "directive" as const,
          subject: null,
          body: content,
          priority: "normal",
          organization_id: orgId,
          metadata: {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agent-chat", orgId, agentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["agent_communications"],
      });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}
