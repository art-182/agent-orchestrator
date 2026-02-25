import { DollarSign, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { exportDailyCostsCSV, exportAgentCostsCSV } from "@/lib/export-utils";
import BillingCards from "@/components/finances/BillingCards";
import CostChart from "@/components/finances/CostChart";
import DailyConsumptionChart from "@/components/finances/DailyConsumptionChart";
import ModelObservability from "@/components/finances/ModelObservability";
import ModelStatsCards from "@/components/finances/ModelStatsCards";
import AgentCostTable from "@/components/finances/AgentCostTable";
import ProviderPieChart from "@/components/finances/ProviderPieChart";
import TokenUsageChart from "@/components/finances/TokenUsageChart";
import ModelPricingTable from "@/components/finances/ModelPricingTable";
import ProjectionChart from "@/components/finances/ProjectionChart";
import ToolCostTable from "@/components/finances/ToolCostTable";
import SkillCostTable from "@/components/finances/SkillCostTable";
import ProjectionDetails from "@/components/finances/ProjectionDetails";
import ProviderLimitsView from "@/components/finances/ProviderLimitsView";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import {
  useDailyCosts, useAgents,
  useDailyTokenUsage, useModelPricing, useMonthlyProjections,
  useToolCosts, useSkillCosts, useProviderLimits,
  useRateLimitEvents, useCostAnomalies,
} from "@/hooks/use-supabase-data";
import type { DailyCost, AgentCost, DailyTokenUsage, ModelPricing, MonthlyProjection, ToolCost, SkillCost, ProviderLimit, RateLimitEvent, CostAnomaly } from "@/lib/finance-types";
import { parseJsonb } from "@/lib/parse-jsonb";

const Finances = () => {
  const { data: dbCosts } = useDailyCosts();
  const { data: agents } = useAgents();
  const { data: dbDailyTokens } = useDailyTokenUsage();
  const { data: dbModelPricing } = useModelPricing();
  const { data: dbMonthlyProjections } = useMonthlyProjections();
  const { data: dbToolCosts } = useToolCosts();
  const { data: dbSkillCosts } = useSkillCosts();
  const { data: dbProviderLimits } = useProviderLimits();
  const { data: dbRateLimitEvents } = useRateLimitEvents();
  const { data: dbCostAnomalies } = useCostAnomalies();

  const dailyCosts: DailyCost[] = (dbCosts ?? []).map((c) => ({
    date: c.date, openai: c.openai ?? 0, anthropic: c.anthropic ?? 0, google: c.google ?? 0, total: c.total ?? 0,
  }));

  const agentCosts: AgentCost[] = (() => {
    // Operational cost = only google (Antigravity/anthropic = subscription)
    const totalFromDailyCosts = dailyCosts.reduce((s, c) => s + (c.google ?? 0), 0);
    const agentList = agents ?? [];
    const totalTasks = agentList.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
    return agentList.filter(a => a.id !== "ceo").map((a) => {
      const agentTasks = a.tasks_completed ?? 0;
      const costShare = totalTasks > 0 ? totalFromDailyCosts * (agentTasks / totalTasks) : 0;
      return {
        id: a.id, name: a.name, emoji: a.emoji, status: (a.status as AgentCost["status"]) ?? "online",
        tokens: 0, cost: costShare, tasks: agentTasks,
        costPerTask: agentTasks > 0 ? costShare / agentTasks : 0,
      };
    });
  })();

  const providerBreakdown = (() => {
    // All 5 configured providers
    const limits = dbProviderLimits ?? [];
    const provColors: Record<string, string> = {
      "Google": "hsl(45, 93%, 56%)",
      "Google CLI": "hsl(30, 80%, 50%)",
      "Antigravity": "hsl(200, 80%, 55%)",
      "Vercel AI Gateway": "hsl(260, 67%, 70%)",
      "Minimax": "hsl(340, 75%, 55%)",
    };
    if (limits.length > 0) {
      return limits
        .map(p => ({
          name: p.provider ?? "?",
          value: Math.round((p.monthly_spent ?? 0) * 100) / 100,
          color: provColors[p.provider ?? ""] ?? "hsl(0, 0%, 50%)",
        }))
        .sort((a, b) => b.value - a.value);
    }
    // Fallback
    const g = Math.round(dailyCosts.reduce((s, c) => s + (c.google ?? 0), 0) * 100) / 100;
    return [
      { name: "Google", value: g, color: "hsl(45, 93%, 56%)" },
      { name: "Google CLI", value: 0, color: "hsl(30, 80%, 50%)" },
      { name: "Antigravity", value: 0, color: "hsl(200, 80%, 55%)" },
      { name: "Vercel AI Gateway", value: 0, color: "hsl(260, 67%, 70%)" },
      { name: "Minimax", value: 0, color: "hsl(340, 75%, 55%)" },
    ];
  })();

  const dailyTokens: DailyTokenUsage[] = (dbDailyTokens ?? []).map((t: any) => ({
    date: t.date, input: Number(t.input), output: Number(t.output), total: Number(t.total),
  }));

  const modelPricing: ModelPricing[] = (dbModelPricing ?? []).map((m: any) => ({
    model: m.model, provider: m.provider,
    inputCostPer1k: Number(m.input_cost_per_1k), outputCostPer1k: Number(m.output_cost_per_1k),
    inputTokens: Number(m.input_tokens), outputTokens: Number(m.output_tokens),
    totalCost: Number(m.total_cost), avgLatency: m.avg_latency ?? "",
  }));

  const monthlyProjections: MonthlyProjection[] = (dbMonthlyProjections ?? []).map((p: any) => ({
    month: p.month, actual: p.actual != null ? Number(p.actual) : null, projected: Number(p.projected),
  }));

  const toolCosts: ToolCost[] = (dbToolCosts ?? []).map((t: any) => ({
    tool: t.tool, agent: t.agent, calls: Number(t.calls), tokens: Number(t.tokens),
    cost: Number(t.cost), avgDuration: t.avg_duration ?? "",
  }));

  const skillCosts: SkillCost[] = (dbSkillCosts ?? []).map((s: any) => ({
    skill: s.skill, category: s.category, executions: Number(s.executions),
    tokens: Number(s.tokens), cost: Number(s.cost), successRate: Number(s.success_rate),
  }));

  const providerLimits: ProviderLimit[] = (dbProviderLimits ?? []).map((p: any) => ({
    provider: p.provider, tier: p.tier ?? "",
    rpmLimit: Number(p.rpm_limit), rpmUsed: Number(p.rpm_used),
    tpmLimit: Number(p.tpm_limit), tpmUsed: Number(p.tpm_used),
    dailyBudget: Number(p.daily_budget), dailySpent: Number(p.daily_spent),
    monthlyBudget: Number(p.monthly_budget), monthlySpent: Number(p.monthly_spent),
    rateLimitHits24h: Number(p.rate_limit_hits_24h),
    avgLatency: Number(p.avg_latency), p99Latency: Number(p.p99_latency),
    uptime: Number(p.uptime),
    fallbackProvider: p.fallback_provider, fallbackModel: p.fallback_model,
    fallbackActivations24h: Number(p.fallback_activations_24h),
    models: parseJsonb<any[]>(p.models, []),
  }));

  const rateLimitEvents: RateLimitEvent[] = (dbRateLimitEvents ?? []).map((e: any) => ({
    timestamp: e.timestamp, provider: e.provider, model: e.model,
    type: e.type as RateLimitEvent["type"], detail: e.detail ?? "",
    fallbackUsed: e.fallback_used, latencyMs: Number(e.latency_ms),
  }));

  const costAnomalies: CostAnomaly[] = (dbCostAnomalies ?? []).map((a: any) => ({
    date: a.date, provider: a.provider,
    expectedCost: Number(a.expected_cost), actualCost: Number(a.actual_cost),
    deviation: Number(a.deviation), reason: a.reason ?? "",
  }));

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber/10 text-amber p-2 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Finanças</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Análise detalhada de custos e consumo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-[11px] gap-2 rounded-xl border-border/50 hover:border-border" onClick={() => exportDailyCostsCSV(dailyCosts)}>
            <Download className="h-3.5 w-3.5" /> Custos
          </Button>
          <Button variant="outline" size="sm" className="text-[11px] gap-2 rounded-xl border-border/50 hover:border-border" onClick={() => exportAgentCostsCSV(agentCosts)}>
            <Download className="h-3.5 w-3.5" /> Agentes
          </Button>
        </div>
      </div>

      <BillingCards />

      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="bg-muted/30 border border-border/30 rounded-xl p-1">
          <TabsTrigger value="overview" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="tokens" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tokens</TabsTrigger>
          <TabsTrigger value="tools" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tools & Skills</TabsTrigger>
          <TabsTrigger value="providers" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Providers</TabsTrigger>
          <TabsTrigger value="projections" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Projeções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CostChart data={dailyCosts} />
            <ModelObservability />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProviderPieChart data={providerBreakdown} />
            <ModelStatsCards />
          </div>
          <AgentCostTable data={agentCosts} />
        </TabsContent>

        <TabsContent value="tokens" className="mt-4 space-y-6">
          <TokenUsageChart data={dailyTokens} />
          <ModelPricingTable data={modelPricing} />
        </TabsContent>

        <TabsContent value="tools" className="mt-4 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Tools</h2>
            <ToolCostTable data={toolCosts} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Skills</h2>
            <SkillCostTable data={skillCosts} />
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <ProviderLimitsView providers={providerLimits} events={rateLimitEvents} anomalies={costAnomalies} />
        </TabsContent>
        <TabsContent value="projections" className="mt-4 space-y-6">
          <ProjectionChart data={monthlyProjections} />
          <ProjectionDetails />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default Finances;
