-- ═══════════════════════════════════════════════════
-- HHCC Command Center — Seed Data
-- ═══════════════════════════════════════════════════
-- Generated from HHCC org chart, KPIs, playbooks, and handoffs.
-- All 39 agents, 8 departments, ~50 KPIs, 11 playbooks, 12 handoffs.


-- ───────────────────────────────────────────────────
-- 1. DEPARTMENTS (8 rows)
-- ───────────────────────────────────────────────────

INSERT INTO departments (id, slug, name, color, icon, agent_count) VALUES
  (gen_random_uuid(), 'executive',           'Executive',            '#f59e0b', 'Crown',       0),
  (gen_random_uuid(), 'marketing',           'Marketing',            '#ec4899', 'Megaphone',   0),
  (gen_random_uuid(), 'clinical-operations', 'Clinical Operations',  '#ef4444', 'HeartPulse',  0),
  (gen_random_uuid(), 'admissions-intake',   'Admissions & Intake',  '#3b82f6', 'UserPlus',    0),
  (gen_random_uuid(), 'caregiver-staffing',  'Caregiver Staffing',   '#8b5cf6', 'Users',       0),
  (gen_random_uuid(), 'customer-experience', 'Customer Experience',  '#06d6a0', 'Heart',       0),
  (gen_random_uuid(), 'compliance-quality',  'Compliance & Quality', '#f97316', 'Shield',      0),
  (gen_random_uuid(), 'accounting-finance',  'Accounting & Finance', '#14b8a6', 'Calculator',  0);


-- ───────────────────────────────────────────────────
-- 2. AGENTS (39 rows)
-- ───────────────────────────────────────────────────
-- We insert all agents first with parent_agent_id = NULL,
-- then update parent references in a second pass.

-- Executive (1 agent)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES (gen_random_uuid(), 'diane', 'Diane', 'CEO', 'executive', 'orchestrator', NULL, 'idle', 'souls/diane.soul.md');

-- Marketing (7 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'camila',  'Camila',  'Marketing Director',         'marketing', 'director',   NULL, 'idle', 'souls/camila.soul.md'),
  (gen_random_uuid(), 'haven',   'Haven',   'Market Research Specialist',  'marketing', 'specialist', NULL, 'idle', 'souls/haven.soul.md'),
  (gen_random_uuid(), 'beacon',  'Beacon',  'Paid Ads Specialist',         'marketing', 'specialist', NULL, 'idle', 'souls/beacon.soul.md'),
  (gen_random_uuid(), 'roots',   'Roots',   'SEO Specialist',              'marketing', 'specialist', NULL, 'idle', 'souls/roots.soul.md'),
  (gen_random_uuid(), 'ember',   'Ember',   'Email Marketing Specialist',  'marketing', 'specialist', NULL, 'idle', 'souls/ember.soul.md'),
  (gen_random_uuid(), 'gather',  'Gather',  'Event Coordinator',           'marketing', 'specialist', NULL, 'idle', 'souls/gather.soul.md'),
  (gen_random_uuid(), 'grace',   'Grace',   'Community Manager',           'marketing', 'specialist', NULL, 'idle', 'souls/grace.soul.md');

-- Clinical Operations (6 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'dr-elena',    'Dr. Elena',    'Clinical Director',                          'clinical-operations', 'director',   NULL, 'idle', 'souls/dr-elena.soul.md'),
  (gen_random_uuid(), 'nurse-riley', 'Nurse Riley',  'Director of Nursing',                        'clinical-operations', 'specialist', NULL, 'idle', 'souls/nurse-riley.soul.md'),
  (gen_random_uuid(), 'solace',      'Solace',       'Hospice Nurse - RN',                         'clinical-operations', 'specialist', NULL, 'idle', 'souls/solace.soul.md'),
  (gen_random_uuid(), 'comfort',     'Comfort',      'Certified Nursing Assistant - CNA',          'clinical-operations', 'specialist', NULL, 'idle', 'souls/comfort.soul.md'),
  (gen_random_uuid(), 'spirit',      'Spirit',       'Chaplain / Spiritual Care Coordinator',      'clinical-operations', 'specialist', NULL, 'idle', 'souls/spirit.soul.md'),
  (gen_random_uuid(), 'harmony',     'Harmony',      'Social Worker - MSW',                        'clinical-operations', 'specialist', NULL, 'idle', 'souls/harmony.soul.md'),
  (gen_random_uuid(), 'bereavement', 'Bereavement',  'Bereavement Coordinator',                    'clinical-operations', 'specialist', NULL, 'idle', 'souls/bereavement.soul.md');

-- Admissions & Intake (4 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'river',   'River',   'Admissions Director',                'admissions-intake', 'director',   NULL, 'idle', 'souls/river.soul.md'),
  (gen_random_uuid(), 'bridge',  'Bridge',  'Intake Coordinator',                 'admissions-intake', 'specialist', NULL, 'idle', 'souls/bridge.soul.md'),
  (gen_random_uuid(), 'verify',  'Verify',  'Insurance & Eligibility Specialist', 'admissions-intake', 'specialist', NULL, 'idle', 'souls/verify.soul.md'),
  (gen_random_uuid(), 'triage',  'Triage',  'Clinical Intake Nurse',              'admissions-intake', 'specialist', NULL, 'idle', 'souls/triage.soul.md');

-- Caregiver Staffing (5 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'terra',   'Terra',   'Staffing Director',                        'caregiver-staffing', 'director',   NULL, 'idle', 'souls/terra.soul.md'),
  (gen_random_uuid(), 'recruit', 'Recruit', 'Caregiver Recruiter',                      'caregiver-staffing', 'specialist', NULL, 'idle', 'souls/recruit.soul.md'),
  (gen_random_uuid(), 'shift',   'Shift',   'Scheduling Coordinator',                   'caregiver-staffing', 'specialist', NULL, 'idle', 'souls/shift.soul.md'),
  (gen_random_uuid(), 'train',   'Train',   'Training & Development Specialist',        'caregiver-staffing', 'specialist', NULL, 'idle', 'souls/train.soul.md'),
  (gen_random_uuid(), 'retain',  'Retain',  'Employee Relations Specialist',             'caregiver-staffing', 'specialist', NULL, 'idle', 'souls/retain.soul.md');

