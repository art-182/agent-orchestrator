import { ListChecks, CheckCircle2, Play, Clock, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/animations/MotionPrimitives";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";

interface Task {
  id: string;
  name: string;
  agent: string;
  emoji: string;
  mission: string;
  status: TaskStatus;
  priority: TaskPriority;
  duration: string;
  tokens: number;
  cost: number;
  created: string;
}

const tasks: Task[] = [
  { id: "t1", name: "Criar middleware JWT", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", status: "done", priority: "critical", duration: "12.3s", tokens: 34200, cost: 0.42, created: "14:32" },
  { id: "t2", name: "Implementar refresh tokens", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", status: "done", priority: "critical", duration: "8.7s", tokens: 28400, cost: 0.35, created: "14:28" },
  { id: "t3", name: "RBAC policies", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", status: "in_progress", priority: "high", duration: "—", tokens: 15200, cost: 0.19, created: "14:25" },
  { id: "t4", name: "Rollback automático", agent: "Deployer", emoji: "🚀", mission: "Deploy Pipeline v2.3", status: "in_progress", priority: "high", duration: "—", tokens: 8900, cost: 0.11, created: "14:20" },
  { id: "t5", name: "Secret rotation", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1", status: "in_progress", priority: "critical", duration: "—", tokens: 22100, cost: 0.28, created: "14:18" },
  { id: "t6", name: "Security audit auth flow", agent: "Scout", emoji: "🔍", mission: "Auth Feature v2", status: "todo", priority: "high", duration: "—", tokens: 0, cost: 0, created: "14:15" },
  { id: "t7", name: "Testes e2e auth", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", status: "todo", priority: "medium", duration: "—", tokens: 0, cost: 0, created: "14:12" },
  { id: "t8", name: "OWASP compliance check", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1", status: "todo", priority: "high", duration: "—", tokens: 0, cost: 0, created: "14:10" },
  { id: "t9", name: "Monitoring integration", agent: "Analyst", emoji: "📊", mission: "Deploy Pipeline v2.3", status: "todo", priority: "medium", duration: "—", tokens: 0, cost: 0, created: "14:08" },
  { id: "t10", name: "Otimizar N+1 queries", agent: "Coder", emoji: "💻", mission: "Performance Optimization", status: "blocked", priority: "medium", duration: "—", tokens: 0, cost: 0, created: "14:05" },
  { id: "t11", name: "Load testing", agent: "Deployer", emoji: "🚀", mission: "Performance Optimization", status: "blocked", priority: "low", duration: "—", tokens: 0, cost: 0, created: "14:02" },
  { id: "t12", name: "Pen test automatizado", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1", status: "todo", priority: "high", duration: "—", tokens: 0, cost: 0, created: "14:00" },
];

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

  const baseTasks = missionFilter ? tasks.filter((t) => t.mission === missionFilter) : tasks;
  const filteredTasks = filter === "all" ? baseTasks : baseTasks.filter((t) => t.agent === filter);
  const agents = [...new Set(baseTasks.map((t) => t.agent))];

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListChecks className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Tarefas</h1>
          {missionFilter && (
            <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-violet/30 bg-violet/10 text-violet">
              {missionFilter}
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
                onClick={() => setFilter(a)}
              >
                {a}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban columns */}
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
                        <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border shrink-0 ${priorityColor[t.priority]}`}>
                          {t.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <span>{t.emoji} {t.agent}</span>
                        <span>·</span>
                        <span className="truncate">{t.mission}</span>
                      </div>
                      {t.status === "done" && (
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-muted-foreground">{t.duration}</span>
                          <span className="text-terminal">${t.cost.toFixed(2)}</span>
                        </div>
                      )}
                      {t.tokens > 0 && (
                        <div className="font-mono text-[9px] text-muted-foreground">{formatTokens(t.tokens)} tokens</div>
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
    </div>
  );
};

export default Tasks;
