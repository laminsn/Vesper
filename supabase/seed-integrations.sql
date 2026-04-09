-- ═══════════════════════════════════════════════════
-- HHCC Command Center — Integration Registry Seed
-- ═══════════════════════════════════════════════════
-- Seeds the integration_registry with HHCC's actual
-- connected MCP servers, APIs, and OAuth integrations.

INSERT INTO public.integration_registry (integration_key, display_name, category, status, used_by_departments) VALUES
  ('supabase',         'Supabase',          'database', 'connected',    '{"executive","marketing","clinical-operations","admissions-intake","caregiver-staffing","customer-experience","compliance-quality","accounting-finance"}'),
  ('n8n',              'n8n Cloud',         'webhook',  'connected',    '{"executive","marketing","clinical-operations","admissions-intake","caregiver-staffing","customer-experience","compliance-quality","accounting-finance"}'),
  ('notion',           'Notion',            'mcp',      'connected',    '{"executive","marketing","clinical-operations","admissions-intake","caregiver-staffing","customer-experience","compliance-quality","accounting-finance"}'),
  ('airtable',         'Airtable',          'mcp',      'connected',    '{"executive","marketing","admissions-intake","caregiver-staffing","customer-experience"}'),
  ('ghl',              'GoHighLevel',       'mcp',      'connected',    '{"marketing","admissions-intake","customer-experience"}'),
  ('google-workspace', 'Google Workspace',  'oauth',    'connected',    '{"executive","marketing","clinical-operations","admissions-intake","compliance-quality","accounting-finance"}'),
  ('anthropic',        'Anthropic Claude',  'api',      'connected',    '{"executive"}'),
  ('apify',            'Apify',             'mcp',      'connected',    '{"marketing","caregiver-staffing"}'),
  ('jobspy',           'JobSpy',            'mcp',      'connected',    '{"caregiver-staffing"}'),
  ('telegram',         'Telegram',          'api',      'disconnected', '{}'),
  ('gmail',            'Gmail',             'oauth',    'connected',    '{"customer-experience","marketing"}'),
  ('figma',            'Figma',             'mcp',      'disconnected', '{"marketing"}'),
  ('canva',            'Canva',             'mcp',      'connected',    '{"marketing"}');
