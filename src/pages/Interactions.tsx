import { GitBranch, ArrowRight, MessageSquare, Zap, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Interaction {
  id: string;
  timestamp: string;
  from: string;
  fromEmoji: string;
  to: string;
  toEmoji: string;
  type: "delegation" | "response" | "escalation" | "feedback" | "sync";
  message: string;
  tokens: number;
  latency: string;
  context?: string;
}

const interactions: Interaction[] = [
  { id: "i1", timestamp: "14:32:01", from: "OraCLI Main", fromEmoji: "🧠", to: "Coder", toEmoji: "💻", type: "delegation", message: "Implementar RBAC policies para roles admin, editor e viewer", tokens: 2400, latency: "0.8s", context: "Auth Feature v2" },
  { id: "i2", timestamp: "14:31:45", from: "Coder", fromEmoji: "💻", to: "OraCLI Main", toEmoji: "🧠", type: "response", message: "JWT middleware concluído. 3 arquivos criados, 42 testes passing.", tokens: 1200, latency: "0.3s", context: "Auth Feature v2" },
  { id: "i3", timestamp: "14:31:22", from: "OraCLI Main", fromEmoji: "🧠", to: "Deployer", toEmoji: "🚀", type: "delegation", message: "Iniciar deploy staging v2.3.1 com rollback automático", tokens: 890, latency: "0.5s", context: "Deploy Pipeline v2.3" },
  { id: "i4", timestamp: "14:30:58", from: "Scout", fromEmoji: "🔍", to: "OraCLI Main", toEmoji: "🧠", type: "escalation", message: "2 CVEs críticas encontradas em jsonwebtoken@8.5.1 — upgrade necessário", tokens: 1800, latency: "0.4s", context: "Security Hardening Q1" },
  { id: "i5", timestamp: "14:30:33", from: "OraCLI Main", fromEmoji: "🧠", to: "Coder", toEmoji: "💻", type: "delegation", message: "Upgrade jsonwebtoken para v9.0.2 — CVE-2022-23529 e CVE-2022-23540", tokens: 1100, latency: "0.6s", context: "Security Hardening Q1" },
  { id: "i6", timestamp: "14:30:01", from: "Reviewer", fromEmoji: "📝", to: "Coder", toEmoji: "💻", type: "feedback", message: "PR #481: approve. Sugestão: extrair validateToken para util separada.", tokens: 3200, latency: "11.2s", context: "Auth Feature v2" },
  { id: "i7", timestamp: "14:29:45", from: "Analyst", fromEmoji: "📊", to: "OraCLI Main", toEmoji: "🧠", type: "escalation", message: "API de métricas timeout após 30s. 3 retries falharam.", tokens: 450, latency: "30.0s", context: "Monitoring" },
  { id: "i8", timestamp: "14:29:12", from: "OraCLI Main", fromEmoji: "🧠", to: "Analyst", toEmoji: "📊", type: "sync", message: "Redirecionando para endpoint de backup. Verificar health em 5min.", tokens: 320, latency: "0.2s", context: "Monitoring" },
  { id: "i9", timestamp: "14:28:55", from: "Deployer", fromEmoji: "🚀", to: "OraCLI Main", toEmoji: "🧠", type: "response", message: "Health check staging: all services green. Latência P99: 234ms.", tokens: 680, latency: "1.2s", context: "Deploy Pipeline v2.3" },
  { id: "i10", timestamp: "14:28:30", from: "OraCLI Main", fromEmoji: "🧠", to: "Scout", toEmoji: "🔍", type: "delegation", message: "Iniciar secret rotation para API keys com mais de 90 dias.", tokens: 980, latency: "0.4s", context: "Security Hardening Q1" },
  { id: "i11", timestamp: "14:28:01", from: "Coder", fromEmoji: "💻", to: "Reviewer", toEmoji: "📝", type: "sync", message: "PR #482 aberto: 12 files changed, 847 insertions. Review requested.", tokens: 560, latency: "0.3s", context: "Auth Feature v2" },
  { id: "i12", timestamp: "14:27:33", from: "Scout", fromEmoji: "🔍", to: "OraCLI Main", toEmoji: "🧠", type: "response", message: "Scan completo: 147 deps auditadas, 2 high, 0 critical restantes.", tokens: 1400, latency: "6.4s", context: "Security Hardening Q1" },
];

const typeConfig: Record<string, { color: string; label: string }> = {
  delegation: { color: "bg-violet/15 text-violet border-violet/30", label: "Delegação" },
  response: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Resposta" },
  escalation: { color: "bg-rose/15 text-rose border-rose/30", label: "Escalação" },
  feedback: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Feedback" },
  sync: { color: "bg-amber/15 text-amber border-amber/30", label: "Sync" },
};

const Interactions = () => {
  const totalTokens = interactions.reduce((s, i) => s + i.tokens, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Interações</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: interactions.length.toString(), color: "text-foreground" },
          { label: "Delegações", value: interactions.filter((i) => i.type === "delegation").length.toString(), color: "text-violet" },
          { label: "Escalações", value: interactions.filter((i) => i.type === "escalation").length.toString(), color: "text-rose" },
          { label: "Tokens", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), color: "text-cyan" },
          { label: "Agentes Ativos", value: new Set([...interactions.map((i) => i.from), ...interactions.map((i) => i.to)]).size.toString(), color: "text-terminal" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-3">
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interaction timeline */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-2">
          {interactions.map((inter) => {
            const tc = typeConfig[inter.type];
            return (
              <Card key={inter.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2 w-2 rounded-full bg-terminal" />
                      <div className="w-px h-full bg-border mt-1" />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-muted-foreground">{inter.timestamp}</span>
                        <span className="font-mono text-xs font-semibold text-foreground">{inter.fromEmoji} {inter.from}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs font-semibold text-foreground">{inter.toEmoji} {inter.to}</span>
                        <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border ${tc.color}`}>
                          {tc.label}
                        </Badge>
                        {inter.context && (
                          <span className="font-mono text-[9px] text-muted-foreground">· {inter.context}</span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{inter.message}</p>
                      <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
                        <span><Zap className="h-2.5 w-2.5 inline mr-0.5" />{inter.tokens} tokens</span>
                        <span>⏱ {inter.latency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Interactions;
