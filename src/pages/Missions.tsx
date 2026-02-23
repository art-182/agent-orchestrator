import { Rocket, Target, Clock, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";

type MissionStatus = "active" | "completed" | "paused" | "failed";

interface MissionTask {
  name: string;
  agent: string;
  status: "done" | "running" | "pending" | "error";
}

interface Mission {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  progress: number;
  priority: "critical" | "high" | "medium" | "low";
  owner: string;
  created: string;
  deadline: string;
  tasks: MissionTask[];
  agents: string[];
  cost: number;
  tokensUsed: number;
}

const missions: Mission[] = [
  {
    id: "m1", name: "Auth Feature v2", description: "Implementar autenticação JWT completa com refresh tokens, RBAC e session management.",
    status: "active", progress: 67, priority: "critical", owner: "OraCLI Main", created: "Feb 18", deadline: "Feb 25",
    tasks: [
      { name: "Criar middleware JWT", agent: "Coder", status: "done" },
      { name: "Implementar refresh tokens", agent: "Coder", status: "done" },
      { name: "RBAC policies", agent: "Coder", status: "running" },
      { name: "Security audit auth flow", agent: "Scout", status: "pending" },
      { name: "Testes e2e auth", agent: "Coder", status: "pending" },
      { name: "Review final", agent: "Reviewer", status: "pending" },
    ],
    agents: ["🧠 OraCLI", "💻 Coder", "🔍 Scout", "📝 Reviewer"], cost: 34.20, tokensUsed: 412000,
  },
  {
    id: "m2", name: "Deploy Pipeline v2.3", description: "Pipeline CI/CD com blue-green deployment, canary releases e rollback automático.",
    status: "active", progress: 82, priority: "high", owner: "OraCLI Main", created: "Feb 15", deadline: "Feb 23",
    tasks: [
      { name: "Configurar GitHub Actions", agent: "Deployer", status: "done" },
      { name: "Blue-green setup", agent: "Deployer", status: "done" },
      { name: "Canary config", agent: "Deployer", status: "done" },
      { name: "Rollback automático", agent: "Deployer", status: "running" },
      { name: "Monitoring integration", agent: "Analyst", status: "pending" },
    ],
    agents: ["🧠 OraCLI", "🚀 Deployer", "📊 Analyst"], cost: 12.50, tokensUsed: 189000,
  },
  {
    id: "m3", name: "Security Hardening Q1", description: "Auditoria completa de segurança: deps, endpoints, secrets, OWASP top 10.",
    status: "active", progress: 45, priority: "high", owner: "OraCLI Main", created: "Feb 10", deadline: "Feb 28",
    tasks: [
      { name: "Scan dependências", agent: "Scout", status: "done" },
      { name: "Audit endpoints", agent: "Scout", status: "done" },
      { name: "Secret rotation", agent: "Scout", status: "running" },
      { name: "OWASP compliance check", agent: "Scout", status: "pending" },
      { name: "Pen test automatizado", agent: "Scout", status: "pending" },
      { name: "Relatório executivo", agent: "Analyst", status: "pending" },
      { name: "Fix vulnerabilities", agent: "Coder", status: "pending" },
    ],
    agents: ["🧠 OraCLI", "🔍 Scout", "💻 Coder", "📊 Analyst"], cost: 28.90, tokensUsed: 345000,
  },
  {
    id: "m4", name: "Performance Optimization", description: "Reduzir latência P99 em 40%, otimizar queries e caching.",
    status: "paused", progress: 30, priority: "medium", owner: "OraCLI Main", created: "Feb 08", deadline: "Mar 05",
    tasks: [
      { name: "Profiling de queries", agent: "Analyst", status: "done" },
      { name: "Implementar cache layer", agent: "Coder", status: "done" },
      { name: "Otimizar N+1 queries", agent: "Coder", status: "pending" },
      { name: "Load testing", agent: "Deployer", status: "pending" },
    ],
    agents: ["🧠 OraCLI", "💻 Coder", "📊 Analyst", "🚀 Deployer"], cost: 8.40, tokensUsed: 98000,
  },
  {
    id: "m5", name: "API Documentation v3", description: "Gerar documentação OpenAPI 3.1, exemplos interativos e SDK clients.",
    status: "completed", progress: 100, priority: "low", owner: "OraCLI Main", created: "Feb 01", deadline: "Feb 15",
    tasks: [
      { name: "Extrair schemas dos endpoints", agent: "Analyst", status: "done" },
      { name: "Gerar OpenAPI spec", agent: "Coder", status: "done" },
      { name: "Criar exemplos interativos", agent: "Coder", status: "done" },
      { name: "Review documentação", agent: "Reviewer", status: "done" },
    ],
    agents: ["🧠 OraCLI", "💻 Coder", "📊 Analyst", "📝 Reviewer"], cost: 15.60, tokensUsed: 210000,
  },
];

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
  running: <Play className="h-3 w-3 text-cyan" />,
  pending: <Clock className="h-3 w-3 text-muted-foreground" />,
  error: <AlertTriangle className="h-3 w-3 text-rose" />,
};

const formatTokens = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();

const Missions = () => {
  const navigate = useNavigate();
  const activeMissions = missions.filter((m) => m.status === "active").length;
  const totalTasks = missions.reduce((s, m) => s + m.tasks.length, 0);
  const doneTasks = missions.reduce((s, m) => s + m.tasks.filter((t) => t.status === "done").length, 0);
  const totalCost = missions.reduce((s, m) => s + m.cost, 0);

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Missões</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Missões Ativas", value: activeMissions.toString(), color: "text-terminal" },
          { label: "Tarefas Concluídas", value: `${doneTasks}/${totalTasks}`, color: "text-cyan" },
          { label: "Custo Total", value: `$${totalCost.toFixed(2)}`, color: "text-amber" },
          { label: "Progresso Médio", value: `${Math.round(missions.reduce((s, m) => s + m.progress, 0) / missions.length)}%`, color: "text-violet" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-3">
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission cards */}
      <div className="space-y-4">
        {missions.map((m) => {
          const sc = statusConfig[m.status];
          return (
            <Card key={m.id} className="border-border bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-mono text-sm text-foreground">{m.name}</CardTitle>
                      <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 border ${sc.color}`}>
                        {sc.icon}<span className="ml-1">{sc.label}</span>
                      </Badge>
                      <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 border ${priorityColor[m.priority]}`}>
                        {m.priority}
                      </Badge>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{m.description}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-terminal">{m.progress}%</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={m.progress} className="h-1.5" />

                <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                  <span>📅 {m.created} → {m.deadline}</span>
                  <span>💰 ${m.cost.toFixed(2)}</span>
                  <span>🔤 {formatTokens(m.tokensUsed)} tokens</span>
                  <span>👥 {m.agents.join(", ")}</span>
                </div>

                {/* Task list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {m.tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 rounded border border-border/50 bg-muted/20 px-2 py-1.5">
                      {taskStatusIcon[t.status]}
                      <span className="font-mono text-[10px] text-foreground truncate flex-1">{t.name}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{t.agent}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default Missions;
