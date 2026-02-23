import { useState, useMemo } from "react";
import { Brain, Database, Users, Target, ListChecks, PackageCheck, MessageSquare, Activity, Search, SlidersHorizontal, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useMemoryEntries, useAgents, useMissions, useTasks, useDeliverables, useInteractions, useTraces } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const typeConfig: Record<string, { color: string; label: string; emoji: string }> = {
  fact: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Fato", emoji: "📌" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", label: "Decisão", emoji: "⚖️" },
  context: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Contexto", emoji: "🧠" },
  preference: { color: "bg-amber/15 text-amber border-amber/30", label: "Preferência", emoji: "⭐" },
  error_pattern: { color: "bg-rose/15 text-rose border-rose/30", label: "Erro", emoji: "🔴" },
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

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [confidenceMin, setConfidenceMin] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const isLoading = loadingMemory || loadingAgents || loadingMissions || loadingTasks || loadingDeliverables || loadingInteractions || loadingTraces;

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

  // Filtered memories
  const filteredMem = useMemo(() => {
    return mem.filter((entry) => {
      if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase()) && !(entry.tags ?? []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      const agent = entry.agents as any;
      if (agentFilter !== "all" && agent?.name !== agentFilter) return false;
      if ((entry.confidence ?? 0) < confidenceMin) return false;
      return true;
    });
  }, [mem, searchQuery, typeFilter, agentFilter, confidenceMin]);

  // Tag frequency map
  const tagMap = useMemo(() => {
    const map: Record<string, number> = {};
    mem.forEach((m) => (m.tags ?? []).forEach((t) => { map[t] = (map[t] ?? 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [mem]);

  // Connections between agents via shared tags
  const agentConnections = useMemo(() => {
    const connections: { from: string; to: string; shared: string[] }[] = [];
    const agentTags: Record<string, Set<string>> = {};
    mem.forEach((m) => {
      const agent = (m.agents as any)?.name;
      if (agent) {
        if (!agentTags[agent]) agentTags[agent] = new Set();
        (m.tags ?? []).forEach((t) => agentTags[agent].add(t));
      }
    });
    const agentNames = Object.keys(agentTags);
    for (let i = 0; i < agentNames.length; i++) {
      for (let j = i + 1; j < agentNames.length; j++) {
        const shared = [...agentTags[agentNames[i]]].filter((t) => agentTags[agentNames[j]].has(t));
        if (shared.length > 0) connections.push({ from: agentNames[i], to: agentNames[j], shared });
      }
    }
    return connections;
  }, [mem]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl"><Brain className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Memória</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </PageTransition>
    );
  }

  const layers = [
    { label: "Memórias", value: mem.length, icon: Brain, color: "text-terminal" },
    { label: "Confiança Média", value: `${avgConfidence}%`, icon: TrendingUp, color: avgConfidence >= 90 ? "text-terminal" : "text-amber" },
    { label: "Acessos Total", value: totalAccess.toLocaleString(), icon: Layers, color: "text-cyan" },
    { label: "Agentes", value: ags.length, icon: Users, color: "text-violet" },
    { label: "Missões", value: mis.length, icon: Target, color: "text-foreground" },
    { label: "Tarefas", value: tks.length, icon: ListChecks, color: "text-cyan" },
    { label: "Tokens Total", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), icon: Database, color: "text-violet" },
    { label: "Traces", value: trc.length, icon: Activity, color: "text-rose" },
  ];

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-terminal/10 text-terminal p-2 rounded-xl">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Memória</h1>
          <p className="text-[11px] text-muted-foreground font-medium">Base de conhecimento · {mem.length} memórias · {avgConfidence}% confiança</p>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {layers.map((l) => (
          <FadeIn key={l.label}>
            <Card className="border-border/50 bg-card surface-elevated">
              <CardContent className="p-4 flex items-center gap-3">
                <l.icon className={`h-4 w-4 ${l.color} shrink-0`} />
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">{l.label}</p>
                  <p className={`text-lg font-bold ${l.color} tracking-tight`}>{l.value}</p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <Tabs defaultValue="entries">
        <TabsList className="bg-muted/30 border border-border/30 rounded-xl p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="entries" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Memórias</TabsTrigger>
          <TabsTrigger value="connections" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Conexões</TabsTrigger>
          <TabsTrigger value="tags" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Tags</TabsTrigger>
          <TabsTrigger value="agents" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Agentes</TabsTrigger>
          <TabsTrigger value="missions" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Missões</TabsTrigger>
          <TabsTrigger value="interactions" className="text-[12px] rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Interações</TabsTrigger>
        </TabsList>

        {/* Memory Entries with Search & Filters */}
        <TabsContent value="entries" className="mt-4 space-y-4">
          {/* Search & filters bar */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar memórias, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-[12px] bg-card border-border/50 rounded-xl"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] text-[12px] bg-card border-border/50 rounded-xl">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">Todos os tipos</SelectItem>
                {Object.entries(typeConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-[12px]">{v.emoji} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[140px] text-[12px] bg-card border-border/50 rounded-xl">
                <SelectValue placeholder="Agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">Todos agentes</SelectItem>
                {ags.map((a) => (
                  <SelectItem key={a.id} value={a.name} className="text-[12px]">{a.emoji} {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-[11px] px-2.5 py-1.5 border-border/50 cursor-pointer hover:border-border rounded-full font-medium" onClick={() => setConfidenceMin(confidenceMin > 0 ? 0 : 85)}>
              {confidenceMin > 0 ? `≥${confidenceMin}%` : "Confiança"}
            </Badge>
          </div>

          <p className="text-[10px] text-muted-foreground font-medium">{filteredMem.length} resultado(s)</p>

          <ScrollArea className="h-[calc(100vh-480px)]">
            <div className="space-y-2">
              {filteredMem.map((entry) => {
                const tc = typeConfig[entry.type] ?? typeConfig.fact;
                const agent = entry.agents as any;
                const isSelected = selectedEntry?.id === entry.id;
                return (
                  <Card
                    key={entry.id}
                    className={`border-border/50 bg-card surface-elevated hover:border-border transition-all duration-200 cursor-pointer ${isSelected ? "ring-1 ring-terminal/20 border-terminal/30" : ""}`}
                    onClick={() => setSelectedEntry(isSelected ? null : entry)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm">{tc.emoji}</span>
                          <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${tc.color}`}>{tc.label}</Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16">
                            <Progress value={entry.confidence ?? 0} className="h-1" />
                          </div>
                          <span className={`font-mono text-[10px] font-semibold ${(entry.confidence ?? 0) >= 95 ? "text-terminal" : (entry.confidence ?? 0) >= 85 ? "text-amber" : "text-rose"}`}>{entry.confidence}%</span>
                        </div>
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {(entry.tags ?? []).map((tag) => (
                            <span
                              key={tag}
                              className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-terminal/10 hover:text-terminal cursor-pointer transition-colors"
                              onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{entry.access_count}x · {new Date(entry.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>

                      {/* Expanded detail */}
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="font-mono text-[9px] text-muted-foreground">Acessos</p>
                              <p className="font-mono text-sm font-bold text-foreground">{entry.access_count}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-muted-foreground">Confiança</p>
                              <p className="font-mono text-sm font-bold text-foreground">{entry.confidence}%</p>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-muted-foreground">Último acesso</p>
                              <p className="font-mono text-sm font-bold text-foreground">{entry.last_accessed ? new Date(entry.last_accessed).toLocaleDateString("pt-BR") : "—"}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Connections tab */}
        <TabsContent value="connections" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">{agentConnections.length} conexões via tags compartilhadas</p>
              {agentConnections.map((conn, idx) => (
                <Card key={idx} className="border-border bg-card">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className="font-semibold text-terminal">{conn.from}</span>
                      <span className="text-muted-foreground">↔</span>
                      <span className="font-semibold text-cyan">{conn.to}</span>
                      <Badge variant="outline" className="ml-auto font-mono text-[10px] border-violet/30 text-violet">{conn.shared.length} tags</Badge>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {conn.shared.map((tag) => (
                        <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-violet/10 text-violet">#{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {agentConnections.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma conexão encontrada</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tags tab */}
        <TabsContent value="tags" className="mt-4">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground">{tagMap.length} tags encontradas</p>
              <div className="flex flex-wrap gap-2">
                {tagMap.map(([tag, count]) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="font-mono text-xs px-3 py-1.5 border-border hover:border-terminal/30 hover:bg-terminal/5 cursor-pointer transition-colors"
                    onClick={() => { setSearchQuery(tag); }}
                  >
                    #{tag} <span className="ml-1.5 text-muted-foreground">({count})</span>
                  </Badge>
                ))}
              </div>
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
                    {/* Memory count for this agent */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                      <Brain className="h-3 w-3 text-terminal" />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {mem.filter((m) => (m.agents as any)?.name === a.name).length} memórias associadas
                      </span>
                    </div>
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
                  </CardContent>
                </Card>
              ))}
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
      </Tabs>
    </PageTransition>
  );
};

export default Memory;
