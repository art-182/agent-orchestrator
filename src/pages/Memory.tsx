import { Brain, Database, Users, Target, ListChecks, PackageCheck, MessageSquare, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useMemoryEntries, useAgents, useMissions, useTasks, useDeliverables, useInteractions, useTraces } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const typeConfig: Record<string, { color: string; label: string }> = {
  fact: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Fato" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", label: "Decisão" },
  context: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Contexto" },
  preference: { color: "bg-amber/15 text-amber border-amber/30", label: "Preferência" },
  error_pattern: { color: "bg-rose/15 text-rose border-rose/30", label: "Erro" },
};

const statusColor: Record<string, string> = {
  online: "text-terminal", busy: "text-amber", idle: "text-muted-foreground", error: "text-rose",
  active: "text-terminal", completed: "text-terminal", paused: "text-amber", cancelled: "text-rose",
  todo: "text-muted-foreground", in_progress: "text-cyan", done: "text-terminal", blocked: "text-rose",
  delivered: "text-terminal", pending: "text-muted-foreground",
  success: "text-terminal", failure: "text-rose",
};

const Memory = () => {
  const { data: memoryEntries, isLoading: loadingMemory } = useMemoryEntries();
  const { data: agents, isLoading: loadingAgents } = useAgents();
  const { data: missions, isLoading: loadingMissions } = useMissions();
  const { data: tasks, isLoading: loadingTasks } = useTasks();
  const { data: deliverables, isLoading: loadingDeliverables } = useDeliverables();
  const { data: interactions, isLoading: loadingInteractions } = useInteractions();
  const { data: traces, isLoading: loadingTraces } = useTraces();

  const isLoading = loadingMemory || loadingAgents || loadingMissions || loadingTasks || loadingDeliverables || loadingInteractions || loadingTraces;

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Memória</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </PageTransition>
    );
  }

  const mem = memoryEntries ?? [];
  const ags = agents ?? [];
  const mis = missions ?? [];
  const tks = tasks ?? [];
  const del = deliverables ?? [];
  const inter = interactions ?? [];
  const trc = traces ?? [];

  const totalAccess = mem.reduce((s, m) => s + (m.access_count ?? 0), 0);
  const avgConfidence = mem.length > 0 ? Math.round(mem.reduce((s, m) => s + (m.confidence ?? 0), 0) / mem.length) : 0;
  const totalTokens = inter.reduce((s, i) => s + (i.tokens ?? 0), 0);
  const totalCost = ags.reduce((s, a) => s + (a.total_cost ?? 0), 0);

  const layers = [
    { label: "Agentes", value: ags.length, icon: Users, color: "text-terminal" },
    { label: "Missões", value: mis.length, icon: Target, color: "text-violet" },
    { label: "Tarefas", value: tks.length, icon: ListChecks, color: "text-cyan" },
    { label: "Entregáveis", value: del.length, icon: PackageCheck, color: "text-amber" },
    { label: "Interações", value: inter.length, icon: MessageSquare, color: "text-foreground" },
    { label: "Traces", value: trc.length, icon: Activity, color: "text-rose" },
    { label: "Memórias", value: mem.length, icon: Brain, color: "text-terminal" },
    { label: "Tokens Total", value: totalTokens.toLocaleString(), icon: Database, color: "text-violet" },
  ];

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center gap-3">
        <Brain className="h-7 w-7 text-terminal" />
        <div>
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Memória</h1>
          <p className="text-xs text-muted-foreground">Todas as camadas e contextos do projeto</p>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {layers.map((l) => (
          <FadeIn key={l.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3 flex items-center gap-3">
                <l.icon className={`h-4 w-4 ${l.color} shrink-0`} />
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">{l.label}</p>
                  <p className={`font-mono text-lg font-bold ${l.color}`}>{l.value}</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <Tabs defaultValue="entries">
        <TabsList className="font-mono flex-wrap h-auto gap-1">
          <TabsTrigger value="entries" className="font-mono text-[10px]">Memórias</TabsTrigger>
          <TabsTrigger value="agents" className="font-mono text-[10px]">Agentes</TabsTrigger>
          <TabsTrigger value="missions" className="font-mono text-[10px]">Missões</TabsTrigger>
          <TabsTrigger value="tasks" className="font-mono text-[10px]">Tarefas</TabsTrigger>
          <TabsTrigger value="deliverables" className="font-mono text-[10px]">Entregáveis</TabsTrigger>
          <TabsTrigger value="interactions" className="font-mono text-[10px]">Interações</TabsTrigger>
          <TabsTrigger value="traces" className="font-mono text-[10px]">Traces</TabsTrigger>
        </TabsList>

        {/* Memory Entries */}
        <TabsContent value="entries" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {mem.map((entry) => {
                const tc = typeConfig[entry.type] ?? typeConfig.fact;
                const agent = entry.agents as any;
                return (
                  <Card key={entry.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${tc.color}`}>{tc.label}</Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                        </div>
                        <span className={`font-mono text-[10px] font-semibold ${(entry.confidence ?? 0) >= 95 ? "text-terminal" : (entry.confidence ?? 0) >= 85 ? "text-amber" : "text-rose"}`}>{entry.confidence}%</span>
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {(entry.tags ?? []).map((tag) => (
                            <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{entry.access_count}x acessado</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Agents Context */}
        <TabsContent value="agents" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {ags.map((a) => (
                <Card key={a.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{a.emoji}</span>
                        <div>
                          <p className="font-mono text-sm font-semibold text-foreground">{a.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{a.model} · {a.provider}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 border ${statusColor[a.status] ?? "text-muted-foreground"}`}>{a.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { l: "Tarefas", v: a.tasks_completed ?? 0 },
                        { l: "Erro", v: `${a.error_rate ?? 0}%` },
                        { l: "Custo", v: `$${(a.total_cost ?? 0).toFixed(2)}` },
                        { l: "Uptime", v: a.uptime ?? "—" },
                      ].map((m) => (
                        <div key={m.l}>
                          <p className="font-mono text-[9px] text-muted-foreground">{m.l}</p>
                          <p className="font-mono text-xs font-bold text-foreground">{m.v}</p>
                        </div>
                      ))}
                    </div>
                    {a.current_task && <p className="font-mono text-[10px] text-muted-foreground truncate">→ {a.current_task}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Missions Context */}
        <TabsContent value="missions" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {mis.map((m) => (
                <Card key={m.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-semibold text-foreground">{m.name}</p>
                      <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 border ${statusColor[m.status] ?? "text-muted-foreground"}`}>{m.status}</Badge>
                    </div>
                    {m.description && <p className="font-mono text-[10px] text-muted-foreground">{m.description}</p>}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-foreground font-semibold">{m.progress ?? 0}%</span>
                      </div>
                      <Progress value={m.progress ?? 0} className="h-1.5" />
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                      <span>Prioridade: <span className="text-foreground">{m.priority}</span></span>
                      <span>Custo: <span className="text-foreground">${(m.cost ?? 0).toFixed(2)}</span></span>
                      <span>Tokens: <span className="text-foreground">{(m.tokens_used ?? 0).toLocaleString()}</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tasks Context */}
        <TabsContent value="tasks" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {tks.map((t) => {
                const agent = (t as any).agents as any;
                const mission = (t as any).missions as any;
                return (
                  <Card key={t.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs font-semibold text-foreground">{t.name}</p>
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 border ${statusColor[t.status] ?? "text-muted-foreground"}`}>{t.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                        {agent && <span>{agent.emoji} {agent.name}</span>}
                        {mission && <span>📌 {mission.name}</span>}
                        <span>⏱ {t.duration}</span>
                        <span className="ml-auto">{t.priority}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Deliverables Context */}
        <TabsContent value="deliverables" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {del.map((d) => {
                const agent = (d as any).agents as any;
                const mission = (d as any).missions as any;
                return (
                  <Card key={d.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs font-semibold text-foreground">{d.name}</p>
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 border ${statusColor[d.status] ?? "text-muted-foreground"}`}>{d.status}</Badge>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground">{d.description}</p>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                        {agent && <span>{agent.emoji} {agent.name}</span>}
                        {mission && <span>📌 {mission.name}</span>}
                        <span>{d.files} arquivos</span>
                        {(d.lines_changed ?? 0) > 0 && <span className="text-terminal">+{d.lines_changed} linhas</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Interactions Context */}
        <TabsContent value="interactions" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {inter.map((i) => {
                const from = (i as any).from as any;
                const to = (i as any).to as any;
                return (
                  <Card key={i.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-foreground">{from?.emoji} {from?.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-foreground">{to?.emoji} {to?.name}</span>
                        <Badge variant="outline" className="font-mono text-[8px] px-1 py-0 border ml-auto">{i.type}</Badge>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">{i.message}</p>
                      <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
                        <span>{i.tokens} tokens</span>
                        <span>{i.latency}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Traces Context */}
        <TabsContent value="traces" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-2">
              {trc.map((t) => {
                const agent = (t as any).agents as any;
                return (
                  <Card key={t.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs font-semibold text-foreground">{t.name}</p>
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 border ${statusColor[t.status] ?? "text-muted-foreground"}`}>{t.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                        {agent && <span>{agent.emoji} {agent.name}</span>}
                        <span>⏱ {t.duration}</span>
                        {t.error && <span className="text-rose">⚠ {t.error}</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default Memory;
