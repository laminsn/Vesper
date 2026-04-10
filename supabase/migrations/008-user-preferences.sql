-- =============================================================================
-- Migration 008: User Preferences & Profile
-- =============================================================================
-- User notification delivery preferences, profile info, and avatar.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name          TEXT,
  avatar_url            TEXT,
  phone                 TEXT,
  timezone              TEXT DEFAULT 'America/New_York',
  language              TEXT DEFAULT 'en',
  notification_channels JSONB DEFAULT '{"app": true, "email": false, "whatsapp": false, "telegram": false, "slack": false}',
  notification_email    TEXT,
  notification_phone    TEXT,
  telegram_chat_id      TEXT,
  slack_webhook_url     TEXT,
  whatsapp_phone        TEXT,
  notification_types    JSONB DEFAULT '{"sla_warnings": true, "task_completions": true, "directive_updates": true, "daily_reports": true, "agent_status": true, "hipaa_alerts": true, "playbook_executions": true, "financial_reports": false}',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users_write_own" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);

-- Add allowed_departments to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS allowed_departments JSONB DEFAULT '[]';

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
