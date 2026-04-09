-- =============================================================================
-- Migration 001: Multi-Tenant Organizations
-- =============================================================================
-- Transforms AI Army Nexus from single-tenant (HHCC-only) to multi-tenant.
-- Adds organizations, organization_members, org scoping on all tables,
-- and replaces RLS policies with org-aware versions.
-- =============================================================================


-- =============================================================================
-- SECTION 1: ORGANIZATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  logo_url      TEXT,
  industry      TEXT CHECK (industry IN (
    'healthcare', 'marketing', 'finance', 'real_estate',
    'technology', 'education', 'hospitality', 'other'
  )),
  hipaa_mode    BOOLEAN DEFAULT false,
  theme_config  JSONB DEFAULT '{}',
  settings      JSONB DEFAULT '{}',
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on organizations.
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 2: ORGANIZATION MEMBERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'readonly')),
  display_name    TEXT,
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);


-- =============================================================================
-- SECTION 3: HELPER FUNCTIONS (org-aware)
-- =============================================================================

-- Returns all organization IDs the current user belongs to.
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns the user's role within a specific organization.
CREATE OR REPLACE FUNCTION public.get_user_org_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role
  FROM public.organization_members
  WHERE user_id = auth.uid()
    AND organization_id = org_id
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- =============================================================================
-- SECTION 4: ADD organization_id TO ALL EXISTING TABLES
-- =============================================================================

-- Agents
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Departments
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- KPIs
ALTER TABLE public.kpis
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- KPI History
ALTER TABLE public.kpi_history
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Task Comments
ALTER TABLE public.task_comments
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Playbooks
ALTER TABLE public.playbooks
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Playbook Executions
ALTER TABLE public.playbook_executions
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Handoffs
ALTER TABLE public.handoffs
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Handoff Executions
ALTER TABLE public.handoff_executions
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Agent Communications
ALTER TABLE public.agent_communications
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Directives
ALTER TABLE public.directives
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Evolution Proposals
ALTER TABLE public.evolution_proposals
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Evolution Retrospectives
ALTER TABLE public.evolution_retrospectives
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- User Roles (kept for backward compatibility)
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);


