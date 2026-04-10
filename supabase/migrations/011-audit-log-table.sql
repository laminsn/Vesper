-- =============================================================================
-- Migration 011: Create Audit Log Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  org_id        UUID REFERENCES public.organizations(id),
  action        TEXT NOT NULL,
  details       TEXT,
  ip_address    TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON public.audit_log(org_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audit logs" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Seed sample audit entries for each org
INSERT INTO public.audit_log (user_id, org_id, action, details, metadata) VALUES
-- HHCC
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000001', 'auth.login', 'Login succeeded', '{"success":true,"risk_level":"low"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000001', 'phi.access', 'Viewed patient chart | resource_type=patient_record | phi_accessed=true | risk_level=high', '{"phi_accessed":true,"risk_level":"high","resource_type":"patient_record"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000001', 'agent.invoke', 'Issued directive to Diane | resource_type=agent | resource_id=diane', '{"risk_level":"low","zone":"operations"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000001', 'task.create', 'Created task: Monthly compliance review', '{"risk_level":"low","resource_type":"task"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000001', 'playbook.execute', 'Executed Play 1: New Patient Referral', '{"risk_level":"medium","resource_type":"playbook"}'),
-- FNF
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000002', 'auth.login', 'Login succeeded', '{"success":true,"risk_level":"low"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000002', 'agent.invoke', 'Issued directive to Magnus', '{"risk_level":"low","zone":"operations"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000002', 'playbook.execute', 'Executed Play 5: Wholesale Deal Pipeline', '{"risk_level":"medium"}'),
-- BET
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000003', 'auth.login', 'Login succeeded', '{"success":true,"risk_level":"low"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000003', 'agent.invoke', 'Issued directive to Ricardo', '{"risk_level":"low","zone":"operations"}'),
-- HAA
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000004', 'auth.login', 'Login succeeded', '{"success":true,"risk_level":"low"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000004', 'task.create', 'Created task: Q2 Course Launch Review', '{"risk_level":"low","resource_type":"task"}'),
-- RAM
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000005', 'auth.login', 'Login succeeded', '{"success":true,"risk_level":"low"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000005', 'agent.invoke', 'Issued directive to Corvus', '{"risk_level":"low","zone":"operations"}'),
((SELECT id FROM auth.users WHERE email = 'admin@vesper.app' LIMIT 1), '00000000-0000-4000-a000-000000000005', 'playbook.execute', 'Executed Play 3: AI Agent Build-Out', '{"risk_level":"medium"}');
