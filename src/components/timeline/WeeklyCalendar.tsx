import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock, Play, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  agent_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  scheduled_date: string | null;
  duration: string | null;
  agentEmoji: string;
  agentName: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-3 w-3 text-terminal shrink-0" />,
  in_progress: <Play className="h-3 w-3 text-cyan shrink-0" />,
  todo: <Clock className="h-3 w-3 text-muted-foreground shrink-0" />,
  blocked: <AlertTriangle className="h-3 w-3 text-rose shrink-0" />,
};
const statusLabel: Record<string, string> = {
  todo: "Pendente", in_progress: "Em Progresso", done: "Concluído", blocked: "Bloqueado",
};
const priorityAccent: Record<string, string> = {
  critical: "border-l-rose", high: "border-l-amber", medium: "border-l-cyan/60", low: "border-l-muted-foreground/40",
};
const statusBg: Record<string, string> = {
  done: "bg-terminal/8", in_progress: "bg-cyan/8", todo: "bg-muted/20", blocked: "bg-rose/8",
};

const DAYS_PT = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."];

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface WeeklyCalendarProps {
  tasks: CalendarTask[];
}

export default function WeeklyCalendar({ tasks }: WeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = useMemo(() => {
    const now = new Date();
    const m = getMonday(now);
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    }),
  [monday]);

  const tasksByDay = useMemo(() => {
    const map: Record<number, CalendarTask[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    tasks.forEach(task => {
      const date = task.scheduled_date ?? task.started_at?.slice(0, 10);
      if (!date) return;
      const taskDate = new Date(date + "T12:00:00");

      for (let i = 0; i < 7; i++) {
        const wd = weekDays[i];
        if (
          taskDate.getFullYear() === wd.getFullYear() &&
          taskDate.getMonth() === wd.getMonth() &&
          taskDate.getDate() === wd.getDate()
        ) {
          map[i].push(task);
          break;
        }
      }
    });

    // Sort each day: in_progress first, then todo, then done
    const order: Record<string, number> = { in_progress: 0, todo: 1, blocked: 2, done: 3 };
    Object.values(map).forEach(arr =>
      arr.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
    );

    return map;
  }, [tasks, weekDays]);

  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const weekLabel = useMemo(() => {
    const end = new Date(monday);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleString("pt-BR", { month: "short" })}`;
    return `${fmt(monday)} – ${fmt(end)}`;
  }, [monday]);

  return (
    <Card className="border-border/50 bg-card surface-elevated overflow-hidden">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <div className="bg-cyan/10 text-cyan p-1.5 rounded-lg">
            <Calendar className="h-4 w-4" />
          </div>
          Agenda Semanal
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">{weekLabel}</span>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => setWeekOffset(0)}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-t border-border/30">
          {weekDays.map((day, dayIdx) => {
            const dayTasks = tasksByDay[dayIdx] ?? [];
            const highlight = isToday(day);
            const doneCount = dayTasks.filter(t => t.status === "done").length;

            return (
              <div key={dayIdx} className={`border-r border-border/20 last:border-r-0 ${highlight ? "bg-cyan/[0.03]" : ""}`}>
                {/* Day header */}
                <div className={`px-2 py-2.5 border-b border-border/30 text-center ${highlight ? "bg-cyan/10" : ""}`}>
                  <span className="text-[10px] text-muted-foreground/70 font-medium tracking-wider block">{DAYS_PT[day.getDay()]}</span>
                  <span className={`text-lg font-bold tabular-nums ${highlight ? "text-cyan" : "text-foreground/80"}`}>{day.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] text-muted-foreground/60 block mt-0.5">
                      {doneCount}/{dayTasks.length} concluídas
                    </span>
                  )}
                </div>

                {/* Task list - simple vertical stack, no overlap */}
                <div className="p-1.5 space-y-1.5 min-h-[120px]">
                  {dayTasks.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/30 text-center mt-8">—</p>
                  )}
                  {dayTasks.map(task => {
                    const border = priorityAccent[task.priority] ?? "border-l-border";
                    const bg = statusBg[task.status] ?? "bg-muted/10";
                    const icon = statusIcon[task.status];
                    const timeStr = task.started_at ? formatTime(task.started_at) : null;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-md border-l-2 ${border} ${bg} px-2 py-1.5 cursor-default hover:brightness-110 transition-all`}
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="mt-0.5">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-foreground leading-tight truncate">{task.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] text-muted-foreground">{task.agentEmoji}</span>
                              {timeStr && <span className="text-[9px] text-muted-foreground tabular-nums">{timeStr}</span>}
                              {task.duration && task.duration !== "—" && (
                                <span className="text-[9px] text-muted-foreground">· {task.duration}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
