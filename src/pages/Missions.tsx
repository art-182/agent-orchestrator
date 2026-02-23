import { Rocket, Target, Clock, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useMissions, useTasks } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

type MissionStatus = "active" | "completed" | "paused" | "failed";

const statusConfig: Record<MissionStatus, { color: string; icon: React.ReactNode; label: string }> = {
  active: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <Play className="h-3 w-3" />, label: "Ativo" },
  completed: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <CheckCircle2 className="h-3 w-3" />, label: "Concluído" },
  paused: { color: "bg-amber/15 text-amber border-amber/30", icon: <Clock className="h-3 w-3" />, label: "Pausado" },
  failed: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-3 w-3" />, label: "Falhou" },
};

const priorityColor: Record<string, string> = {
  critical: "bg-rose/15 text-rose border-rose/30",
  high: "bg-amber/15 text-amber border-amber/30",
  medium: "bg-violet/15 text-violet border-violet/30",
  low: "bg-muted text-muted-foreground border-border",
};

const taskStatusIcon: Record<string, React.ReactNode> = {
  done: <CheckCircle2 className="h-3 w-3 text-terminal" />,
  in_progress: <Play className="h-3 w-3 text-cyan" />,
  todo: <Clock className="h-3 w-3 text-muted-foreground" />,
  blocked: <AlertTriangle className="h-3 w-3 text-rose" />,
};

const formatTokens = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();

const Missions = () => {
  const navigate = useNavigate();
  const { data: missions, isLoading: loadingMissions } = useMissions();
  const { data: tasks, isLoading: loadingTasks } = useTasks();

  if (loadingMissions || loadingTasks) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Missões</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </PageTransition>
    );
  }

  const missionList = missions ?? [];
  const taskList = tasks ?? [];
  const activeMissions = missionList.filter((m) => m.status === "active").length;
  const totalTasks = taskList.length;
  const doneTasks = taskList.filter((t) => t.status === "done").length;
  const totalCost = missionList.reduce((s, m) => s + (m.cost ?? 0), 0);

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Missões</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Missões Ativas", value: activeMissions.toString(), color: "text-terminal" },
          { label: "Tarefas Concluídas", value: `${doneTasks}/${totalTasks}`, color: "text-cyan" },
          { label: "Custo Total", value: `$${totalCost.toFixed(2)}`, color: "text-amber" },
          { label: "Progresso Médio", value: `${missionList.length > 0 ? Math.round(missionList.reduce((s, m) => s + (m.progress ?? 0), 0) / missionList.length) : 0}%`, color: "text-violet" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <div className="space-y-4">
        {missionList.map((m) => {
          const sc = statusConfig[(m.status as MissionStatus) ?? "active"];
          const mTasks = taskList.filter((t) => t.mission_id === m.id);
          return (
            <Card key={m.id} className="border-border bg-card cursor-pointer hover:border-muted-foreground/30 transition-colors" onClick={() => navigate(`/tasks?mission=${m.id}`)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-mono text-sm text-foreground">{m.name}</CardTitle>
                      <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 border ${sc.color}`}>
                        {sc.icon}<span className="ml-1">{sc.label}</span>
                      </Badge>
                      <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 border ${priorityColor[m.priority] ?? ""}`}>
                        {m.priority}
                      </Badge>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{m.description}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-terminal">{m.progress ?? 0}%</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={m.progress ?? 0} className="h-1.5" />

                <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                  <span>💰 ${(m.cost ?? 0).toFixed(2)}</span>
                  <span>🔤 {formatTokens(m.tokens_used ?? 0)} tokens</span>
                </div>

                {mTasks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {mTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 rounded border border-border/50 bg-muted/20 px-2 py-1.5">
                        {taskStatusIcon[t.status] ?? <Clock className="h-3 w-3 text-muted-foreground" />}
                        <span className="font-mono text-[10px] text-foreground truncate flex-1">{t.name}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">{t.agents?.name ?? ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default Missions;
