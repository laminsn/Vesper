-- =============================================================================
-- Migration 010: Seed KPI Data with 90 Days of History
-- =============================================================================

-- Update existing HHCC KPIs with real values
UPDATE public.kpis SET current_value = 24, target_value = 30, trend = 'up', measured_at = now()
WHERE metric_name = 'Patient Census (ADC)' AND organization_id = '00000000-0000-4000-a000-000000000001';
UPDATE public.kpis SET current_value = 96, target_value = 95, trend = 'up', measured_at = now()
WHERE metric_name = 'SLA Compliance' AND organization_id = '00000000-0000-4000-a000-000000000001';
UPDATE public.kpis SET current_value = 4.8, target_value = 4.5, trend = 'up', measured_at = now()
WHERE metric_name = 'Family Satisfaction' AND organization_id = '00000000-0000-4000-a000-000000000001';
UPDATE public.kpis SET current_value = 92, target_value = 95, trend = 'flat', measured_at = now()
WHERE metric_name = 'Documentation Compliance' AND organization_id = '00000000-0000-4000-a000-000000000001';
UPDATE public.kpis SET current_value = 142000, target_value = 150000, trend = 'up', measured_at = now()
WHERE metric_name = 'Monthly Revenue' AND organization_id = '00000000-0000-4000-a000-000000000001';
UPDATE public.kpis SET current_value = 88, target_value = 95, trend = 'down', measured_at = now()
WHERE metric_name = 'Staff Coverage' AND organization_id = '00000000-0000-4000-a000-000000000001';

-- Bulk update all remaining NULL KPIs across all orgs
UPDATE public.kpis SET
  current_value = CASE
    WHEN unit = '%' THEN 85 + (HASHTEXT(metric_name) % 15)
    WHEN unit = '$' THEN 50000 + (HASHTEXT(metric_name) % 100000)
    WHEN unit = 'score' THEN 3.5 + (ABS(HASHTEXT(metric_name)) % 15) / 10.0
    ELSE 10 + (ABS(HASHTEXT(metric_name)) % 50)
  END,
  target_value = CASE
    WHEN unit = '%' THEN 90
    WHEN unit = '$' THEN 100000
    WHEN unit = 'score' THEN 4.5
    ELSE 50
  END,
  trend = CASE (ABS(HASHTEXT(metric_name)) % 3)
    WHEN 0 THEN 'up' WHEN 1 THEN 'down' ELSE 'flat'
  END,
  measured_at = now()
WHERE current_value IS NULL;

-- Generate 90 days of KPI history for all KPIs
INSERT INTO public.kpi_history (id, kpi_id, value, recorded_at)
SELECT
  gen_random_uuid(),
  k.id,
  k.current_value * (0.85 + 0.3 * (0.5 + 0.5 * SIN(EXTRACT(epoch FROM d) / 86400.0 * 0.1 + HASHTEXT(k.metric_name)))),
  d
FROM public.kpis k
CROSS JOIN generate_series(
  now() - interval '90 days',
  now(),
  interval '1 day'
) AS d
WHERE k.current_value IS NOT NULL
ON CONFLICT DO NOTHING;
