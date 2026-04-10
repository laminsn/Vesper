-- =============================================================================
-- Migration 009: Seed Empire Organizations & Agents
-- =============================================================================
-- Seeds all 5 empire companies as organizations, then inserts agents for each.
-- Uses deterministic UUIDs so the app can reference them consistently.
-- Existing HHCC agents get their organization_id updated.
-- =============================================================================


-- =============================================================================
-- SECTION 1: INSERT ORGANIZATIONS
-- =============================================================================

INSERT INTO public.organizations (id, name, slug, industry, hipaa_mode, plan, theme_config, settings)
VALUES
  ('00000000-0000-4000-a000-000000000001', 'Happier Homes Comfort Care', 'hhcc', 'healthcare', true, 'enterprise', '{}', '{}'),
  ('00000000-0000-4000-a000-000000000002', 'First Nation Fidelity', 'fnf', 'real_estate', false, 'enterprise', '{}', '{}'),
  ('00000000-0000-4000-a000-000000000003', 'Brazil International Escrow Title', 'bet', 'real_estate', false, 'enterprise', '{}', '{}'),
  ('00000000-0000-4000-a000-000000000004', 'Healthcare AI Academy', 'haa', 'education', false, 'enterprise', '{}', '{}'),
  ('00000000-0000-4000-a000-000000000005', 'Rara Avis Marketing', 'ram', 'marketing', false, 'enterprise', '{}', '{}')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  industry = EXCLUDED.industry,
  hipaa_mode = EXCLUDED.hipaa_mode,
  plan = EXCLUDED.plan;


-- =============================================================================
-- SECTION 2: UPDATE EXISTING HHCC AGENTS
-- =============================================================================

UPDATE public.agents
SET organization_id = '00000000-0000-4000-a000-000000000001'
WHERE organization_id IS NULL;


