import { PackageCheck, FileCode, FileText, Shield, TestTube, ExternalLink, Search, Filter, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const list = deliverables ?? [];

  const filtered = useMemo(() => {
    return list.filter((d) => {
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      return true;
    });
  }, [list, search, typeFilter, statusFilter]);

  const delivered = list.filter((d) => d.status === "delivered").length;
  const totalFiles = list.reduce((s, d) => s + (d.files ?? 0), 0);
  const totalLines = list.reduce((s, d) => s + (d.lines_changed ?? 0), 0);
  const deliveryRate = list.length > 0 ? Math.round((delivered / list.length) * 100) : 0;

  // Type distribution
  const typeDist = useMemo(() => {
    const map: Record<string, number> = {};
    list.forEach((d) => { map[d.type] = (map[d.type] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [list]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <PackageCheck className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Entregáveis</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center gap-3">
        <PackageCheck className="h-7 w-7 text-terminal" />
        <div>
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Entregáveis</h1>
          <p className="text-xs text-muted-foreground">{list.length} entregáveis · {deliveryRate}% entregues</p>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: list.length.toString(), color: "text-foreground" },
          { label: "Entregues", value: `${delivered}/${list.length}`, color: "text-terminal" },
          { label: "Arquivos", value: totalFiles.toString(), color: "text-cyan" },
          { label: "Linhas", value: totalLines.toLocaleString(), color: "text-violet" },
          { label: "Taxa Entrega", value: `${deliveryRate}%`, color: "text-terminal" },
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

      {/* Type distribution bar */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">Distribuição por tipo</span>
          </div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            {typeDist.map(([type, count]) => {
              const pct = (count / list.length) * 100;
              const colors: Record<string, string> = { code: "bg-terminal", report: "bg-amber", config: "bg-violet", test: "bg-cyan", doc: "bg-muted-foreground" };
              return <div key={type} className={`${colors[type] ?? "bg-muted"} transition-all`} style={{ width: `${pct}%` }} />;
            })}
          </div>
          <div className="flex gap-3 flex-wrap">
            {typeDist.map(([type, count]) => (
              <span key={type} className="font-mono text-[10px] text-muted-foreground">{typeLabel[type as DeliverableType] ?? type}: {count}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar entregáveis..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-mono text-xs bg-card border-border" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] font-mono text-xs bg-card border-border">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Todos tipos</SelectItem>
            {Object.entries(typeLabel).map(([k, v]) => (
              <SelectItem key={k} value={k} className="font-mono text-xs">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] font-mono text-xs bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Todos</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k} className="font-mono text-xs">{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground">{filtered.length} resultado(s)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const sc = statusConfig[(d.status as DeliverableStatus) ?? "pending"];
          const agent = d.agents as any;
          const mission = d.missions as any;
          const url = (d as any).url as string | undefined;
          const hasUrl = url && url.length > 0;

          return (
            <Card key={d.id} className="border-border bg-card hover:border-muted-foreground/30 transition-all duration-200 group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {typeIcon[(d.type as DeliverableType) ?? "code"]}
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{typeLabel[(d.type as DeliverableType) ?? "code"]}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] px-2 py-0.5 border ${sc.color}`}>
                    {sc.label}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{agent?.emoji} {agent?.name}</span>
                  <span className="truncate ml-2">{mission?.name}</span>
                </div>

                {d.status === "delivered" && (
                  <div className="flex items-center gap-3 text-xs pt-2 border-t border-border">
                    <span className="text-foreground font-mono">{d.files} arquivos</span>
                    {(d.lines_changed ?? 0) > 0 && <span className="text-terminal font-mono">+{d.lines_changed} linhas</span>}
                  </div>
                )}

                {d.status === "in_progress" && (
                  <div className="pt-2 border-t border-border">
                    <Progress value={50} className="h-1.5" />
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">Em desenvolvimento</p>
                  </div>
                )}

                {hasUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 font-mono text-xs border-border hover:border-terminal/40 hover:text-terminal transition-colors mt-1"
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Acessar Entregável
                  </Button>
                )}

                {!hasUrl && d.status === "pending" && (
                  <p className="text-[10px] text-muted-foreground/60 font-mono text-center pt-1">Link disponível após entrega</p>
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
