-- =============================================================================
-- HHCC Command Center - Complete Supabase PostgreSQL Schema
-- =============================================================================
-- Happier Homes Comfort Care - Digital Command Matrix (DCM)
-- All tables, RLS policies, indexes, triggers, and helper functions.
-- =============================================================================


-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- SECTION 2: HELPER FUNCTIONS
-- =============================================================================

-- Returns the role of the currently authenticated user.
-- Used by RLS policies to determine write permissions.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Convenience check: is current user an owner or cofounder?
CREATE OR REPLACE FUNCTION public.is_owner_or_cofounder()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('owner', 'cofounder')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Convenience check: is current user at least staff level?
CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS BOOLEAN AS $$
  SELECT public.get_user_role() IN ('owner', 'cofounder', 'staff')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Generic updated_at trigger function.
-- Attach to any table that needs automatic updated_at timestamps.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- SECTION 3: TABLES - User Management
-- =============================================================================

-- Roles assigned to authenticated users (owner, cofounder, staff, readonly).
CREATE TABLE public.user_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'cofounder', 'staff', 'readonly')),
  display_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Invite tokens for onboarding new users.
CREATE TABLE public.user_invites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('cofounder', 'staff', 'readonly')),
  invited_by      UUID REFERENCES auth.users(id),
  token           TEXT UNIQUE NOT NULL,
  accepted_at     TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 4: TABLES - Agents & Departments
-- =============================================================================

-- Every AI agent in the HHCC empire.
CREATE TABLE public.agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  department      TEXT NOT NULL,
  tier            TEXT NOT NULL CHECK (tier IN ('orchestrator', 'director', 'specialist')),
  parent_agent_id UUID REFERENCES public.agents(id),
  status          TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'offline', 'executing')),
  last_seen_at    TIMESTAMPTZ DEFAULT now(),
  avatar_url      TEXT,
  soul_file_path  TEXT,
  config          JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Organizational departments, each led by a director agent.
CREATE TABLE public.departments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  director_agent_id UUID REFERENCES public.agents(id),
  color             TEXT NOT NULL,
  icon              TEXT NOT NULL,
  agent_count       INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 5: TABLES - KPIs
-- =============================================================================

-- Current KPI metrics tied to departments and owner agents.
CREATE TABLE public.kpis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID REFERENCES public.departments(id),
  metric_name     TEXT NOT NULL,
  current_value   NUMERIC,
  target_value    NUMERIC,
  unit            TEXT,
  trend           TEXT DEFAULT 'unknown' CHECK (trend IN ('up', 'down', 'flat', 'unknown')),
  owner_agent_id  UUID REFERENCES public.agents(id),
  measured_at     TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Historical KPI values for trend analysis and charting.
CREATE TABLE public.kpi_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id          UUID REFERENCES public.kpis(id) ON DELETE CASCADE,
  value           NUMERIC NOT NULL,
  recorded_at     TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 6: TABLES - Tasks & Comments
-- =============================================================================

-- Tasks assigned to agents, organized by department and priority.
CREATE TABLE public.tasks (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                   TEXT NOT NULL,
  description             TEXT,
  status                  TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'blocked', 'done')),
  priority                TEXT DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  department_id           UUID REFERENCES public.departments(id),
  assigned_agent_id       UUID REFERENCES public.agents(id),
  created_by_agent_id     UUID REFERENCES public.agents(id),
  created_by_user_id      UUID REFERENCES auth.users(id),
  due_date                TIMESTAMPTZ,
  tags                    TEXT[] DEFAULT '{}',
  sign_off_required       BOOLEAN DEFAULT false,
  signed_off_by           UUID REFERENCES auth.users(id),
  signed_off_at           TIMESTAMPTZ,
  parent_task_id          UUID REFERENCES public.tasks(id),
  playbook_execution_id   UUID,
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Comments on tasks from both humans and agents.
CREATE TABLE public.task_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_user_id  UUID REFERENCES auth.users(id),
  author_agent_id UUID REFERENCES public.agents(id),
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 7: TABLES - Playbooks & Executions
-- =============================================================================

-- Playbook definitions: reusable operational procedures.
CREATE TABLE public.playbooks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_number         INTEGER UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  trigger_description TEXT,
  duration_target     TEXT,
  playmaker_agent_id  UUID REFERENCES public.agents(id),
  steps               JSONB NOT NULL DEFAULT '[]',
  kill_criteria       JSONB,
  non_negotiables     JSONB,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Individual playbook execution runs.
CREATE TABLE public.playbook_executions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id         UUID REFERENCES public.playbooks(id),
  triggered_by        UUID REFERENCES auth.users(id),
  status              TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'killed', 'paused')),
  current_step        INTEGER DEFAULT 1,
  step_statuses       JSONB DEFAULT '[]',
  context             JSONB DEFAULT '{}',
  started_at          TIMESTAMPTZ DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  quality_score       NUMERIC,
  sla_met_percentage  NUMERIC
);


