/**
 * useRealTimeROI — single source of truth for ROI metrics.
 *
 * Calculates everything from raw traces + tasks + daily_costs.
 * No dependency on agents.roi field (which requires background sync).
 *
 * Used by: ROIDashboard, BillingCards, Finances, CommandCenter, StatusBar
 */
import { useMemo } from "react";
import { useAgents, useTraces, useDailyCosts } from "@/hooks/use-supabase-data";
import { parseJsonb } from "@/lib/parse-jsonb";

// 1K output tokens ≈ 12 min of skilled human work
const HUMAN_MINUTES_PER_1K_OUTPUT = 12;
const AGENT_SECONDS_PER_CALL = 30;

const HUMAN_RATES: Record<string, number> = {
  oracli: 80, code: 65, infra: 70, docs: 55, general: 50,
};

interface Span {
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cache_read?: number;
  cost?: number;
}

export interface AgentROIMetrics {
  id: string;
  name: string;
  emoji: string;
  calls: number;
  outputTokens: number;
  inputTokens: number;
  cacheRead: number;
  traceCost: number;
  tasksDone: number;
  tasksTotal: number;
  humanEquivalentHours: number;
  agentActualHours: number;
  hoursSaved: number;
  hoursPerDay: number;
  speedup: number;
  automationRate: number;
  qualityScore: number;
  costPerHourHuman: number;
  costPerTask: number;
  avgTaskTimeHuman: string;
  avgTaskTimeAgent: string;
}

export interface ROISummary {
  /** Total hours saved across all agents */
  totalHoursSaved: number;
  /** Hours saved per day (average) */
  hoursPerDay: number;
  /** Human equivalent hours (what it would take humans) */
  totalHumanEquivalent: number;
  /** Actual agent hours */
  totalAgentHours: number;
  /** Operating period in days */
  operatingDays: number;
  /** Operational cost (google only) */
  operationalCost: number;
  /** Cost per hour saved */
  costPerHourSaved: number;
  /** Daily operational cost average */
  dailyCostAvg: number;
  /** Monthly projected cost */
  monthlyCostProjection: number;
  /** Monthly value generated (hours × rate) */
  monthlyValue: number;
  /** ROI multiplier */
  roiMultiplier: number;
  /** Average quality score (trace success rate) */
  avgQualityScore: number;
  /** Average automation rate */
  avgAutomationRate: number;
  /** Weighted average human hourly rate */
  avgHumanHourRate: number;
  /** Total traces */
  totalCalls: number;
  /** Total tasks done */
  totalTasksDone: number;
  /** Per-agent breakdown */
  agents: AgentROIMetrics[];
  /** Data maturity: bootstrap (<3d), early (3-7d), stable (7d+) */
  dataMaturity: "bootstrap" | "early" | "stable";
  /** Is still loading */
  isLoading: boolean;
}

