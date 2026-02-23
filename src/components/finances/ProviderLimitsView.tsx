import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowRightLeft,
  Shield,
  Zap,
  Clock,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { ProviderLimit, RateLimitEvent, CostAnomaly } from "@/lib/finance-data";

// ── Provider Quota Card ────────────────────────────────

const QuotaBar = ({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) => {
  const pct = (used / limit) * 100;
  const color = pct > 90 ? "text-rose" : pct > 70 ? "text-amber" : "text-terminal";
  const barColor = pct > 90 ? "bg-rose" : pct > 70 ? "bg-amber" : "bg-terminal";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between font-mono text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={color}>
          {used.toLocaleString()}/{limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
};

const providerColor: Record<string, string> = {
  OpenAI: "border-terminal/30",
  Anthropic: "border-violet/30",
  Google: "border-amber/30",
};

const ProviderLimitCard = ({ provider }: { provider: ProviderLimit }) => {
  const budgetPct = (provider.dailySpent / provider.dailyBudget) * 100;

  return (
    <Card className={`border-border bg-card ${providerColor[provider.provider] ?? ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm text-foreground flex items-center gap-2">
            {provider.provider}
            <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 border-border">
              {provider.tier}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${provider.uptime > 99.5 ? "bg-terminal" : provider.uptime > 98 ? "bg-amber" : "bg-rose"} animate-pulse-dot`} />
            <span className="font-mono text-[10px] text-muted-foreground">{provider.uptime}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Rate limits */}
        <QuotaBar label="RPM" used={provider.rpmUsed} limit={provider.rpmLimit} unit="req/min" />
        <QuotaBar label="TPM" used={provider.tpmUsed} limit={provider.tpmLimit} unit="tok/min" />

        {/* Budget */}
        <div className="rounded border border-border bg-muted/20 p-2 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">Budget Diário</span>
            <span className={budgetPct > 85 ? "text-amber" : "text-foreground"}>
              ${provider.dailySpent.toFixed(2)} / ${provider.dailyBudget}
            </span>
          </div>
          <Progress value={budgetPct} className="h-1" />
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">Budget Mensal</span>
            <span className="text-foreground">
              ${provider.monthlySpent.toFixed(2)} / ${provider.monthlyBudget}
            </span>
          </div>
          <Progress value={(provider.monthlySpent / provider.monthlyBudget) * 100} className="h-1" />
        </div>

        {/* Latency */}
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Avg: {provider.avgLatency}ms</span>
          <span className="text-muted-foreground">P99: {provider.p99Latency}ms</span>
          {provider.rateLimitHits24h > 0 && (
            <span className="text-amber flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />{provider.rateLimitHits24h} rate limits
            </span>
          )}
        </div>

        {/* Fallback */}
        {provider.fallbackProvider && (
          <div className="rounded border border-border bg-muted/20 p-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <ArrowRightLeft className="h-3 w-3 text-cyan" />
              <span className="text-muted-foreground">Fallback:</span>
              <span className="text-foreground">{provider.fallbackProvider} → {provider.fallbackModel}</span>
              {provider.fallbackActivations24h > 0 && (
                <Badge variant="outline" className="ml-auto font-mono text-[8px] px-1 py-0 bg-amber/15 text-amber border-amber/30">
                  {provider.fallbackActivations24h}x ativado 24h
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Model quotas */}
        <Separator className="bg-border" />
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground">Modelos</p>
          {provider.models.map((m) => (
            <div key={m.model} className="rounded border border-border/50 p-1.5 space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-foreground font-semibold">{m.model}</span>
                <span className="text-muted-foreground">{(m.contextWindow / 1000).toFixed(0)}K ctx</span>
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

// ── Rate Limit Events Log ──────────────────────────────

const eventTypeIcon: Record<string, React.ReactNode> = {
  rate_limit: <AlertTriangle className="h-3 w-3 text-amber" />,
  timeout: <Clock className="h-3 w-3 text-rose" />,
  error: <Shield className="h-3 w-3 text-rose" />,
  fallback_activated: <ArrowRightLeft className="h-3 w-3 text-cyan" />,
};

const eventTypeBg: Record<string, string> = {
  rate_limit: "bg-amber/10",
  timeout: "bg-rose/10",
  error: "bg-rose/10",
  fallback_activated: "bg-cyan/10",
};

// ── Main Component ─────────────────────────────────────

interface ProviderLimitsViewProps {
  providers: ProviderLimit[];
  events: RateLimitEvent[];
  anomalies: CostAnomaly[];
}

const ProviderLimitsView = ({ providers, events, anomalies }: ProviderLimitsViewProps) => (
  <div className="space-y-6">
    {/* Summary stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Zap, label: "Rate Limits 24h", value: providers.reduce((s, p) => s + p.rateLimitHits24h, 0).toString(), color: "text-amber" },
        { icon: ArrowRightLeft, label: "Fallbacks 24h", value: providers.reduce((s, p) => s + p.fallbackActivations24h, 0).toString(), color: "text-cyan" },
        { icon: Activity, label: "Uptime Médio", value: `${(providers.reduce((s, p) => s + p.uptime, 0) / providers.length).toFixed(1)}%`, color: "text-terminal" },
        { icon: TrendingUp, label: "Anomalias Custo", value: anomalies.length.toString(), color: anomalies.length > 0 ? "text-rose" : "text-terminal" },
      ].map((s) => (
        <Card key={s.label} className="border-border bg-card">
          <CardContent className="p-3 flex items-center gap-3">
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <div>
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Provider cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {providers.map((p) => (
        <ProviderLimitCard key={p.provider} provider={p} />
      ))}
    </div>

    {/* Events + Anomalies side by side */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rate Limit Events */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-foreground">Eventos de Rate Limit & Fallback</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[280px]">
            <div className="space-y-1">
              {events.map((e, i) => (
                <div key={i} className={`flex items-start gap-2 rounded px-2 py-1.5 font-mono text-[10px] ${eventTypeBg[e.type]}`}>
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
                  <span className="text-muted-foreground whitespace-nowrap">{e.latencyMs}ms</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Cost Anomalies */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-foreground">Anomalias de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-[10px] text-muted-foreground">Data</TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground">Provider</TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground text-right">Esperado</TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground text-right">Real</TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground text-right">Desvio</TableHead>
                <TableHead className="font-mono text-[10px] text-muted-foreground">Razão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.map((a, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="font-mono text-[10px] text-foreground">{a.date}</TableCell>
                  <TableCell className="font-mono text-[10px] text-foreground">{a.provider}</TableCell>
                  <TableCell className="font-mono text-[10px] text-right text-muted-foreground">${a.expectedCost.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-[10px] text-right text-foreground">${a.actualCost.toFixed(2)}</TableCell>
                  <TableCell className={`font-mono text-[10px] text-right font-semibold ${a.deviation > 0 ? "text-rose" : "text-terminal"}`}>
                    {a.deviation > 0 ? "+" : ""}{a.deviation.toFixed(0)}%
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[120px] truncate">{a.reason}</TableCell>
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
