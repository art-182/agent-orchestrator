import { DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingCards from "@/components/finances/BillingCards";
import CostChart from "@/components/finances/CostChart";
import AgentCostTable from "@/components/finances/AgentCostTable";
import ProviderPieChart from "@/components/finances/ProviderPieChart";
import TokenUsageChart from "@/components/finances/TokenUsageChart";
import ModelPricingTable from "@/components/finances/ModelPricingTable";
import ProjectionChart from "@/components/finances/ProjectionChart";
import ToolCostTable from "@/components/finances/ToolCostTable";
import SkillCostTable from "@/components/finances/SkillCostTable";
import {
  mockBillingSummary,
  mockDailyCosts,
  mockAgentCosts,
  mockProviderBreakdown,
  mockDailyTokens,
  mockModelPricing,
  mockMonthlyProjections,
  mockToolCosts,
  mockSkillCosts,
} from "@/lib/finance-data";

const Finances = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <DollarSign className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Finanças</h1>
    </div>

    {/* Billing summary cards */}
    <BillingCards data={mockBillingSummary} />

    {/* Tabs for deep views */}
    <Tabs defaultValue="overview" className="mt-2">
      <TabsList className="font-mono">
        <TabsTrigger value="overview" className="font-mono text-xs">Visão Geral</TabsTrigger>
        <TabsTrigger value="tokens" className="font-mono text-xs">Tokens</TabsTrigger>
        <TabsTrigger value="tools" className="font-mono text-xs">Tools & Skills</TabsTrigger>
        <TabsTrigger value="projections" className="font-mono text-xs">Projeções</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CostChart data={mockDailyCosts} />
          </div>
          <ProviderPieChart data={mockProviderBreakdown} />
        </div>
        <AgentCostTable data={mockAgentCosts} />
      </TabsContent>

      <TabsContent value="tokens" className="mt-4 space-y-6">
        <TokenUsageChart data={mockDailyTokens} />
        <ModelPricingTable data={mockModelPricing} />
      </TabsContent>

      <TabsContent value="tools" className="mt-4 space-y-6">
        <ToolCostTable data={mockToolCosts} />
        <SkillCostTable data={mockSkillCosts} />
      </TabsContent>

      <TabsContent value="projections" className="mt-4 space-y-6">
        <ProjectionChart data={mockMonthlyProjections} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AgentCostTable data={mockAgentCosts} />
          </div>
          <ProviderPieChart data={mockProviderBreakdown} />
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default Finances;
