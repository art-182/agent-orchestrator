import { useState, useMemo, useRef, useCallback } from "react";
import { GanttChart, X, FileJson, Puzzle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Milestone, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useInteractions, useMissions } from "@/hooks/use-supabase-data";
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

const ROW_HEIGHT = 56;

const ZOOM_LEVELS = [60, 80, 100, 140, 180];
const ZOOM_LABELS = ["1h", "1.5h", "2h", "3h", "4h"];

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
  durationHours: number;
  missionId: string | null;
}

const TimelinePage = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: interactions, isLoading: li } = useInteractions();
  const { data: missions } = useMissions();
  const [selected, setSelected] = useState<SelectedTask | null>(null);
  const [zoomIdx, setZoomIdx] = useState(2);
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [showDependencies, setShowDependencies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const HOUR_WIDTH = ZOOM_LEVELS[zoomIdx];
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 06:00 - 19:00

  const isLoading = la || lt || li;

  const ganttData = useMemo(() => {
    if (!agents || !tasks) return [];
    const filtered = missionFilter === "all" ? tasks : tasks.filter((t) => t.mission_id === missionFilter);
    return agents.map((agent) => {
      const agentTasks = filtered
        .filter((t) => t.agent_id === agent.id)
        .map((t, idx) => {
          const startHour = 7 + (idx * 2) % 11;
          const durationHours = t.status === "done" ? 2.5 : t.status === "in_progress" ? 3 : t.status === "blocked" ? 1 : 1.5;
          return { ...t, startHour, durationHours };
        });
      return { agent, tasks: agentTasks };
    }).filter((r) => r.tasks.length > 0);
  }, [agents, tasks, missionFilter]);

  // Build dependency lines between tasks in same mission
  const dependencies = useMemo(() => {
    if (!showDependencies) return [];
    const deps: { fromX: number; fromY: number; toX: number; toY: number }[] = [];
    const taskPositions: Record<string, { x: number; y: number; w: number }> = {};

    ganttData.forEach((row, rowIdx) => {
      row.tasks.forEach((task) => {
        const left = (task.startHour - 6) * HOUR_WIDTH;
        const width = task.durationHours * HOUR_WIDTH;
        const y = rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        taskPositions[task.id] = { x: left, y, w: width };
      });
    });

    // Connect sequential tasks within same mission
    ganttData.forEach((row) => {
      for (let i = 0; i < row.tasks.length - 1; i++) {
        const curr = row.tasks[i];
        const next = row.tasks[i + 1];
        if (curr.mission_id && curr.mission_id === next.mission_id) {
          const from = taskPositions[curr.id];
          const to = taskPositions[next.id];
          if (from && to) {
            deps.push({ fromX: from.x + from.w, fromY: from.y, toX: to.x, toY: to.y });
          }
        }
      }
    });
    return deps;
  }, [ganttData, showDependencies, HOUR_WIDTH]);

  // Milestones from missions
  const milestones = useMemo(() => {
    if (!missions) return [];
    return missions.filter((m) => m.deadline).map((m) => {
      const deadline = new Date(m.deadline!);
      const hour = deadline.getHours() + deadline.getMinutes() / 60;
      return { name: m.name, hour, status: m.status, progress: m.progress ?? 0 };
    });
  }, [missions]);

  const decisionTree = useMemo(() => {
    if (!selected || !interactions) return [];
    return interactions
      .filter((i) => i.from_agent === selected.id || i.to_agent === selected.id)
      .slice(0, 4)
      .map((i) => ({ type: i.type, message: i.message, tokens: i.tokens ?? 0 }));
  }, [selected, interactions]);

  const zoomIn = useCallback(() => setZoomIdx((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1)), []);
  const zoomOut = useCallback(() => setZoomIdx((i) => Math.max(i - 1, 0)), []);

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

  const nowHour = new Date().getHours() + new Date().getMinutes() / 60;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <GanttChart className="h-7 w-7 text-terminal" />
          <div>
            <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Timeline</h1>
            <p className="text-xs text-muted-foreground">Gantt · {ganttData.reduce((s, r) => s + r.tasks.length, 0)} tarefas · {ganttData.length} agentes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={missionFilter} onValueChange={setMissionFilter}>
            <SelectTrigger className="w-[160px] font-mono text-xs bg-card border-border h-8">
              <SelectValue placeholder="Missão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-mono text-xs">Todas missões</SelectItem>
              {(missions ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id} className="font-mono text-xs">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showDependencies ? "default" : "outline"}
            size="sm"
            className={`font-mono text-[10px] h-8 gap-1.5 ${showDependencies ? "bg-terminal text-background hover:bg-terminal/80" : ""}`}
            onClick={() => setShowDependencies(!showDependencies)}
          >
            <Link2 className="h-3.5 w-3.5" /> Deps
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={zoomIdx === 0}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="font-mono text-[10px] text-muted-foreground w-8 text-center">{ZOOM_LABELS[zoomIdx]}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={zoomIdx === ZOOM_LEVELS.length - 1}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
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
      </div>

      {/* Gantt Chart */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="flex">
          {/* Agent labels column */}
          <div className="shrink-0 w-[180px] border-r border-border z-10 bg-card">
            <div className="h-10 border-b border-border flex items-center px-3">
              <span className="font-mono text-[10px] text-muted-foreground">Agentes</span>
            </div>
            {ganttData.map((row) => (
              <div key={row.agent.id} className="flex items-center gap-2 px-3 border-b border-border/50" style={{ height: ROW_HEIGHT }}>
                <span className="text-base">{row.agent.emoji}</span>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-foreground truncate">{row.agent.name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{row.agent.model}</p>
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
                  <div key={h} className="flex items-center justify-center border-r border-border/30 font-mono text-[10px] text-muted-foreground relative" style={{ width: HOUR_WIDTH }}>
                    {String(h).padStart(2, "0")}:00
                    {/* Half hour mark */}
                    <div className="absolute bottom-0 left-1/2 w-px h-2 bg-border/30" />
                  </div>
                ))}
              </div>

              {/* Rows */}
              <TooltipProvider>
                <div className="relative">
                  {/* Dependency arrows SVG */}
                  {dependencies.length > 0 && (
                    <svg className="absolute inset-0 pointer-events-none z-20" style={{ width: HOURS.length * HOUR_WIDTH, height: ganttData.length * ROW_HEIGHT }}>
                      <defs>
                        <marker id="dep-arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="4" orient="auto">
                          <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(260, 67%, 70%)" />
                        </marker>
                      </defs>
                      {dependencies.map((dep, idx) => (
                        <line key={idx} x1={dep.fromX} y1={dep.fromY} x2={dep.toX} y2={dep.toY} stroke="hsl(260, 67%, 70%)" strokeWidth={1.5} strokeDasharray="6,4" opacity={0.5} markerEnd="url(#dep-arrow)" />
                      ))}
                    </svg>
                  )}

                  {/* Milestone lines */}
                  {milestones.map((ms, idx) => {
                    if (ms.hour < 6 || ms.hour > 20) return null;
                    const left = (ms.hour - 6) * HOUR_WIDTH;
                    return (
                      <div key={idx} className="absolute top-0 z-30" style={{ left, height: ganttData.length * ROW_HEIGHT }}>
                        <div className="w-px h-full bg-violet/40 border-l border-dashed border-violet/30" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute -top-1 -translate-x-1/2 cursor-pointer">
                              <Milestone className="h-4 w-4 text-violet" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="font-mono text-xs">
                            <p className="font-semibold">{ms.name}</p>
                            <p className="text-muted-foreground">{ms.progress}% · {ms.status}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  })}

                  {ganttData.map((row) => (
                    <div key={row.agent.id} className="relative border-b border-border/50" style={{ height: ROW_HEIGHT }}>
                      {/* Grid lines */}
                      {HOURS.map((h) => (
                        <div key={h} className="absolute top-0 bottom-0 border-r border-border/10" style={{ left: (h - 6) * HOUR_WIDTH, width: HOUR_WIDTH }} />
                      ))}

                      {/* Now indicator */}
                      {nowHour >= 6 && nowHour <= 20 && (
                        <div className="absolute top-0 bottom-0 w-px bg-rose/50 z-10" style={{ left: (nowHour - 6) * HOUR_WIDTH }}>
                          <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose" />
                        </div>
                      )}

                      {/* Task bars */}
                      {row.tasks.map((task) => {
                        const left = (task.startHour - 6) * HOUR_WIDTH;
                        const width = task.durationHours * HOUR_WIDTH;
                        const sc = statusColor[task.status] ?? "bg-muted";
                        const pc = priorityColor[task.priority] ?? "border-border";
                        const agent = (task as any).agents as any;
                        const mission = (task as any).missions as any;

                        return (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                              <button
                                className={`absolute top-2 h-[calc(100%-16px)] rounded-md border-2 ${pc} ${sc}/20 backdrop-blur-sm flex items-center px-2 gap-1.5 cursor-pointer hover:brightness-125 transition-all group z-10`}
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
                                  durationHours: task.durationHours,
                                  missionId: task.mission_id,
                                })}
                              >
                                <div className={`h-2 w-2 rounded-full ${sc} shrink-0`} />
                                <span className="font-mono text-[10px] text-foreground truncate">{task.name}</span>
                                {task.status === "in_progress" && (
                                  <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="font-mono text-xs space-y-1">
                              <p className="font-semibold">{task.name}</p>
                              <p className="text-muted-foreground">{task.priority} · {statusLabel[task.status]} · {task.durationHours}h</p>
                              {task.tokens && <p className="text-muted-foreground">{task.tokens} tokens · ${(task.cost ?? 0).toFixed(2)}</p>}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
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
        <div className="flex items-center gap-1.5 ml-2">
          <div className="h-3 w-px bg-rose/50" />
          <span className="font-mono text-[10px] text-rose/60">Agora</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <Milestone className="h-3 w-3 text-violet" />
          <span className="font-mono text-[10px] text-violet/60">Milestone</span>
        </div>
        {showDependencies && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="h-px w-4 bg-violet/50 border-t border-dashed border-violet/40" />
            <span className="font-mono text-[10px] text-violet/60">Dependência</span>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="border-border bg-card w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-cyan/15 text-cyan border-cyan/30 font-mono text-[10px]">
                    {statusLabel[selected.status] ?? selected.status}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">{selected.priority}</Badge>
                </div>
                <SheetTitle className="font-mono text-lg">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.agentEmoji} {selected.agentName} · {selected.missionName} · {selected.durationHours}h
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs defaultValue="tree">
                  <TabsList className="font-mono w-full">
                    <TabsTrigger value="tree" className="font-mono text-[10px] flex-1">Decisão</TabsTrigger>
                    <TabsTrigger value="logs" className="font-mono text-[10px] flex-1">JSON</TabsTrigger>
                    <TabsTrigger value="artifacts" className="font-mono text-[10px] flex-1">Artifacts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree" className="mt-4">
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">INPUT_RECEIVED</span>
                        </div>
                        <p className="font-mono text-xs text-foreground">"{selected.name}"</p>
                      </div>

                      <div className="rounded-lg border border-violet/30 bg-violet/5 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-violet" />
                            <span className="font-mono text-[10px] font-bold text-violet">INTENT_CLASSIFICATION</span>
                          </div>
                          <Badge variant="outline" className="font-mono text-[8px] border-terminal/30 text-terminal">
                            {selected.priority === "critical" ? "98" : selected.priority === "high" ? "95" : "90"}%
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-foreground">
                          Severity: <span className={selected.priority === "critical" ? "text-rose" : selected.priority === "high" ? "text-amber" : "text-terminal"}>
                            {selected.priority}
                          </span>
                        </p>
                      </div>

                      {/* Decision interactions */}
                      {decisionTree.length > 0 && (
                        <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-3 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-2 rounded-full bg-cyan" />
                            <span className="font-mono text-[10px] font-bold text-cyan">AGENT_INTERACTIONS</span>
                          </div>
                          {decisionTree.map((d, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/30">
                              <Badge variant="outline" className="font-mono text-[8px] px-1 py-0">{d.type}</Badge>
                              <span className="font-mono text-[10px] text-foreground truncate flex-1">{d.message.slice(0, 60)}</span>
                              <span className="font-mono text-[9px] text-muted-foreground shrink-0">{d.tokens}t</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">OUTPUT</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                          <div>
                            <p className="font-mono text-[9px] text-muted-foreground">Tokens</p>
                            <p className="font-mono text-sm font-bold text-foreground">{selected.tokens}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] text-muted-foreground">Custo</p>
                            <p className="font-mono text-sm font-bold text-terminal">${selected.cost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] text-muted-foreground">Duração</p>
                            <p className="font-mono text-sm font-bold text-foreground">{selected.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1 gap-2 font-mono text-xs border-rose/30 text-rose hover:bg-rose/10">
                        <X className="h-3.5 w-3.5" /> Interromper
                      </Button>
                      <Button className="flex-1 gap-2 font-mono text-xs bg-terminal hover:bg-terminal/80 text-background">
                        <Puzzle className="h-3.5 w-3.5" /> Detalhes
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="logs" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <pre className="font-mono text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">
{JSON.stringify({
  task_name: selected.name,
  agent: `${selected.agentEmoji} ${selected.agentName}`,
  mission: selected.missionName,
  status: selected.status,
  priority: selected.priority,
  duration_hours: selected.durationHours,
  tokens_used: selected.tokens,
  cost: selected.cost,
  decision_path: ["INPUT", "CLASSIFY", "DECIDE", "EXECUTE", "OUTPUT"],
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
                          <p className="font-mono text-[9px] text-muted-foreground">Árvore de decisão</p>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center gap-3">
                        <FileJson className="h-4 w-4 text-terminal" />
                        <div>
                          <p className="font-mono text-xs text-foreground">output_response.md</p>
                          <p className="font-mono text-[9px] text-muted-foreground">Resposta do agente</p>
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
