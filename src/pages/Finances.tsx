import { DollarSign, Download } from "lucide-react";
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