-- Customer Experience (6 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'serenity',  'Serenity',  'CX Director',                     'customer-experience', 'director',   NULL, 'idle', 'souls/serenity.soul.md'),
  (gen_random_uuid(), 'embrace',   'Embrace',   'Family Success Manager',           'customer-experience', 'specialist', NULL, 'idle', 'souls/embrace.soul.md'),
  (gen_random_uuid(), 'memory',    'Memory',    'Review & Testimonial Specialist',  'customer-experience', 'specialist', NULL, 'idle', 'souls/memory.soul.md'),
  (gen_random_uuid(), 'gratitude', 'Gratitude', 'Referral Family Coordinator',      'customer-experience', 'specialist', NULL, 'idle', 'souls/gratitude.soul.md'),
  (gen_random_uuid(), 'reflect',   'Reflect',   'Engagement Content Specialist',    'customer-experience', 'specialist', NULL, 'idle', 'souls/reflect.soul.md'),
  (gen_random_uuid(), 'listen',    'Listen',    'Feedback & Insights Analyst',      'customer-experience', 'specialist', NULL, 'idle', 'souls/listen.soul.md');

-- Compliance & Quality (5 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'justice',  'Justice',  'Compliance Director',                              'compliance-quality', 'director',   NULL, 'idle', 'souls/justice.soul.md'),
  (gen_random_uuid(), 'guardian', 'Guardian', 'Regulatory Compliance Officer',                    'compliance-quality', 'specialist', NULL, 'idle', 'souls/guardian.soul.md'),
  (gen_random_uuid(), 'chart',   'Chart',    'Medical Records & Documentation Specialist',       'compliance-quality', 'specialist', NULL, 'idle', 'souls/chart.soul.md'),
  (gen_random_uuid(), 'shield',  'Shield',   'HIPAA Privacy Officer',                            'compliance-quality', 'specialist', NULL, 'idle', 'souls/shield.soul.md'),
  (gen_random_uuid(), 'quality', 'Quality',  'Quality Improvement Coordinator',                  'compliance-quality', 'specialist', NULL, 'idle', 'souls/quality.soul.md');

-- Accounting & Finance (6 agents)
INSERT INTO agents (id, slug, name, role, department, tier, parent_agent_id, status, soul_file_path)
VALUES
  (gen_random_uuid(), 'steward',    'Steward',    'Accounting & Finance Director / CFO',                    'accounting-finance', 'director',   NULL, 'idle', 'souls/steward.soul.md'),
  (gen_random_uuid(), 'nurture',    'Nurture',    'Bookkeeper & General Ledger Specialist',                 'accounting-finance', 'specialist', NULL, 'idle', 'souls/nurture.soul.md'),
  (gen_random_uuid(), 'provision',  'Provision',  'Accounts Payable & Bill Payment Specialist',             'accounting-finance', 'specialist', NULL, 'idle', 'souls/provision.soul.md'),
  (gen_random_uuid(), 'harvest',    'Harvest',    'Revenue Cycle & Medicare/Medicaid Billing Specialist',   'accounting-finance', 'specialist', NULL, 'idle', 'souls/harvest.soul.md'),
  (gen_random_uuid(), 'pledge',     'Pledge',     'Payroll & Benefits Specialist',                          'accounting-finance', 'specialist', NULL, 'idle', 'souls/pledge.soul.md'),
  (gen_random_uuid(), 'foundation', 'Foundation', 'Tax, Entity Compliance & Audit Readiness Specialist',    'accounting-finance', 'specialist', NULL, 'idle', 'souls/foundation.soul.md');


-- ───────────────────────────────────────────────────
-- 2b. UPDATE parent_agent_id references
-- ───────────────────────────────────────────────────

-- Directors report to Diane
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'diane')
WHERE slug IN ('camila', 'dr-elena', 'river', 'terra', 'serenity', 'justice', 'steward');

-- Marketing specialists report to Camila
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'camila')
WHERE slug IN ('haven', 'beacon', 'roots', 'ember', 'gather', 'grace');

-- Clinical Operations: Nurse Riley reports to Dr. Elena; others report to Dr. Elena
-- (Solace and Comfort report to Nurse Riley per org chart, but at data level
--  the hierarchy shows them all under Dr. Elena's department)
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'dr-elena')
WHERE slug IN ('nurse-riley', 'spirit', 'harmony', 'bereavement');

-- Solace and Comfort report to Nurse Riley
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'nurse-riley')
WHERE slug IN ('solace', 'comfort');

-- Admissions specialists report to River
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'river')
WHERE slug IN ('bridge', 'verify', 'triage');

-- Staffing specialists report to Terra
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'terra')
WHERE slug IN ('recruit', 'shift', 'train', 'retain');

-- CX specialists report to Serenity
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'serenity')
WHERE slug IN ('embrace', 'memory', 'gratitude', 'reflect', 'listen');

-- Compliance specialists report to Justice
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'justice')
WHERE slug IN ('guardian', 'chart', 'shield', 'quality');

-- Finance specialists report to Steward
UPDATE agents SET parent_agent_id = (SELECT id FROM agents WHERE slug = 'steward')
WHERE slug IN ('nurture', 'provision', 'harvest', 'pledge', 'foundation');


-- ───────────────────────────────────────────────────
-- 3. KPIs (~50 rows)
-- ───────────────────────────────────────────────────
-- current_value is NULL (no data yet). target_value from kpis.md.
-- trend is 'unknown' for all.

-- Company-Level KPIs (executive department, owned by various agents)
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'executive'),
   'Patient Census (ADC)', NULL, NULL, 'patients', 'unknown',
   (SELECT id FROM agents WHERE slug = 'diane')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Average Length of Stay (ALOS)', NULL, NULL, 'days', 'unknown',
   (SELECT id FROM agents WHERE slug = 'dr-elena')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'executive'),
   'Revenue Per Patient Day', NULL, NULL, 'dollars', 'unknown',
   (SELECT id FROM agents WHERE slug = 'diane')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'executive'),
   'Monthly Revenue', NULL, NULL, 'dollars', 'unknown',
   (SELECT id FROM agents WHERE slug = 'diane')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'CAHPS Hospice Survey Score', NULL, NULL, 'score', 'unknown',
   (SELECT id FROM agents WHERE slug = 'serenity')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Referral-to-Admission Rate', NULL, NULL, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'river')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Staff Turnover Rate', NULL, NULL, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'terra'));