-- =============================================================================
-- SECTION 8: TABLES - Handoffs & Executions
-- =============================================================================

-- Handoff definitions: cross-department transfer protocols.
CREATE TABLE public.handoffs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_number    INTEGER UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  from_department   TEXT NOT NULL,
  to_department     TEXT NOT NULL,
  from_agent_id     UUID REFERENCES public.agents(id),
  to_agent_id       UUID REFERENCES public.agents(id),
  sla_description   TEXT,
  packet_template   JSONB,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Individual handoff execution instances with SLA tracking.
CREATE TABLE public.handoff_executions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handoff_id              UUID REFERENCES public.handoffs(id),
  playbook_execution_id   UUID REFERENCES public.playbook_executions(id),
  from_agent_id           UUID REFERENCES public.agents(id),
  to_agent_id             UUID REFERENCES public.agents(id),
  packet                  JSONB NOT NULL DEFAULT '{}',
  acknowledged_at         TIMESTAMPTZ,
  sla_target_minutes      INTEGER,
  actual_minutes          INTEGER,
  sla_met                 BOOLEAN,
  friction_notes          TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 9: TABLES - Communications & Directives
-- =============================================================================

-- Agent-to-agent communication log.
CREATE TABLE public.agent_communications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id   UUID REFERENCES public.agents(id),
  to_agent_id     UUID REFERENCES public.agents(id),
  to_department   TEXT,
  message_type    TEXT CHECK (message_type IN ('directive', 'status_report', 'handoff', 'escalation', 'notification')),
  subject         TEXT,
  body            TEXT NOT NULL,
  priority        TEXT DEFAULT 'normal',
  read_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Human-issued directives to agents or departments.
