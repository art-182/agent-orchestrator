import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useTraces } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

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

const Traces = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: traces, isLoading } = useTraces();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Traces & Erros</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const list = traces ?? [];
  const errors = list.filter((t) => t.status === "error").length;
  const warnings = list.filter((t) => t.status === "warning").length;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Traces & Erros</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Traces", value: list.length.toString(), color: "text-foreground" },
          { label: "Erros", value: errors.toString(), color: "text-rose" },
          { label: "Warnings", value: warnings.toString(), color: "text-amber" },
          { label: "Total", value: `${list.length}`, color: "text-cyan" },
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

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-2">
          {list.map((trace) => {
            const isExpanded = expanded === trace.id;
            const agent = trace.agents as any;
            const spans = (trace.spans as any[]) ?? [];
            const maxMs = Math.max(...spans.map((s: any) => parseFloat(s.duration) * 1000 || 1), 1);

            return (
              <Card
                key={trace.id}
                className={`border-border bg-card cursor-pointer transition-colors hover:border-muted-foreground/30 ${statusColor[(trace.status as TraceStatus) ?? "success"]}`}
                onClick={() => setExpanded(isExpanded ? null : trace.id)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {statusIcon[(trace.status as TraceStatus) ?? "success"]}
                    <span className="font-mono text-xs font-semibold text-foreground flex-1">{trace.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                    <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 border-border">{trace.duration}</Badge>
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[9px] text-muted-foreground">{spans.length}</span>
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {trace.error && (
                    <div className="rounded bg-rose/10 border border-rose/20 px-2 py-1.5">
                      <p className="font-mono text-[10px] text-rose">{trace.error}</p>
                    </div>
                  )}

                  {isExpanded && spans.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-border">
                      {spans.map((span: any, i: number) => {
                        const ms = parseFloat(span.duration) * 1000 || 0;
                        const pct = (ms / maxMs) * 100;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            {statusIcon[(span.status as TraceStatus) ?? "success"]}
                            <span className="font-mono text-[10px] text-foreground w-28 truncate">{span.name}</span>
                            <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                              <div className={`h-full rounded-sm ${spanBarColor[(span.status as TraceStatus) ?? "success"]}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                            </div>
                            <span className="font-mono text-[9px] text-muted-foreground w-12 text-right">{span.duration}</span>
                            {span.model && <span className="font-mono text-[8px] text-muted-foreground">{span.model}</span>}
                            {span.tokens && <span className="font-mono text-[8px] text-cyan">{(span.tokens / 1000).toFixed(1)}K</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </PageTransition>
  );
};

export default Traces;
