-- =============================================================================
-- Migration 004: Calendar Events & Meeting Notes
-- =============================================================================
-- Calendar events with Google Calendar sync support, meeting notes with
-- agendas, briefings, summaries, and action items.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  description           TEXT,
  event_type            TEXT NOT NULL CHECK (event_type IN (
    'meeting', 'appointment', 'follow_up', 'standup', 'review',
    'training', 'deadline', 'idt', 'briefing', 'call'
  )),
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ,
  all_day               BOOLEAN DEFAULT false,
  location              TEXT,
  google_meet_link      TEXT,
  google_event_id       TEXT,
  google_calendar_synced BOOLEAN DEFAULT false,
  department            TEXT,
  assigned_agent_id     UUID REFERENCES public.agents(id),
  attendees             JSONB DEFAULT '[]',
  recurrence            TEXT,
  status                TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
  )),
  created_by            TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  note_type         TEXT NOT NULL CHECK (note_type IN (
    'agenda', 'briefing', 'live_notes', 'summary', 'action_items', 'follow_up', 'recording_transcript'
  )),
  title             TEXT NOT NULL,
  body              TEXT NOT NULL,
  author_agent_id   UUID REFERENCES public.agents(id),
  action_items      JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_delete" ON public.calendar_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.meeting_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON public.meeting_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public.meeting_notes FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_calendar_events_start ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_dept ON public.calendar_events(department);
CREATE INDEX idx_calendar_events_agent ON public.calendar_events(assigned_agent_id);
CREATE INDEX idx_calendar_events_google ON public.calendar_events(google_event_id);
CREATE INDEX idx_meeting_notes_event ON public.meeting_notes(event_id);

-- Updated_at trigger
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
