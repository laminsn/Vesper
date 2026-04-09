// ═══════════════════════════════════════════════════
// HHCC Command Center — Mock Metrics History
// 30 days of daily metrics (2026-03-01 to 2026-03-30)
// ═══════════════════════════════════════════════════

export interface DailyMetrics {
  date: string;
  census: number;
  referrals: number;
  admissions: number;
  revenue: number;
  expenses: number;
  satisfaction: number;
  sla_compliance: number;
  tasks_completed: number;
  doc_compliance: number;
  staff_coverage: number;
  email_sent: number;
  sms_sent: number;
  calls_made: number;
}

export interface DepartmentDailyMetrics {
  date: string;
  department: string;
  tasks_completed: number;
  tasks_total: number;
  kpis_met: number;
  kpis_total: number;
  comms_sent: number;
}

// ── Deterministic seeded random ──────────────────

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}

function randBetween(
  rng: () => number,
  min: number,
  max: number,
  decimals = 0
): number {
  const value = min + rng() * (max - min);
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Day-of-week helpers ──────────────────────────

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay(); // 0=Sun, 6=Sat
}

function isWeekend(dateStr: string): boolean {
  const day = getDayOfWeek(dateStr);
  return day === 0 || day === 6;
}

// ── Generate daily metrics ───────────────────────

function generateDailyMetrics(): readonly DailyMetrics[] {
  const rng = seededRandom(42);
  const metrics: DailyMetrics[] = [];

  for (let day = 1; day <= 30; day++) {
    const date = `2026-03-${String(day).padStart(2, "0")}`;
    const weekend = isWeekend(date);
    const trendFactor = day / 30; // 0 to 1 over the month

    // Census: 20-28, trending up
    const baseCensus = 20 + trendFactor * 6;
    const census = Math.round(
      baseCensus + randBetween(rng, -1, 1)
    );

    // Referrals: 1-5, lower on weekends
    const baseReferrals = weekend ? 1 : 3;
    const referrals = Math.max(
      1,
      Math.round(baseReferrals + randBetween(rng, -1, 2))
    );

    // Admissions: 0-3, lower on weekends
    const baseAdmissions = weekend ? 0.5 : 1.5;
    const admissions = Math.max(
      0,
      Math.round(baseAdmissions + randBetween(rng, -0.5, 1.5))
    );

    // Revenue: 4000-6000, trending up
    const baseRevenue = 4200 + trendFactor * 1200;
    const weekendDip = weekend ? -600 : 0;
    const revenue = Math.round(
      baseRevenue + weekendDip + randBetween(rng, -300, 400)
    );

    // Expenses: 2800-4200
    const baseExpenses = 3000 + trendFactor * 400;
    const expenses = Math.round(
      baseExpenses + randBetween(rng, -200, 300)
    );

    // Satisfaction: 4.2-4.8, slight upward trend
    const satisfaction = randBetween(
      rng,
      4.2 + trendFactor * 0.2,
      4.6 + trendFactor * 0.2,
      1
    );

    // SLA compliance: 88-99
    const sla_compliance = randBetween(
      rng,
      89 + trendFactor * 4,
      97 + trendFactor * 2,
      0
    );

    // Tasks completed: 15-30, lower on weekends
    const baseTasks = weekend ? 12 : 22;
    const tasks_completed = Math.round(
      baseTasks + trendFactor * 4 + randBetween(rng, -3, 5)
    );

    // Doc compliance: 92-99
    const doc_compliance = randBetween(
      rng,
      92 + trendFactor * 2,
      97 + trendFactor * 2,
      0
    );

    // Staff coverage: 85-100
    const staff_coverage = randBetween(
      rng,
      86 + trendFactor * 4,
      96 + trendFactor * 4,
      0
    );

    // Comms: lower on weekends
    const commMultiplier = weekend ? 0.4 : 1;
    const email_sent = Math.round(
      commMultiplier * randBetween(rng, 15, 40)
    );
    const sms_sent = Math.round(
      commMultiplier * randBetween(rng, 5, 15)
    );
    const calls_made = Math.round(
      commMultiplier * randBetween(rng, 8, 20)
    );

    metrics.push({
      date,
      census: Math.min(28, Math.max(20, census)),
      referrals: Math.min(5, referrals),
      admissions: Math.min(3, admissions),
      revenue: Math.min(6000, Math.max(4000, revenue)),
      expenses: Math.min(4200, Math.max(2800, expenses)),
      satisfaction: Math.min(4.8, Math.max(4.2, satisfaction)),
      sla_compliance: Math.min(99, Math.max(88, sla_compliance)),
      tasks_completed: Math.min(30, Math.max(15, tasks_completed)),
      doc_compliance: Math.min(99, Math.max(92, doc_compliance)),
      staff_coverage: Math.min(100, Math.max(85, staff_coverage)),
      email_sent: Math.max(4, email_sent),
      sms_sent: Math.max(2, sms_sent),
      calls_made: Math.max(3, calls_made),
    });
  }

  return Object.freeze(metrics);
}

