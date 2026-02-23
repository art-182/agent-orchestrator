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
  mockProviderBreakdown,
  mockDailyTokens,
  mockModelPricing,
  mockMonthlyProjections,
  mockToolCosts,
  mockSkillCosts,
  mockProviderLimits,
  mockRateLimitEvents,
  mockCostAnomalies,
} from "@/lib/finance-data";
import type { DailyCost, AgentCost } from "@/lib/finance-data";

const Finances = () => {
  const { data: dbCosts } = useDailyCosts();
  const { data: agents } = useAgents();

  // Map DB daily_costs to the DailyCost interface
  const dailyCosts: DailyCost[] = (dbCosts ?? []).map((c) => ({
    date: c.date,
    openai: c.openai ?? 0,
    anthropic: c.anthropic ?? 0,
    google: c.google ?? 0,
    total: c.total ?? 0,
  }));

  // Derive agent costs from agents table
  const agentCosts: AgentCost[] = (agents ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    status: (a.status as AgentCost["status"]) ?? "online",
    tokens: 0, // not tracked per-agent in DB yet
    cost: a.total_cost ?? 0,
    tasks: a.tasks_completed ?? 0,
    costPerTask: a.tasks_completed ? (a.total_cost ?? 0) / a.tasks_completed : 0,
  }));

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Finanças</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-2"
            onClick={() => exportDailyCostsCSV(dailyCosts)}
          >
            <Download className="h-3.5 w-3.5" /> Custos CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs gap-2"
            onClick={() => exportAgentCostsCSV(agentCosts)}
          >
            <Download className="h-3.5 w-3.5" /> Agentes CSV
          </Button>
        </div>
      </div>

      <BillingCards />

      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="font-mono">
          <TabsTrigger value="overview" className="font-mono text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="tokens" className="font-mono text-xs">Tokens</TabsTrigger>
          <TabsTrigger value="tools" className="font-mono text-xs">Tools & Skills</TabsTrigger>
          <TabsTrigger value="providers" className="font-mono text-xs">Providers & Limites</TabsTrigger>
          <TabsTrigger value="projections" className="font-mono text-xs">Projeções</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <CostChart data={dailyCosts.length > 0 ? dailyCosts : []} />
            </div>
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
            <h2 className="font-mono text-sm font-semibold text-foreground mb-4">Tools</h2>
            <ToolCostTable data={mockToolCosts} />
          </div>
          <div>
            <h2 className="font-mono text-sm font-semibold text-foreground mb-4">Skills</h2>
            <SkillCostTable data={mockSkillCosts} />
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <ProviderLimitsView
            providers={mockProviderLimits}
            events={mockRateLimitEvents}
            anomalies={mockCostAnomalies}
          />
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
