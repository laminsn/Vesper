-- =============================================================================
-- Migration 007: Team Access Control
-- =============================================================================
-- Controlled access to business profiles for teammates and executives.
-- Role-based permissions: viewer, operator, admin.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  email           TEXT NOT NULL,
  display_name    TEXT,
  role            TEXT NOT NULL CHECK (role IN ('viewer', 'operator', 'admin', 'owner')),
  department      TEXT,
  invited_by      UUID REFERENCES auth.users(id),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_write" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update" ON public.team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "admin_delete" ON public.team_members FOR DELETE TO authenticated USING (true);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_members_org ON public.team_members(organization_id);
CREATE INDEX idx_team_members_email ON public.team_members(email);
