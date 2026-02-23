import { ListChecks, CheckCircle2, Play, Clock, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useTasks } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; label: string }> = {
  done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Concluído" },
  in_progress: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-3.5 w-3.5" />, label: "Em Progresso" },
  todo: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-3.5 w-3.5" />, label: "Pendente" },
  blocked: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Bloqueado" },
};

const priorityColor: Record<TaskPriority, string> = {
  critical: "bg-rose/15 text-rose border-rose/30",
  high: "bg-amber/15 text-amber border-amber/30",
  medium: "bg-violet/15 text-violet border-violet/30",
  low: "bg-muted text-muted-foreground border-border",
};

const columns: { key: TaskStatus; label: string }[] = [
  { key: "in_progress", label: "Em Progresso" },
  { key: "todo", label: "Pendente" },
  { key: "done", label: "Concluído" },
  { key: "blocked", label: "Bloqueado" },
];

const formatTokens = (n: number) => n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const missionFilter = searchParams.get("mission");
  const [filter, setFilter] = useState<string>("all");
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Tarefas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </PageTransition>
    );
  }

  const allTasks = tasks ?? [];
  const baseTasks = missionFilter ? allTasks.filter((t) => t.mission_id === missionFilter) : allTasks;
  const filteredTasks = filter === "all" ? baseTasks : baseTasks.filter((t) => t.agents?.name === filter);
  const agents = [...new Set(baseTasks.map((t) => t.agents?.name).filter(Boolean))];

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Tarefas</h1>
          {missionFilter && (
            <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-violet/30 bg-violet/10 text-violet">
              {baseTasks[0]?.missions?.name ?? missionFilter}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex gap-1">
            <Badge
              variant="outline"
              className={`font-mono text-[10px] px-2 py-0.5 cursor-pointer border ${filter === "all" ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground"}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </Badge>
            {agents.map((a) => (
              <Badge
                key={a}
                variant="outline"
                className={`font-mono text-[10px] px-2 py-0.5 cursor-pointer border ${filter === a ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground"}`}
                onClick={() => setFilter(a!)}
              >
                {a}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          const sc = statusConfig[col.key];
          return (
            <div key={col.key} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                {sc.icon}
                <span className="font-mono text-xs font-semibold text-foreground">{col.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">({colTasks.length})</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <Card key={t.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="font-mono text-xs font-semibold text-foreground leading-tight">{t.name}</p>
                        <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border shrink-0 ${priorityColor[t.priority as TaskPriority] ?? ""}`}>
                          {t.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <span>{t.agents?.emoji} {t.agents?.name}</span>
                        <span>·</span>
                        <span className="truncate">{t.missions?.name}</span>
                      </div>
                      {t.status === "done" && (
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-muted-foreground">{t.duration}</span>
                          <span className="text-terminal">${(t.cost ?? 0).toFixed(2)}</span>
                        </div>
                      )}
                      {(t.tokens ?? 0) > 0 && (
                        <div className="font-mono text-[9px] text-muted-foreground">{formatTokens(t.tokens ?? 0)} tokens</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded border border-dashed border-border p-4 text-center">
                    <p className="font-mono text-[10px] text-muted-foreground">Nenhuma tarefa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default Tasks;