-- Clinical Operations KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Time to First Visit (from admission)', NULL, 24, 'hours', 'unknown',
   (SELECT id FROM agents WHERE slug = 'nurse-riley')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Pain Management Response Time', NULL, 1, 'hours', 'unknown',
   (SELECT id FROM agents WHERE slug = 'dr-elena')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Care Plan Completion Rate', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'nurse-riley')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Symptom Management Effectiveness', NULL, 90, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'dr-elena')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Hospice Eligibility Accuracy', NULL, 98, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'triage')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'clinical-operations'),
   'Bereavement Program Completion', NULL, 80, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'bereavement'));

-- Admissions & Intake KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Speed to Contact (referral received)', NULL, 15, 'minutes', 'unknown',
   (SELECT id FROM agents WHERE slug = 'bridge')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Referral-to-Assessment Time', NULL, 24, 'hours', 'unknown',
   (SELECT id FROM agents WHERE slug = 'triage')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Insurance Verification Accuracy', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'verify')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Admission Conversion Rate', NULL, 75, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'river')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Physician Referral Volume', NULL, NULL, 'referrals', 'unknown',
   (SELECT id FROM agents WHERE slug = 'river')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'admissions-intake'),
   'Hospital Referral Volume', NULL, NULL, 'referrals', 'unknown',
   (SELECT id FROM agents WHERE slug = 'river'));

-- Marketing KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Referral Source Growth', NULL, NULL, 'sources', 'unknown',
   (SELECT id FROM agents WHERE slug = 'camila')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Website Traffic (hospice keywords)', NULL, NULL, 'visits', 'unknown',
   (SELECT id FROM agents WHERE slug = 'roots')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Community Event Attendance', NULL, NULL, 'attendees', 'unknown',
   (SELECT id FROM agents WHERE slug = 'gather')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Email Open Rate (physician nurture)', NULL, 30, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'ember')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Social Media Engagement', NULL, NULL, 'engagements', 'unknown',
   (SELECT id FROM agents WHERE slug = 'grace')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'marketing'),
   'Paid Ad Cost Per Inquiry', NULL, NULL, 'dollars', 'unknown',
   (SELECT id FROM agents WHERE slug = 'beacon'));

-- Caregiver Staffing KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Open Position Fill Time', NULL, 14, 'days', 'unknown',
   (SELECT id FROM agents WHERE slug = 'recruit')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Caregiver Turnover Rate', NULL, 20, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'retain')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Schedule Coverage Rate', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'shift')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Training Completion Rate', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'train')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'caregiver-staffing'),
   'Staff Satisfaction Score', NULL, 4.2, 'rating', 'unknown',
   (SELECT id FROM agents WHERE slug = 'retain'));

-- Customer Experience KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'Family Satisfaction Score', NULL, 4.5, 'rating', 'unknown',
   (SELECT id FROM agents WHERE slug = 'serenity')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'CAHPS Hospice "Would Recommend"', NULL, 90, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'listen')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'Online Review Rating', NULL, 4.8, 'rating', 'unknown',
   (SELECT id FROM agents WHERE slug = 'memory')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'Family Referral Rate', NULL, NULL, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'gratitude')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'customer-experience'),
   'Bereavement Program Satisfaction', NULL, 90, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'bereavement'));

-- Compliance & Quality KPIs
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'compliance-quality'),
   'Survey Deficiency Count', NULL, 0, 'deficiencies', 'unknown',
   (SELECT id FROM agents WHERE slug = 'justice')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'compliance-quality'),
   'Documentation Compliance Rate', NULL, 98, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'chart')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'compliance-quality'),
   'HIPAA Incident Count', NULL, 0, 'incidents', 'unknown',
   (SELECT id FROM agents WHERE slug = 'shield')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'compliance-quality'),
   'QI Project Completion Rate', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'quality')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'compliance-quality'),
   'Recertification Accuracy', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'guardian'));

-- Accounting & Finance KPIs (from user requirements)
INSERT INTO kpis (id, department_id, metric_name, current_value, target_value, unit, trend, owner_agent_id)
VALUES
  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'Monthly Close Completion', NULL, 10, 'day of month', 'unknown',
   (SELECT id FROM agents WHERE slug = 'steward')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'Claim Submission Timeliness', NULL, 3, 'business days', 'unknown',
   (SELECT id FROM agents WHERE slug = 'harvest')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'Claim Denial Rate', NULL, 5, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'harvest')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'Hospice Cap Utilization', NULL, 90, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'harvest')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'Payroll Accuracy', NULL, 100, 'percent', 'unknown',
   (SELECT id FROM agents WHERE slug = 'pledge')),

  (gen_random_uuid(),
   (SELECT id FROM departments WHERE slug = 'accounting-finance'),
   'AR Days', NULL, 30, 'days', 'unknown',
   (SELECT id FROM agents WHERE slug = 'harvest'));


-- ───────────────────────────────────────────────────
-- 4. PLAYBOOKS (11 rows)
-- ───────────────────────────────────────────────────

INSERT INTO playbooks (id, play_number, name, trigger_description, duration_target, playmaker_agent_id, steps, kill_criteria, non_negotiables)
VALUES

