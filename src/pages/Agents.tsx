import { useState } from "react";
import { Bot, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import AgentCard from "@/components/agents/AgentCard";
import AgentDetailSheet from "@/components/agents/AgentDetailSheet";
import AgentPerformanceTable from "@/components/agents/AgentPerformanceTable";
import AgentOrgChart from "@/components/agents/AgentOrgChart";
import { mockAgents, statusColorMap } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [hierarchyOpen, setHierarchyOpen] = useState(true);

  const parent = mockAgents.find((a) => !a.parentId);
  const children = mockAgents.filter((a) => a.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Agentes</h1>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="font-mono">
          <TabsTrigger value="overview" className="font-mono text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance" className="font-mono text-xs">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {parent && (
            <Collapsible open={hierarchyOpen} onOpenChange={setHierarchyOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 font-mono text-sm text-foreground hover:text-terminal transition-colors">
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${hierarchyOpen ? "rotate-90" : ""}`}
                />
                <span className="text-lg">{parent.emoji}</span>
                {parent.name}
                <span className={`text-xs ${statusColorMap[parent.status]}`}>({parent.status})</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-6 mt-2 space-y-1.5 border-l border-border pl-4">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
                    onClick={() => setSelectedAgent(child)}
                  >
                    <span>{child.emoji}</span>
                    <span>{child.name}</span>
                    <span className={`${statusColorMap[child.status]}`}>({child.status})</span>
                    <span className="ml-auto text-[10px]">{child.model}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
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
