/**
 * Centralized ROI calculation — single source of truth.
 * 
 * Formula: ROI = (value generated) / (cost spent)
 *   value = totalHoursPerWeek * costPerHourHuman * weeksInPeriod
 *   cost  = sum of daily_costs.total
 * 
 * All pages MUST use this module to avoid discrepancies.
 */

import { parseJsonb } from "@/lib/parse-jsonb";

interface AgentData {
  roi?: unknown;
  total_cost?: number | null;
  tasks_completed?: number | null;
}

interface DailyCostData {
  total?: number | null;
  google?: number | null;
  date?: string | null;
}

export interface ROIMetrics {
  /** Total operational cost from daily_costs */
  totalCost: number;
  /** Number of tracked days */
  days: number;
  /** Average daily cost */
  dailyAvg: number;
  /** Monthly projection (dailyAvg × 30) */
  monthlyProjection: number;
  /** Total hours saved per week (sum of all agents) */
  totalHoursPerWeek: number;
  /** Average human cost per hour (from agents or $50 default) */
  avgHumanHourRate: number;
  /** Monthly value generated (hours × rate × 4.33 weeks) */
  monthlyValue: number;
  /** ROI multiplier: monthlyValue / monthlyProjection */
  roiMultiplier: number;
  /** Total tasks automated */
  totalTasks: number;
  /** Cost per task */
  costPerTask: number;
}

/**
 * Calculate ROI metrics from raw data.
 * This is THE formula. Used by BillingCards, ProjectionDetails, ROIDashboard.
 */
export function calculateROI(agents: AgentData[], dailyCosts: DailyCostData[]): ROIMetrics {
  // Operational cost = ONLY google column
  // Antigravity (anthropic column) = subscription with $0 inference cost
  const totalCost = dailyCosts.reduce((s, c) => s + (c.google ?? 0), 0);
  // Count DISTINCT days, not rows (streamer inserts multiple rows per day)
  const distinctDays = new Set(dailyCosts.map(c => c.date)).size || 1;
  const dailyAvg = totalCost / distinctDays;
  const monthlyProjection = dailyAvg * 30;

  // Hours saved per week (sum across all agents)
  let totalHoursPerWeek = 0;
  let humanRateSum = 0;
  let humanRateCount = 0;

  agents.forEach(a => {
    const roi = parseJsonb<any>(a.roi, {});
    totalHoursPerWeek += roi?.hoursPerWeekSaved ?? 0;
    if (roi?.costPerHourHuman) {
      humanRateSum += roi.costPerHourHuman;
      humanRateCount++;
    }
  });

  const avgHumanHourRate = humanRateCount > 0 ? humanRateSum / humanRateCount : 50;
  
  // Monthly value = hours/week × rate × 4.33 weeks/month
  const monthlyValue = totalHoursPerWeek * avgHumanHourRate * 4.33;

  // ROI = value / cost (if cost > 0)
  const roiMultiplier = monthlyProjection > 0 ? monthlyValue / monthlyProjection : 0;

  // Tasks
  const totalTasks = agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
  const costPerTask = totalTasks > 0 ? totalCost / totalTasks : 0;

  return {
    totalCost,
    days: distinctDays,
    dailyAvg,
    monthlyProjection,
    totalHoursPerWeek,
    avgHumanHourRate,
    monthlyValue,
    roiMultiplier,
    totalTasks,
    costPerTask,
  };
}
