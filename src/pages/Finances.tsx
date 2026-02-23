import { DollarSign } from "lucide-react";
import BillingCards from "@/components/finances/BillingCards";
import CostChart from "@/components/finances/CostChart";
import AgentCostTable from "@/components/finances/AgentCostTable";
import ProviderPieChart from "@/components/finances/ProviderPieChart";
import {
  mockBillingSummary,
  mockDailyCosts,
  mockAgentCosts,
  mockProviderBreakdown,
} from "@/lib/finance-data";

const Finances = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <DollarSign className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Finanças</h1>
    </div>

    {/* Billing summary cards */}
    <BillingCards data={mockBillingSummary} />

    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CostChart data={mockDailyCosts} />
      </div>
      <ProviderPieChart data={mockProviderBreakdown} />
    </div>

    {/* Agent cost breakdown */}
    <AgentCostTable data={mockAgentCosts} />
  </div>
);

export default Finances;
