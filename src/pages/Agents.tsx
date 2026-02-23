import { useState, useMemo } from "react";
import { Bot, Search, Filter, Activity, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import AgentDetailSheet from "@/components/agents/AgentDetailSheet";
import AgentPerformanceTable from "@/components/agents/AgentPerformanceTable";
import AgentOrgChart from "@/components/agents/AgentOrgChart";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useAgents } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

const Agents = () => {
  const [selectedAgent, setSelectedAgent] = useState<DbAgent | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: agents, isLoading } = useAgents();

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
          <Bot className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Agentes</h1>
        </div>
        <Skeleton className="h-64" />
      </PageTransition>
    );
  }

  const all = agents ?? [];
  const online = all.filter((a) => a.status === "online").length;
  const totalCost = all.reduce((s, a) => s + (a.total_cost ?? 0), 0);
  const totalTasks = all.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
  const avgError = all.length > 0 ? (all.reduce((s, a) => s + (a.error_rate ?? 0), 0) / all.length).toFixed(1) : "0";

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-7 w-7 text-terminal" />
        <div>
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Agentes</h1>
          <p className="text-xs text-muted-foreground">{all.length} agentes · {online} online</p>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Online", value: `${online}/${all.length}`, color: "text-terminal" },
          { label: "Tarefas Total", value: totalTasks.toString(), color: "text-cyan" },
          { label: "Custo Total", value: `$${totalCost.toFixed(2)}`, color: "text-amber" },
          { label: "Erro Médio", value: `${avgError}%`, color: "text-rose" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar agentes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-mono text-xs bg-card border-border" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] font-mono text-xs bg-card border-border">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Todos</SelectItem>
            {["online", "busy", "idle", "error"].map((s) => (
              <SelectItem key={s} value={s} className="font-mono text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="font-mono">
          <TabsTrigger value="overview" className="font-mono text-xs">Organograma</TabsTrigger>
          <TabsTrigger value="performance" className="font-mono text-xs">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AgentOrgChart agents={filtered} onSelectAgent={setSelectedAgent} />
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <AgentPerformanceTable agents={filtered} />
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
