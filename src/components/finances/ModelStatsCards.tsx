import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { useModelMetrics } from "./ModelObservability";

const formatK = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

/** Model stats cards — shows per-model call count, tokens, cost, cache */
const ModelStatsCards = () => {
  const { models, totalCalls } = useModelMetrics();

  const totalTokens = models.reduce((s, m) => s + m.inputTokens + m.outputTokens, 0);
  const totalCache = models.reduce((s, m) => s + m.cacheRead, 0);
  const cacheRate = (totalTokens + totalCache) > 0
    ? Math.round((totalCache / (totalTokens + totalCache)) * 100)
    : 0;

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground tracking-tight">
          <div className="flex items-center gap-2.5">
            <div className="bg-cyan/10 text-cyan p-1.5 rounded-lg">
              <Cpu className="h-4 w-4" />
            </div>
            Modelos Ativos
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-normal tabular-nums">
            <span>{formatK(totalTokens)} tokens</span>
            <span>·</span>
            <span className="text-terminal">{cacheRate}% cache</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="space-y-3">
          {models.map((m) => {
            const pctCalls = totalCalls > 0 ? Math.round((m.calls / totalCalls) * 100) : 0;
            return (
              <div
                key={m.model}
                className="p-3 rounded-xl border border-border/30 bg-muted/10 space-y-2"
              >
                {/* Header: model name + cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-[13px] font-semibold text-foreground">{m.model}</span>
                  </div>
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: m.color }}>
                    ${m.totalCost.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar: share of total calls */}
                <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pctCalls}%`, backgroundColor: m.color }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground tabular-nums">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-foreground/80">{m.calls} calls</span>
                    <span>{pctCalls}%</span>
                    <span>·</span>
                    <span>{formatK(m.inputTokens)} in</span>
                    <span>{formatK(m.outputTokens)} out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.cacheRead > 0 && (
                      <span className="text-terminal">{formatK(m.cacheRead)} cached</span>
                    )}
                    <span>${m.calls > 0 ? (m.totalCost / m.calls).toFixed(4) : "0"}/call</span>
                  </div>
                </div>
              </div>
            );
          })}

          {models.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Sem dados de traces.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelStatsCards;