-- PLAY 1: New Patient Referral (Hospital)
(gen_random_uuid(), 1, 'New Patient Referral (Hospital)',
 'Hospital discharge planner or case manager contacts HHC',
 'Admission within 24-48 hours of referral',
 (SELECT id FROM agents WHERE slug = 'river'),
 '[
   {"step_number":1,  "description":"Bridge receives referral call and documents patient information", "agent_slug":"bridge", "sla":null},
   {"step_number":2,  "description":"Bridge confirms basic eligibility criteria (terminal diagnosis, 6-month prognosis)", "agent_slug":"bridge", "sla":null},
   {"step_number":3,  "description":"Verify initiates insurance verification (Medicare hospice benefit, Medicaid, private)", "agent_slug":"verify", "sla":null},
   {"step_number":4,  "description":"Triage reviews medical records from hospital within 4 hours", "agent_slug":"triage", "sla":"4 hours"},
   {"step_number":5,  "description":"Triage conducts bedside clinical assessment (in-hospital or at home)", "agent_slug":"triage", "sla":null},
   {"step_number":6,  "description":"Dr. Elena reviews assessment and certifies hospice eligibility", "agent_slug":"dr-elena", "sla":null},
   {"step_number":7,  "description":"River coordinates admission paperwork and family consent", "agent_slug":"river", "sla":null},
   {"step_number":8,  "description":"Harmony meets with family to discuss advance directives and support services", "agent_slug":"harmony", "sla":null},
   {"step_number":9,  "description":"Shift assigns primary nurse and CNA based on patient needs and geography", "agent_slug":"shift", "sla":null},
   {"step_number":10, "description":"Solace conducts initial nursing visit within 24 hours of admission", "agent_slug":"solace", "sla":"24 hours"},
   {"step_number":11, "description":"Comfort begins personal care visits per care plan", "agent_slug":"comfort", "sla":null},
   {"step_number":12, "description":"Spirit contacts family to introduce spiritual care services", "agent_slug":"spirit", "sla":null},
   {"step_number":13, "description":"Embrace sends welcome package and family orientation materials", "agent_slug":"embrace", "sla":null},
   {"step_number":14, "description":"Chart ensures all admission documentation is complete in EMR", "agent_slug":"chart", "sla":null}
 ]'::jsonb,
 ARRAY[
   'Patient does not meet hospice eligibility criteria',
   'Family declines hospice services after education',
   'Insurance verification reveals coverage issues requiring resolution',
   'Physician refuses to certify terminal prognosis',
   'Patient is discharged or transferred before assessment'
 ],
 NULL),

-- PLAY 2: New Patient Referral (Physician)
(gen_random_uuid(), 2, 'New Patient Referral (Physician)',
 'Primary care physician or specialist refers patient to hospice',
 'Admission within 48-72 hours of referral',
 (SELECT id FROM agents WHERE slug = 'river'),
 '[
   {"step_number":1,  "description":"Bridge receives physician referral (phone, fax, or EMR)", "agent_slug":"bridge", "sla":null},
   {"step_number":2,  "description":"Bridge contacts family to introduce HHC and schedule assessment", "agent_slug":"bridge", "sla":null},
   {"step_number":3,  "description":"Verify initiates insurance verification", "agent_slug":"verify", "sla":null},
   {"step_number":4,  "description":"Triage obtains medical records from referring physician", "agent_slug":"triage", "sla":null},
   {"step_number":5,  "description":"Triage schedules and conducts home clinical assessment", "agent_slug":"triage", "sla":null},
   {"step_number":6,  "description":"Dr. Elena reviews assessment, coordinates with referring physician, certifies eligibility", "agent_slug":"dr-elena", "sla":null},
   {"step_number":7,  "description":"River completes admission paperwork with family", "agent_slug":"river", "sla":null},
   {"step_number":8,  "description":"Harmony conducts initial social work assessment", "agent_slug":"harmony", "sla":null},
   {"step_number":9,  "description":"Shift assigns care team (nurse, CNA, chaplain, social worker)", "agent_slug":"shift", "sla":null},
   {"step_number":10, "description":"Solace conducts comprehensive nursing assessment within 24 hours", "agent_slug":"solace", "sla":"24 hours"},
   {"step_number":11, "description":"Spirit schedules initial spiritual care visit", "agent_slug":"spirit", "sla":null},
   {"step_number":12, "description":"Embrace orients family to HHC services and communication protocols", "agent_slug":"embrace", "sla":null},
   {"step_number":13, "description":"Camila sends thank-you to referring physician with referral tracking", "agent_slug":"camila", "sla":null},
   {"step_number":14, "description":"Chart completes all documentation within 48 hours", "agent_slug":"chart", "sla":"48 hours"}
 ]'::jsonb,
 NULL,
 NULL),

-- PLAY 3: Family Inquiry (Inbound)
(gen_random_uuid(), 3, 'Family Inquiry (Inbound)',
 'Family contacts HHC seeking information about hospice',
 'Information within 1 hour, assessment within 72 hours (if appropriate)',
 (SELECT id FROM agents WHERE slug = 'bridge'),
 '[
   {"step_number":1,  "description":"Grace or Bridge receives initial inquiry (phone, web form, social media)", "agent_slug":"bridge", "sla":null},
   {"step_number":2,  "description":"Bridge conducts compassionate intake conversation — listens first, educates second", "agent_slug":"bridge", "sla":null},
   {"step_number":3,  "description":"Bridge assesses whether patient may qualify for hospice (does NOT diagnose)", "agent_slug":"bridge", "sla":null},
   {"step_number":4,  "description":"If appropriate: Bridge offers to schedule a no-obligation clinical assessment", "agent_slug":"bridge", "sla":null},
   {"step_number":5,  "description":"If not ready: Bridge provides educational resources, adds to nurture sequence", "agent_slug":"bridge", "sla":null},
   {"step_number":6,  "description":"Ember sends personalized follow-up email with educational materials", "agent_slug":"ember", "sla":null},
   {"step_number":7,  "description":"If assessment scheduled: Triage conducts home visit within 72 hours", "agent_slug":"triage", "sla":"72 hours"},
   {"step_number":8,  "description":"If family needs time: Bridge follows up at family preferred timeline", "agent_slug":"bridge", "sla":null},
   {"step_number":9,  "description":"Embrace available for ongoing family questions throughout decision process", "agent_slug":"embrace", "sla":null},
   {"step_number":10, "description":"Camila tracks inquiry source for marketing attribution", "agent_slug":"camila", "sla":null}
 ]'::jsonb,
 NULL,
 ARRAY[
   'NEVER pressure a family into hospice. The decision belongs to them.',
   'ALWAYS provide honest information about what hospice is and is not.',
   'ALWAYS respect the family timeline.'
 ]),

