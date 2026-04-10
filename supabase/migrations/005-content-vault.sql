-- =============================================================================
-- Migration 005: Content Vault
-- =============================================================================
-- Stores extracted quotes, key phrases, viral topics, thumbnails, and
-- static post assets from all content channels (YouTube, podcast, IG, etc.)
-- Agents monitor content output and extract high-value moments for repurposing.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.content_vault (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type           TEXT NOT NULL CHECK (source_type IN (
    'youtube', 'podcast', 'instagram', 'tiktok', 'interview',
    'webinar', 'live', 'blog', 'newsletter', 'other'
  )),
  source_url            TEXT,
  source_title          TEXT NOT NULL,
  content_type          TEXT NOT NULL CHECK (content_type IN (
    'quote', 'key_phrase', 'viral_topic', 'thumbnail',
    'clip_timestamp', 'static_post', 'carousel', 'hook', 'cta'
  )),
  body                  TEXT NOT NULL,
  speaker               TEXT,
  timestamp_start       TEXT,
  timestamp_end         TEXT,
  thumbnail_url         TEXT,
  tags                  JSONB DEFAULT '[]',
  viral_potential       TEXT DEFAULT 'medium' CHECK (viral_potential IN ('low', 'medium', 'high', 'viral')),
  post_status           TEXT DEFAULT 'extracted' CHECK (post_status IN (
    'extracted', 'drafted', 'approved', 'scheduled', 'posted', 'archived'
  )),
  platform_target       TEXT,
  visual_treatment      TEXT,
  department            TEXT,
  extracted_by_agent_id UUID REFERENCES public.agents(id),
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.content_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON public.content_vault FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON public.content_vault FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON public.content_vault FOR UPDATE TO authenticated USING (true);
CREATE POLICY "authenticated_delete" ON public.content_vault FOR DELETE TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_content_vault_type ON public.content_vault(content_type);
CREATE INDEX idx_content_vault_source ON public.content_vault(source_type);
CREATE INDEX idx_content_vault_status ON public.content_vault(post_status);
CREATE INDEX idx_content_vault_viral ON public.content_vault(viral_potential);
CREATE INDEX idx_content_vault_agent ON public.content_vault(extracted_by_agent_id);
CREATE INDEX idx_content_vault_created ON public.content_vault(created_at);