-- =============================================================================
-- SECTION 3: INSERT FNF AGENTS (46 core agents)
-- =============================================================================

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config) VALUES
-- Executive
(gen_random_uuid(), 'magnus', 'Magnus', 'CEO', 'executive', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000002', 'souls/magnus.soul.md', '{}'),
-- Marketing (Marisol + 6)
(gen_random_uuid(), 'marisol', 'Marisol', 'Marketing Director', 'marketing', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/marisol.soul.md', '{}'),
(gen_random_uuid(), 'talon', 'Talon', 'Market Research Specialist', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/talon.soul.md', '{}'),
(gen_random_uuid(), 'ignite', 'Ignite', 'Paid Ads Specialist', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/ignite.soul.md', '{}'),
(gen_random_uuid(), 'onyx', 'Onyx', 'SEO Specialist', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/onyx.soul.md', '{}'),
(gen_random_uuid(), 'cipher-fnf', 'Cipher', 'Email Marketing Specialist', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/cipher.soul.md', '{}'),
(gen_random_uuid(), 'summit-fnf', 'Summit', 'Event Coordinator', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/summit.soul.md', '{}'),
(gen_random_uuid(), 'quill-fnf', 'Quill', 'Community Manager', 'marketing', 'specialist', 'marisol', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/quill.soul.md', '{}'),
-- Sales / Loan Origination (Kael + 5)
(gen_random_uuid(), 'kael', 'Kael', 'Sales Director / Loan Origination', 'sales', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/kael.soul.md', '{}'),
(gen_random_uuid(), 'siren', 'Siren', 'Loan Officer Recruiter', 'sales', 'specialist', 'kael', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/siren.soul.md', '{}'),
(gen_random_uuid(), 'titan', 'Titan', 'Top Producer Loan Officer', 'sales', 'specialist', 'kael', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/titan.soul.md', '{}'),
(gen_random_uuid(), 'echo-fnf', 'Echo', 'Refinance Specialist', 'sales', 'specialist', 'kael', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/echo.soul.md', '{}'),
(gen_random_uuid(), 'canyon', 'Canyon', 'Branch Manager', 'sales', 'specialist', 'kael', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/canyon.soul.md', '{}'),
(gen_random_uuid(), 'flicker', 'Flicker', 'Inside Sales Rep', 'sales', 'specialist', 'kael', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/flicker.soul.md', '{}'),
-- Operations (Rook + 5)
(gen_random_uuid(), 'rook', 'Rook', 'Operations Director', 'operations', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/rook.soul.md', '{}'),
(gen_random_uuid(), 'maven', 'Maven', 'Loan Processor', 'operations', 'specialist', 'rook', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/maven.soul.md', '{}'),
(gen_random_uuid(), 'anchor', 'Anchor', 'Underwriting Coordinator', 'operations', 'specialist', 'rook', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/anchor.soul.md', '{}'),
(gen_random_uuid(), 'finch-fnf', 'Finch', 'Closing Coordinator', 'operations', 'specialist', 'rook', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/finch.soul.md', '{}'),
(gen_random_uuid(), 'vault', 'Vault', 'Post-Closing Specialist', 'operations', 'specialist', 'rook', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/vault.soul.md', '{}'),
(gen_random_uuid(), 'grid', 'Grid', 'Platform Manager', 'operations', 'specialist', 'rook', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/grid.soul.md', '{}'),
-- Wholesaling (Flint + 10)
(gen_random_uuid(), 'flint', 'Flint', 'Wholesaling Director', 'wholesaling', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/flint.soul.md', '{}'),
(gen_random_uuid(), 'vulture', 'Vulture', 'Property Finder', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/vulture.soul.md', '{}'),
(gen_random_uuid(), 'monocle', 'Monocle', 'Market Data Analyst', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/monocle.soul.md', '{}'),
(gen_random_uuid(), 'forge', 'Forge', 'Rehab Development Manager', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/forge.soul.md', '{}'),
(gen_random_uuid(), 'cypher-fnf', 'Cypher', 'Underwriting Analyst', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/cypher.soul.md', '{}'),
(gen_random_uuid(), 'sleuth', 'Sleuth', 'Due Diligence Specialist', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/sleuth.soul.md', '{}'),
(gen_random_uuid(), 'blueprint', 'Blueprint', 'Construction Records Analyst', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/blueprint.soul.md', '{}'),
(gen_random_uuid(), 'meridian-fnf', 'Meridian', 'Land & Survey Specialist', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/meridian.soul.md', '{}'),
(gen_random_uuid(), 'gambit', 'Gambit', 'Acquisition Negotiator', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/gambit.soul.md', '{}'),
(gen_random_uuid(), 'pivot', 'Pivot', 'Disposition Manager', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/pivot.soul.md', '{}'),
(gen_random_uuid(), 'notary', 'Notary', 'Transaction Coordinator', 'wholesaling', 'specialist', 'flint', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/notary.soul.md', '{}'),
-- CX (Stella + 5)
(gen_random_uuid(), 'stella', 'Stella', 'CX Director', 'customer-experience', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/stella.soul.md', '{}'),
(gen_random_uuid(), 'aura', 'Aura', 'Borrower Success Manager', 'customer-experience', 'specialist', 'stella', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/aura.soul.md', '{}'),
(gen_random_uuid(), 'mirror', 'Mirror', 'Review & Reputation Specialist', 'customer-experience', 'specialist', 'stella', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/mirror.soul.md', '{}'),
(gen_random_uuid(), 'kin', 'Kin', 'Referral Program Coordinator', 'customer-experience', 'specialist', 'stella', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/kin.soul.md', '{}'),
(gen_random_uuid(), 'pulse', 'Pulse', 'Engagement Content Specialist', 'customer-experience', 'specialist', 'stella', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/pulse.soul.md', '{}'),
(gen_random_uuid(), 'oracle-fnf', 'Oracle', 'Feedback & Insights Analyst', 'customer-experience', 'specialist', 'stella', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/oracle.soul.md', '{}'),
-- Compliance (Justus + 4)
(gen_random_uuid(), 'justus', 'Justus', 'Compliance Director', 'compliance', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/justus.soul.md', '{}'),
(gen_random_uuid(), 'sentinel-fnf', 'Sentinel', 'Regulatory Compliance Officer', 'compliance', 'specialist', 'justus', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/sentinel.soul.md', '{}'),
(gen_random_uuid(), 'scribe', 'Scribe', 'Quality Control Specialist', 'compliance', 'specialist', 'justus', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/scribe.soul.md', '{}'),
(gen_random_uuid(), 'warden', 'Warden', 'Risk Management Analyst', 'compliance', 'specialist', 'justus', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/warden.soul.md', '{}'),
(gen_random_uuid(), 'parity', 'Parity', 'Fair Lending Officer', 'compliance', 'specialist', 'justus', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/parity.soul.md', '{}'),
-- Product & Pricing (Sterling + 3)
(gen_random_uuid(), 'sterling-fnf', 'Sterling', 'Product & Pricing Director', 'product', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/sterling.soul.md', '{}'),
(gen_random_uuid(), 'gauge', 'Gauge', 'Pricing Analyst', 'product', 'specialist', 'sterling-fnf', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/gauge.soul.md', '{}'),
(gen_random_uuid(), 'compass', 'Compass', 'Loan Program Specialist', 'product', 'specialist', 'sterling-fnf', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/compass.soul.md', '{}'),
(gen_random_uuid(), 'leverage', 'Leverage', 'Investor Relations Manager', 'product', 'specialist', 'sterling-fnf', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/leverage.soul.md', '{}'),
-- Accounting & Finance (Bastion + 5)
(gen_random_uuid(), 'bastion', 'Bastion', 'CFO / Finance Director', 'accounting-finance', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/bastion.soul.md', '{}'),
(gen_random_uuid(), 'ledger-fnf', 'Ledger', 'Bookkeeper & Reconciliation', 'accounting-finance', 'specialist', 'bastion', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/ledger.soul.md', '{}'),
(gen_random_uuid(), 'tribute', 'Tribute', 'Accounts Payable Specialist', 'accounting-finance', 'specialist', 'bastion', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/tribute.soul.md', '{}'),
(gen_random_uuid(), 'yield', 'Yield', 'Accounts Receivable & Revenue', 'accounting-finance', 'specialist', 'bastion', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/yield.soul.md', '{}'),
(gen_random_uuid(), 'writ', 'Writ', 'Tax & Entity Compliance', 'accounting-finance', 'specialist', 'bastion', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/writ.soul.md', '{}'),
(gen_random_uuid(), 'bulwark', 'Bulwark', 'Financial Reporting & Audit', 'accounting-finance', 'specialist', 'bastion', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/bulwark.soul.md', '{}'),
-- Legal (Phoenix + 6)
(gen_random_uuid(), 'phoenix', 'Phoenix', 'Chief Legal Officer USA', 'legal', 'director', 'magnus', 'active', '00000000-0000-4000-a000-000000000002', 'souls/phoenix.soul.md', '{}'),
(gen_random_uuid(), 'callum', 'Callum', 'NE & Mid-Atlantic Legal', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/callum.soul.md', '{}'),
(gen_random_uuid(), 'savannah', 'Savannah', 'SE Legal (FL, GA, Carolinas)', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/savannah.soul.md', '{}'),
(gen_random_uuid(), 'tex', 'Tex', 'SW Legal (TX, AZ, NV)', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/tex.soul.md', '{}'),
(gen_random_uuid(), 'pacific', 'Pacific', 'West Coast Legal', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/pacific.soul.md', '{}'),
(gen_random_uuid(), 'prairie', 'Prairie', 'Midwest Legal', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/prairie.soul.md', '{}'),
(gen_random_uuid(), 'summit-legal', 'Summit', 'Mountain Legal', 'legal', 'specialist', 'phoenix', 'idle', '00000000-0000-4000-a000-000000000002', 'souls/summit.soul.md', '{}')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- SECTION 4: INSERT BET AGENTS (35 core agents)
-- =============================================================================

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config) VALUES
(gen_random_uuid(), 'ricardo', 'Ricardo', 'CEO', 'executive', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000003', 'souls/ricardo.soul.md', '{}'),
-- Marketing (Isadora + 6)
(gen_random_uuid(), 'isadora', 'Isadora', 'Marketing Director', 'marketing', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/isadora.soul.md', '{}'),
(gen_random_uuid(), 'radar', 'Radar', 'Market Research Specialist', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/radar.soul.md', '{}'),
(gen_random_uuid(), 'fogo', 'Fogo', 'Paid Ads Specialist', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/fogo.soul.md', '{}'),
(gen_random_uuid(), 'raiz', 'Raiz', 'SEO Specialist', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/raiz.soul.md', '{}'),
(gen_random_uuid(), 'onda', 'Onda', 'Email Marketing Specialist', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/onda.soul.md', '{}'),
(gen_random_uuid(), 'palco', 'Palco', 'Event Coordinator', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/palco.soul.md', '{}'),
(gen_random_uuid(), 'rio', 'Rio', 'Community Manager', 'marketing', 'specialist', 'isadora', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/rio.soul.md', '{}'),
-- Sales (Thor + 4)
(gen_random_uuid(), 'thor', 'Thor', 'Sales / Realtor Relations Director', 'sales', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/thor.soul.md', '{}'),
(gen_random_uuid(), 'atracao', 'Atracao', 'Realtor Recruiter', 'sales', 'specialist', 'thor', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/atracao.soul.md', '{}'),
(gen_random_uuid(), 'ponte', 'Ponte', 'Realtor Relations Manager', 'sales', 'specialist', 'thor', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/ponte.soul.md', '{}'),
(gen_random_uuid(), 'ancora', 'Ancora', 'New Development Specialist', 'sales', 'specialist', 'thor', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/ancora.soul.md', '{}'),
(gen_random_uuid(), 'vista', 'Vista', 'Inside Sales Rep', 'sales', 'specialist', 'thor', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/vista.soul.md', '{}'),
-- Operations (Forte + 5)
(gen_random_uuid(), 'forte', 'Forte', 'Title & Escrow Operations Director', 'operations', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/forte.soul.md', '{}'),
(gen_random_uuid(), 'pesquisa', 'Pesquisa', 'Title Search Specialist', 'operations', 'specialist', 'forte', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/pesquisa.soul.md', '{}'),
(gen_random_uuid(), 'limpo', 'Limpo', 'Title Curative Specialist', 'operations', 'specialist', 'forte', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/limpo.soul.md', '{}'),
(gen_random_uuid(), 'documento', 'Documento', 'Document Preparation Specialist', 'operations', 'specialist', 'forte', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/documento.soul.md', '{}'),
(gen_random_uuid(), 'cofre', 'Cofre', 'Escrow Officer', 'operations', 'specialist', 'forte', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/cofre.soul.md', '{}'),
(gen_random_uuid(), 'mapa', 'Mapa', 'Survey & Property Records', 'operations', 'specialist', 'forte', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/mapa.soul.md', '{}'),
-- Closing (Chave + 4)
(gen_random_uuid(), 'chave', 'Chave', 'Closing Director', 'closing', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/chave.soul.md', '{}'),
(gen_random_uuid(), 'agenda', 'Agenda', 'Closing Coordinator', 'closing', 'specialist', 'chave', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/agenda.soul.md', '{}'),
(gen_random_uuid(), 'assinatura', 'Assinatura', 'Notary Liaison', 'closing', 'specialist', 'chave', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/assinatura.soul.md', '{}'),
(gen_random_uuid(), 'fechamento', 'Fechamento', 'Final Review Specialist', 'closing', 'specialist', 'chave', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/fechamento.soul.md', '{}'),
(gen_random_uuid(), 'repasse', 'Repasse', 'Funding Coordinator', 'closing', 'specialist', 'chave', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/repasse.soul.md', '{}'),
-- CX (Luz + 5)
(gen_random_uuid(), 'luz', 'Luz', 'Customer Experience Director', 'customer-experience', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/luz.soul.md', '{}'),
(gen_random_uuid(), 'guia', 'Guia', 'Client Success Manager', 'customer-experience', 'specialist', 'luz', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/guia.soul.md', '{}'),
(gen_random_uuid(), 'eco', 'Eco', 'Review & Reputation Specialist', 'customer-experience', 'specialist', 'luz', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/eco.soul.md', '{}'),
(gen_random_uuid(), 'laco', 'Laco', 'Referral Program Coordinator', 'customer-experience', 'specialist', 'luz', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/laco.soul.md', '{}'),
(gen_random_uuid(), 'brilho', 'Brilho', 'Engagement Content Specialist', 'customer-experience', 'specialist', 'luz', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/brilho.soul.md', '{}'),
(gen_random_uuid(), 'sentinela', 'Sentinela', 'Feedback & Insights Analyst', 'customer-experience', 'specialist', 'luz', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/sentinela.soul.md', '{}'),
-- Compliance (Justo + 3)
(gen_random_uuid(), 'justo', 'Justo', 'Compliance & Legal Director', 'compliance', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/justo.soul.md', '{}'),
(gen_random_uuid(), 'escudo', 'Escudo', 'Regulatory Compliance Officer', 'compliance', 'specialist', 'justo', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/escudo.soul.md', '{}'),
(gen_random_uuid(), 'verificacao', 'Verificacao', 'AML & Fraud Prevention', 'compliance', 'specialist', 'justo', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/verificacao.soul.md', '{}'),
(gen_random_uuid(), 'registro', 'Registro', 'Document Compliance', 'compliance', 'specialist', 'justo', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/registro.soul.md', '{}'),
-- Accounting (Tesouro + 4)
(gen_random_uuid(), 'tesouro', 'Tesouro', 'CFO / Finance Director', 'accounting-finance', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/tesouro.soul.md', '{}'),
(gen_random_uuid(), 'balanco', 'Balanço', 'Bookkeeper & Reconciliation', 'accounting-finance', 'specialist', 'tesouro', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/balanco.soul.md', '{}'),
(gen_random_uuid(), 'pagamento', 'Pagamento', 'Accounts Payable', 'accounting-finance', 'specialist', 'tesouro', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/pagamento.soul.md', '{}'),
(gen_random_uuid(), 'cobranca', 'Cobrança', 'Accounts Receivable', 'accounting-finance', 'specialist', 'tesouro', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/cobranca.soul.md', '{}'),
(gen_random_uuid(), 'fiscal', 'Fiscal', 'Tax & Regulatory Compliance', 'accounting-finance', 'specialist', 'tesouro', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/fiscal.soul.md', '{}'),
-- Legal (Themis + 6)
(gen_random_uuid(), 'themis', 'Themis', 'Chief Legal Officer Brazil', 'legal', 'director', 'ricardo', 'active', '00000000-0000-4000-a000-000000000003', 'souls/themis.soul.md', '{}'),
(gen_random_uuid(), 'carioca', 'Carioca', 'RJ Legal Specialist', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/carioca.soul.md', '{}'),
(gen_random_uuid(), 'paulista', 'Paulista', 'SP Legal Specialist', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/paulista.soul.md', '{}'),
(gen_random_uuid(), 'baiano', 'Baiano', 'BA Legal Specialist', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/baiano.soul.md', '{}'),
(gen_random_uuid(), 'brasilia', 'Brasília', 'DF Federal Legal', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/brasilia.soul.md', '{}'),
(gen_random_uuid(), 'mineiro', 'Mineiro', 'MG Legal Specialist', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/mineiro.soul.md', '{}'),
(gen_random_uuid(), 'gaucho', 'Gaúcho', 'RS Legal Specialist', 'legal', 'specialist', 'themis', 'idle', '00000000-0000-4000-a000-000000000003', 'souls/gaucho.soul.md', '{}')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- SECTION 5: INSERT HAA AGENTS (37 core agents)
-- =============================================================================

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config) VALUES
(gen_random_uuid(), 'maxwell', 'Maxwell', 'CEO', 'executive', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000004', 'souls/maxwell.soul.md', '{}'),
-- Marketing (Diana + 5)
(gen_random_uuid(), 'diana', 'Diana', 'Marketing Director', 'marketing', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/diana.soul.md', '{}'),
(gen_random_uuid(), 'iris', 'Iris', 'Market Research Specialist', 'marketing', 'specialist', 'diana', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/iris.soul.md', '{}'),
(gen_random_uuid(), 'rex', 'Rex', 'Paid Ads Specialist', 'marketing', 'specialist', 'diana', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/rex.soul.md', '{}'),
(gen_random_uuid(), 'finn', 'Finn', 'SEO Specialist', 'marketing', 'specialist', 'diana', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/finn.soul.md', '{}'),
(gen_random_uuid(), 'lyra', 'Lyra', 'Email Marketing Specialist', 'marketing', 'specialist', 'diana', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/lyra.soul.md', '{}'),
(gen_random_uuid(), 'piper-haa', 'Piper', 'Webinar Coordinator', 'marketing', 'specialist', 'diana', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/piper.soul.md', '{}'),
-- Content (Jordan + 6)
(gen_random_uuid(), 'jordan', 'Jordan', 'Content Director', 'content', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/jordan.soul.md', '{}'),
(gen_random_uuid(), 'blaze-haa', 'Blaze', 'Short-Form Video Specialist', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/blaze.soul.md', '{}'),
(gen_random_uuid(), 'lennox', 'Lennox', 'Long-Form Video Specialist', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/lennox.soul.md', '{}'),
(gen_random_uuid(), 'wren-haa', 'Wren', 'Blog & Written Content', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/wren.soul.md', '{}'),
(gen_random_uuid(), 'lux', 'Lux', 'Graphic Designer', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/lux.soul.md', '{}'),
(gen_random_uuid(), 'cleo', 'Cleo', 'Social Media Manager', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/cleo.soul.md', '{}'),
(gen_random_uuid(), 'spark', 'Spark', 'Community Manager', 'content', 'specialist', 'jordan', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/spark.soul.md', '{}'),
-- Sales (Victor + 4)
(gen_random_uuid(), 'victor', 'Victor', 'Sales Director', 'sales', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/victor.soul.md', '{}'),
(gen_random_uuid(), 'cassidy', 'Cassidy', 'Sales Copywriter', 'sales', 'specialist', 'victor', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/cassidy.soul.md', '{}'),
(gen_random_uuid(), 'drake', 'Drake', 'Sales Development Rep', 'sales', 'specialist', 'victor', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/drake.soul.md', '{}'),
(gen_random_uuid(), 'vera', 'Vera', 'Enrollment Specialist', 'sales', 'specialist', 'victor', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/vera.soul.md', '{}'),
(gen_random_uuid(), 'trace', 'Trace', 'CRM Admin', 'sales', 'specialist', 'victor', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/trace.soul.md', '{}'),
-- Product (Priya + 3)
(gen_random_uuid(), 'priya', 'Priya', 'Product Director', 'product', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/priya.soul.md', '{}'),
(gen_random_uuid(), 'milo', 'Milo', 'Curriculum Developer', 'product', 'specialist', 'priya', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/milo.soul.md', '{}'),
(gen_random_uuid(), 'nora', 'Nora', 'Assessment Designer', 'product', 'specialist', 'priya', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/nora.soul.md', '{}'),
(gen_random_uuid(), 'remy', 'Remy', 'LMS Administrator', 'product', 'specialist', 'priya', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/remy.soul.md', '{}'),
-- Operations (Sterling + 3)
(gen_random_uuid(), 'sterling-haa', 'Sterling', 'Operations Director', 'operations', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/sterling.soul.md', '{}'),
(gen_random_uuid(), 'skye', 'Skye', 'Student Onboarding Specialist', 'operations', 'specialist', 'sterling-haa', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/skye.soul.md', '{}'),
(gen_random_uuid(), 'knox', 'Knox', 'Platform Manager', 'operations', 'specialist', 'sterling-haa', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/knox.soul.md', '{}'),
(gen_random_uuid(), 'bree', 'Bree', 'Customer Support Rep', 'operations', 'specialist', 'sterling-haa', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/bree.soul.md', '{}'),
-- Risk
(gen_random_uuid(), 'vesper-haa', 'Vesper', 'Risk Analyst', 'compliance', 'specialist', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/vesper.soul.md', '{}'),
-- Accounting (Aspen + 3)
(gen_random_uuid(), 'aspen', 'Aspen', 'CFO / Finance Director', 'accounting-finance', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/aspen.soul.md', '{}'),
(gen_random_uuid(), 'cedar', 'Cedar', 'Bookkeeper & AP/AR', 'accounting-finance', 'specialist', 'aspen', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/cedar.soul.md', '{}'),
(gen_random_uuid(), 'quartz', 'Quartz', 'Tax & Entity Compliance', 'accounting-finance', 'specialist', 'aspen', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/quartz.soul.md', '{}'),
(gen_random_uuid(), 'summit-haa', 'Summit', 'Financial Reporting & Planning', 'accounting-finance', 'specialist', 'aspen', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/summit.soul.md', '{}'),
-- CX (Celeste + 5)
(gen_random_uuid(), 'celeste', 'Celeste', 'CX Director', 'customer-experience', 'director', 'maxwell', 'active', '00000000-0000-4000-a000-000000000004', 'souls/celeste.soul.md', '{}'),
(gen_random_uuid(), 'haven-haa', 'Haven', 'Student Success Manager', 'customer-experience', 'specialist', 'celeste', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/haven.soul.md', '{}'),
(gen_random_uuid(), 'echo-haa', 'Echo', 'Review & Reputation Specialist', 'customer-experience', 'specialist', 'celeste', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/echo.soul.md', '{}'),
(gen_random_uuid(), 'dash', 'Dash', 'Referral Program Coordinator', 'customer-experience', 'specialist', 'celeste', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/dash.soul.md', '{}'),
(gen_random_uuid(), 'rue', 'Rue', 'Engagement Content Specialist', 'customer-experience', 'specialist', 'celeste', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/rue.soul.md', '{}'),
(gen_random_uuid(), 'vex', 'Vex', 'Feedback & Insights Analyst', 'customer-experience', 'specialist', 'celeste', 'idle', '00000000-0000-4000-a000-000000000004', 'souls/vex.soul.md', '{}')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- SECTION 6: INSERT RAM AGENTS (48 core agents)
-- =============================================================================

INSERT INTO public.agents (id, slug, name, role, department, tier, parent_agent_id, status, organization_id, soul_file_path, config) VALUES
(gen_random_uuid(), 'corvus', 'Corvus', 'CEO', 'executive', 'orchestrator', NULL, 'active', '00000000-0000-4000-a000-000000000005', 'souls/corvus.soul.md', '{}'),
-- Partnerships
(gen_random_uuid(), 'ibis', 'Ibis', 'Partnerships & Community Director', 'partnerships', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/ibis.soul.md', '{}'),
-- Marketing (Plume + 5)
(gen_random_uuid(), 'plume', 'Plume', 'Marketing Director', 'marketing', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/plume.soul.md', '{}'),
(gen_random_uuid(), 'wren-ram', 'Wren', 'Content Strategist', 'marketing', 'specialist', 'plume', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/wren.soul.md', '{}'),
(gen_random_uuid(), 'starling', 'Starling', 'Social Media Specialist', 'marketing', 'specialist', 'plume', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/starling.soul.md', '{}'),
(gen_random_uuid(), 'osprey', 'Osprey', 'Paid Ads Specialist', 'marketing', 'specialist', 'plume', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/osprey.soul.md', '{}'),
(gen_random_uuid(), 'lark', 'Lark', 'SEO Specialist', 'marketing', 'specialist', 'plume', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/lark.soul.md', '{}'),
(gen_random_uuid(), 'piper-ram', 'Piper', 'Email Marketing Specialist', 'marketing', 'specialist', 'plume', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/piper.soul.md', '{}'),
-- Sales (Hawk + 4)
(gen_random_uuid(), 'hawk', 'Hawk', 'Sales Director', 'sales', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/hawk.soul.md', '{}'),
(gen_random_uuid(), 'falcon', 'Falcon', 'Account Executive — Enterprise', 'sales', 'specialist', 'hawk', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/falcon.soul.md', '{}'),
(gen_random_uuid(), 'merlin-ram', 'Merlin', 'Account Executive — SMB', 'sales', 'specialist', 'hawk', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/merlin.soul.md', '{}'),
(gen_random_uuid(), 'swift', 'Swift', 'Inside Sales / Lead Qualifier', 'sales', 'specialist', 'hawk', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/swift.soul.md', '{}'),
(gen_random_uuid(), 'shrike', 'Shrike', 'Proposal & Pitch Specialist', 'sales', 'specialist', 'hawk', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/shrike.soul.md', '{}'),
-- AI Solutions (Raptor + 5)
(gen_random_uuid(), 'raptor', 'Raptor', 'AI Solutions Director', 'ai-solutions', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/raptor.soul.md', '{}'),
(gen_random_uuid(), 'peregrine', 'Peregrine', 'AI Agent Developer', 'ai-solutions', 'specialist', 'raptor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/peregrine.soul.md', '{}'),
(gen_random_uuid(), 'harrier', 'Harrier', 'Automation Architect', 'ai-solutions', 'specialist', 'raptor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/harrier.soul.md', '{}'),
(gen_random_uuid(), 'kite', 'Kite', 'Integration Specialist', 'ai-solutions', 'specialist', 'raptor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/kite.soul.md', '{}'),
(gen_random_uuid(), 'goshawk', 'Goshawk', 'AI Quality & Testing', 'ai-solutions', 'specialist', 'raptor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/goshawk.soul.md', '{}'),
(gen_random_uuid(), 'sparrowhawk', 'Sparrowhawk', 'CAIO Delivery Specialist', 'ai-solutions', 'specialist', 'raptor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/sparrowhawk.soul.md', '{}'),
-- Campaign Management (Blaze + 5)
(gen_random_uuid(), 'blaze-ram', 'Blaze', 'Campaign Management Director', 'campaign-management', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/blaze.soul.md', '{}'),
(gen_random_uuid(), 'robin', 'Robin', 'Campaign Strategist', 'campaign-management', 'specialist', 'blaze-ram', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/robin.soul.md', '{}'),
(gen_random_uuid(), 'tanager', 'Tanager', 'Paid Media Manager', 'campaign-management', 'specialist', 'blaze-ram', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/tanager.soul.md', '{}'),
(gen_random_uuid(), 'bunting', 'Bunting', 'Email & Nurture Campaign Manager', 'campaign-management', 'specialist', 'blaze-ram', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/bunting.soul.md', '{}'),
(gen_random_uuid(), 'oriole', 'Oriole', 'Content Production Specialist', 'campaign-management', 'specialist', 'blaze-ram', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/oriole.soul.md', '{}'),
(gen_random_uuid(), 'cardinal', 'Cardinal', 'Analytics & Reporting', 'campaign-management', 'specialist', 'blaze-ram', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/cardinal.soul.md', '{}'),
-- Web & Design (Avis + 5)
(gen_random_uuid(), 'avis', 'Avis', 'Web & Design Director', 'web-design', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/avis.soul.md', '{}'),
(gen_random_uuid(), 'jay', 'Jay', 'UI/UX Designer', 'web-design', 'specialist', 'avis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/jay.soul.md', '{}'),
(gen_random_uuid(), 'kingfisher', 'Kingfisher', 'Frontend Developer', 'web-design', 'specialist', 'avis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/kingfisher.soul.md', '{}'),
(gen_random_uuid(), 'magpie', 'Magpie', 'Graphic Designer / Brand Identity', 'web-design', 'specialist', 'avis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/magpie.soul.md', '{}'),
(gen_random_uuid(), 'finwren', 'Finwren', 'Motion & Animation Designer', 'web-design', 'specialist', 'avis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/finwren.soul.md', '{}'),
(gen_random_uuid(), 'dove', 'Dove', 'Copywriter / UX Writer', 'web-design', 'specialist', 'avis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/dove.soul.md', '{}'),
-- Coaching (Condor + 3)
(gen_random_uuid(), 'condor', 'Condor', 'Coaching & Strategy Director', 'coaching', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/condor.soul.md', '{}'),
(gen_random_uuid(), 'albatross', 'Albatross', '1:1 Coaching Facilitator', 'coaching', 'specialist', 'condor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/albatross.soul.md', '{}'),
(gen_random_uuid(), 'pelican', 'Pelican', 'Group Program Coordinator', 'coaching', 'specialist', 'condor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/pelican.soul.md', '{}'),
(gen_random_uuid(), 'nighthawk', 'Nighthawk', 'Workshop & Event Specialist', 'coaching', 'specialist', 'condor', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/nighthawk.soul.md', '{}'),
-- Client Success (Crane + 4)
(gen_random_uuid(), 'crane', 'Crane', 'Client Success Director', 'client-success', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/crane.soul.md', '{}'),
(gen_random_uuid(), 'heron', 'Heron', 'Client Success Manager — Retainer', 'client-success', 'specialist', 'crane', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/heron.soul.md', '{}'),
(gen_random_uuid(), 'egret', 'Egret', 'Client Success Manager — Project', 'client-success', 'specialist', 'crane', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/egret.soul.md', '{}'),
(gen_random_uuid(), 'flamingo', 'Flamingo', 'Review & Reputation Specialist', 'client-success', 'specialist', 'crane', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/flamingo.soul.md', '{}'),
(gen_random_uuid(), 'sandpiper', 'Sandpiper', 'Onboarding Specialist', 'client-success', 'specialist', 'crane', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/sandpiper.soul.md', '{}'),
-- Operations (Kestrel + 3)
(gen_random_uuid(), 'kestrel', 'Kestrel', 'Operations Director', 'operations', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/kestrel.soul.md', '{}'),
(gen_random_uuid(), 'sparrow', 'Sparrow', 'Project Manager', 'operations', 'specialist', 'kestrel', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/sparrow.soul.md', '{}'),
(gen_random_uuid(), 'raven', 'Raven', 'Resource & Capacity Planner', 'operations', 'specialist', 'kestrel', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/raven.soul.md', '{}'),
(gen_random_uuid(), 'crow', 'Crow', 'Platform & Tools Manager', 'operations', 'specialist', 'kestrel', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/crow.soul.md', '{}'),
-- Accounting (Ledgerbird + 5)
(gen_random_uuid(), 'ledgerbird', 'Ledgerbird', 'CFO / Finance Director', 'accounting-finance', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/ledgerbird.soul.md', '{}'),
(gen_random_uuid(), 'swallow', 'Swallow', 'Billing & Invoice Specialist', 'accounting-finance', 'specialist', 'ledgerbird', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/swallow.soul.md', '{}'),
(gen_random_uuid(), 'waxwing', 'Waxwing', 'Bookkeeper & Reconciliation', 'accounting-finance', 'specialist', 'ledgerbird', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/waxwing.soul.md', '{}'),
(gen_random_uuid(), 'tern', 'Tern', 'Accounts Payable', 'accounting-finance', 'specialist', 'ledgerbird', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/tern.soul.md', '{}'),
(gen_random_uuid(), 'nuthatch', 'Nuthatch', 'Tax & Entity Compliance', 'accounting-finance', 'specialist', 'ledgerbird', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/nuthatch.soul.md', '{}'),
(gen_random_uuid(), 'warbler', 'Warbler', 'Financial Reporting & Profitability', 'accounting-finance', 'specialist', 'ledgerbird', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/warbler.soul.md', '{}'),
-- Compliance (Aegis + 2)
(gen_random_uuid(), 'aegis', 'Aegis', 'Compliance Director', 'compliance', 'director', 'corvus', 'active', '00000000-0000-4000-a000-000000000005', 'souls/aegis.soul.md', '{}'),
(gen_random_uuid(), 'owl', 'Owl', 'Contract & Legal Review', 'compliance', 'specialist', 'aegis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/owl.soul.md', '{}'),
(gen_random_uuid(), 'stork', 'Stork', 'Data Privacy & IP Compliance', 'compliance', 'specialist', 'aegis', 'idle', '00000000-0000-4000-a000-000000000005', 'souls/stork.soul.md', '{}')
ON CONFLICT DO NOTHING;