export function useRealTimeROI(): ROISummary {
  const { data: agents, isLoading: la } = useAgents();
  const { data: traces, isLoading: lt } = useTraces();
  const { data: costs, isLoading: lc } = useDailyCosts();

  return useMemo(() => {
    const isLoading = la || lt || lc;
    const traceList = traces ?? [];
    const agentList = (agents ?? []).filter(a => a.id !== "ceo");
    const costList = costs ?? [];

    // ── Aggregate traces per agent ──
    const agentTraces = new Map<string, {
      calls: number; input: number; output: number;
      cache: number; cost: number; success: number; total: number;
    }>();

    for (const t of traceList) {
      const aid = t.agent_id ?? "unknown";
      if (!agentTraces.has(aid)) {
        agentTraces.set(aid, { calls: 0, input: 0, output: 0, cache: 0, cost: 0, success: 0, total: 0 });
      }
      const acc = agentTraces.get(aid)!;
      acc.total++;
      if (t.status === "success") acc.success++;

      const spans = parseJsonb<Span[]>(t.spans, []);
      for (const s of spans) {
        acc.calls++;
        acc.input += s.input_tokens ?? 0;
        acc.output += s.output_tokens ?? 0;
        acc.cache += s.cache_read ?? 0;
        acc.cost += s.cost ?? 0;
      }
    }

    // ── Aggregate tasks per agent ──
    // Tasks use agent_id field from tasks table — but we don't have tasks hook here
    // Use agents.tasks_completed as proxy
    const agentTasksCompleted = new Map<string, number>();
    for (const a of agentList) {
      agentTasksCompleted.set(a.id, a.tasks_completed ?? 0);
    }

    // ── Operating period ──
    const timestamps = traceList
      .map(t => t.created_at)
      .filter(Boolean)
      .sort();
    const firstTs = timestamps[0];
    const lastTs = timestamps[timestamps.length - 1];
    let operatingDays = 0.5;
    if (firstTs && lastTs) {
      const diff = new Date(lastTs).getTime() - new Date(firstTs).getTime();
      operatingDays = Math.max(diff / 86400000, 0.5);
    }

    // ── Operational cost ──
    const operationalCost = costList.reduce((s, c) => s + (c.google ?? 0), 0);
    const distinctDays = new Set(costList.map(c => c.date)).size || 1;
    const dailyCostAvg = operationalCost / distinctDays;

    // ── Per-agent ROI ──
    const agentMetrics: AgentROIMetrics[] = agentList.map(a => {
      const tr = agentTraces.get(a.id) ?? { calls: 0, input: 0, output: 0, cache: 0, cost: 0, success: 0, total: 0 };
      const rate = HUMAN_RATES[a.id] ?? 50;
      const tasksDone = agentTasksCompleted.get(a.id) ?? 0;

      const humanMinutes = (tr.output / 1000) * HUMAN_MINUTES_PER_1K_OUTPUT;
      const humanHours = humanMinutes / 60;
      const agentMinutes = (tr.calls * AGENT_SECONDS_PER_CALL) / 60;
      const agentHours = agentMinutes / 60;
      const hoursSaved = Math.max(humanHours - agentHours, 0);
      const hoursPerDay = hoursSaved / operatingDays;
      const speedup = agentMinutes > 0 ? Math.round(humanMinutes / agentMinutes) : 0;
      const qualityScore = tr.total > 0 ? Math.round((tr.success / tr.total) * 100) : (tr.calls > 0 ? 100 : 0);
      const automationRate = tasksDone > 0 ? Math.min(100, Math.round((tasksDone / Math.max(tasksDone, 1)) * 100)) : 0;
      const costPerTask = tasksDone > 0 ? tr.cost / tasksDone : 0;
      const avgHumanMin = tasksDone > 0 ? Math.round(humanMinutes / tasksDone) : 0;
      const avgAgentMin = tasksDone > 0 ? (agentMinutes / tasksDone).toFixed(1) : "0";

      return {
        id: a.id,
        name: a.name,
        emoji: a.emoji ?? "🤖",
        calls: tr.calls,
        outputTokens: tr.output,
        inputTokens: tr.input,
        cacheRead: tr.cache,
        traceCost: tr.cost,
        tasksDone,
        tasksTotal: tasksDone,
        humanEquivalentHours: humanHours,
        agentActualHours: agentHours,
        hoursSaved,
        hoursPerDay,
        speedup,
        automationRate,
        qualityScore,
        costPerHourHuman: rate,
        costPerTask,
        avgTaskTimeHuman: `${avgHumanMin}min`,
        avgTaskTimeAgent: `${avgAgentMin}min`,
      };
    });

    // ── Summary ──
    const totalHoursSaved = agentMetrics.reduce((s, a) => s + a.hoursSaved, 0);
    const totalHumanEquiv = agentMetrics.reduce((s, a) => s + a.humanEquivalentHours, 0);
    const totalAgentHours = agentMetrics.reduce((s, a) => s + a.agentActualHours, 0);
    const hoursPerDay = totalHoursSaved / operatingDays;
    const activeAgents = agentMetrics.filter(a => a.calls > 0);

    // Weighted average human rate
    const weightedRate = activeAgents.length > 0
      ? activeAgents.reduce((s, a) => s + a.costPerHourHuman * a.hoursSaved, 0) / (totalHoursSaved || 1)
      : 50;
    const monthlyValue = hoursPerDay * 30 * weightedRate;
    const monthlyCost = dailyCostAvg * 30;
    const roiMultiplier = monthlyCost > 0 ? monthlyValue / monthlyCost : 0;

    const avgQuality = agentMetrics.length > 0
      ? Math.round(agentMetrics.reduce((s, a) => s + a.qualityScore, 0) / agentMetrics.length)
      : 0;
    const avgAutomation = agentMetrics.length > 0
      ? Math.round(agentMetrics.reduce((s, a) => s + a.automationRate, 0) / agentMetrics.length)
      : 0;

    const dataMaturity: ROISummary["dataMaturity"] =
      operatingDays >= 7 ? "stable" : operatingDays >= 3 ? "early" : "bootstrap";

    return {
      totalHoursSaved,
      hoursPerDay,
      totalHumanEquivalent: totalHumanEquiv,
      totalAgentHours,
      operatingDays,
      operationalCost,
      costPerHourSaved: totalHoursSaved > 0 ? operationalCost / totalHoursSaved : 0,
      dailyCostAvg,
      monthlyCostProjection: monthlyCost,
      monthlyValue,
      roiMultiplier,
      avgQualityScore: avgQuality,
      avgAutomationRate: avgAutomation,
      avgHumanHourRate: weightedRate,
      totalCalls: traceList.length,
      totalTasksDone: agentMetrics.reduce((s, a) => s + a.tasksDone, 0),
      agents: agentMetrics,
      dataMaturity,
      isLoading,
    };
  }, [agents, traces, costs, la, lt, lc]);
}
