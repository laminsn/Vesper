-- Seed Medical Baise and Legal Baise organizations
-- Both share the same 52 agents as Casa Baise (Baise Group unified team)

INSERT INTO public.organizations (id, name, slug, industry, hipaa_mode, plan, config, metadata)
VALUES
  ('00000000-0000-4000-a000-000000000008', 'Medical Baise', 'mb', 'healthcare', true, 'enterprise', '{}', '{"group": "baise"}'),
  ('00000000-0000-4000-a000-000000000009', 'Legal Baise', 'lb', 'other', false, 'enterprise', '{}', '{"group": "baise"}')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, industry = EXCLUDED.industry, hipaa_mode = EXCLUDED.hipaa_mode;

-- Link the same 52 Casa Baise agents to Medical Baise and Legal Baise
-- by inserting agent records with the new org IDs
-- (agents share the same slugs and soul files across all Baise Group companies)

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config)
SELECT
  gen_random_uuid(),
  a.slug,
  a.name,
  a.role,
  a.department,
  a.tier,
  a.parent_agent_id,
  a.status,
  '00000000-0000-4000-a000-000000000008', -- Medical Baise
  a.soul_file_path,
  a.config
FROM public.agents a
WHERE a.organization_id = '00000000-0000-4000-a000-000000000007' -- Casa Baise source
ON CONFLICT DO NOTHING;

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config)
SELECT
  gen_random_uuid(),
  a.slug,
  a.name,
  a.role,
  a.department,
  a.tier,
  a.parent_agent_id,
  a.status,
  '00000000-0000-4000-a000-000000000009', -- Legal Baise
  a.soul_file_path,
  a.config
FROM public.agents a
WHERE a.organization_id = '00000000-0000-4000-a000-000000000007' -- Casa Baise source
ON CONFLICT DO NOTHING;
