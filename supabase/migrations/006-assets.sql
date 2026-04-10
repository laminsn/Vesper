-- =============================================================================
-- Migration 006: Asset Library
-- =============================================================================
-- Created assets (images, docs, spreadsheets, presentations, videos) with
-- approval workflow and Google Drive export capability.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  asset_type        TEXT NOT NULL CHECK (asset_type IN (
    'image', 'document', 'spreadsheet', 'presentation', 'video',
    'pdf', 'design', 'template', 'report', 'other'
  )),
  file_url          TEXT,
  thumbnail_url     TEXT,
  mime_type         TEXT,
  file_size_bytes   INTEGER,
  department        TEXT,
  created_by_agent_id UUID REFERENCES public.agents(id),
  approval_status   TEXT DEFAULT 'pending' CHECK (approval_status IN (
    'pending', 'approved', 'rejected', 'revision_needed', 'exported'
  )),
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  export_destination TEXT,
  google_drive_id   TEXT,
  tags              JSONB DEFAULT '[]',
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON public.assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public.assets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_delete" ON public.assets FOR DELETE TO authenticated USING (true);
CREATE INDEX idx_assets_type ON public.assets(asset_type);
CREATE INDEX idx_assets_status ON public.assets(approval_status);
CREATE INDEX idx_assets_dept ON public.assets(department);
CREATE INDEX idx_assets_agent ON public.assets(created_by_agent_id);