// ── Generate department metrics ──────────────────

const DEPARTMENTS = [
  "Executive",
  "Marketing",
  "Clinical",
  "Admissions",
  "Staffing",
  "CX",
  "Compliance",
  "Finance",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

function generateDepartmentMetrics(): readonly DepartmentDailyMetrics[] {
  const rng = seededRandom(99);
  const metrics: DepartmentDailyMetrics[] = [];

  // Department-specific profiles (base tasks, KPIs)
  const profiles: Record<
    Department,
    { baseTasks: number; kpiCount: number; baseComms: number }
  > = {
    Executive: { baseTasks: 8, kpiCount: 5, baseComms: 12 },
    Marketing: { baseTasks: 12, kpiCount: 6, baseComms: 25 },
    Clinical: { baseTasks: 18, kpiCount: 8, baseComms: 15 },
    Admissions: { baseTasks: 10, kpiCount: 5, baseComms: 20 },
    Staffing: { baseTasks: 14, kpiCount: 6, baseComms: 18 },
    CX: { baseTasks: 16, kpiCount: 7, baseComms: 30 },
    Compliance: { baseTasks: 10, kpiCount: 8, baseComms: 8 },
    Finance: { baseTasks: 12, kpiCount: 6, baseComms: 10 },
  };

  for (let day = 1; day <= 30; day++) {
    const date = `2026-03-${String(day).padStart(2, "0")}`;
    const weekend = isWeekend(date);
    const trendFactor = day / 30;

    for (const dept of DEPARTMENTS) {
      const profile = profiles[dept];
      const weekendScale = weekend ? 0.5 : 1;

      const tasks_total = Math.round(
        profile.baseTasks * weekendScale + randBetween(rng, -2, 2)
      );
      const completionRate = 0.7 + trendFactor * 0.15 + randBetween(rng, -0.05, 0.1);
      const tasks_completed = Math.min(
        tasks_total,
        Math.max(0, Math.round(tasks_total * completionRate))
      );

      const kpis_total = profile.kpiCount;
      const kpiRate = 0.6 + trendFactor * 0.2 + randBetween(rng, -0.1, 0.15);
      const kpis_met = Math.min(
        kpis_total,
        Math.max(0, Math.round(kpis_total * kpiRate))
      );

      const comms_sent = Math.max(
        0,
        Math.round(
          profile.baseComms * weekendScale + randBetween(rng, -4, 6)
        )
      );

      metrics.push({
        date,
        department: dept,
        tasks_completed: Math.max(0, tasks_completed),
        tasks_total: Math.max(1, tasks_total),
        kpis_met,
        kpis_total,
        comms_sent,
      });
    }
  }

  return Object.freeze(metrics);
}

// ── Exported data ────────────────────────────────

export const metricsHistory: readonly DailyMetrics[] = generateDailyMetrics();

export const departmentMetrics: readonly DepartmentDailyMetrics[] =
  generateDepartmentMetrics();

// ── Helper functions ─────────────────────────────

export function getMetricsForRange(
  startDate: string,
  endDate: string
): readonly DailyMetrics[] {
  return metricsHistory.filter(
    (m) => m.date >= startDate && m.date <= endDate
  );
}

export function getLast7Days(): readonly DailyMetrics[] {
  return metricsHistory.slice(-7);
}

export function getLast30Days(): readonly DailyMetrics[] {
  return [...metricsHistory];
}

export function getDepartmentMetrics(
  dept: string,
  days: number = 30
): readonly DepartmentDailyMetrics[] {
  const filtered = departmentMetrics.filter((m) => m.department === dept);
  return filtered.slice(-days);
}
