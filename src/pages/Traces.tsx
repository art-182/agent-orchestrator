import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle, ChevronRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

type TraceStatus = "success" | "error" | "warning" | "timeout";

interface TraceSpan {
  name: string;
  duration: string;
  status: TraceStatus;
  model?: string;
  tokens?: number;
}

interface Trace {
  id: string;
  name: string;
  agent: string;
  emoji: string;
  status: TraceStatus;
  duration: string;
  timestamp: string;
  spans: TraceSpan[];
  error?: string;
}

const traces: Trace[] = [
  {
    id: "tr1", name: "code_write → jwt-middleware.ts", agent: "Coder", emoji: "💻", status: "success", duration: "12.3s", timestamp: "14:32:01",
    spans: [
      { name: "context_load", duration: "0.8s", status: "success" },
      { name: "llm_call", duration: "8.2s", status: "success", model: "gpt-4o", tokens: 34200 },
      { name: "code_validate", duration: "1.1s", status: "success" },
      { name: "file_write", duration: "0.3s", status: "success" },
      { name: "test_run", duration: "1.9s", status: "success" },
    ],
  },
  {
    id: "tr2", name: "security_scan → npm audit", agent: "Scout", emoji: "🔍", status: "warning", duration: "6.4s", timestamp: "14:31:45",
    spans: [
      { name: "dep_collect", duration: "0.5s", status: "success" },
      { name: "vuln_check", duration: "4.2s", status: "warning" },
      { name: "cve_lookup", duration: "1.2s", status: "success", tokens: 1800 },
      { name: "report_gen", duration: "0.5s", status: "success" },
    ],
  },
  {
    id: "tr3", name: "deploy_staging → v2.3.1", agent: "Deployer", emoji: "🚀", status: "success", duration: "32.1s", timestamp: "14:31:22",
    spans: [
      { name: "build", duration: "12.4s", status: "success" },
      { name: "image_push", duration: "8.2s", status: "success" },
      { name: "blue_green_swap", duration: "3.1s", status: "success" },
      { name: "health_check", duration: "5.2s", status: "success" },
      { name: "dns_update", duration: "3.2s", status: "success" },
    ],
  },
  {
    id: "tr4", name: "metrics_collect → weekly report", agent: "Analyst", emoji: "📊", status: "error", duration: "30.0s", timestamp: "14:30:01",
    error: "TimeoutError: API metrics.internal.io não respondeu em 30s. Endpoint: /v2/aggregate. Retry 3/3 falhou.",
    spans: [
      { name: "api_call_1", duration: "10.0s", status: "timeout" },
      { name: "retry_1", duration: "10.0s", status: "timeout" },
      { name: "retry_2", duration: "10.0s", status: "timeout" },
    ],
  },
  {
    id: "tr5", name: "code_review → PR #481", agent: "Reviewer", emoji: "📝", status: "success", duration: "11.2s", timestamp: "14:30:33",
    spans: [
      { name: "diff_parse", duration: "0.4s", status: "success" },
      { name: "context_load", duration: "1.2s", status: "success" },
      { name: "llm_review", duration: "8.8s", status: "success", model: "claude-3.5-sonnet", tokens: 3200 },
      { name: "comment_post", duration: "0.8s", status: "success" },
    ],
  },
  {
    id: "tr6", name: "task_delegate → Scout security audit", agent: "OraCLI Main", emoji: "🧠", status: "success", duration: "0.8s", timestamp: "14:30:58",
    spans: [
      { name: "agent_select", duration: "0.2s", status: "success", model: "gpt-4o", tokens: 980 },
      { name: "task_create", duration: "0.3s", status: "success" },
      { name: "notify_agent", duration: "0.3s", status: "success" },
    ],
  },
  {
    id: "tr7", name: "code_write → e2e-tests.spec.ts", agent: "Coder", emoji: "💻", status: "error", duration: "15.2s", timestamp: "14:25:01",
    error: "AssertionError: Expected 200 but got 401 on /api/auth/refresh. Token validation failed in test environment.",
    spans: [
      { name: "context_load", duration: "0.9s", status: "success" },
      { name: "llm_call", duration: "10.1s", status: "success", model: "gpt-4o", tokens: 42100 },
      { name: "code_validate", duration: "0.8s", status: "success" },
      { name: "test_run", duration: "3.4s", status: "error" },
    ],
  },
  {
    id: "tr8", name: "plan_create → Deploy Pipeline v2.3.1", agent: "OraCLI Main", emoji: "🧠", status: "success", duration: "4.5s", timestamp: "14:24:15",
    spans: [
      { name: "context_gather", duration: "0.8s", status: "success" },
      { name: "llm_plan", duration: "3.2s", status: "success", model: "gpt-4o", tokens: 8900 },
      { name: "task_breakdown", duration: "0.5s", status: "success" },
    ],
  },
];

const statusIcon: Record<TraceStatus, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5 text-terminal" />,
  error: <XCircle className="h-3.5 w-3.5 text-rose" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber" />,
  timeout: <Clock className="h-3.5 w-3.5 text-rose" />,
};

const statusColor: Record<TraceStatus, string> = {
  success: "border-terminal/30",
  error: "border-rose/30",
  warning: "border-amber/30",
  timeout: "border-rose/30",
};

const spanBarColor: Record<TraceStatus, string> = {
  success: "bg-terminal",
  error: "bg-rose",
  warning: "bg-amber",
  timeout: "bg-rose/50",
};

const Traces = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const errors = traces.filter((t) => t.status === "error").length;
  const warnings = traces.filter((t) => t.status === "warning").length;
  const avgDuration = (traces.reduce((s, t) => s + parseFloat(t.duration), 0) / traces.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Traces & Erros</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Traces", value: traces.length.toString(), color: "text-foreground" },
          { label: "Erros", value: errors.toString(), color: "text-rose" },
          { label: "Warnings", value: warnings.toString(), color: "text-amber" },
          { label: "Duração Média", value: `${avgDuration}s`, color: "text-cyan" },
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
        <div className="space-y-2">
          {traces.map((trace) => {
            const isExpanded = expanded === trace.id;
            const maxMs = Math.max(...trace.spans.map((s) => parseFloat(s.duration) * 1000));

            return (
              <Card
                key={trace.id}
                className={`border-border bg-card cursor-pointer transition-colors hover:border-muted-foreground/30 ${statusColor[trace.status]}`}
                onClick={() => setExpanded(isExpanded ? null : trace.id)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {statusIcon[trace.status]}
                    <span className="font-mono text-xs font-semibold text-foreground flex-1">{trace.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{trace.emoji} {trace.agent}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{trace.timestamp}</span>
                    <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 border-border">{trace.duration}</Badge>
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[9px] text-muted-foreground">{trace.spans.length}</span>
                    <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {trace.error && (
                    <div className="rounded bg-rose/10 border border-rose/20 px-2 py-1.5">
                      <p className="font-mono text-[10px] text-rose">{trace.error}</p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="space-y-1 pt-2 border-t border-border">
                      {trace.spans.map((span, i) => {
                        const ms = parseFloat(span.duration) * 1000;
                        const pct = (ms / maxMs) * 100;
                        return (
                          <div key={i} className="flex items-center gap-2">
                            {statusIcon[span.status]}
                            <span className="font-mono text-[10px] text-foreground w-28 truncate">{span.name}</span>
                            <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                              <div className={`h-full rounded-sm ${spanBarColor[span.status]}`} style={{ width: `${Math.max(pct, 3)}%` }} />
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
    </div>
  );
};

export default Traces;