-- =============================================================================
-- SECTION 5: INDEXES ON organization_id
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_agents_org ON public.agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_org ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpis_org ON public.kpis(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_history_org ON public.kpi_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_org ON public.task_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_org ON public.playbooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_playbook_executions_org ON public.playbook_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_org ON public.handoffs(organization_id);
CREATE INDEX IF NOT EXISTS idx_handoff_executions_org ON public.handoff_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_communications_org ON public.agent_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_directives_org ON public.directives(organization_id);
CREATE INDEX IF NOT EXISTS idx_evolution_proposals_org ON public.evolution_proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_evolution_retrospectives_org ON public.evolution_retrospectives(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON public.user_roles(organization_id);

-- Additional indexes for organization_members lookups.
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);


-- =============================================================================
-- SECTION 6: ENABLE RLS ON NEW TABLES
-- =============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 7: DROP ALL EXISTING RLS POLICIES
-- =============================================================================
-- We must drop old single-tenant policies before creating org-aware replacements.

-- user_roles
DROP POLICY IF EXISTS "Authenticated users can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner/cofounder can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner/cofounder can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Owner/cofounder can delete user_roles" ON public.user_roles;

-- user_invites
DROP POLICY IF EXISTS "Authenticated users can read user_invites" ON public.user_invites;
DROP POLICY IF EXISTS "Owner/cofounder can insert user_invites" ON public.user_invites;
DROP POLICY IF EXISTS "Owner/cofounder can update user_invites" ON public.user_invites;
DROP POLICY IF EXISTS "Owner/cofounder can delete user_invites" ON public.user_invites;

-- agents
DROP POLICY IF EXISTS "Authenticated users can read agents" ON public.agents;
DROP POLICY IF EXISTS "Owner/cofounder can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Owner/cofounder can update agents" ON public.agents;
DROP POLICY IF EXISTS "Owner/cofounder can delete agents" ON public.agents;

-- departments
DROP POLICY IF EXISTS "Authenticated users can read departments" ON public.departments;
DROP POLICY IF EXISTS "Owner/cofounder can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Owner/cofounder can update departments" ON public.departments;
DROP POLICY IF EXISTS "Owner/cofounder can delete departments" ON public.departments;

-- kpis
DROP POLICY IF EXISTS "Authenticated users can read kpis" ON public.kpis;
DROP POLICY IF EXISTS "Owner/cofounder can insert kpis" ON public.kpis;
DROP POLICY IF EXISTS "Owner/cofounder can update kpis" ON public.kpis;
DROP POLICY IF EXISTS "Owner/cofounder can delete kpis" ON public.kpis;

-- kpi_history
DROP POLICY IF EXISTS "Authenticated users can read kpi_history" ON public.kpi_history;
DROP POLICY IF EXISTS "Owner/cofounder can insert kpi_history" ON public.kpi_history;
DROP POLICY IF EXISTS "Owner/cofounder can update kpi_history" ON public.kpi_history;
DROP POLICY IF EXISTS "Owner/cofounder can delete kpi_history" ON public.kpi_history;

-- tasks
DROP POLICY IF EXISTS "Authenticated users can read tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff and above can insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff and above can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff and above can delete tasks" ON public.tasks;

-- task_comments
DROP POLICY IF EXISTS "Authenticated users can read task_comments" ON public.task_comments;
DROP POLICY IF EXISTS "Staff and above can insert task_comments" ON public.task_comments;
DROP POLICY IF EXISTS "Staff and above can update task_comments" ON public.task_comments;
DROP POLICY IF EXISTS "Staff and above can delete task_comments" ON public.task_comments;

-- playbooks
DROP POLICY IF EXISTS "Authenticated users can read playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Owner/cofounder can insert playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Owner/cofounder can update playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Owner/cofounder can delete playbooks" ON public.playbooks;

-- playbook_executions
DROP POLICY IF EXISTS "Authenticated users can read playbook_executions" ON public.playbook_executions;
DROP POLICY IF EXISTS "Owner/cofounder can insert playbook_executions" ON public.playbook_executions;
DROP POLICY IF EXISTS "Owner/cofounder can update playbook_executions" ON public.playbook_executions;
DROP POLICY IF EXISTS "Owner/cofounder can delete playbook_executions" ON public.playbook_executions;

-- handoffs
DROP POLICY IF EXISTS "Authenticated users can read handoffs" ON public.handoffs;
DROP POLICY IF EXISTS "Owner/cofounder can insert handoffs" ON public.handoffs;
DROP POLICY IF EXISTS "Owner/cofounder can update handoffs" ON public.handoffs;
DROP POLICY IF EXISTS "Owner/cofounder can delete handoffs" ON public.handoffs;

-- handoff_executions
DROP POLICY IF EXISTS "Authenticated users can read handoff_executions" ON public.handoff_executions;
DROP POLICY IF EXISTS "Owner/cofounder can insert handoff_executions" ON public.handoff_executions;
DROP POLICY IF EXISTS "Owner/cofounder can update handoff_executions" ON public.handoff_executions;
DROP POLICY IF EXISTS "Owner/cofounder can delete handoff_executions" ON public.handoff_executions;

-- agent_communications
DROP POLICY IF EXISTS "Authenticated users can read agent_communications" ON public.agent_communications;
DROP POLICY IF EXISTS "Staff and above can insert agent_communications" ON public.agent_communications;
DROP POLICY IF EXISTS "Staff and above can update agent_communications" ON public.agent_communications;
DROP POLICY IF EXISTS "Staff and above can delete agent_communications" ON public.agent_communications;

-- directives
DROP POLICY IF EXISTS "Authenticated users can read directives" ON public.directives;
DROP POLICY IF EXISTS "Staff and above can insert directives" ON public.directives;
DROP POLICY IF EXISTS "Staff and above can update directives" ON public.directives;
DROP POLICY IF EXISTS "Staff and above can delete directives" ON public.directives;

-- evolution_proposals
DROP POLICY IF EXISTS "Authenticated users can read evolution_proposals" ON public.evolution_proposals;
DROP POLICY IF EXISTS "Owner/cofounder can insert evolution_proposals" ON public.evolution_proposals;
DROP POLICY IF EXISTS "Owner/cofounder can update evolution_proposals" ON public.evolution_proposals;
DROP POLICY IF EXISTS "Owner/cofounder can delete evolution_proposals" ON public.evolution_proposals;

-- evolution_retrospectives
DROP POLICY IF EXISTS "Authenticated users can read evolution_retrospectives" ON public.evolution_retrospectives;
DROP POLICY IF EXISTS "Owner/cofounder can insert evolution_retrospectives" ON public.evolution_retrospectives;
DROP POLICY IF EXISTS "Owner/cofounder can update evolution_retrospectives" ON public.evolution_retrospectives;
DROP POLICY IF EXISTS "Owner/cofounder can delete evolution_retrospectives" ON public.evolution_retrospectives;


-- =============================================================================
-- SECTION 8: RLS POLICIES - organizations
-- =============================================================================

-- Users can read organizations they belong to.
CREATE POLICY "Members can read their organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.get_user_org_ids()));

-- Any authenticated user can create an organization (they become owner).
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only owners and admins can update their organization.
CREATE POLICY "Owners and admins can update organizations"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(id) IN ('owner', 'admin'));

-- Only owners can delete their organization.
CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(id) = 'owner');


