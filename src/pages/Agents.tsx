import { useState } from "react";
import { Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentCard from "@/components/agents/AgentCard";
import AgentDetailSheet from "@/components/agents/AgentDetailSheet";
import AgentPerformanceTable from "@/components/agents/AgentPerformanceTable";
import AgentOrgChart from "@/components/agents/AgentOrgChart";
import { mockAgents, statusColorMap } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Agentes</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="font-mono">
          <TabsTrigger value="overview" className="font-mono text-xs">Organograma</TabsTrigger>
          <TabsTrigger value="performance" className="font-mono text-xs">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AgentOrgChart onSelectAgent={setSelectedAgent} />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <AgentPerformanceTable />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <AgentDetailSheet
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => !open && setSelectedAgent(null)}
      />
    </div>
  );
};

export default Agents;
