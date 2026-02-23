import { useState, useMemo, useRef } from "react";
import { GanttChart, X, FileJson, Puzzle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useInteractions } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const statusColor: Record<string, string> = {
  todo: "bg-muted-foreground/40", in_progress: "bg-cyan", done: "bg-terminal", blocked: "bg-rose",
};
const statusLabel: Record<string, string> = {
  todo: "Pendente", in_progress: "Em Progresso", done: "Concluído", blocked: "Bloqueado",
};
const priorityColor: Record<string, string> = {
  critical: "border-rose/60", high: "border-amber/60", medium: "border-cyan/40", low: "border-muted-foreground/30",
};

const HOUR_WIDTH = 100;
const ROW_HEIGHT = 56;
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 - 18:00

interface SelectedTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  duration: string;
  agentName: string;
  agentEmoji: string;
  missionName: string;
  startHour: number;
  tokens: number;
  cost: number;
}

const TimelinePage = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: interactions, isLoading: li } = useInteractions();
  const [selected, setSelected] = useState<SelectedTask | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = la || lt || li;

  // Build gantt data: assign tasks to agents with pseudo time slots
  const ganttData = useMemo(() => {
    if (!agents || !tasks) return [];
    return agents.map((agent) => {
      const agentTasks = tasks
        .filter((t) => t.agent_id === agent.id)
        .map((t, idx) => {
          // Pseudo-time: spread tasks across the day based on index
          const startHour = 8 + (idx * 2.5) % 9;
          const durationHours = t.status === "done" ? 2 : t.status === "in_progress" ? 3 : 1.5;
          return { ...t, startHour, durationHours };
        });
      return { agent, tasks: agentTasks };
    }).filter((r) => r.tasks.length > 0);
  }, [agents, tasks]);

  // Decision tree mock for selected task
  const decisionTree = useMemo(() => {
    if (!selected || !interactions) return [];
    // Find interactions related to the agent
    return interactions
      .filter((i) => i.from_agent === selected.id || i.to_agent === selected.id)
      .slice(0, 4)
      .map((i) => ({
        type: i.type,
        message: i.message,
        tokens: i.tokens ?? 0,
      }));
  }, [selected, interactions]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <GanttChart className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Timeline</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const scrollTimeline = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GanttChart className="h-7 w-7 text-terminal" />
          <div>
            <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Timeline</h1>
            <p className="text-xs text-muted-foreground">Visualização Gantt · Agentes × Tarefas</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scrollTimeline(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => scrollTimeline(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="flex">
          {/* Agent labels column */}
          <div className="shrink-0 w-[180px] border-r border-border z-10 bg-card">
            {/* Header spacer */}
            <div className="h-10 border-b border-border flex items-center px-3">
              <span className="font-mono text-[10px] text-muted-foreground">Agentes</span>
            </div>
            {ganttData.map((row) => (
              <div key={row.agent.id} className="flex items-center gap-2 px-3 border-b border-border/50" style={{ height: ROW_HEIGHT }}>
                <span className="text-base">{row.agent.emoji}</span>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-foreground truncate">{row.agent.name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{row.agent.model} · {row.agent.provider?.slice(0, 3)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable timeline area */}
          <div className="overflow-x-auto flex-1" ref={scrollRef}>
            <div style={{ minWidth: HOURS.length * HOUR_WIDTH }}>
              {/* Time headers */}
              <div className="flex h-10 border-b border-border">
                {HOURS.map((h) => (
                  <div key={h} className="flex items-center justify-center border-r border-border/30 font-mono text-[10px] text-muted-foreground" style={{ width: HOUR_WIDTH }}>
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Rows */}
              {ganttData.map((row) => (
                <div key={row.agent.id} className="relative border-b border-border/50" style={{ height: ROW_HEIGHT }}>
                  {/* Grid lines */}
                  {HOURS.map((h) => (
                    <div key={h} className="absolute top-0 bottom-0 border-r border-border/10" style={{ left: (h - 7) * HOUR_WIDTH, width: HOUR_WIDTH }} />
                  ))}

                  {/* Now indicator */}
                  <div className="absolute top-0 bottom-0 w-px bg-rose/40 z-10" style={{ left: (new Date().getHours() - 7 + new Date().getMinutes() / 60) * HOUR_WIDTH }} />

                  {/* Task bars */}
                  {row.tasks.map((task) => {
                    const left = (task.startHour - 7) * HOUR_WIDTH;
                    const width = task.durationHours * HOUR_WIDTH;
                    const sc = statusColor[task.status] ?? "bg-muted";
                    const pc = priorityColor[task.priority] ?? "border-border";
                    const agent = (task as any).agents as any;
                    const mission = (task as any).missions as any;

                    return (
                      <button
                        key={task.id}
                        className={`absolute top-2 h-[calc(100%-16px)] rounded-md border-2 ${pc} ${sc}/20 backdrop-blur-sm flex items-center px-2 gap-1.5 cursor-pointer hover:brightness-125 transition-all group`}
                        style={{ left, width: Math.max(width, 60) }}
                        onClick={() => setSelected({
                          id: task.agent_id ?? "",
                          name: task.name,
                          status: task.status,
                          priority: task.priority,
                          duration: task.duration ?? "—",
                          agentName: agent?.name ?? row.agent.name,
                          agentEmoji: agent?.emoji ?? row.agent.emoji,
                          missionName: mission?.name ?? "—",
                          startHour: task.startHour,
                          tokens: task.tokens ?? 0,
                          cost: task.cost ?? 0,
                        })}
                      >
                        <div className={`h-2 w-2 rounded-full ${sc} shrink-0`} />
                        <span className="font-mono text-[10px] text-foreground truncate">{task.name}</span>
                        {task.status === "in_progress" && (
                          <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusColor).map(([k, c]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${c}`} />
            <span className="font-mono text-[10px] text-muted-foreground">{statusLabel[k] ?? k}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <div className="h-full w-px bg-rose/40 h-3" />
          <span className="font-mono text-[10px] text-rose/60">Agora</span>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="border-border bg-card w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-cyan/15 text-cyan border-cyan/30 font-mono text-[10px]">
                    TAREFA ATIVA
                  </Badge>
                </div>
                <SheetTitle className="font-mono text-lg">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  Agente: {selected.agentEmoji} {selected.agentName} · Iniciado: {String(Math.floor(selected.startHour)).padStart(2, "0")}:{String(Math.round((selected.startHour % 1) * 60)).padStart(2, "0")}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs defaultValue="tree">
                  <TabsList className="font-mono w-full">
                    <TabsTrigger value="tree" className="font-mono text-[10px] flex-1">Árvore de Decisão</TabsTrigger>
                    <TabsTrigger value="logs" className="font-mono text-[10px] flex-1">Logs JSON</TabsTrigger>
                    <TabsTrigger value="artifacts" className="font-mono text-[10px] flex-1">Artifacts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree" className="mt-4">
                    <div className="space-y-3">
                      {/* INPUT_RECEIVED */}
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">INPUT_RECEIVED</span>
                        </div>
                        <p className="font-mono text-xs text-foreground">"{selected.name}"</p>
                      </div>

                      {/* INTENT_CLASSIFICATION */}
                      <div className="rounded-lg border border-violet/30 bg-violet/5 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-violet" />
                            <span className="font-mono text-[10px] font-bold text-violet">INTENT_CLASSIFICATION</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-[8px] border-terminal/30 text-terminal">
                            {selected.priority === "critical" ? "98" : selected.priority === "high" ? "95" : "90"}% Conf
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-foreground">
                          Category: <span className="text-cyan">{selected.priority === "critical" ? "Critical_Issue" : "Technical_Issue"}</span>
                        </p>
                        <p className="font-mono text-xs text-foreground">
                          Severity: <span className={selected.priority === "critical" ? "text-rose" : selected.priority === "high" ? "text-amber" : "text-terminal"}>
                            {selected.priority === "critical" ? "Critical" : selected.priority === "high" ? "High" : "Medium"}
                          </span>
                        </p>
                      </div>

                      {/* DECISION_NODE */}
                      <div className="rounded-lg border border-amber/30 bg-amber/5 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-amber" />
                          <span className="font-mono text-[10px] font-bold text-amber">DECISION_NODE</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-terminal/10 border border-terminal/20">
                            <span className="text-terminal text-xs">✓</span>
                            <span className="font-mono text-xs text-foreground">Check Knowledge Base</span>
                          </div>
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50">
                            <span className="text-muted-foreground text-xs">⬜</span>
                            <span className="font-mono text-xs text-muted-foreground">Escalate to Human</span>
                          </div>
                        </div>
                      </div>

                      {/* RESPONSE_GENERATION */}
                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">RESPONSE_GENERATION</span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground italic">
                          {selected.status === "done" ? "Resposta gerada com sucesso." : "Waiting for decision..."}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1 gap-2 font-mono text-xs border-rose/30 text-rose hover:bg-rose/10">
                        <X className="h-3.5 w-3.5" /> Interromper
                      </Button>
                      <Button className="flex-1 gap-2 font-mono text-xs bg-terminal hover:bg-terminal/80 text-background">
                        <Puzzle className="h-3.5 w-3.5" /> Ver Detalhes
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <pre className="font-mono text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">
{JSON.stringify({
  task_id: selected.id,
  task_name: selected.name,
  agent: `${selected.agentEmoji} ${selected.agentName}`,
  mission: selected.missionName,
  status: selected.status,
  priority: selected.priority,
  started_at: `${String(Math.floor(selected.startHour)).padStart(2, "0")}:${String(Math.round((selected.startHour % 1) * 60)).padStart(2, "0")}`,
  tokens_used: selected.tokens,
  cost: selected.cost,
  decision_path: ["INPUT_RECEIVED", "INTENT_CLASSIFICATION", "DECISION_NODE", "RESPONSE_GENERATION"],
  interactions: decisionTree,
}, null, 2)}
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="artifacts" className="mt-4">
                    <div className="space-y-2">
                      <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
                        <FileJson className="h-4 w-4 text-cyan" />
                        <div>
                          <p className="font-mono text-xs text-foreground">decision_log.json</p>
                          <p className="font-mono text-[9px] text-muted-foreground">Árvore de decisão completa</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
                        <FileJson className="h-4 w-4 text-terminal" />
                        <div>
                          <p className="font-mono text-xs text-foreground">output_response.md</p>
                          <p className="font-mono text-[9px] text-muted-foreground">Resposta gerada pelo agente</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageTransition>
  );
};

export default TimelinePage;
