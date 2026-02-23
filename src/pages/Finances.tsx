import { DollarSign, Download, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { exportDailyCostsCSV, exportAgentCostsCSV } from "@/lib/export-utils";
import BillingCards from "@/components/finances/BillingCards";
import CostChart from "@/components/finances/CostChart";
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
import { useDailyCosts, useBillingSnapshots, useAgents } from "@/hooks/use-supabase-data";
import {
  mockProviderBreakdown, mockDailyTokens, mockModelPricing, mockMonthlyProjections,
  mockToolCosts, mockSkillCosts, mockProviderLimits, mockRateLimitEvents, mockCostAnomalies,
} from "@/lib/finance-data";
import type { DailyCost, AgentCost } from "@/lib/finance-data";

const Finances = () => {
  const { data: dbCosts } = useDailyCosts();
  const { data: agents } = useAgents();

  const dailyCosts: DailyCost[] = (dbCosts ?? []).map((c) => ({
    date: c.date, openai: c.openai ?? 0, anthropic: c.anthropic ?? 0, google: c.google ?? 0, total: c.total ?? 0,
  }));

  const agentCosts: AgentCost[] = (agents ?? []).map((a) => ({
    id: a.id, name: a.name, emoji: a.emoji, status: (a.status as AgentCost["status"]) ?? "online",
    tokens: 0, cost: a.total_cost ?? 0, tasks: a.tasks_completed ?? 0,
    costPerTask: a.tasks_completed ? (a.total_cost ?? 0) / a.tasks_completed : 0,
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

      {/* Financial Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-terminal" />
              <span className="text-sm font-medium">Tendência Semanal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {dailyCosts.length >= 7
                ? (() => {
                    const last7 = dailyCosts.slice(-7);
                    const prev7 = dailyCosts.slice(-14, -7);
                    const sumLast = last7.reduce((s, c) => s + c.total, 0);
                    const sumPrev = prev7.reduce((s, c) => s + c.total, 0);
                    const pctChange = sumPrev > 0 ? ((sumLast - sumPrev) / sumPrev * 100).toFixed(1) : "0";
                    return `Gasto dos últimos 7 dias: $${sumLast.toFixed(2)} (${Number(pctChange) >= 0 ? "+" : ""}${pctChange}% vs semana anterior)`;
                  })()
                : `Total acumulado: $${dailyCosts.reduce((s, c) => s + c.total, 0).toFixed(2)} em ${dailyCosts.length} dias registrados`
              }
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-cyan" />
              <span className="text-sm font-medium">Eficiência dos Agentes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {agentCosts.length > 0
                ? `${agentCosts.length} agentes · Custo médio/tarefa: $${(agentCosts.reduce((s, a) => s + a.costPerTask, 0) / agentCosts.length).toFixed(3)} · Total tarefas: ${agentCosts.reduce((s, a) => s + a.tasks, 0).toLocaleString()}`
                : "Sem dados de agentes ainda"
              }
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-violet" />
              <span className="text-sm font-medium">Distribuição de Custos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {dailyCosts.length > 0
                ? (() => {
                    const totals = { openai: 0, anthropic: 0, google: 0 };
                    dailyCosts.forEach(c => { totals.openai += c.openai; totals.anthropic += c.anthropic; totals.google += c.google; });
                    const sum = totals.openai + totals.anthropic + totals.google;
                    return `OpenAI: ${(totals.openai / sum * 100).toFixed(0)}% · Anthropic: ${(totals.anthropic / sum * 100).toFixed(0)}% · Google: ${(totals.google / sum * 100).toFixed(0)}%`;
                  })()
                : "Sem dados de custos ainda"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="bg-muted/30 border border-border/30 rounded-xl p-1">
          <TabsTrigger value="overview" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="tokens" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tokens</TabsTrigger>
          <TabsTrigger value="tools" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tools & Skills</TabsTrigger>
          <TabsTrigger value="providers" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Providers</TabsTrigger>
          <TabsTrigger value="projections" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Projeções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3"><CostChart data={dailyCosts.length > 0 ? dailyCosts : []} /></div>
            <ProviderPieChart data={mockProviderBreakdown} />
          </div>
          <AgentCostTable data={agentCosts} />
        </TabsContent>

        <TabsContent value="tokens" className="mt-4 space-y-6">
          <TokenUsageChart data={mockDailyTokens} />
          <ModelPricingTable data={mockModelPricing} />
        </TabsContent>

        <TabsContent value="tools" className="mt-4 space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Tools</h2>
            <ToolCostTable data={mockToolCosts} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Skills</h2>
            <SkillCostTable data={mockSkillCosts} />
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <ProviderLimitsView providers={mockProviderLimits} events={mockRateLimitEvents} anomalies={mockCostAnomalies} />
        </TabsContent>
        <TabsContent value="projections" className="mt-4 space-y-6">
          <ProjectionChart data={mockMonthlyProjections} />
          <ProjectionDetails />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default Finances;
