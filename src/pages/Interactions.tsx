import { useState, useEffect, useCallback } from "react";
import { GitBranch, MessageSquare, Users, Coins, ListTodo } from "lucide-react";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgents, useTasks, useInteractions } from "@/hooks/use-supabase-data";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import InteractionGraph from "@/components/interactions/InteractionGraph";
import LiveInteractionFeed from "@/components/interactions/LiveInteractionFeed";

const Interactions = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: interactions, isLoading: li } = useInteractions();
  const queryClient = useQueryClient();
  const [liveAgents, setLiveAgents] = useState<Record<string, string>>({});
  const [pulsingEdges, setPulsingEdges] = useState<Set<string>>(new Set());
  const [newInteractionIds, setNewInteractionIds] = useState<Set<string>>(new Set());

  const addPulsingEdge = useCallback((key: string) => {
    setPulsingEdges((prev) => new Set(prev).add(key));
    setTimeout(() => setPulsingEdges((prev) => { const n = new Set(prev); n.delete(key); return n; }), 4000);
  }, []);

  const addNewInteraction = useCallback((id: string) => {
    setNewInteractionIds((prev) => new Set(prev).add(id));
    setTimeout(() => setNewInteractionIds((prev) => { const n = new Set(prev); n.delete(id); return n; }), 6000);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("interactions-live-v2")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "agents" }, (payload) => {
        const updated = payload.new as any;
        setLiveAgents((prev) => ({ ...prev, [updated.id]: updated.status }));
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "interactions" }, (payload) => {
        const inter = payload.new as any;
        const edgeKey = `${inter.from_agent}-${inter.to_agent}`;
        addPulsingEdge(edgeKey);
        addNewInteraction(inter.id);
        queryClient.invalidateQueries({ queryKey: ["interactions"] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, addPulsingEdge, addNewInteraction]);

  const isLoading = la || lt || li;

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2 rounded-xl"><GitBranch className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Interações</h1>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[500px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </PageTransition>
    );
  }

  const totalTokens = (interactions ?? []).reduce((s, i) => s + (i.tokens ?? 0), 0);
  const agentCount = new Set(
    [...(interactions ?? []).map((i) => i.from_agent), ...(interactions ?? []).map((i) => i.to_agent)].filter(Boolean)
  ).size;

  const stats = [
    { label: "Interações", value: (interactions ?? []).length.toString(), icon: MessageSquare, color: "text-cyan" },
    { label: "Agentes Ativos", value: agentCount.toString(), icon: Users, color: "text-terminal" },
    { label: "Tokens Usados", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), icon: Coins, color: "text-amber" },
    { label: "Tarefas", value: (tasks ?? []).length.toString(), icon: ListTodo, color: "text-violet" },
  ];

  return (
    <PageTransition className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2.5 rounded-xl">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Interações</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Grafo em tempo real · agentes, tarefas e mensagens</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-terminal/5 border border-terminal/20 rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-terminal animate-ping opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal" />
          </span>
          <span className="text-[11px] text-terminal font-semibold tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border/50 bg-card surface-elevated hover:border-border/70 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${s.color} opacity-60`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color} tracking-tight tabular-nums`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Main content: Graph + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 340px)" }}>
        {/* Graph */}
        <div className="lg:col-span-2 border border-border/50 rounded-2xl bg-card surface-elevated overflow-hidden">
          <ScrollArea className="h-full">
            <div className="overflow-x-auto p-2">
              <InteractionGraph
                agents={agents ?? []}
                tasks={tasks ?? []}
                interactions={(interactions ?? []).map((i) => ({
                  id: i.id,
                  from_agent: i.from_agent,
                  to_agent: i.to_agent,
                  message: i.message,
                  type: i.type,
                  tokens: i.tokens,
                  created_at: i.created_at,
                }))}
                liveAgents={liveAgents}
                pulsingEdges={pulsingEdges}
                newInteractionIds={newInteractionIds}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Live Feed */}
        <LiveInteractionFeed
          interactions={(interactions ?? []) as any}
          newIds={newInteractionIds}
        />
      </div>
    </PageTransition>
  );
};

export default Interactions;
