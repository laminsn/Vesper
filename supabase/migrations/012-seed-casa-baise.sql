-- =============================================================================
-- Migration 012: Seed Casa Baise Organization & Agents
-- =============================================================================
-- Seeds Casa Baise as a new organization, then inserts all 52 agents.
-- Uses deterministic UUID for the org; agent rows use gen_random_uuid().
-- =============================================================================


-- =============================================================================
-- SECTION 1: INSERT ORGANIZATION
-- =============================================================================

INSERT INTO public.organizations (id, name, slug, industry, hipaa_mode, plan, theme_config, settings)
VALUES
  ('00000000-0000-4000-a000-000000000007', 'Casa Baise', 'cb', 'technology', false, 'enterprise', '{}', '{}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  hipaa_mode = EXCLUDED.hipaa_mode,
  plan = EXCLUDED.plan;


-- =============================================================================
-- SECTION 2: INSERT CASA BAISE AGENTS
-- =============================================================================

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config) VALUES

-- Empire Leadership (shared orchestrators)
(gen_random_uuid(), 'leona',  'Leona',  'Chief of Staff',         'empire-leadership', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/leona.soul.md',  '{}'),
(gen_random_uuid(), 'nova',   'Nova',   'Marketing Intelligence', 'empire-leadership', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/nova.soul.md',   '{}'),
(gen_random_uuid(), 'marcus', 'Marcus', 'Revenue Intelligence',   'empire-leadership', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/marcus.soul.md', '{}'),
(gen_random_uuid(), 'sage',   'Sage',   'Knowledge & Research',   'empire-leadership', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/sage.soul.md',   '{}'),
(gen_random_uuid(), 'atlas',  'Atlas',  'Operations Intelligence','empire-leadership', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/atlas.soul.md',  '{}'),

-- Executive
(gen_random_uuid(), 'valentina-cruz', 'Valentina Cruz', 'Chief Executive Officer', 'executive', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000007', 'souls/valentina-cruz.soul.md', '{}'),

-- Directors (parent: valentina-cruz)
(gen_random_uuid(), 'diana-sousa',     'Diana Sousa',     'Marketing Director',          'marketing',             'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/diana-sousa.soul.md',     '{}'),
(gen_random_uuid(), 'jordan-pinto',    'Jordan Pinto',    'Content Director',            'content',               'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/jordan-pinto.soul.md',    '{}'),
(gen_random_uuid(), 'victor-drummond', 'Victor Drummond', 'Sales Director',              'sales-growth',          'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/victor-drummond.soul.md', '{}'),
(gen_random_uuid(), 'rook-ferreira',   'Rook Ferreira',   'Operations Director',         'contractor-operations', 'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/rook-ferreira.soul.md',   '{}'),
(gen_random_uuid(), 'celeste-duarte',  'Celeste Duarte',  'CX Director — Homeowners',    'homeowner-experience',  'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/celeste-duarte.soul.md',  '{}'),
(gen_random_uuid(), 'lucas-oliveira',  'Lucas Oliveira',  'Contractor Success Director', 'contractor-success',    'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/lucas-oliveira.soul.md',  '{}'),
(gen_random_uuid(), 'fernanda-rocha',  'Fernanda Rocha',  'Trust & Safety Director',     'trust-safety',          'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/fernanda-rocha.soul.md',  '{}'),
(gen_random_uuid(), 'isabela-mendes',  'Isabela Mendes',  'Chief Financial Officer',     'finance',               'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/isabela-mendes.soul.md',  '{}'),
(gen_random_uuid(), 'carolina-vieira', 'Carolina Vieira', 'Legal & Compliance Director', 'legal-compliance',      'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/carolina-vieira.soul.md', '{}'),
(gen_random_uuid(), 'diego-barbosa',   'Diego Barbosa',   'Product Director',            'product',               'director', 'valentina-cruz', 'active', '00000000-0000-4000-a000-000000000007', 'souls/diego-barbosa.soul.md',   '{}'),

-- Marketing specialists (parent: diana-sousa)
(gen_random_uuid(), 'iris-campos',    'Iris Campos',    'Market Research Specialist',  'marketing', 'specialist', 'diana-sousa', 'idle',      '00000000-0000-4000-a000-000000000007', 'souls/iris-campos.soul.md',    '{}'),
(gen_random_uuid(), 'rex-teixeira',   'Rex Teixeira',   'Paid Ads Specialist',         'marketing', 'specialist', 'diana-sousa', 'executing', '00000000-0000-4000-a000-000000000007', 'souls/rex-teixeira.soul.md',   '{}'),
(gen_random_uuid(), 'finn-azevedo',   'Finn Azevedo',   'SEO Specialist',              'marketing', 'specialist', 'diana-sousa', 'idle',      '00000000-0000-4000-a000-000000000007', 'souls/finn-azevedo.soul.md',   '{}'),
(gen_random_uuid(), 'lyra-mendonca',  'Lyra Mendonca',  'Email Marketing Specialist',  'marketing', 'specialist', 'diana-sousa', 'active',    '00000000-0000-4000-a000-000000000007', 'souls/lyra-mendonca.soul.md',  '{}'),
(gen_random_uuid(), 'summit-faria',   'Summit Faria',   'Event Coordinator',           'marketing', 'specialist', 'diana-sousa', 'idle',      '00000000-0000-4000-a000-000000000007', 'souls/summit-faria.soul.md',   '{}'),

-- Content specialists (parent: jordan-pinto)
(gen_random_uuid(), 'blaze-correia',  'Blaze Correia',  'Short-Form Video Specialist',       'content', 'specialist', 'jordan-pinto', 'active', '00000000-0000-4000-a000-000000000007', 'souls/blaze-correia.soul.md',  '{}'),
(gen_random_uuid(), 'wren-batista',   'Wren Batista',   'Blog & Written Content Specialist', 'content', 'specialist', 'jordan-pinto', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/wren-batista.soul.md',   '{}'),
(gen_random_uuid(), 'lux-oliveira',   'Lux Oliveira',   'Graphic Designer',                  'content', 'specialist', 'jordan-pinto', 'active', '00000000-0000-4000-a000-000000000007', 'souls/lux-oliveira.soul.md',   '{}'),
(gen_random_uuid(), 'cleo-marques',   'Cleo Marques',   'Social Media Manager',              'content', 'specialist', 'jordan-pinto', 'active', '00000000-0000-4000-a000-000000000007', 'souls/cleo-marques.soul.md',   '{}'),
(gen_random_uuid(), 'quill-tavares',  'Quill Tavares',  'Community Manager',                 'content', 'specialist', 'jordan-pinto', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/quill-tavares.soul.md',  '{}'),

-- Sales specialists (parent: victor-drummond)
(gen_random_uuid(), 'cassidy-rocha',     'Cassidy Rocha',     'Account Executive — Homeowners', 'sales-growth', 'specialist', 'victor-drummond', 'active', '00000000-0000-4000-a000-000000000007', 'souls/cassidy-rocha.soul.md',     '{}'),
(gen_random_uuid(), 'drake-nunes',       'Drake Nunes',       'Account Executive — Contractors','sales-growth', 'specialist', 'victor-drummond', 'active', '00000000-0000-4000-a000-000000000007', 'souls/drake-nunes.soul.md',       '{}'),
(gen_random_uuid(), 'vera-santana',      'Vera Santana',      'Inside Sales Rep',               'sales-growth', 'specialist', 'victor-drummond', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/vera-santana.soul.md',      '{}'),
(gen_random_uuid(), 'trace-cavalcanti',  'Trace Cavalcanti',  'Proposal & Pitch Specialist',    'sales-growth', 'specialist', 'victor-drummond', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/trace-cavalcanti.soul.md',  '{}'),

-- Contractor Ops specialists (parent: rook-ferreira)
(gen_random_uuid(), 'maven-prado',       'Maven Prado',       'Job Dispatch Coordinator',   'contractor-operations', 'specialist', 'rook-ferreira', 'active', '00000000-0000-4000-a000-000000000007', 'souls/maven-prado.soul.md',       '{}'),
(gen_random_uuid(), 'anchor-lima',       'Anchor Lima',       'Contractor Vetting Specialist','contractor-operations','specialist', 'rook-ferreira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/anchor-lima.soul.md',       '{}'),
(gen_random_uuid(), 'scout-vasconcelos', 'Scout Vasconcelos', 'Field Quality Inspector',     'contractor-operations', 'specialist', 'rook-ferreira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/scout-vasconcelos.soul.md', '{}'),
(gen_random_uuid(), 'grid-moura',        'Grid Moura',        'Platform & Tools Manager',    'contractor-operations', 'specialist', 'rook-ferreira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/grid-moura.soul.md',        '{}'),

-- Homeowner CX specialists (parent: celeste-duarte)
(gen_random_uuid(), 'ana-ferreira',  'Ana Ferreira',  'Homeowner Onboarding Specialist', 'homeowner-experience', 'specialist', 'celeste-duarte', 'active', '00000000-0000-4000-a000-000000000007', 'souls/ana-ferreira.soul.md',  '{}'),
(gen_random_uuid(), 'haven-ribeiro', 'Haven Ribeiro', 'Support & Escalation Manager',    'homeowner-experience', 'specialist', 'celeste-duarte', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/haven-ribeiro.soul.md', '{}'),
(gen_random_uuid(), 'mirror-gomes',  'Mirror Gomes',  'Review & Reputation Specialist',  'homeowner-experience', 'specialist', 'celeste-duarte', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/mirror-gomes.soul.md',  '{}'),
(gen_random_uuid(), 'kin-aragao',    'Kin Aragao',    'Retention & Renewal Specialist',  'homeowner-experience', 'specialist', 'celeste-duarte', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/kin-aragao.soul.md',    '{}'),

-- Contractor Success specialists (parent: lucas-oliveira)
(gen_random_uuid(), 'coach-souza',   'Coach Souza',   'Contractor Onboarding Coach',      'contractor-success', 'specialist', 'lucas-oliveira', 'active', '00000000-0000-4000-a000-000000000007', 'souls/coach-souza.soul.md',   '{}'),
(gen_random_uuid(), 'dash-pereira',  'Dash Pereira',  'Performance & Ratings Specialist', 'contractor-success', 'specialist', 'lucas-oliveira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/dash-pereira.soul.md',  '{}'),
(gen_random_uuid(), 'rue-monteiro',  'Rue Monteiro',  'Contractor Communications Manager','contractor-success', 'specialist', 'lucas-oliveira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/rue-monteiro.soul.md',  '{}'),
(gen_random_uuid(), 'pulse-barros',  'Pulse Barros',  'Contractor Feedback Analyst',      'contractor-success', 'specialist', 'lucas-oliveira', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/pulse-barros.soul.md',  '{}'),

-- Trust & Safety specialists (parent: fernanda-rocha)
(gen_random_uuid(), 'sentinel-cruz',  'Sentinel Cruz',  'Fraud & Abuse Investigator',   'trust-safety', 'specialist', 'fernanda-rocha', 'active', '00000000-0000-4000-a000-000000000007', 'souls/sentinel-cruz.soul.md',  '{}'),
(gen_random_uuid(), 'arbiter-lopes',  'Arbiter Lopes',  'Dispute Resolution Specialist', 'trust-safety', 'specialist', 'fernanda-rocha', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/arbiter-lopes.soul.md',  '{}'),
(gen_random_uuid(), 'warden-freitas', 'Warden Freitas', 'Policy & Compliance Officer',  'trust-safety', 'specialist', 'fernanda-rocha', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/warden-freitas.soul.md', '{}'),

-- Finance specialists (parent: isabela-mendes)
(gen_random_uuid(), 'thiago-cardoso',    'Thiago Cardoso',    'Bookkeeper & Reconciliation',        'finance', 'specialist', 'isabela-mendes', 'idle', '00000000-0000-4000-a000-000000000007', 'souls/thiago-cardoso.soul.md',    '{}'),
(gen_random_uuid(), 'gauge-albuquerque', 'Gauge Albuquerque', 'Financial Reporting & Profitability', 'finance', 'specialist', 'isabela-mendes', 'idle', '00000000-0000-4000-a000-000000000007', 'souls/gauge-albuquerque.soul.md', '{}'),

-- Legal specialists (parent: carolina-vieira)
(gen_random_uuid(), 'parity-soares', 'Parity Soares', 'Contract & Legal Review Specialist', 'legal-compliance', 'specialist', 'carolina-vieira', 'idle', '00000000-0000-4000-a000-000000000007', 'souls/parity-soares.soul.md', '{}'),
(gen_random_uuid(), 'scribe-leal',   'Scribe Leal',   'Regulatory Compliance Officer',      'legal-compliance', 'specialist', 'carolina-vieira', 'idle', '00000000-0000-4000-a000-000000000007', 'souls/scribe-leal.soul.md',   '{}'),

-- Product specialists (parent: diego-barbosa)
(gen_random_uuid(), 'milo-queiroz', 'Milo Queiroz', 'Product Manager',        'product', 'specialist', 'diego-barbosa', 'active', '00000000-0000-4000-a000-000000000007', 'souls/milo-queiroz.soul.md', '{}'),
(gen_random_uuid(), 'nora-campos',  'Nora Campos',  'UX Designer',            'product', 'specialist', 'diego-barbosa', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/nora-campos.soul.md',  '{}'),
(gen_random_uuid(), 'knox-assis',   'Knox Assis',   'QA & Testing Specialist','product', 'specialist', 'diego-barbosa', 'idle',   '00000000-0000-4000-a000-000000000007', 'souls/knox-assis.soul.md',   '{}')

ON CONFLICT (slug) DO NOTHING;
