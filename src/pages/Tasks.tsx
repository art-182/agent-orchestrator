import { ListChecks, CheckCircle2, Play, Clock, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useTasks } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; label: string }> = {
  done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-4 w-4" />, label: "Concluído" },
  in_progress: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-4 w-4" />, label: "Em Progresso" },
  todo: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-4 w-4" />, label: "Pendente" },
  blocked: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-4 w-4" />, label: "Bloqueado" },
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
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <div className="flex items-center gap-3">
          <ListChecks className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Tarefas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ListChecks className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Tarefas</h1>
          {missionFilter && (
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 border-violet/30 bg-violet/10 text-violet rounded-lg">
              {baseTasks[0]?.missions?.name ?? missionFilter}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={`font-mono text-xs px-2.5 py-1 cursor-pointer border rounded-lg transition-all ${filter === "all" ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </Badge>
            {agents.map((a) => (
              <Badge
                key={a}
                variant="outline"
                className={`font-mono text-xs px-2.5 py-1 cursor-pointer border rounded-lg transition-all ${filter === a ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                onClick={() => setFilter(a!)}
              >
                {a}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);
          const sc = statusConfig[col.key];
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                {sc.icon}
                <span className="font-mono text-sm font-semibold text-foreground">{col.label}</span>
                <span className="font-mono text-xs text-muted-foreground">({colTasks.length})</span>
              </div>
              <div className="space-y-3">
                {colTasks.map((t) => (
                  <Card
                    key={t.id}
                    className="border-border bg-card hover:border-muted-foreground/30 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                    onClick={() => setSelectedTask(t)}
                  >
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-sm font-semibold text-foreground leading-tight">{t.name}</p>
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0.5 border shrink-0 rounded-md ${priorityColor[t.priority as TaskPriority] ?? ""}`}>
                          {t.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t.agents?.emoji} {t.agents?.name}</span>
                        <span>·</span>
                        <span className="truncate">{t.missions?.name}</span>
                      </div>
                      {t.status === "done" && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{t.duration}</span>
                          <span className="text-terminal font-semibold">${(t.cost ?? 0).toFixed(2)}</span>
                        </div>
                      )}
                      {(t.tokens ?? 0) > 0 && (
                        <div className="font-mono text-xs text-muted-foreground">{formatTokens(t.tokens ?? 0)} tokens</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </PageTransition>
  );
};

export default Tasks;
