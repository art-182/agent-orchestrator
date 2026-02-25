import { parseJsonb } from "@/lib/parse-jsonb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowRightLeft, Shield, Zap, Clock, Activity, TrendingUp } from "lucide-react";
import type { ProviderLimit, RateLimitEvent, CostAnomaly } from "@/lib/finance-types";

const QuotaBar = ({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) => {
  const u = used ?? 0;
  const l = limit ?? 1;
  const pct = l > 0 ? (u / l) * 100 : 0;
  const color = pct > 90 ? "text-rose" : pct > 70 ? "text-amber" : "text-terminal";
  const barColor = pct > 90 ? "bg-rose" : pct > 70 ? "bg-amber" : "bg-terminal";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={`${color} tabular-nums`}>
          {u.toLocaleString()}/{l.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
};

const providerColor: Record<string, string> = {
  "Antigravity": "border-violet/20",
  "Vercel AI Gateway": "border-cyan/20",
  "Google CLI": "border-amber/20",
  "Google Vertex": "border-amber/20",
  "Minimax": "border-rose/20",
  // Legacy names (fallback)
  OpenAI: "border-terminal/20",
  Anthropic: "border-violet/20",
  Google: "border-amber/20",
};

const ProviderLimitCard = ({ provider }: { provider: ProviderLimit }) => {
  const budgetPct = (provider.dailySpent / provider.dailyBudget) * 100;

  return (
    <Card className={`border-border/50 bg-card surface-elevated ${providerColor[provider.provider] ?? ""}`}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2 tracking-tight">
            {provider.provider}
            <Badge variant="outline" className="text-[9px] px-2 py-0 border-border/50 rounded-full font-medium">
              {provider.tier}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${provider.uptime > 99.5 ? "bg-terminal" : provider.uptime > 98 ? "bg-amber" : "bg-rose"} animate-pulse-dot`} />
            <span className="text-[10px] text-muted-foreground tabular-nums">{provider.uptime}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3">
        <QuotaBar label="RPM" used={provider.rpmUsed} limit={provider.rpmLimit} unit="req/min" />
        <QuotaBar label="TPM" used={provider.tpmUsed} limit={provider.tpmLimit} unit="tok/min" />

        <div className="rounded-2xl border border-border/40 bg-muted/10 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground font-medium">Budget Diário</span>
            <span className={`tabular-nums ${budgetPct > 85 ? "text-amber" : "text-foreground"}`}>
              ${(provider.dailySpent ?? 0).toFixed(2)} / ${provider.dailyBudget ?? 0}
            </span>
          </div>
          <Progress value={budgetPct} className="h-1" />
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground font-medium">Budget Mensal</span>
            <span className="text-foreground tabular-nums">
              ${(provider.monthlySpent ?? 0).toFixed(2)} / ${provider.monthlyBudget ?? 0}
            </span>
          </div>
          <Progress value={((provider.monthlySpent ?? 0) / (provider.monthlyBudget || 1)) * 100} className="h-1" />
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Avg: {provider.avgLatency}ms</span>
          <span className="text-muted-foreground tabular-nums">P99: {provider.p99Latency}ms</span>
          {provider.rateLimitHits24h > 0 && (
            <span className="text-amber flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />{provider.rateLimitHits24h} rate limits
            </span>
          )}
        </div>

        {provider.fallbackProvider && (
          <div className="rounded-2xl border border-border/40 bg-muted/10 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px]">
              <ArrowRightLeft className="h-3 w-3 text-cyan" />
              <span className="text-muted-foreground">Fallback:</span>
              <span className="text-foreground font-medium">{provider.fallbackProvider} → {provider.fallbackModel}</span>
              {provider.fallbackActivations24h > 0 && (
                <Badge variant="outline" className="ml-auto text-[8px] px-1.5 py-0 bg-amber/10 text-amber border-amber/20 rounded-full font-medium">
                  {provider.fallbackActivations24h}x ativado 24h
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator className="bg-border/50" />
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-medium">Modelos</p>
          {provider.models.map((m) => (
            <div key={m.model} className="rounded-xl border border-border/40 p-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-foreground font-semibold">{m.model}</span>
                <span className="text-muted-foreground tabular-nums">{((m.contextWindow ?? 0) / 1000).toFixed(0)}K ctx</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <QuotaBar label="RPM" used={m.rpmUsed} limit={m.rpmLimit} unit="" />
                <QuotaBar label="TPM" used={m.tpmUsed} limit={m.tpmLimit} unit="" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const eventTypeIcon: Record<string, React.ReactNode> = {
  rate_limit: <AlertTriangle className="h-3 w-3 text-amber" />,
  timeout: <Clock className="h-3 w-3 text-rose" />,
  error: <Shield className="h-3 w-3 text-rose" />,
  fallback_activated: <ArrowRightLeft className="h-3 w-3 text-cyan" />,
};

const eventTypeBg: Record<string, string> = {
  rate_limit: "bg-amber/5",
  timeout: "bg-rose/5",
  error: "bg-rose/5",
  fallback_activated: "bg-cyan/5",
};

interface ProviderLimitsViewProps {
  providers: ProviderLimit[];
  events: RateLimitEvent[];
  anomalies: CostAnomaly[];
}

const ProviderLimitsView = ({ providers, events, anomalies }: ProviderLimitsViewProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Zap, label: "Rate Limits 24h", value: providers.reduce((s, p) => s + p.rateLimitHits24h, 0).toString(), color: "text-amber" },
        { icon: ArrowRightLeft, label: "Fallbacks 24h", value: providers.reduce((s, p) => s + p.fallbackActivations24h, 0).toString(), color: "text-cyan" },
        { icon: Activity, label: "Uptime Médio", value: `${(providers.reduce((s, p) => s + (p.uptime ?? 0), 0) / (providers.length || 1)).toFixed(1)}%`, color: "text-terminal" },
        { icon: TrendingUp, label: "Anomalias Custo", value: anomalies.length.toString(), color: anomalies.length > 0 ? "text-rose" : "text-terminal" },
      ].map((s) => (
        <Card key={s.label} className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-3.5 flex items-center gap-3">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {providers.map((p) => (
        <ProviderLimitCard key={p.provider} provider={p} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/50 bg-card surface-elevated">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Eventos de Rate Limit & Fallback</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <ScrollArea className="h-[280px]">
            <div className="space-y-1">
              {events.map((e, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-xl px-2.5 py-2 text-[10px] ${eventTypeBg[e.type]}`}>
                  {eventTypeIcon[e.type]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{e.timestamp}</span>
                      <span className="text-foreground font-semibold">{e.provider}</span>
                      <span className="text-muted-foreground">{e.model}</span>
                    </div>
                    <p className="text-foreground truncate">{e.detail}</p>
                    {e.fallbackUsed && (
                      <p className="text-cyan">→ fallback: {e.fallbackUsed}</p>
                    )}
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap tabular-nums">{e.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card surface-elevated">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Anomalias de Custo</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] text-muted-foreground font-medium">Data</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-medium">Provider</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-medium text-right">Esperado</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-medium text-right">Real</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-medium text-right">Desvio</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-medium">Razão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((a, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell className="text-[10px] text-foreground">{a.date}</TableCell>
                  <TableCell className="text-[10px] text-foreground">{a.provider}</TableCell>
                  <TableCell className="text-[10px] text-right text-muted-foreground tabular-nums">${(a.expectedCost ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-[10px] text-right text-foreground tabular-nums">${(a.actualCost ?? 0).toFixed(2)}</TableCell>
                  <TableCell className={`text-[10px] text-right font-semibold tabular-nums ${(a.deviation ?? 0) > 0 ? "text-rose" : "text-terminal"}`}>
                    {(a.deviation ?? 0) > 0 ? "+" : ""}{(a.deviation ?? 0).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground max-w-[120px] truncate">{a.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ProviderLimitsView;