-- PLAY 4: Emergency Symptom Management
(gen_random_uuid(), 4, 'Emergency Symptom Management',
 'Patient experiences acute symptom crisis (pain, breathing, agitation, nausea)',
 'Immediate response — resolution within 1-4 hours',
 (SELECT id FROM agents WHERE slug = 'dr-elena'),
 '[
   {"step_number":1,  "description":"Solace (or on-call nurse) receives crisis call from family", "agent_slug":"solace", "sla":null},
   {"step_number":2,  "description":"Solace provides immediate phone-based symptom management guidance", "agent_slug":"solace", "sla":null},
   {"step_number":3,  "description":"Solace dispatches to patient home within 1 hour (or sooner based on severity)", "agent_slug":"solace", "sla":"1 hour"},
   {"step_number":4,  "description":"Dr. Elena consulted for medication adjustments or new orders", "agent_slug":"dr-elena", "sla":null},
   {"step_number":5,  "description":"Solace administers medications per Dr. Elena orders", "agent_slug":"solace", "sla":null},
   {"step_number":6,  "description":"Solace stays with patient until symptoms are managed and family is comfortable", "agent_slug":"solace", "sla":null},
   {"step_number":7,  "description":"Nurse Riley notified if symptom pattern suggests disease progression", "agent_slug":"nurse-riley", "sla":null},
   {"step_number":8,  "description":"Dr. Elena updates care plan to prevent recurrence", "agent_slug":"dr-elena", "sla":null},
   {"step_number":9,  "description":"Comfort scheduled for increased visits if personal care needs change", "agent_slug":"comfort", "sla":null},
   {"step_number":10, "description":"Embrace follows up with family within 24 hours to check emotional state", "agent_slug":"embrace", "sla":"24 hours"},
   {"step_number":11, "description":"Chart documents entire episode in EMR within 4 hours", "agent_slug":"chart", "sla":"4 hours"}
 ]'::jsonb,
 NULL,
 NULL),

-- PLAY 5: Caregiver Staffing Surge
(gen_random_uuid(), 5, 'Caregiver Staffing Surge',
 'Multiple new admissions, caregiver call-outs, or sudden census increase',
 '24-48 hour staffing resolution',
 (SELECT id FROM agents WHERE slug = 'terra'),
 '[
   {"step_number":1,  "description":"Shift identifies coverage gap and assesses scope", "agent_slug":"shift", "sla":null},
   {"step_number":2,  "description":"Shift attempts to fill from existing staff (overtime, reassignment)", "agent_slug":"shift", "sla":null},
   {"step_number":3,  "description":"If insufficient: Recruit activates emergency hiring pipeline", "agent_slug":"recruit", "sla":null},
   {"step_number":4,  "description":"Recruit contacts PRN/per diem staff pool", "agent_slug":"recruit", "sla":null},
   {"step_number":5,  "description":"Recruit contacts staffing agency partners (if needed)", "agent_slug":"recruit", "sla":null},
   {"step_number":6,  "description":"Train provides rapid orientation for new/temporary staff", "agent_slug":"train", "sla":null},
   {"step_number":7,  "description":"Nurse Riley validates clinical competency of new assignments", "agent_slug":"nurse-riley", "sla":null},
   {"step_number":8,  "description":"Shift publishes updated schedule and confirms all coverage", "agent_slug":"shift", "sla":null},
   {"step_number":9,  "description":"Terra notifies Diane if census growth requires permanent hiring", "agent_slug":"terra", "sla":null},
   {"step_number":10, "description":"Retain monitors staff morale during surge — prevents burnout cascading", "agent_slug":"retain", "sla":null}
 ]'::jsonb,
 NULL,
 ARRAY[
   'No patient goes without a scheduled visit',
   'No caregiver works more than 16 hours without mandatory rest',
   'Quality of care is NEVER sacrificed for coverage'
 ]),

-- PLAY 6: Bereavement Program Launch
(gen_random_uuid(), 6, 'Bereavement Program Launch',
 'Patient passes — 13-month grief support program activates',
 '13 months from date of passing',
 (SELECT id FROM agents WHERE slug = 'bereavement'),
 '[
   {"step_number":1,  "description":"Bereavement receives notification of patient passing from clinical team", "agent_slug":"bereavement", "sla":null},
   {"step_number":2,  "description":"Bereavement reviews family profile, chaplain notes, and social worker notes", "agent_slug":"bereavement", "sla":null},
   {"step_number":3,  "description":"Within 48 hours: Bereavement contacts family with condolences", "agent_slug":"bereavement", "sla":"48 hours"},
   {"step_number":4,  "description":"Within 1 week: Bereavement sends initial grief resource packet", "agent_slug":"bereavement", "sla":"1 week"},
   {"step_number":5,  "description":"Bereavement assesses family members for complicated grief risk factors", "agent_slug":"bereavement", "sla":null},
   {"step_number":6,  "description":"High-risk families: individual counseling referrals and increased outreach", "agent_slug":"bereavement", "sla":null},
   {"step_number":7,  "description":"Standard: monthly contact (phone, card, or visit) for 13 months", "agent_slug":"bereavement", "sla":"monthly"},
   {"step_number":8,  "description":"Bereavement invites family to grief support group (if available)", "agent_slug":"bereavement", "sla":null},
   {"step_number":9,  "description":"Gather coordinates memorial services and remembrance events", "agent_slug":"gather", "sla":null},
   {"step_number":10, "description":"Reflect provides grief-stage-appropriate content and resources", "agent_slug":"reflect", "sla":null},
   {"step_number":11, "description":"Month 6: Bereavement conducts mid-program check-in", "agent_slug":"bereavement", "sla":null},
   {"step_number":12, "description":"Month 12: Bereavement conducts pre-graduation assessment", "agent_slug":"bereavement", "sla":null},
   {"step_number":13, "description":"Month 13: Bereavement sends final letter and transitions family to alumni connection", "agent_slug":"bereavement", "sla":null},
   {"step_number":14, "description":"Gratitude maintains ongoing relationship for willing families", "agent_slug":"gratitude", "sla":null}
 ]'::jsonb,
 NULL,
 NULL),

