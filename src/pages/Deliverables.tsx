import { PackageCheck, FileCode, FileText, Shield, TestTube, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DeliverableType = "code" | "report" | "config" | "test" | "doc";
type DeliverableStatus = "delivered" | "in_progress" | "pending";

interface Deliverable {
  id: string;
  name: string;
  type: DeliverableType;
  status: DeliverableStatus;
  agent: string;
  emoji: string;
  mission: string;
  created: string;
  files: number;
  linesChanged: number;
  description: string;
}

const deliverables: Deliverable[] = [
  { id: "d1", name: "JWT Middleware", type: "code", status: "delivered", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", created: "14:32", files: 3, linesChanged: 247, description: "Middleware de autenticação JWT com validação, refresh e error handling." },
  { id: "d2", name: "Refresh Token Flow", type: "code", status: "delivered", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", created: "14:28", files: 2, linesChanged: 189, description: "Fluxo completo de refresh tokens com rotation e revocation." },
  { id: "d3", name: "Security Audit Report", type: "report", status: "delivered", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1", created: "14:26", files: 1, linesChanged: 0, description: "Relatório com 147 dependências auditadas, 2 CVEs high encontradas." },
  { id: "d4", name: "Deploy Pipeline Config", type: "config", status: "delivered", agent: "Deployer", emoji: "🚀", mission: "Deploy Pipeline v2.3", created: "14:20", files: 4, linesChanged: 312, description: "GitHub Actions com blue-green deploy, canary e health checks." },
  { id: "d5", name: "RBAC Policies", type: "code", status: "in_progress", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", created: "14:25", files: 5, linesChanged: 420, description: "Sistema de roles e permissions com admin, editor e viewer." },
  { id: "d6", name: "E2E Auth Tests", type: "test", status: "pending", agent: "Coder", emoji: "💻", mission: "Auth Feature v2", created: "—", files: 0, linesChanged: 0, description: "Suite de testes end-to-end para fluxos de autenticação." },
  { id: "d7", name: "API Documentation v3", type: "doc", status: "delivered", agent: "Coder", emoji: "💻", mission: "API Documentation v3", created: "Feb 15", files: 8, linesChanged: 1240, description: "OpenAPI 3.1 spec com exemplos interativos e SDK TypeScript." },
  { id: "d8", name: "OWASP Compliance Report", type: "report", status: "pending", agent: "Scout", emoji: "🔍", mission: "Security Hardening Q1", created: "—", files: 0, linesChanged: 0, description: "Checklist OWASP Top 10 com status de conformidade." },
  { id: "d9", name: "Cache Layer Implementation", type: "code", status: "delivered", agent: "Coder", emoji: "💻", mission: "Performance Optimization", created: "Feb 12", files: 4, linesChanged: 356, description: "Redis cache layer com TTL, invalidation e fallback." },
  { id: "d10", name: "PR Review — PR #481", type: "doc", status: "delivered", agent: "Reviewer", emoji: "📝", mission: "Auth Feature v2", created: "14:30", files: 0, linesChanged: 0, description: "Review aprovado com sugestão de refactor em validateToken." },
];

const typeIcon: Record<DeliverableType, React.ReactNode> = {
  code: <FileCode className="h-4 w-4 text-terminal" />,
  report: <Shield className="h-4 w-4 text-amber" />,
  config: <FileText className="h-4 w-4 text-violet" />,
  test: <TestTube className="h-4 w-4 text-cyan" />,
  doc: <FileText className="h-4 w-4 text-foreground" />,
};

const typeLabel: Record<DeliverableType, string> = { code: "Código", report: "Relatório", config: "Config", test: "Teste", doc: "Documento" };

const statusConfig: Record<DeliverableStatus, { color: string; label: string }> = {
  delivered: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Entregue" },
  in_progress: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Em progresso" },
  pending: { color: "bg-muted text-muted-foreground border-border", label: "Pendente" },
};

const Deliverables = () => {
  const delivered = deliverables.filter((d) => d.status === "delivered").length;
  const totalFiles = deliverables.reduce((s, d) => s + d.files, 0);
  const totalLines = deliverables.reduce((s, d) => s + d.linesChanged, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PackageCheck className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Entregáveis</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: deliverables.length.toString(), color: "text-foreground" },
          { label: "Entregues", value: `${delivered}/${deliverables.length}`, color: "text-terminal" },
          { label: "Arquivos", value: totalFiles.toString(), color: "text-cyan" },
          { label: "Linhas Alteradas", value: totalLines.toLocaleString(), color: "text-violet" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-3">
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {deliverables.map((d) => {
          const sc = statusConfig[d.status];
          return (
            <Card key={d.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcon[d.type]}
                    <div>
                      <p className="font-mono text-xs font-semibold text-foreground">{d.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{typeLabel[d.type]}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${sc.color}`}>
                    {sc.label}
                  </Badge>
                </div>

                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{d.description}</p>

                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{d.emoji} {d.agent}</span>
                  <span>{d.mission}</span>
                </div>

                {d.status === "delivered" && (
                  <div className="flex items-center gap-3 font-mono text-[10px] pt-1 border-t border-border">
                    <span className="text-foreground">{d.files} arquivos</span>
                    {d.linesChanged > 0 && <span className="text-terminal">+{d.linesChanged} linhas</span>}
                    <span className="text-muted-foreground">{d.created}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Deliverables;
