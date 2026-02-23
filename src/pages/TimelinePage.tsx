import { GanttChart, CheckCircle2, Play, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type TimelineEventType = "mission_start" | "task_done" | "deploy" | "error" | "escalation" | "milestone" | "decision";

interface TimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  type: TimelineEventType;
  title: string;
  description: string;
  agent: string;
  emoji: string;
  mission?: string;
}

const events: TimelineEvent[] = [
  { id: "e1", timestamp: "14:32", date: "Feb 22", type: "task_done", title: "JWT Middleware Concluído", description: "3 arquivos criados, 42 testes passing. Middleware de autenticação JWT completo.", agent: "Coder", emoji: "💻", mission: "Auth Feature v2" },
  { id: "e2", timestamp: "14:31", date: "Feb 22", type: "escalation", title: "2 CVEs Críticas Detectadas", description: "jsonwebtoken@8.5.1 vulnerável. Upgrade urgente necessário para v9.0.2.", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1" },
  { id: "e3", timestamp: "14:31", date: "Feb 22", type: "deploy", title: "Deploy Staging v2.3.1", description: "Blue-green deploy iniciado. Health checks passando. P99: 234ms.", agent: "Deployer", emoji: "🚀", mission: "Deploy Pipeline v2.3" },
  { id: "e4", timestamp: "14:30", date: "Feb 22", type: "error", title: "API Metrics Timeout", description: "metrics.internal.io timeout após 30s. 3 retries falharam. Redirecionado para backup.", agent: "Analyst", emoji: "📊" },
  { id: "e5", timestamp: "14:30", date: "Feb 22", type: "task_done", title: "PR #481 Aprovado e Merged", description: "Review completo com sugestão de refactor em validateToken. Aprovado.", agent: "Reviewer", emoji: "📝", mission: "Auth Feature v2" },
  { id: "e6", timestamp: "14:28", date: "Feb 22", type: "task_done", title: "Refresh Token Flow Implementado", description: "Token rotation e revocation implementados. 189 linhas adicionadas.", agent: "Coder", emoji: "💻", mission: "Auth Feature v2" },
  { id: "e7", timestamp: "12:00", date: "Feb 22", type: "milestone", title: "Auth Feature v2 → 67% Concluído", description: "4 de 6 tarefas concluídas. RBAC e testes e2e pendentes.", agent: "OraCLI Main", emoji: "🧠", mission: "Auth Feature v2" },
  { id: "e8", timestamp: "10:15", date: "Feb 22", type: "decision", title: "JWT Algoritmo: RS256", description: "Decisão: usar RS256 com key rotation a cada 24h. Mais seguro que HS256.", agent: "OraCLI Main", emoji: "🧠", mission: "Auth Feature v2" },
  { id: "e9", timestamp: "18:45", date: "Feb 21", type: "deploy", title: "Rollback Prod → v2.3.0", description: "Rollback automático após health check falhar. Latência P99 > 5s detectada.", agent: "Deployer", emoji: "🚀", mission: "Deploy Pipeline v2.3" },
  { id: "e10", timestamp: "16:30", date: "Feb 21", type: "task_done", title: "Blue-Green Deploy Configurado", description: "Setup completo com GitHub Actions, canary config e health checks.", agent: "Deployer", emoji: "🚀", mission: "Deploy Pipeline v2.3" },
  { id: "e11", timestamp: "14:00", date: "Feb 21", type: "mission_start", title: "Security Hardening Q1 Iniciado", description: "Auditoria completa de segurança: deps, endpoints, secrets, OWASP top 10.", agent: "OraCLI Main", emoji: "🧠", mission: "Security Hardening Q1" },
  { id: "e12", timestamp: "09:00", date: "Feb 19", type: "mission_start", title: "Auth Feature v2 Iniciado", description: "Autenticação JWT com refresh tokens, RBAC e session management.", agent: "OraCLI Main", emoji: "🧠", mission: "Auth Feature v2" },
  { id: "e13", timestamp: "17:00", date: "Feb 15", type: "milestone", title: "API Documentation v3 Concluída", description: "OpenAPI 3.1 spec com exemplos interativos e SDK TypeScript. 8 arquivos, 1240 linhas.", agent: "Coder", emoji: "💻", mission: "API Documentation v3" },
  { id: "e14", timestamp: "14:30", date: "Feb 15", type: "deploy", title: "Deploy Pipeline v2.3 Iniciado", description: "Pipeline CI/CD com blue-green, canary releases e rollback automático.", agent: "OraCLI Main", emoji: "🧠", mission: "Deploy Pipeline v2.3" },
];

const typeConfig: Record<TimelineEventType, { color: string; icon: React.ReactNode; accent: string }> = {
  mission_start: { color: "bg-violet/15 text-violet border-violet/30", icon: <Play className="h-3 w-3" />, accent: "bg-violet" },
  task_done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-3 w-3" />, accent: "bg-terminal" },
  deploy: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-3 w-3" />, accent: "bg-cyan" },
  error: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-3 w-3" />, accent: "bg-rose" },
  escalation: { color: "bg-amber/15 text-amber border-amber/30", icon: <AlertTriangle className="h-3 w-3" />, accent: "bg-amber" },
  milestone: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-3 w-3" />, accent: "bg-terminal" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", icon: <Clock className="h-3 w-3" />, accent: "bg-violet" },
};

const typeLabel: Record<TimelineEventType, string> = {
  mission_start: "Missão Iniciada", task_done: "Tarefa Concluída", deploy: "Deploy",
  error: "Erro", escalation: "Escalação", milestone: "Marco", decision: "Decisão",
};

// Group events by date
const groupByDate = (evts: TimelineEvent[]) => {
  const groups: Record<string, TimelineEvent[]> = {};
  evts.forEach((e) => {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  });
  return Object.entries(groups);
};

const TimelinePage = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <GanttChart className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Timeline</h1>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Eventos", value: events.length.toString(), color: "text-foreground" },
        { label: "Deploys", value: events.filter((e) => e.type === "deploy").length.toString(), color: "text-cyan" },
        { label: "Erros", value: events.filter((e) => e.type === "error").length.toString(), color: "text-rose" },
        { label: "Marcos", value: events.filter((e) => e.type === "milestone").length.toString(), color: "text-terminal" },
      ].map((s) => (
        <Card key={s.label} className="border-border bg-card">
          <CardContent className="p-3">
            <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
            <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-6">
        {groupByDate(events).map(([date, evts]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] text-muted-foreground px-2">{date}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative pl-6 space-y-3">
              {/* Vertical line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

              {evts.map((evt) => {
                const tc = typeConfig[evt.type];
                return (
                  <div key={evt.id} className="relative">
                    {/* Dot */}
                    <div className={`absolute left-[-18px] top-2.5 h-2.5 w-2.5 rounded-full ${tc.accent} ring-2 ring-background`} />

                    <Card className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-muted-foreground">{evt.timestamp}</span>
                          {tc.icon}
                          <span className="font-mono text-xs font-semibold text-foreground">{evt.title}</span>
                          <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border ${tc.color}`}>
                            {typeLabel[evt.type]}
                          </Badge>
                          {evt.mission && (
                            <span className="font-mono text-[9px] text-muted-foreground">· {evt.mission}</span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">{evt.description}</p>
                        <span className="font-mono text-[9px] text-muted-foreground">{evt.emoji} {evt.agent}</span>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

export default TimelinePage;
