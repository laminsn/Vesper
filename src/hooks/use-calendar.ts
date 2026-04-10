"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useOrgStore } from "@/stores/org-store";

export interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly event_type: string;
  readonly start_time: string;
  readonly end_time: string | null;
  readonly all_day: boolean;
  readonly location: string | null;
  readonly google_meet_link: string | null;
  readonly google_event_id: string | null;
  readonly google_calendar_synced: boolean;
  readonly department: string | null;
  readonly assigned_agent_id: string | null;
  readonly attendees: readonly { name: string; role?: string; email?: string }[];
  readonly recurrence: string | null;
  readonly status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
  readonly created_by: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export function useCalendarEvents(month?: string) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const now = month ? new Date(month + "-01T00:00:00") : new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar_events", orgId, start, end],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select("*")
        .gte("start_time", start)
        .lte("start_time", end)
        .order("start_time");
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpcomingEvents(limit: number = 10) {
  const supabase = createClient();
  const orgId = useOrgStore((s) => s.currentOrgId);
  const now = new Date().toISOString();

  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar_events_upcoming", orgId, limit],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select("*")
        .gte("start_time", now)
        .eq("status", "scheduled")
        .order("start_time")
        .limit(limit);
      if (orgId) {
        query = query.eq("organization_id", orgId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

interface CreateEventInput {
  readonly title: string;
  readonly description?: string;
  readonly event_type: string;
  readonly start_time: string;
  readonly end_time?: string;
  readonly all_day?: boolean;
  readonly location?: string;
  readonly google_meet_link?: string;
  readonly department?: string;
  readonly assigned_agent_id?: string;
  readonly attendees?: readonly { name: string; role?: string; email?: string }[];
  readonly recurrence?: string;
}

export function useCreateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({ ...input, status: "scheduled" })
        .select()
        .single();
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar_events_upcoming"] });
    },
  });
}

export function useUpdateEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CalendarEvent>) => {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar_events_upcoming"] });
    },
  });
}

export function useDeleteEvent() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar_events_upcoming"] });
    },
  });
}