-- PLAY 7: Medicare Recertification
(gen_random_uuid(), 7, 'Medicare Recertification',
 'Patient approaching end of benefit period (60-day or 90-day)',
 'Completed 5 days before benefit period expiration',
 (SELECT id FROM agents WHERE slug = 'dr-elena'),
 '[
   {"step_number":1,  "description":"Chart flags patients approaching benefit period expiration (30 days out)", "agent_slug":"chart", "sla":"30 days before expiration"},
   {"step_number":2,  "description":"Nurse Riley conducts updated clinical assessment", "agent_slug":"nurse-riley", "sla":null},
   {"step_number":3,  "description":"Dr. Elena performs face-to-face encounter with patient", "agent_slug":"dr-elena", "sla":null},
   {"step_number":4,  "description":"Dr. Elena documents continued eligibility and clinical trajectory", "agent_slug":"dr-elena", "sla":null},
   {"step_number":5,  "description":"Verify prepares recertification paperwork for Medicare", "agent_slug":"verify", "sla":null},
   {"step_number":6,  "description":"Guardian reviews documentation for compliance with Medicare CoP", "agent_slug":"guardian", "sla":null},
   {"step_number":7,  "description":"Dr. Elena signs recertification statement", "agent_slug":"dr-elena", "sla":null},
   {"step_number":8,  "description":"Verify submits to Medicare and confirms continued coverage", "agent_slug":"verify", "sla":null},
   {"step_number":9,  "description":"If patient no longer eligible: Harmony coordinates discharge planning with family", "agent_slug":"harmony", "sla":null},
   {"step_number":10, "description":"Chart ensures all recertification documentation is complete in EMR", "agent_slug":"chart", "sla":null}
 ]'::jsonb,
 NULL,
 ARRAY[
   'Recertification is NEVER falsified. If a patient no longer meets criteria, they are discharged with dignity and support.',
   'Face-to-face encounter documentation must be detailed and clinically specific.',
   'All recertifications reviewed by Guardian before submission.'
 ]),

-- PLAY 8: Survey/Audit Preparation
(gen_random_uuid(), 8, 'Survey/Audit Preparation',
 'State survey notification or Medicare audit scheduled',
 '30 days preparation',
 (SELECT id FROM agents WHERE slug = 'justice'),
 '[
   {"step_number":1,  "description":"Justice receives audit/survey notification and determines scope", "agent_slug":"justice", "sla":null},
   {"step_number":2,  "description":"Guardian reviews current policies against survey scope", "agent_slug":"guardian", "sla":null},
   {"step_number":3,  "description":"Chart conducts pre-audit chart review (random sample + flagged files)", "agent_slug":"chart", "sla":null},
   {"step_number":4,  "description":"Shield verifies HIPAA compliance documentation is current", "agent_slug":"shield", "sla":null},
   {"step_number":5,  "description":"Quality reviews clinical outcomes data and QI project documentation", "agent_slug":"quality", "sla":null},
   {"step_number":6,  "description":"Nurse Riley ensures all care plans are current and complete", "agent_slug":"nurse-riley", "sla":null},
   {"step_number":7,  "description":"Dr. Elena reviews physician documentation for compliance", "agent_slug":"dr-elena", "sla":null},
   {"step_number":8,  "description":"Train provides survey readiness training to all clinical staff", "agent_slug":"train", "sla":null},
   {"step_number":9,  "description":"Justice conducts mock survey with team", "agent_slug":"justice", "sla":null},
   {"step_number":10, "description":"Justice prepares management response package", "agent_slug":"justice", "sla":null},
   {"step_number":11, "description":"Diane briefed on any findings requiring executive attention", "agent_slug":"diane", "sla":null},
   {"step_number":12, "description":"Sage documents audit results and remediation actions", "agent_slug":"justice", "sla":null}
 ]'::jsonb,
 NULL,
 ARRAY[
   'Survey readiness is a continuous state, not a sprint',
   'All staff know their role during a survey',
   'Documentation should reflect actual care provided — NEVER fabricated or backdated'
 ]),

-- PLAY 9: Community Education Event
(gen_random_uuid(), 9, 'Community Education Event',
 'Quarterly community education schedule or new market entry',
 '4-6 weeks planning, single or multi-day event',
 (SELECT id FROM agents WHERE slug = 'camila'),
 '[
   {"step_number":1,  "description":"Camila identifies education topic and target audience (families, physicians, community)", "agent_slug":"camila", "sla":null},
   {"step_number":2,  "description":"Gather selects venue, date, and logistics", "agent_slug":"gather", "sla":null},
   {"step_number":3,  "description":"Haven researches community needs and competitor events", "agent_slug":"haven", "sla":null},
   {"step_number":4,  "description":"Beacon promotes event through paid channels", "agent_slug":"beacon", "sla":null},
   {"step_number":5,  "description":"Roots creates event landing page with registration", "agent_slug":"roots", "sla":null},
   {"step_number":6,  "description":"Ember sends email invitations to physician network, past families, community contacts", "agent_slug":"ember", "sla":null},
   {"step_number":7,  "description":"Grace promotes on social media and community groups", "agent_slug":"grace", "sla":null},
   {"step_number":8,  "description":"Dr. Elena or Diane presents clinical or organizational content", "agent_slug":"dr-elena", "sla":null},
   {"step_number":9,  "description":"Spirit presents on spiritual/emotional aspects of end-of-life care (if appropriate)", "agent_slug":"spirit", "sla":null},
   {"step_number":10, "description":"Bridge available at event for families with immediate hospice questions", "agent_slug":"bridge", "sla":null},
   {"step_number":11, "description":"Gather collects attendee information for follow-up", "agent_slug":"gather", "sla":null},
   {"step_number":12, "description":"Listen surveys attendees for feedback", "agent_slug":"listen", "sla":null},
   {"step_number":13, "description":"Ember sends follow-up thank-you and resources to attendees", "agent_slug":"ember", "sla":null},
   {"step_number":14, "description":"Atlas reports on event ROI (attendees, referrals generated, community reach)", "agent_slug":"camila", "sla":null}
 ]'::jsonb,
 NULL,
 NULL),

