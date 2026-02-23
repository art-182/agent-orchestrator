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
  success: "border-terminal/30", error: "border-rose/30", warning: "border-amber/30", timeout: "border-rose/30",
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
          <Activity className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Traces & Erros</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const all = traces ?? [];
  const errors = all.filter((t) => t.status === "error").length;
  const warnings = all.filter((t) => t.status === "warning").length;
  const successes = all.filter((t) => t.status === "success").length;
  const avgSpans = all.length > 0 ? Math.round(all.reduce((s, t) => s + ((t.spans as any[]) ?? []).length, 0) / all.length) : 0;
  const successRate = all.length > 0 ? Math.round((successes / all.length) * 100) : 0;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Activity className="h-7 w-7 text-terminal" />
          <div>
            <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Traces & Erros</h1>
            <p className="text-xs text-muted-foreground">{all.length} traces · {successRate}% sucesso</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 h-8" onClick={() => queryClient.invalidateQueries({ queryKey: ["traces"] })}>
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
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar traces..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-mono text-xs bg-card border-border" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] font-mono text-xs bg-card border-border">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-mono text-xs">Todos</SelectItem>
            {(Object.keys(statusLabel) as TraceStatus[]).map((k) => (
              <SelectItem key={k} value={k} className="font-mono text-xs">{statusLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground">{list.length} resultado(s)</p>

      <TooltipProvider>
        <ScrollArea className="h-[calc(100vh-420px)]">
          <div className="space-y-2">
            {list.map((trace) => {
              const isExpanded = expanded === trace.id;
              const agent = trace.agents as any;
              const spans = (trace.spans as any[]) ?? [];
              const maxMs = Math.max(...spans.map((s: any) => parseFloat(s.duration) * 1000 || 1), 1);
              const totalTokens = spans.reduce((s: number, sp: any) => s + (sp.tokens ?? 0), 0);

              return (
                <Card
                  key={trace.id}
                  className={`border-border bg-card cursor-pointer transition-all hover:border-muted-foreground/30 ${statusColor[(trace.status as TraceStatus) ?? "success"]} ${isExpanded ? "ring-1 ring-terminal/20" : ""}`}
                  onClick={() => setExpanded(isExpanded ? null : trace.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {statusIcon[(trace.status as TraceStatus) ?? "success"]}
                      <span className="font-mono text-xs font-semibold text-foreground flex-1">{trace.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                      <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 border-border">{trace.duration}</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-[9px] text-muted-foreground">{spans.length}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="font-mono text-xs">{spans.length} spans · {totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K tokens` : "sem tokens"}</TooltipContent>
                      </Tooltip>
                      <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>

                    {trace.error && (
                      <div className="rounded bg-rose/10 border border-rose/20 px-2 py-1.5">
                        <p className="font-mono text-[10px] text-rose">{trace.error}</p>
                      </div>
                    )}

                    {isExpanded && spans.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border">
                        {/* Waterfall header */}
                        <div className="flex items-center gap-2 px-1 pb-1">
                          <span className="font-mono text-[9px] text-muted-foreground w-28">Span</span>
                          <span className="font-mono text-[9px] text-muted-foreground flex-1">Waterfall</span>
                          <span className="font-mono text-[9px] text-muted-foreground w-14 text-right">Duração</span>
                          <span className="font-mono text-[9px] text-muted-foreground w-14 text-right">Tokens</span>
                        </div>
                        {spans.map((span: any, i: number) => {
                          const ms = parseFloat(span.duration) * 1000 || 0;
                          const pct = (ms / maxMs) * 100;
                          const offset = i * 8; // waterfall offset
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 hover:bg-muted/20 rounded px-1 py-0.5 transition-colors">
                                  {statusIcon[(span.status as TraceStatus) ?? "success"]}
                                  <span className="font-mono text-[10px] text-foreground w-28 truncate">{span.name}</span>
                                  <div className="flex-1 h-4 bg-muted/30 rounded-sm overflow-hidden relative">
                                    <div
                                      className={`absolute top-0.5 h-3 rounded-sm ${spanBarColor[(span.status as TraceStatus) ?? "success"]} transition-all`}
                                      style={{ width: `${Math.max(pct, 4)}%`, left: `${Math.min(offset, 40)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[9px] text-muted-foreground w-14 text-right">{span.duration}</span>
                                  <span className="font-mono text-[9px] text-cyan w-14 text-right">{span.tokens ? `${(span.tokens / 1000).toFixed(1)}K` : "—"}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="font-mono text-xs space-y-1">
                                <p className="font-semibold">{span.name}</p>
                                <p className="text-muted-foreground">{span.status} · {span.duration} · {span.model ?? "—"}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    )}

                    {isExpanded && (
                      <div className="flex items-center gap-4 pt-2 border-t border-border font-mono text-[10px] text-muted-foreground">
                        <span>Total: {totalTokens > 0 ? `${(totalTokens / 1000).toFixed(1)}K tokens` : "—"}</span>
                        <span>{spans.length} spans</span>
                        <span>{new Date(trace.created_at).toLocaleString("pt-BR")}</span>
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
