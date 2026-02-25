import { useState, useMemo } from "react";
import { CalendarDays, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitHubCalendar } from "@/components/ui/git-hub-calendar";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useMissions, useDailyCosts } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import WeeklyCalendar from "@/components/timeline/WeeklyCalendar";

const statusLabel: Record<string, string> = {
  todo: "Pendente", in_progress: "Em Progresso", done: "Concluído", blocked: "Bloqueado",
};

const TimelinePage = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: missions } = useMissions();
  const { data: dailyCosts } = useDailyCosts();
  const [missionFilter, setMissionFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const isLoading = la || lt;

  /* ── Build contribution data from tasks ── */
  const contributionData = useMemo(() => {
    const filtered = missionFilter === "all"
      ? (tasks ?? [])
      : (tasks ?? []).filter(t => t.mission_id === missionFilter);

    const dayMap = new Map<string, number>();
    filtered.forEach(t => {
      const d = (t as any).scheduled_date
        ?? (t as any).started_at?.slice(0, 10)
        ?? t.created_at?.slice(0, 10);
      if (d) dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    });

    return Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));
  }, [tasks, missionFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const filtered = missionFilter === "all"
      ? (tasks ?? [])
      : (tasks ?? []).filter(t => t.mission_id === missionFilter);
    const totalTasks = filtered.length;
    const totalDone = filtered.filter(t => t.status === "done").length;
    const activeDays = new Set(
      filtered.map(t =>
        (t as any).scheduled_date ?? (t as any).started_at?.slice(0, 10) ?? t.created_at?.slice(0, 10)
      ).filter(Boolean)
    ).size;
    return { totalTasks, totalDone, activeDays };
  }, [tasks, missionFilter]);

  /* ── Selected day tasks ── */
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
    return (dailyCosts ?? []).filter(c => c.date === selectedDay).reduce((s, c) => s + (c.google ?? 0), 0);
  }, [selectedDay, dailyCosts]);

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
              {stats.totalTasks} tarefas · {stats.totalDone} concluídas · {stats.activeDays} dias ativos
            </p>
          </div>
        </div>
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
      </div>

      {/* GitHub Contribution Calendar */}
      <div className="border border-border/50 rounded-2xl bg-card surface-elevated p-5">
        <GitHubCalendar
          data={contributionData}
          colors={["hsl(var(--muted) / 0.3)", "#0e4429", "#006d32", "#26a641", "#39d353"]}
          onDayClick={(day) => setSelectedDay(prev => prev === day.date ? null : day.date)}
        />
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="border border-border/50 rounded-2xl bg-card surface-elevated p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-terminal" />
              <span className="text-sm font-semibold text-foreground">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
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
                  <div key={t.id} className={`rounded-xl border p-3 space-y-1 ${statusColors[t.status] ?? statusColors.todo}`}>
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
