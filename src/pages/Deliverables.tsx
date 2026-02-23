import { PackageCheck, FileCode, FileText, Shield, TestTube, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useDeliverables } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

type DeliverableType = "code" | "report" | "config" | "test" | "doc";
type DeliverableStatus = "delivered" | "in_progress" | "pending";

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
  const { data: deliverables, isLoading } = useDeliverables();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <PackageCheck className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Entregáveis</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </PageTransition>
    );
  }

  const list = deliverables ?? [];
  const delivered = list.filter((d) => d.status === "delivered").length;
  const totalFiles = list.reduce((s, d) => s + (d.files ?? 0), 0);
  const totalLines = list.reduce((s, d) => s + (d.lines_changed ?? 0), 0);

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <PackageCheck className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Entregáveis</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: list.length.toString(), color: "text-foreground" },
          { label: "Entregues", value: `${delivered}/${list.length}`, color: "text-terminal" },
          { label: "Arquivos", value: totalFiles.toString(), color: "text-cyan" },
          { label: "Linhas Alteradas", value: totalLines.toLocaleString(), color: "text-violet" },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((d) => {
          const sc = statusConfig[(d.status as DeliverableStatus) ?? "pending"];
          const agent = d.agents as any;
          const mission = d.missions as any;
          return (
            <Card key={d.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {typeIcon[(d.type as DeliverableType) ?? "code"]}
                    <div>
                      <p className="font-mono text-xs font-semibold text-foreground">{d.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{typeLabel[(d.type as DeliverableType) ?? "code"]}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${sc.color}`}>
                    {sc.label}
                  </Badge>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{d.description}</p>
                <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>{agent?.emoji} {agent?.name}</span>
                  <span>{mission?.name}</span>
                </div>
                {d.status === "delivered" && (
                  <div className="flex items-center gap-3 font-mono text-[10px] pt-1 border-t border-border">
                    <span className="text-foreground">{d.files} arquivos</span>
                    {(d.lines_changed ?? 0) > 0 && <span className="text-terminal">+{d.lines_changed} linhas</span>}
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

export default Deliverables;
