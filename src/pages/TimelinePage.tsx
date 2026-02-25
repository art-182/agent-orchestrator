import { useState, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useMissions, useDailyCosts } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import WeeklyCalendar from "@/components/timeline/WeeklyCalendar";

/* ── helpers ── */
const CELL = 14;
const GAP = 3;
const DAYS = ["", "Seg", "", "Qua", "", "Sex", ""];
const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const statusLabel: Record<string, string> = {
  todo: "Pendente", in_progress: "Em Progresso", done: "Concluído", blocked: "Bloqueado",
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  copy.setHours(0, 0, 0, 0);
  return copy;
}

interface DayData {
  date: string;
  tasks: number;
  done: number;
  inProgress: number;
  cost: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const TimelinePage = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: missions } = useMissions();
  const { data: dailyCosts } = useDailyCosts();
  const [yearOffset, setYearOffset] = useState(0);
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const isLoading = la || lt;
  const now = new Date();
  const viewYear = now.getFullYear() + yearOffset;

  /* ── Build heatmap data ── */
  const { grid, monthLabels, totalTasks, totalDone, maxPerDay, dayMap } = useMemo(() => {
    const filtered = missionFilter === "all"
      ? (tasks ?? [])
      : (tasks ?? []).filter(t => t.mission_id === missionFilter);

    // Count tasks per day
    const dayMap = new Map<string, { tasks: number; done: number; inProgress: number; cost: number }>();
    filtered.forEach(t => {
      const d = (t as any).scheduled_date
        ?? (t as any).started_at?.slice(0, 10)
        ?? t.created_at?.slice(0, 10);
      if (!d) return;
      const entry = dayMap.get(d) ?? { tasks: 0, done: 0, inProgress: 0, cost: 0 };
      entry.tasks++;
      if (t.status === "done") entry.done++;
      if (t.status === "in_progress") entry.inProgress++;
      dayMap.set(d, entry);
    });

    // Merge cost data
    (dailyCosts ?? []).forEach(c => {
      const entry = dayMap.get(c.date) ?? { tasks: 0, done: 0, inProgress: 0, cost: 0 };
      entry.cost += c.total ?? 0;
      dayMap.set(c.date, entry);
    });

    // Determine max for level calculation
    let maxPerDay = 0;
    dayMap.forEach(v => { if (v.tasks > maxPerDay) maxPerDay = v.tasks; });

    // Build 53-week grid starting from first Monday of the year
    const jan1 = new Date(viewYear, 0, 1);
    const startDate = getWeekStart(jan1);
    const endDate = new Date(viewYear, 11, 31);

    const grid: DayData[][] = [];
    const monthLabels: { month: string; col: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);
    while (cursor <= endDate || grid.length < 53) {
      const week: DayData[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = isoDate(cursor);
        const info = dayMap.get(dateStr);
        const taskCount = info?.tasks ?? 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (taskCount > 0 && maxPerDay > 0) {
          const ratio = taskCount / maxPerDay;
          level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
        }

        // Month label tracking
        const m = cursor.getMonth();
        if (m !== lastMonth && d === 0) {
          const yr = cursor.getFullYear();
          if (yr === viewYear) {
            monthLabels.push({ month: MONTHS_PT[m], col: grid.length });
          }
          lastMonth = m;
        }

        week.push({
          date: dateStr,
          tasks: taskCount,
          done: info?.done ?? 0,
          inProgress: info?.inProgress ?? 0,
          cost: info?.cost ?? 0,
          level: cursor > now ? 0 : level,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(week);
      if (grid.length >= 53) break;
    }

    const totalTasks = filtered.length;
    const totalDone = filtered.filter(t => t.status === "done").length;

    return { grid, monthLabels, totalTasks, totalDone, maxPerDay, dayMap };
  }, [tasks, dailyCosts, missionFilter, viewYear, now]);

  /* ── Day detail ── */
  const selectedDayTasks = useMemo(() => {
    if (!selectedDay || !tasks) return [];
    return tasks.filter(t => {
      const d = (t as any).scheduled_date
        ?? (t as any).started_at?.slice(0, 10)
        ?? t.created_at?.slice(0, 10);
      return d === selectedDay;
    }).filter(t => missionFilter === "all" || t.mission_id === missionFilter);
  }, [selectedDay, tasks, missionFilter]);

  const selectedDayCost = useMemo(() => {
    if (!selectedDay) return 0;
    return (dailyCosts ?? []).filter(c => c.date === selectedDay).reduce((s, c) => s + (c.total ?? 0), 0);
  }, [selectedDay, dailyCosts]);

  /* ── Level colors (GitHub-style) ── */
  const levelColor = [
    "bg-muted/30",           // 0 - empty
    "bg-terminal/25",        // 1 - low
    "bg-terminal/45",        // 2 - medium
    "bg-terminal/70",        // 3 - high
    "bg-terminal",           // 4 - max
  ];
  const levelColorSelected = "ring-2 ring-cyan ring-offset-1 ring-offset-background";

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl"><CalendarDays className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Timeline</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Timeline</h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              {totalTasks} tarefas · {totalDone} concluídas · {viewYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={missionFilter} onValueChange={setMissionFilter}>
            <SelectTrigger className="w-[160px] text-[12px] bg-card border-border/50 rounded-xl h-8">
              <SelectValue placeholder="Missão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">Todas missões</SelectItem>
              {(missions ?? []).map(m => (
                <SelectItem key={m.id} value={m.id} className="text-[12px]">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setYearOffset(y => y - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground tabular-nums w-12 text-center">{viewYear}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setYearOffset(y => y + 1)} disabled={yearOffset >= 0}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contribution Calendar */}
      <div className="border border-border/50 rounded-2xl bg-card surface-elevated p-5 overflow-x-auto">
        <TooltipProvider delayDuration={100}>
          <div className="inline-flex flex-col gap-0.5 min-w-fit">
            {/* Month labels */}
            <div className="flex" style={{ marginLeft: 32 }}>
              {monthLabels.map((ml, i) => {
                const nextCol = i < monthLabels.length - 1 ? monthLabels[i + 1].col : grid.length;
                const span = nextCol - ml.col;
                return (
                  <span
                    key={ml.month + ml.col}
                    className="text-[10px] text-muted-foreground"
                    style={{ width: span * (CELL + GAP), minWidth: span * (CELL + GAP) }}
                  >
                    {ml.month}
                  </span>
                );
              })}
            </div>

            {/* Grid rows (Mon–Sun) */}
            {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
              <div key={dayIdx} className="flex items-center gap-0">
                <span className="text-[10px] text-muted-foreground w-8 text-right pr-2 shrink-0 tabular-nums">
                  {DAYS[dayIdx]}
                </span>
                <div className="flex" style={{ gap: GAP }}>
                  {grid.map((week, wIdx) => {
                    const cell = week[dayIdx];
                    if (!cell) return <div key={wIdx} style={{ width: CELL, height: CELL }} />;
                    const isSelected = selectedDay === cell.date;
                    const isFuture = cell.date > isoDate(now);

                    return (
                      <Tooltip key={wIdx}>
                        <TooltipTrigger asChild>
                          <button
                            className={`rounded-sm transition-all ${levelColor[cell.level]} ${isSelected ? levelColorSelected : ""} ${isFuture ? "opacity-20 cursor-default" : "hover:ring-1 hover:ring-border cursor-pointer"}`}
                            style={{ width: CELL, height: CELL }}
                            onClick={() => !isFuture && setSelectedDay(isSelected ? null : cell.date)}
                            disabled={isFuture}
                          />
                        </TooltipTrigger>
                        {!isFuture && (
                          <TooltipContent className="text-xs space-y-0.5">
                            <p className="font-semibold">
                              {new Date(cell.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                            </p>
                            <p className="text-muted-foreground">
                              {cell.tasks === 0 ? "Nenhuma atividade" : `${cell.tasks} tarefa${cell.tasks > 1 ? "s" : ""} · ${cell.done} concluída${cell.done !== 1 ? "s" : ""}`}
                            </p>
                            {cell.cost > 0 && <p className="text-muted-foreground">${cell.cost.toFixed(2)} custo</p>}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
          <span className="text-[10px] text-muted-foreground">
            {dayMap.size} dias com atividade · máx {maxPerDay} tarefas/dia
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Menos</span>
            {levelColor.map((c, i) => (
              <div key={i} className={`rounded-sm ${c}`} style={{ width: CELL, height: CELL }} />
            ))}
            <span className="text-[10px] text-muted-foreground">Mais</span>
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="border border-border/50 rounded-2xl bg-card surface-elevated p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-terminal" />
              <span className="text-sm font-semibold text-foreground">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {selectedDayCost > 0 && (
                <Badge variant="outline" className="text-[10px] rounded-full border-amber/30 text-amber">
                  ${selectedDayCost.toFixed(2)}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] rounded-full">
                {selectedDayTasks.length} tarefa{selectedDayTasks.length !== 1 ? "s" : ""}
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => setSelectedDay(null)}>
                Fechar
              </Button>
            </div>
          </div>

          {selectedDayTasks.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">Nenhuma tarefa neste dia.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedDayTasks.map(t => {
                const agent = (agents ?? []).find(a => a.id === t.agent_id);
                const statusColors: Record<string, string> = {
                  done: "bg-terminal/15 text-terminal border-terminal/20",
                  in_progress: "bg-cyan/15 text-cyan border-cyan/20",
                  todo: "bg-muted/30 text-muted-foreground border-border/30",
                  blocked: "bg-rose/15 text-rose border-rose/20",
                };
                return (
                  <div
                    key={t.id}
                    className={`rounded-xl border p-3 space-y-1 ${statusColors[t.status] ?? statusColors.todo}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{agent?.emoji ?? "🤖"}</span>
                      <span className="text-[12px] font-medium truncate flex-1">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] rounded-full px-1.5 py-0 border-current/30">
                        {statusLabel[t.status] ?? t.status}
                      </Badge>
                      <span className="text-[10px] opacity-70">{agent?.name ?? t.agent_id}</span>
                      {t.duration && <span className="text-[10px] opacity-70 ml-auto tabular-nums">{t.duration}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
    </PageTransition>
  );
};

export default TimelinePage;
