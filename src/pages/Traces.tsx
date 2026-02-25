import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronRight, Layers, Search, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useMemo } from "react";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useTraces } from "@/hooks/use-supabase-data";
import { parseJsonb } from "@/lib/parse-jsonb";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

type TraceStatus = "success" | "error" | "warning" | "timeout";

const statusIcon: Record<TraceStatus, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-terminal" />,
  error: <XCircle className="h-3.5 w-3.5 text-rose" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber" />,
  timeout: <Clock className="h-3.5 w-3.5 text-rose" />,
};

const statusColor: Record<TraceStatus, string> = {
  success: "border-terminal/20", error: "border-rose/20", warning: "border-amber/20", timeout: "border-rose/20",
};

const spanBarColor: Record<TraceStatus, string> = {
  success: "bg-terminal", error: "bg-rose", warning: "bg-amber", timeout: "bg-rose/50",
};

const statusLabel: Record<TraceStatus, string> = {
  success: "Sucesso", error: "Erro", warning: "Aviso", timeout: "Timeout",
};

const Traces = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: traces, isLoading } = useTraces();
  const queryClient = useQueryClient();

  const list = useMemo(() => {
    const all = traces ?? [];
    return all.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [traces, search, statusFilter]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-rose/10 text-rose p-2 rounded-xl"><Activity className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Traces & Erros</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const all = traces ?? [];
  const errors = all.filter((t) => t.status === "error").length;
  const warnings = all.filter((t) => t.status === "warning").length;
  const successes = all.filter((t) => t.status === "success").length;
  const avgSpans = all.length > 0 ? Math.round(all.reduce((s, t) => s + (parseJsonb<any[]>(t.spans, [])).length, 0) / all.length) : 0;
  const successRate = all.length > 0 ? Math.round((successes / all.length) * 100) : 0;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-rose/10 text-rose p-2 rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Traces & Erros</h1>
            <p className="text-[11px] text-muted-foreground font-medium">{all.length} traces · {successRate}% sucesso</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-[11px] gap-1.5 rounded-xl border-border/50 hover:border-border" onClick={() => queryClient.invalidateQueries({ queryKey: ["traces"] })}>
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Traces", value: all.length.toString(), color: "text-foreground" },
          { label: "Sucesso", value: successes.toString(), color: "text-terminal" },
          { label: "Erros", value: errors.toString(), color: "text-rose" },
          { label: "Warnings", value: warnings.toString(), color: "text-amber" },
          { label: "Spans Médio", value: avgSpans.toString(), color: "text-cyan" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border/50 bg-card surface-elevated">
              <CardContent className="p-4">
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color} tracking-tight`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar traces..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-[12px] bg-card border-border/50 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] text-[12px] bg-card border-border/50 rounded-xl">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">Todos</SelectItem>
            {(Object.keys(statusLabel) as TraceStatus[]).map((k) => (
              <SelectItem key={k} value={k} className="text-[12px]">{statusLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TooltipProvider>
        <ScrollArea className="h-[calc(100vh-420px)]">
          <div className="space-y-2">
            {list.map((trace) => {
              const isExpanded = expanded === trace.id;
              const agent = trace.agents as any;
              const spans = parseJsonb<any[]>(trace.spans, []);
              const maxMs = Math.max(...spans.map((s: any) => parseFloat(s.duration) * 1000 || 1), 1);
              const totalTokens = spans.reduce((s: number, sp: any) => s + (sp.tokens ?? 0), 0);

              return (
                <Card
                  key={trace.id}
                  className={`border-border/50 bg-card surface-elevated cursor-pointer transition-all duration-200 hover:border-border ${statusColor[(trace.status as TraceStatus) ?? "success"]} ${isExpanded ? "ring-1 ring-terminal/20" : ""}`}
                  onClick={() => setExpanded(isExpanded ? null : trace.id)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {statusIcon[(trace.status as TraceStatus) ?? "success"]}
                      <span className="text-[13px] font-semibold text-foreground flex-1 tracking-tight">{trace.name}</span>
                      <span className="text-[11px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border/50 rounded-full font-medium">{trace.duration}</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-medium">{spans.length}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">{spans.length} spans · {totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K tokens` : "sem tokens"}</TooltipContent>
                      </Tooltip>
                      <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    </div>

                    {trace.error && (
                      <div className="rounded-xl bg-rose/8 border border-rose/15 px-3 py-2">
                        <p className="text-[11px] text-rose">{trace.error}</p>
                      </div>
                    )}

                    {isExpanded && spans.length > 0 && (
                      <div className="space-y-1 pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2 px-1 pb-1">
                          <span className="text-[10px] text-muted-foreground w-28 font-medium">Span</span>
                          <span className="text-[10px] text-muted-foreground flex-1 font-medium">Waterfall</span>
                          <span className="text-[10px] text-muted-foreground w-14 text-right font-medium">Duração</span>
                          <span className="text-[10px] text-muted-foreground w-14 text-right font-medium">Tokens</span>
                        </div>
                        {spans.map((span: any, i: number) => {
                          const ms = parseFloat(span.duration) * 1000 || 0;
                          const pct = (ms / maxMs) * 100;
                          const offset = i * 8;
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 hover:bg-muted/20 rounded-lg px-1 py-0.5 transition-colors">
                                  {statusIcon[(span.status as TraceStatus) ?? "success"]}
                                  <span className="text-[11px] text-foreground w-28 truncate">{span.name}</span>
                                  <div className="flex-1 h-4 bg-muted/20 rounded-md overflow-hidden relative">
                                    <div
                                      className={`absolute top-0.5 h-3 rounded-md ${spanBarColor[(span.status as TraceStatus) ?? "success"]} transition-all`}
                                      style={{ width: `${Math.max(pct, 4)}%`, left: `${Math.min(offset, 40)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground w-14 text-right tabular-nums">{span.duration}</span>
                                  <span className="text-[10px] text-cyan w-14 text-right tabular-nums">{span.tokens ? `${(span.tokens / 1000).toFixed(1)}K` : "—"}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs space-y-1">
                                <p className="font-semibold">{span.name}</p>
                                <p className="text-muted-foreground">{span.status} · {span.duration} · {span.model ?? "—"}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}

                    {isExpanded && (
                      <div className="flex items-center gap-4 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                        <span>Total: {totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K tokens` : "—"}</span>
                        <span>{spans.length} spans</span>
                        <span>{trace.created_at ? new Date(trace.created_at).toLocaleString("pt-BR") : "—"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </TooltipProvider>
    </PageTransition>
  );
};

export default Traces;
