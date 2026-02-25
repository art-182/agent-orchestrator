import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { GanttChart, X, FileJson, Puzzle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import WeeklyCalendar from "@/components/timeline/WeeklyCalendar";

const statusColor: Record<string, string> = {
  todo: "bg-muted-foreground/40", in_progress: "bg-cyan", done: "bg-terminal", blocked: "bg-rose",
};
const statusLabel: Record<string, string> = {
  todo: "Pendente", in_progress: "Em Progresso", done: "Concluído", blocked: "Bloqueado",
};
const priorityBorder: Record<string, string> = {
  critical: "border-rose/60", high: "border-amber/60", medium: "border-cyan/40", low: "border-muted-foreground/30",
};

const TASK_HEIGHT = 36;
const TASK_GAP = 6;
const ZOOM_LEVELS = [80, 100, 140, 180, 220];
const ZOOM_LABELS = ["XS", "S", "M", "L", "XL"];
const MIN_BAR_WIDTH = 180;
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);

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
  const [dateFilter, setDateFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);

  const HOUR_WIDTH = ZOOM_LEVELS[zoomIdx];
  const isLoading = la || lt || li;

  useEffect(() => {
    if (!didAutoScroll.current && scrollRef.current && !isLoading) {
      const now = new Date();
      const nowH = now.getHours();
      const scrollTo = Math.max((nowH - 8) * HOUR_WIDTH, 0);
      scrollRef.current.scrollLeft = scrollTo;
      didAutoScroll.current = true;
    }
  }, [isLoading, HOUR_WIDTH]);

  const availableDates = useMemo(() => {
    if (!tasks) return [];
    const dates = new Set<string>();
    tasks.forEach(t => {
      const d = (t as any).scheduled_date ?? (t as any).started_at?.slice(0, 10) ?? t.created_at?.slice(0, 10);
      if (d) dates.add(d);
    });
    return [...dates].sort().reverse();
  }, [tasks]);

  const ganttData = useMemo(() => {
    if (!agents || !tasks) return [];
    let filtered = missionFilter === "all" ? tasks : tasks.filter((t) => t.mission_id === missionFilter);

    if (dateFilter !== "all") {
      if (dateFilter === "week") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        filtered = filtered.filter(t => {
          const d = (t as any).scheduled_date ?? (t as any).started_at?.slice(0, 10) ?? t.created_at?.slice(0, 10);
          if (!d) return false;
          const taskDate = new Date(d + "T12:00:00");
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
      } else {
        const targetDate = dateFilter === "today" ? new Date().toISOString().slice(0, 10) : dateFilter;
        filtered = filtered.filter(t => {
          const d = (t as any).scheduled_date ?? (t as any).started_at?.slice(0, 10) ?? t.created_at?.slice(0, 10);
          return d === targetDate;
        });
      }
    }

    return agents.map((agent) => {
      const agentTasks = filtered
        .filter((t) => t.agent_id === agent.id)
        .map((t) => {
          const startedAt = (t as any).started_at ? new Date((t as any).started_at) : new Date(t.created_at);
          const startHour = startedAt.getHours() + startedAt.getMinutes() / 60;

          let durationHours = 0.5;
          if ((t as any).completed_at && (t as any).started_at) {
            const diff = new Date((t as any).completed_at).getTime() - new Date((t as any).started_at).getTime();
            durationHours = Math.max(diff / 3600000, 0.3);
          } else if (t.duration) {
            const m = t.duration.match(/(\d+)/);
            if (m) durationHours = Math.max(parseInt(m[1]) / 60, 0.3);
          } else {
            durationHours = t.status === "in_progress" ? 1.5 : 0.5;
          }

          return {
            id: t.id,
            name: t.name,
            status: t.status,
            priority: t.priority,
            duration: t.duration,
            tokens: t.tokens ?? 0,
            cost: t.cost ?? 0,
            mission_id: t.mission_id,
            missionName: (t as any).missions?.name ?? "—",
            agent_id: t.agent_id,
            startHour,
            durationHours,
          };
        })
        .sort((a, b) => a.startHour - b.startHour);

      return { agent, tasks: agentTasks };
    }).filter((r) => r.tasks.length > 0);
  }, [agents, tasks, missionFilter, dateFilter]);

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
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl"><GanttChart className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Timeline</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const scrollTimeline = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + dir * HOUR_WIDTH * 3,
        behavior: "smooth",
      });
    }
  };

  const nowHour = new Date().getHours() + new Date().getMinutes() / 60;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl">
            <GanttChart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Timeline</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Gantt · {ganttData.reduce((s, r) => s + r.tasks.length, 0)} tarefas · {ganttData.length} agentes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={missionFilter} onValueChange={setMissionFilter}>
            <SelectTrigger className="w-[160px] text-[12px] bg-card border-border/50 rounded-xl h-8">
              <SelectValue placeholder="Missão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">Todas missões</SelectItem>
              {(missions ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-[12px]">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px] text-[12px] bg-card border-border/50 rounded-xl h-8">
              <SelectValue placeholder="Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">Todos os dias</SelectItem>
              <SelectItem value="today" className="text-[12px]">Hoje</SelectItem>
              <SelectItem value="week" className="text-[12px]">Esta Semana</SelectItem>
              {availableDates.map((d) => (
                <SelectItem key={d} value={d} className="text-[12px]">{new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border border-border/50 rounded-xl px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={zoomIdx === 0}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground w-6 text-center tabular-nums">{ZOOM_LABELS[zoomIdx]}</span>
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

      {/* Gantt Chart - Row per task */}
      <div className="border border-border/50 rounded-2xl bg-card surface-elevated overflow-hidden">
        <div className="flex">
          {/* Task labels column */}
          <div className="shrink-0 w-[220px] border-r border-border/30 z-10 bg-card">
            <div className="h-10 border-b border-border/30 flex items-center px-3">
              <span className="text-[11px] text-muted-foreground font-medium">Tarefas</span>
            </div>
            {ganttData.map((row) => (
              <div key={row.agent.id}>
                {/* Agent header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b border-border/20">
                  <span className="text-sm">{row.agent.emoji}</span>
                  <span className="text-[12px] font-semibold text-foreground">{row.agent.name}</span>
                  <Badge variant="outline" className="text-[9px] ml-auto rounded-full px-1.5">{row.tasks.length}</Badge>
                </div>
                {/* Task rows */}
                {row.tasks.map((task) => {
                  const sc = statusColor[task.status] ?? "bg-muted";
                  return (
                    <div key={task.id} className="flex items-center gap-2 px-3 border-b border-border/10" style={{ height: TASK_HEIGHT + TASK_GAP }}>
                      <div className={`h-2 w-2 rounded-full ${sc} shrink-0`} />
                      <span className="text-[11px] text-foreground truncate flex-1" title={task.name}>{task.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Scrollable timeline area */}
          <div className="overflow-x-auto flex-1" ref={scrollRef}>
            <div style={{ minWidth: HOURS.length * HOUR_WIDTH }}>
              {/* Time headers */}
              <div className="flex h-10 border-b border-border/30">
                {HOURS.map((h) => (
                  <div key={h} className="flex items-center justify-center border-r border-border/15 text-[10px] text-muted-foreground tabular-nums" style={{ width: HOUR_WIDTH }}>
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Rows */}
              <TooltipProvider>
                <div className="relative">
                  {/* Now indicator - full height */}
                  {nowHour >= 6 && nowHour <= 22 && (
                    <div className="absolute top-0 bottom-0 w-px bg-rose/50 z-30" style={{ left: (nowHour - 6) * HOUR_WIDTH }}>
                      <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose" />
                    </div>
                  )}

                  {ganttData.map((row) => (
                    <div key={row.agent.id}>
                      {/* Agent header spacer */}
                      <div className="h-[36px] border-b border-border/20 bg-muted/10 relative">
                        {HOURS.map((h) => (
                          <div key={h} className="absolute top-0 bottom-0 border-r border-border/5" style={{ left: (h - 6) * HOUR_WIDTH, width: HOUR_WIDTH }} />
                        ))}
                      </div>
                      {/* Task bars - one per row */}
                      {row.tasks.map((task) => {
                        const left = Math.max((task.startHour - 6) * HOUR_WIDTH, 0);
                        const calculatedWidth = task.durationHours * HOUR_WIDTH;
                        const width = Math.max(calculatedWidth, MIN_BAR_WIDTH);
                        const sc = statusColor[task.status] ?? "bg-muted";
                        const pc = priorityBorder[task.priority] ?? "border-border";

                        return (
                          <div key={task.id} className="relative border-b border-border/10" style={{ height: TASK_HEIGHT + TASK_GAP }}>
                            {/* Grid lines */}
                            {HOURS.map((h) => (
                              <div key={h} className="absolute top-0 bottom-0 border-r border-border/5" style={{ left: (h - 6) * HOUR_WIDTH, width: HOUR_WIDTH }} />
                            ))}

                            {/* Task bar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className={`absolute rounded-lg border-2 ${pc} ${sc}/15 backdrop-blur-sm flex items-center px-3 gap-2 cursor-pointer hover:brightness-125 transition-all group z-10`}
                                  style={{
                                    left,
                                    width,
                                    top: (TASK_GAP / 2),
                                    height: TASK_HEIGHT,
                                  }}
                                  onClick={() => setSelected({
                                    id: task.agent_id ?? "",
                                    name: task.name,
                                    status: task.status,
                                    priority: task.priority,
                                    duration: task.duration ?? "—",
                                    agentName: row.agent.name,
                                    agentEmoji: row.agent.emoji,
                                    missionName: task.missionName,
                                    startHour: task.startHour,
                                    tokens: task.tokens,
                                    cost: task.cost,
                                    durationHours: task.durationHours,
                                    missionId: task.mission_id,
                                  })}
                                >
                                  <div className={`h-2.5 w-2.5 rounded-full ${sc} shrink-0`} />
                                  <span className="text-[11px] text-foreground truncate font-medium">{task.name}</span>
                                  {task.duration && task.duration !== "—" && (
                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-auto tabular-nums">{task.duration}</span>
                                  )}
                                  {task.status === "in_progress" && (
                                    <span className="shrink-0 h-2 w-2 rounded-full bg-cyan animate-pulse" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs space-y-1 max-w-[250px]">
                                <p className="font-semibold">{task.name}</p>
                                <p className="text-muted-foreground">{task.priority} · {statusLabel[task.status]} · {Math.round(task.durationHours * 60)}min</p>
                                <p className="text-muted-foreground">{row.agent.emoji} {row.agent.name} · {task.missionName}</p>
                                {task.tokens > 0 && <p className="text-muted-foreground">{task.tokens.toLocaleString()} tokens · ${task.cost.toFixed(2)}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </div>
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
            <span className="text-[10px] text-muted-foreground">{statusLabel[k] ?? k}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="h-3 w-px bg-rose/50" />
          <span className="text-[10px] text-rose/60">Agora</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendar
        tasks={(tasks ?? []).map(t => {
          const agent = (agents ?? []).find(a => a.id === t.agent_id);
          return {
            id: t.id,
            name: t.name,
            status: t.status,
            priority: t.priority,
            agent_id: t.agent_id,
            started_at: (t as any).started_at ?? t.created_at,
            completed_at: (t as any).completed_at ?? null,
            scheduled_date: (t as any).scheduled_date ?? null,
            duration: t.duration,
            agentEmoji: agent?.emoji ?? "🤖",
            agentName: agent?.name ?? t.agent_id ?? "?",
          };
        })}
      />

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="border-border/50 bg-card w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/20 text-[10px] rounded-full font-medium">
                    {statusLabel[selected.status] ?? selected.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] rounded-full font-medium border-border/50">{selected.priority}</Badge>
                </div>
                <SheetTitle className="text-lg tracking-tight">{selected.name}</SheetTitle>
                <SheetDescription className="text-[12px]">
                  {selected.agentEmoji} {selected.agentName} · {selected.missionName} · {selected.duration}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs defaultValue="info">
                  <TabsList className="w-full bg-muted/30 border border-border/30 rounded-xl p-1">
                    <TabsTrigger value="info" className="text-[11px] flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Info</TabsTrigger>
                    <TabsTrigger value="json" className="text-[11px] flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-border/30 bg-muted/15 p-3">
                        <p className="text-[10px] text-muted-foreground">Tokens</p>
                        <p className="text-sm font-bold text-foreground tabular-nums">{selected.tokens.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl border border-border/30 bg-muted/15 p-3">
                        <p className="text-[10px] text-muted-foreground">Custo</p>
                        <p className="text-sm font-bold text-terminal tabular-nums">${selected.cost.toFixed(2)}</p>
                      </div>
                      <div className="rounded-xl border border-border/30 bg-muted/15 p-3">
                        <p className="text-[10px] text-muted-foreground">Duração</p>
                        <p className="text-sm font-bold text-foreground">{selected.duration}</p>
                      </div>
                    </div>

                    {decisionTree.length > 0 && (
                      <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-3 space-y-2">
                        <span className="text-[10px] font-semibold text-cyan tracking-wide uppercase">Interações</span>
                        {decisionTree.map((d, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/20">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-full border-border/50">{d.type}</Badge>
                            <span className="text-[11px] text-foreground truncate flex-1">{d.message.slice(0, 60)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="json" className="mt-4">
                    <ScrollArea className="h-[400px]">
                      <pre className="font-mono text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">
{JSON.stringify({
  task_name: selected.name,
  agent: `${selected.agentEmoji} ${selected.agentName}`,
  mission: selected.missionName,
  status: selected.status,
  priority: selected.priority,
  duration: selected.duration,
  tokens_used: selected.tokens,
  cost: selected.cost,
}, null, 2)}
                      </pre>
                    </ScrollArea>
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
