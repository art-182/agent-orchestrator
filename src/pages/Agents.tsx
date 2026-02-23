import { useState } from "react";
import { Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentDetailSheet from "@/components/agents/AgentDetailSheet";
import AgentPerformanceTable from "@/components/agents/AgentPerformanceTable";
import AgentOrgChart from "@/components/agents/AgentOrgChart";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useAgents } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<DbAgent | null>(null);
  const { data: agents, isLoading } = useAgents();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Agentes</h1>
        </div>
        <Skeleton className="h-64" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Agentes</h1>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="font-mono">
          <TabsTrigger value="overview" className="font-mono text-xs">Organograma</TabsTrigger>
          <TabsTrigger value="performance" className="font-mono text-xs">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AgentOrgChart agents={agents ?? []} onSelectAgent={setSelectedAgent} />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <AgentPerformanceTable agents={agents ?? []} />
        </TabsContent>
      </Tabs>

      <AgentDetailSheet
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => !open && setSelectedAgent(null)}
      />
    </PageTransition>
  );
};

export default Agents;