-- =============================================================================
-- SECTION 9: RLS POLICIES - organization_members
-- =============================================================================

-- Members can see other members in their orgs.
CREATE POLICY "Members can read org members"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- Owners and admins can invite members.
CREATE POLICY "Owners and admins can insert org members"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- Owners and admins can update member roles.
CREATE POLICY "Owners and admins can update org members"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- Owners can remove members; members can remove themselves.
CREATE POLICY "Owners can delete org members or self-remove"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    public.get_user_org_role(organization_id) = 'owner'
    OR user_id = auth.uid()
  );


-- =============================================================================
-- SECTION 10: RLS POLICIES - org-scoped SELECT for all data tables
-- =============================================================================
-- All data tables: users can only read rows belonging to their organizations.

CREATE POLICY "Org members can read agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read kpis"
  ON public.kpis FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read kpi_history"
  ON public.kpi_history FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read task_comments"
  ON public.task_comments FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read playbooks"
  ON public.playbooks FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read playbook_executions"
  ON public.playbook_executions FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read handoffs"
  ON public.handoffs FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read handoff_executions"
  ON public.handoff_executions FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read agent_communications"
  ON public.agent_communications FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read directives"
  ON public.directives FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read evolution_proposals"
  ON public.evolution_proposals FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read evolution_retrospectives"
  ON public.evolution_retrospectives FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

CREATE POLICY "Org members can read user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids()));

-- user_invites: keep simple auth-only read (no org_id column on this table).
CREATE POLICY "Authenticated users can read user_invites"
  ON public.user_invites FOR SELECT
  TO authenticated
  USING (true);


-- =============================================================================
-- SECTION 11: RLS POLICIES - org-scoped INSERT (owner/admin only)
-- =============================================================================
-- Leadership tables: only org owners and admins can create records.

CREATE POLICY "Org owners/admins can insert agents"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert departments"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert kpis"
  ON public.kpis FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert kpi_history"
  ON public.kpi_history FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert playbooks"
  ON public.playbooks FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert playbook_executions"
  ON public.playbook_executions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert handoffs"
  ON public.handoffs FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert handoff_executions"
  ON public.handoff_executions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert evolution_proposals"
  ON public.evolution_proposals FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert evolution_retrospectives"
  ON public.evolution_retrospectives FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- Staff-writable tables: owners, admins, and members can insert.
CREATE POLICY "Org members can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can insert task_comments"
  ON public.task_comments FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can insert directives"
  ON public.directives FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can insert agent_communications"
  ON public.agent_communications FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

-- user_invites: owners/admins can create invites.
CREATE POLICY "Org owners/admins can insert user_invites"
  ON public.user_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());


-- =============================================================================
-- SECTION 12: RLS POLICIES - org-scoped UPDATE
-- =============================================================================

CREATE POLICY "Org owners/admins can update agents"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update departments"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update kpis"
  ON public.kpis FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update kpi_history"
  ON public.kpi_history FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update playbooks"
  ON public.playbooks FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update playbook_executions"
  ON public.playbook_executions FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update handoffs"
  ON public.handoffs FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update handoff_executions"
  ON public.handoff_executions FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update evolution_proposals"
  ON public.evolution_proposals FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update evolution_retrospectives"
  ON public.evolution_retrospectives FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can update user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

-- Staff-writable tables: members can update too.
CREATE POLICY "Org members can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can update task_comments"
  ON public.task_comments FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can update directives"
  ON public.directives FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

CREATE POLICY "Org members can update agent_communications"
  ON public.agent_communications FOR UPDATE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'))
  WITH CHECK (public.get_user_org_role(organization_id) IN ('owner', 'admin', 'member'));

-- user_invites: owners/admins can update.
CREATE POLICY "Org owners/admins can update user_invites"
  ON public.user_invites FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());


-- =============================================================================
-- SECTION 13: RLS POLICIES - org-scoped DELETE (owners/admins only)
-- =============================================================================

CREATE POLICY "Org owners/admins can delete agents"
  ON public.agents FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete kpis"
  ON public.kpis FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete kpi_history"
  ON public.kpi_history FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete task_comments"
  ON public.task_comments FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete playbooks"
  ON public.playbooks FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete playbook_executions"
  ON public.playbook_executions FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete handoffs"
  ON public.handoffs FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete handoff_executions"
  ON public.handoff_executions FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete agent_communications"
  ON public.agent_communications FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete directives"
  ON public.directives FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete evolution_proposals"
  ON public.evolution_proposals FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete evolution_retrospectives"
  ON public.evolution_retrospectives FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.get_user_org_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY "Org owners/admins can delete user_invites"
  ON public.user_invites FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());


-- =============================================================================
-- END OF MIGRATION 001
-- =============================================================================
