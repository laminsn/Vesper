"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface MeetingNote {
  readonly id: string;
  readonly event_id: string;
  readonly note_type: "agenda" | "briefing" | "live_notes" | "summary" | "action_items" | "follow_up" | "recording_transcript";
  readonly title: string;
  readonly body: string;
  readonly author_agent_id: string | null;
  readonly action_items: readonly { task: string; assignee?: string; due?: string; done?: boolean }[];
  readonly created_at: string;
}

export function useMeetingNotes(eventId?: string) {
  const supabase = createClient();

  return useQuery<MeetingNote[]>({
    queryKey: ["meeting_notes", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select("*")
        .eq("event_id", eventId!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

interface CreateNoteInput {
  readonly event_id: string;
  readonly note_type: string;
  readonly title: string;
  readonly body: string;
  readonly author_agent_id?: string;
  readonly action_items?: readonly { task: string; assignee?: string; due?: string }[];
}

export function useCreateMeetingNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as MeetingNote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meeting_notes", variables.event_id] });
    },
  });
}