-- PLAY 10: Grief Support Workshop
(gen_random_uuid(), 10, 'Grief Support Workshop',
 'Quarterly schedule or community need identified',
 '2-4 weeks planning, recurring sessions',
 (SELECT id FROM agents WHERE slug = 'bereavement'),
 '[
   {"step_number":1,  "description":"Bereavement designs workshop content (grief education, coping strategies, peer support)", "agent_slug":"bereavement", "sla":null},
   {"step_number":2,  "description":"Gather coordinates logistics (venue, refreshments, materials)", "agent_slug":"gather", "sla":null},
   {"step_number":3,  "description":"Spirit co-facilitates for spiritual/existential grief components", "agent_slug":"spirit", "sla":null},
   {"step_number":4,  "description":"Harmony co-facilitates for practical grief support (estate, insurance, daily living)", "agent_slug":"harmony", "sla":null},
   {"step_number":5,  "description":"Ember promotes to bereavement families, past families, and community", "agent_slug":"ember", "sla":null},
   {"step_number":6,  "description":"Grace shares on social media with sensitivity", "agent_slug":"grace", "sla":null},
   {"step_number":7,  "description":"Gather manages registration and attendance", "agent_slug":"gather", "sla":null},
   {"step_number":8,  "description":"Bereavement facilitates workshop sessions", "agent_slug":"bereavement", "sla":null},
   {"step_number":9,  "description":"Reflect creates follow-up resources for attendees", "agent_slug":"reflect", "sla":null},
   {"step_number":10, "description":"Listen collects feedback and measures impact", "agent_slug":"listen", "sla":null},
   {"step_number":11, "description":"Bereavement follows up individually with attendees who show signs of complicated grief", "agent_slug":"bereavement", "sla":null},
   {"step_number":12, "description":"Gratitude maintains connection with attendees for ongoing support", "agent_slug":"gratitude", "sla":null}
 ]'::jsonb,
 NULL,
 NULL),

-- PLAY 11: Annual Tax Filing, Medicare Cost Reports & Entity Compliance
(gen_random_uuid(), 11, 'Annual Tax Filing, Medicare Cost Reports & Entity Compliance',
 'Annual tax filing deadlines, Medicare cost report due dates, or entity compliance renewal periods',
 'Ongoing calendar-driven — key deadlines Q1 (tax season) and Q4 (Medicare cost report)',
 (SELECT id FROM agents WHERE slug = 'steward'),
 '[
   {"step_number":1,  "description":"Foundation maintains master calendar of all tax, Medicare, and entity compliance deadlines", "agent_slug":"foundation", "sla":null},
   {"step_number":2,  "description":"Foundation sends 30-day advance notices to Steward and relevant agents for each upcoming deadline", "agent_slug":"foundation", "sla":"30 days before deadline"},
   {"step_number":3,  "description":"Harvest prepares Medicare revenue data, claims history, and cost allocation by care level", "agent_slug":"harvest", "sla":null},
   {"step_number":4,  "description":"Foundation files quarterly estimated tax payments on schedule", "agent_slug":"foundation", "sla":null},
   {"step_number":5,  "description":"Pledge produces W-2s for employees and 1099s for contractors by January 31", "agent_slug":"pledge", "sla":"January 31"},
   {"step_number":6,  "description":"Foundation prepares annual Medicare cost report using Harvest data, Pledge payroll data, and Provision expense data", "agent_slug":"foundation", "sla":null},
   {"step_number":7,  "description":"Foundation files all entity compliance documents (state licensing renewals, business registrations, NPI updates)", "agent_slug":"foundation", "sla":null},
   {"step_number":8,  "description":"Foundation coordinates with Justice on healthcare-specific compliance overlaps (Medicare CoP, state survey readiness)", "agent_slug":"foundation", "sla":null},
   {"step_number":9,  "description":"Foundation coordinates with Meridian on empire-wide entity consolidation and cross-business tax strategy", "agent_slug":"foundation", "sla":null},
   {"step_number":10, "description":"Sage archives all filed documents, confirmations, and correspondence in knowledge base", "agent_slug":"foundation", "sla":null}
 ]'::jsonb,
 ARRAY[
   'Never miss a Medicare cost report deadline — penalties and audit risk are severe',
   'Never miss a federal or state tax filing deadline — request extension before missing',
   'Never allow healthcare licenses or entity registrations to lapse',
   'Never file any return or report without Steward final review and sign-off'
 ],
 NULL);


-- ───────────────────────────────────────────────────
-- 5. HANDOFFS (12 rows)
-- ───────────────────────────────────────────────────

INSERT INTO handoffs (id, handoff_number, name, from_department, to_department, from_agent_id, to_agent_id, sla_description, packet_template)
VALUES

-- 1. Marketing -> Admissions (Inquiry to Intake)
(gen_random_uuid(), 1, 'Marketing -> Admissions (Inquiry to Intake)',
 'marketing', 'admissions-intake',
 (SELECT id FROM agents WHERE slug = 'camila'),
 (SELECT id FROM agents WHERE slug = 'bridge'),
 'Family contact within 15 minutes during business hours. After-hours: within 1 hour.',
 '{"referral_source": null, "patient_name": null, "diagnosis": null, "family_contact": null, "urgency_indicators": null, "insurance_info": null, "referring_physician": null}'::jsonb),

-- 2. Admissions -> Clinical Operations (Admitted Patient)
(gen_random_uuid(), 2, 'Admissions -> Clinical Operations (Admitted Patient)',
 'admissions-intake', 'clinical-operations',
 (SELECT id FROM agents WHERE slug = 'river'),
 (SELECT id FROM agents WHERE slug = 'nurse-riley'),
 'Clinical assessment within 24 hours of referral. First nursing visit within 24 hours of admission. Care plan within 48 hours.',
 '{"clinical_assessment": null, "physician_certification": null, "insurance_verification": null, "patient_demographics": null, "medications_allergies": null, "advance_directives": null, "home_environment": null, "family_dynamics": null, "spiritual_preferences": null, "special_needs": null}'::jsonb),

-- 3. Clinical -> Admissions (Recertification)
(gen_random_uuid(), 3, 'Clinical -> Admissions (Recertification)',
 'clinical-operations', 'admissions-intake',
 (SELECT id FROM agents WHERE slug = 'nurse-riley'),
 (SELECT id FROM agents WHERE slug = 'verify'),
 'Recertification initiated 30 days before expiration. Documentation complete 5 days before expiration.',
 '{"clinical_status": null, "face_to_face_encounter": null, "updated_care_plan": null, "recertification_statement": null, "updated_medications": null, "family_assessment": null}'::jsonb),

