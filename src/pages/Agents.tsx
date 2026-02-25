import { useState, useMemo } from "react";
import { Bot, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import AgentDetailSheet from "@/components/agents/AgentDetailSheet";
import AgentPerformanceTable from "@/components/agents/AgentPerformanceTable";
import AgentOrgChart from "@/components/agents/AgentOrgChart";
// SkillsNetworkGraph removed
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useAgents, useDailyCosts } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<DbAgent | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: agents, isLoading } = useAgents();
  const { data: dailyCosts } = useDailyCosts();

  const filtered = useMemo(() => {
    return (agents ?? []).filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [agents, search, statusFilter]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-violet/10 text-violet p-2 rounded-xl"><Bot className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Agentes</h1>
        </div>
        <Skeleton className="h-64" />
      </PageTransition>
    );
  }

  const all = agents ?? [];
  const online = all.filter((a) => a.status === "online").length;
  const totalCost = (dailyCosts ?? []).reduce((s, c) => s + (c.google ?? 0), 0);
  const totalTasks = all.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
  const avgError = all.length > 0 ? (all.reduce((s, a) => s + (a.error_rate ?? 0), 0) / all.length).toFixed(1) : "0";

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-violet/10 text-violet p-2 rounded-xl">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Agentes</h1>
          <p className="text-[11px] text-muted-foreground font-medium">{all.length} agentes · {online} online</p>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Online", value: `${online}/${all.length}`, color: "text-terminal" },
          { label: "Tarefas", value: totalTasks.toString(), color: "text-cyan" },
          { label: "Custo Total", value: `$${totalCost.toFixed(2)}`, color: "text-amber" },
          { label: "Erro Médio", value: `${avgError}%`, color: "text-rose" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border/50 bg-card surface-elevated">
              <CardContent className="p-4">
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color} tracking-tight`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar agentes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-[12px] bg-card border-border/50 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] text-[12px] bg-card border-border/50 rounded-xl">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">Todos</SelectItem>
            {["online", "busy", "idle", "error"].map((s) => (
              <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="bg-muted/30 border border-border/30 rounded-xl p-1">
          <TabsTrigger value="overview" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Organograma</TabsTrigger>
          <TabsTrigger value="performance" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AgentOrgChart agents={filtered} onSelectAgent={setSelectedAgent} />
        </TabsContent>




        <TabsContent value="performance" className="mt-4">
          <AgentPerformanceTable agents={filtered} />
        </TabsContent>
      </Tabs>

      <AgentDetailSheet agent={selectedAgent} open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)} />
    </PageTransition>
  );
};

export default Agents;
