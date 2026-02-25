/**
 * Centralized ROI calculation — legacy compatibility.
 *
 * For real-time ROI, use `useRealTimeROI()` hook.
 * This module exists for BillingCards and other components
 * that still call calculateROI() directly.
 *
 * Cost = sum of daily_costs.google (operational only)
 * Value = hoursPerWeekSaved × costPerHourHuman × 4.33
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
  totalCost: number;
  days: number;
  dailyAvg: number;
  monthlyProjection: number;
  totalHoursPerWeek: number;
  avgHumanHourRate: number;
  monthlyValue: number;
  roiMultiplier: number;
  totalTasks: number;
  costPerTask: number;
}

export function calculateROI(agents: AgentData[], dailyCosts: DailyCostData[]): ROIMetrics {
  // Operational cost = only google
  const totalCost = dailyCosts.reduce((s, c) => s + (c.google ?? 0), 0);
  const distinctDays = new Set(dailyCosts.map(c => c.date)).size || 1;
  const dailyAvg = totalCost / distinctDays;
  const monthlyProjection = dailyAvg * 30;

  let totalHoursPerWeek = 0;
  let humanRateSum = 0;
  let humanRateCount = 0;

  agents.forEach(a => {
    const roi = parseJsonb<any>(a.roi, {});
    totalHoursPerWeek += roi?.hoursPerWeekSaved ?? roi?.hoursPerDay ?? 0;
    if (roi?.costPerHourHuman) {
      humanRateSum += roi.costPerHourHuman;
      humanRateCount++;
    }
  });

  const avgHumanHourRate = humanRateCount > 0 ? humanRateSum / humanRateCount : 50;
  const monthlyValue = totalHoursPerWeek * avgHumanHourRate * 4.33;
  const roiMultiplier = monthlyProjection > 0 ? monthlyValue / monthlyProjection : 0;

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