-- 4. Clinical -> CX (Ongoing Family Communication)
(gen_random_uuid(), 4, 'Clinical -> CX (Ongoing Family Communication)',
 'clinical-operations', 'customer-experience',
 (SELECT id FROM agents WHERE slug = 'dr-elena'),
 (SELECT id FROM agents WHERE slug = 'embrace'),
 'Family support follow-up within 24 hours of significant events. Urgent concerns escalated immediately.',
 '{"event_nature": null, "clinical_communication": null, "family_response": null, "unresolved_questions": null, "next_visit_info": null}'::jsonb),

-- 5. Clinical -> Bereavement (Patient Passing)
(gen_random_uuid(), 5, 'Clinical -> Bereavement (Patient Passing)',
 'clinical-operations', 'clinical-operations',
 (SELECT id FROM agents WHERE slug = 'solace'),
 (SELECT id FROM agents WHERE slug = 'bereavement'),
 'Initial bereavement contact within 48 hours. First grief support outreach within 1 week. Monthly contact for 13 months.',
 '{"patient_name": null, "date_of_passing": null, "family_contacts": null, "primary_caregiver": null, "spiritual_preferences": null, "special_circumstances": null, "chaplain_notes": null, "social_worker_notes": null, "care_team_reflections": null}'::jsonb),

-- 6. Admissions -> Compliance (Eligibility Verification)
(gen_random_uuid(), 6, 'Admissions -> Compliance (Eligibility Verification)',
 'admissions-intake', 'compliance-quality',
 (SELECT id FROM agents WHERE slug = 'verify'),
 (SELECT id FROM agents WHERE slug = 'guardian'),
 'Compliance review within 24 hours of admission. Issues flagged immediately.',
 '{"admission_documentation": null, "insurance_verification": null, "physician_certification": null, "consent_forms": null, "hipaa_authorization": null, "advance_directives": null}'::jsonb),

-- 7. Staffing -> Clinical (Caregiver Assignment)
(gen_random_uuid(), 7, 'Staffing -> Clinical (Caregiver Assignment)',
 'caregiver-staffing', 'clinical-operations',
 (SELECT id FROM agents WHERE slug = 'shift'),
 (SELECT id FROM agents WHERE slug = 'nurse-riley'),
 'Caregiver assignment within 4 hours of admission. Coverage gaps filled within 2 hours.',
 '{"care_plan_summary": null, "visit_frequency": null, "geographic_location": null, "special_skills_needed": null, "family_preferences": null, "language_needs": null}'::jsonb),

-- 8. CX -> Marketing (Testimonial/Review)
(gen_random_uuid(), 8, 'CX -> Marketing (Testimonial/Review)',
 'customer-experience', 'marketing',
 (SELECT id FROM agents WHERE slug = 'memory'),
 (SELECT id FROM agents WHERE slug = 'grace'),
 'Testimonial review within 48 hours. Family approval before any publication.',
 '{"testimonial": null, "release_consent_form": null, "sharing_preferences": null, "name_usage_permission": null, "photo_video_permissions": null, "approved_channels": null}'::jsonb),

-- 9. Compliance -> Clinical (Audit Findings)
(gen_random_uuid(), 9, 'Compliance -> Clinical (Audit Findings)',
 'compliance-quality', 'clinical-operations',
 (SELECT id FROM agents WHERE slug = 'quality'),
 (SELECT id FROM agents WHERE slug = 'dr-elena'),
 'Critical findings communicated within 1 hour. Corrective action plan within 24 hours for critical, 72 hours for significant.',
 '{"finding": null, "regulatory_citation": null, "severity": null, "recommended_action": null, "timeline": null, "prior_findings": null}'::jsonb),

-- 10. CX -> Admissions (Referral Family Intake)
(gen_random_uuid(), 10, 'CX -> Admissions (Referral Family Intake)',
 'customer-experience', 'admissions-intake',
 (SELECT id FROM agents WHERE slug = 'gratitude'),
 (SELECT id FROM agents WHERE slug = 'bridge'),
 'Referred family contacted within 4 hours. Thank-you note to referring family within 24 hours.',
 '{"referring_family": null, "referred_family": null, "relationship": null, "inquiry_nature": null, "referring_family_experience": null}'::jsonb),

-- 11. Revenue Recognition (Medicare/Medicaid Billing)
(gen_random_uuid(), 11, 'Revenue Recognition (Medicare/Medicaid Billing)',
 'admissions-intake', 'accounting-finance',
 (SELECT id FROM agents WHERE slug = 'verify'),
 (SELECT id FROM agents WHERE slug = 'harvest'),
 'Claims submitted within 3 business days. Denials appealed within 5 business days. Hospice cap updated weekly.',
 '{"admission_documentation": null, "insurance_verification": null, "physician_certification": null, "claim_details": null, "denial_documentation": null, "hospice_cap_report": null}'::jsonb),

-- 12. Monthly Financial Package
(gen_random_uuid(), 12, 'Monthly Financial Package',
 'accounting-finance', 'executive',
 (SELECT id FROM agents WHERE slug = 'steward'),
 (SELECT id FROM agents WHERE slug = 'diane'),
 'Financial package delivered to Diane by the 10th of the month. Copy to Meridian by the 12th.',
 '{"pnl_statement": null, "balance_sheet": null, "cash_flow_statement": null, "medicare_revenue_breakdown": null, "claims_status_summary": null, "hospice_cap_report": null, "payroll_summary": null, "budget_vs_actual": null}'::jsonb);


-- ───────────────────────────────────────────────────
-- 6. UPDATE department agent_count
-- ───────────────────────────────────────────────────

UPDATE departments SET agent_count = (
  SELECT COUNT(*) FROM agents WHERE agents.department = departments.slug
);


-- ───────────────────────────────────────────────────
-- 7. UPDATE department director_agent_id
-- ───────────────────────────────────────────────────

UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'diane')     WHERE slug = 'executive';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'camila')    WHERE slug = 'marketing';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'dr-elena')  WHERE slug = 'clinical-operations';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'river')     WHERE slug = 'admissions-intake';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'terra')     WHERE slug = 'caregiver-staffing';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'serenity')  WHERE slug = 'customer-experience';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'justice')   WHERE slug = 'compliance-quality';
UPDATE departments SET director_agent_id = (SELECT id FROM agents WHERE slug = 'steward')   WHERE slug = 'accounting-finance';