CREATE TABLE public.directives (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issued_by         UUID NOT NULL REFERENCES auth.users(id),
  target_agent_id   UUID REFERENCES public.agents(id),
  target_department TEXT,
  instruction       TEXT NOT NULL,
  priority          TEXT DEFAULT 'normal',
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
  acknowledged_at   TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  response          TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 10: TABLES - HyperAgent Evolution System
-- =============================================================================

-- Agent-proposed improvements (prompt, process, tool, knowledge, strategy).
CREATE TABLE public.evolution_proposals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id          UUID NOT NULL REFERENCES public.agents(id),
  category          TEXT CHECK (category IN ('PROMPT', 'PROCESS', 'TOOL', 'KNOWLEDGE', 'STRATEGY')),
  validation_level  TEXT CHECK (validation_level IN ('GREEN', 'YELLOW', 'RED')),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  rationale         TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented', 'expired')),
  reviewed_by       UUID REFERENCES auth.users(id),
  reviewed_at       TIMESTAMPTZ,
  implemented_at    TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Post-execution retrospectives with quality and SLA scoring.
CREATE TABLE public.evolution_retrospectives (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_execution_id   UUID REFERENCES public.playbook_executions(id),
  playmaker_agent_id      UUID REFERENCES public.agents(id),
  quality_score           INTEGER CHECK (quality_score BETWEEN 1 AND 5),
  sla_percentage          NUMERIC,
  friction_points         TEXT[],
  improvements_identified TEXT[],
  lessons_learned         TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- SECTION 11: INDEXES
-- =============================================================================

-- Agents
CREATE INDEX idx_agents_department ON public.agents(department);
CREATE INDEX idx_agents_status     ON public.agents(status);
CREATE INDEX idx_agents_slug       ON public.agents(slug);

-- Tasks
CREATE INDEX idx_tasks_status            ON public.tasks(status);
CREATE INDEX idx_tasks_department_id     ON public.tasks(department_id);
CREATE INDEX idx_tasks_assigned_agent_id ON public.tasks(assigned_agent_id);

-- KPIs
CREATE INDEX idx_kpis_department_id ON public.kpis(department_id);

-- Directives
CREATE INDEX idx_directives_target_agent_id ON public.directives(target_agent_id);
CREATE INDEX idx_directives_status          ON public.directives(status);

-- Agent Communications
CREATE INDEX idx_agent_communications_from_agent_id ON public.agent_communications(from_agent_id);
CREATE INDEX idx_agent_communications_to_agent_id   ON public.agent_communications(to_agent_id);

-- Playbook Executions
CREATE INDEX idx_playbook_executions_playbook_id ON public.playbook_executions(playbook_id);
CREATE INDEX idx_playbook_executions_status       ON public.playbook_executions(status);


-- =============================================================================
-- SECTION 12: TRIGGERS
-- =============================================================================

-- Auto-update updated_at on agents table.
CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-update updated_at on tasks table.
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- SECTION 13: ROW LEVEL SECURITY - Enable on all tables
-- =============================================================================

ALTER TABLE public.user_roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_history             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_executions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoffs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_executions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_communications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directives              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_proposals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_retrospectives ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 14: RLS POLICIES - Read access (all authenticated users)
-- =============================================================================

CREATE POLICY "Authenticated users can read user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read user_invites"
  ON public.user_invites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read kpis"
  ON public.kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read kpi_history"
  ON public.kpi_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read task_comments"
  ON public.task_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read playbooks"
  ON public.playbooks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read playbook_executions"
  ON public.playbook_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read handoffs"
  ON public.handoffs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read handoff_executions"
  ON public.handoff_executions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read agent_communications"
  ON public.agent_communications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read directives"
  ON public.directives FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read evolution_proposals"
  ON public.evolution_proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read evolution_retrospectives"
  ON public.evolution_retrospectives FOR SELECT
  TO authenticated
  USING (true);


-- =============================================================================
-- SECTION 15: RLS POLICIES - Write access for user_roles & user_invites
--   Only owner/cofounder can manage user roles and invitations.
-- =============================================================================

CREATE POLICY "Owner/cofounder can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can insert user_invites"
  ON public.user_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update user_invites"
  ON public.user_invites FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete user_invites"
  ON public.user_invites FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());


-- =============================================================================
-- SECTION 16: RLS POLICIES - Write access for owner/cofounder-only tables
--   These tables are managed exclusively by leadership.
-- =============================================================================

-- agents
CREATE POLICY "Owner/cofounder can insert agents"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update agents"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete agents"
  ON public.agents FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- departments
CREATE POLICY "Owner/cofounder can insert departments"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update departments"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- kpis
CREATE POLICY "Owner/cofounder can insert kpis"
  ON public.kpis FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update kpis"
  ON public.kpis FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete kpis"
  ON public.kpis FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- kpi_history
CREATE POLICY "Owner/cofounder can insert kpi_history"
  ON public.kpi_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update kpi_history"
  ON public.kpi_history FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete kpi_history"
  ON public.kpi_history FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- playbooks
CREATE POLICY "Owner/cofounder can insert playbooks"
  ON public.playbooks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update playbooks"
  ON public.playbooks FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete playbooks"
  ON public.playbooks FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- playbook_executions
CREATE POLICY "Owner/cofounder can insert playbook_executions"
  ON public.playbook_executions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update playbook_executions"
  ON public.playbook_executions FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete playbook_executions"
  ON public.playbook_executions FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- handoffs
CREATE POLICY "Owner/cofounder can insert handoffs"
  ON public.handoffs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update handoffs"
  ON public.handoffs FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete handoffs"
  ON public.handoffs FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- handoff_executions
CREATE POLICY "Owner/cofounder can insert handoff_executions"
  ON public.handoff_executions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update handoff_executions"
  ON public.handoff_executions FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete handoff_executions"
  ON public.handoff_executions FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- evolution_proposals
CREATE POLICY "Owner/cofounder can insert evolution_proposals"
  ON public.evolution_proposals FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update evolution_proposals"
  ON public.evolution_proposals FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete evolution_proposals"
  ON public.evolution_proposals FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- evolution_retrospectives
CREATE POLICY "Owner/cofounder can insert evolution_retrospectives"
  ON public.evolution_retrospectives FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can update evolution_retrospectives"
  ON public.evolution_retrospectives FOR UPDATE
  TO authenticated
  USING (public.is_owner_or_cofounder())
  WITH CHECK (public.is_owner_or_cofounder());

CREATE POLICY "Owner/cofounder can delete evolution_retrospectives"
  ON public.evolution_retrospectives FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());


-- =============================================================================
-- SECTION 17: RLS POLICIES - Write access for staff-writable tables
--   Staff (and above) can write to tasks, task_comments, directives,
--   and agent_communications. Readonly users cannot write.
-- =============================================================================

-- tasks
CREATE POLICY "Staff and above can insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- task_comments
CREATE POLICY "Staff and above can insert task_comments"
  ON public.task_comments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can update task_comments"
  ON public.task_comments FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can delete task_comments"
  ON public.task_comments FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- directives
CREATE POLICY "Staff and above can insert directives"
  ON public.directives FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can update directives"
  ON public.directives FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can delete directives"
  ON public.directives FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());

-- agent_communications
CREATE POLICY "Staff and above can insert agent_communications"
  ON public.agent_communications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can update agent_communications"
  ON public.agent_communications FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

CREATE POLICY "Staff and above can delete agent_communications"
  ON public.agent_communications FOR DELETE
  TO authenticated
  USING (public.is_owner_or_cofounder());


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
