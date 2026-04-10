"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface UserPreferences {
  readonly id: string;
  readonly user_id: string;
  readonly display_name: string | null;
  readonly avatar_url: string | null;
  readonly phone: string | null;
  readonly timezone: string;
  readonly language: string;
  readonly notification_channels: {
    app: boolean;
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
    slack: boolean;
  };
  readonly notification_email: string | null;
  readonly notification_phone: string | null;
  readonly telegram_chat_id: string | null;
  readonly slack_webhook_url: string | null;
  readonly whatsapp_phone: string | null;
  readonly notification_types: Record<string, boolean>;
  readonly created_at: string;
  readonly updated_at: string;
}

export function usePreferences() {
  const supabase = createClient();

  return useQuery<UserPreferences | null>({
    queryKey: ["user_preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // No preferences yet — create default
        const { data: created } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id })
          .select()
          .single();
        return created as UserPreferences | null;
      }

      if (error) throw error;
      return data as UserPreferences;
    },
  });
}

export function useUpdatePreferences() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_preferences"] });
    },
  });
}
