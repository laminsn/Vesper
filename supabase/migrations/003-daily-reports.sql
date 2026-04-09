-- =============================================================================
-- Migration 003: Daily Reports Table
-- =============================================================================
-- Stores daily communications, briefs, and status reports from agents/departments.
-- Reports flow up the hierarchy: specialists → directors → Diane → Lamin.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  department      TEXT NOT NULL,
  submitted_by_agent_id UUID REFERENCES public.agents(id),
  report_type     TEXT NOT NULL CHECK (report_type IN (
    'morning_brief', 'end_of_day', 'standup', 'escalation',
    'weekly_summary', 'clinical_review', 'compliance_check',
    'financial_update', 'recruitment_update', 'marketing_update'
  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  metrics         JSONB DEFAULT '{}',
  status          TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'acknowledged')),
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read" ON public.daily_reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_write" ON public.daily_reports
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "owner_update" ON public.daily_reports
  FOR UPDATE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date);
CREATE INDEX idx_daily_reports_dept ON public.daily_reports(department);
CREATE INDEX idx_daily_reports_type ON public.daily_reports(report_type);
CREATE INDEX idx_daily_reports_agent ON public.daily_reports(submitted_by_agent_id);
