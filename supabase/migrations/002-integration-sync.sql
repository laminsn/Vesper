-- =============================================================================
-- Migration 002: Integration Registry & Business Profile Sync
-- =============================================================================
-- Adds integration_registry, business_profiles, and sync_log tables
-- for managing MCP/API/webhook connections and filesystem sync state.
-- =============================================================================


-- =============================================================================
-- SECTION 1: INTEGRATION REGISTRY TABLE
-- =============================================================================

CREATE TABLE public.integration_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  integration_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mcp', 'api', 'webhook', 'oauth', 'database')),
  config JSONB DEFAULT '{}',
  credentials_ref TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'testing')),
  last_health_check TIMESTAMPTZ,
  health_details JSONB DEFAULT '{}',
  used_by_agents TEXT[] DEFAULT '{}',
  used_by_departments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 2: BUSINESS PROFILES TABLE
-- =============================================================================

CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES public.organizations(id),
  filesystem_root TEXT NOT NULL,
  soul_files_path TEXT DEFAULT 'souls/',
  org_chart_hash TEXT,
  playbook_count INTEGER DEFAULT 0,
  handoff_count INTEGER DEFAULT 0,
  agent_count INTEGER DEFAULT 0,
  department_count INTEGER DEFAULT 0,
  skills_manifest JSONB DEFAULT '{}',
  mcp_configs JSONB DEFAULT '{}',
  knowledge_base_refs JSONB DEFAULT '[]',
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'never' CHECK (sync_status IN ('never', 'syncing', 'synced', 'error')),
  sync_errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 3: SYNC LOG TABLE
-- =============================================================================

CREATE TABLE public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('souls', 'playbooks', 'handoffs', 'org_chart', 'skills', 'mcps', 'full')),
  direction TEXT NOT NULL CHECK (direction IN ('filesystem_to_db', 'db_to_filesystem')),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  items_processed INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);


-- =============================================================================
-- SECTION 4: ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.integration_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Read policies: all authenticated users in the org can read.
CREATE POLICY "authenticated_read" ON public.integration_registry
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.business_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.sync_log
  FOR SELECT TO authenticated USING (true);

-- Write policies: only owner/cofounder can write.
CREATE POLICY "owner_write" ON public.integration_registry
  FOR ALL TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "owner_write" ON public.business_profiles
  FOR ALL TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "owner_write" ON public.sync_log
  FOR ALL TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());


-- =============================================================================
-- SECTION 5: INDEXES
-- =============================================================================

CREATE INDEX idx_integration_registry_key ON public.integration_registry(integration_key);
CREATE INDEX idx_integration_registry_org ON public.integration_registry(organization_id);
CREATE INDEX idx_integration_registry_status ON public.integration_registry(status);
CREATE INDEX idx_business_profiles_org ON public.business_profiles(organization_id);
CREATE INDEX idx_sync_log_type ON public.sync_log(sync_type);
CREATE INDEX idx_sync_log_org ON public.sync_log(organization_id);


-- =============================================================================
-- SECTION 6: TRIGGERS
-- =============================================================================

CREATE TRIGGER integration_registry_updated_at
  BEFORE UPDATE ON public.integration_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- END OF MIGRATION 002
-- =============================================================================
