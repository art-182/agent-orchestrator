import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, Clock, Zap, DollarSign } from "lucide-react";
import type { ToolCost } from "@/lib/finance-data";

interface ToolCostTableProps {
  data: ToolCost[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const ToolCostTable = ({ data }: ToolCostTableProps) => {
  const maxCost = Math.max(...data.map((t) => t.cost));
  const totalCost = data.reduce((s, t) => s + t.cost, 0);
  const totalCalls = data.reduce((s, t) => s + t.calls, 0);
  const totalTokens = data.reduce((s, t) => s + t.tokens, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Wrench, label: "Total Tools", value: data.length.toString(), color: "text-cyan" },
          { icon: Zap, label: "Total Chamadas", value: totalCalls.toLocaleString(), color: "text-violet" },
          { icon: DollarSign, label: "Custo Total", value: `$${totalCost.toFixed(2)}`, color: "text-terminal" },
          { icon: Clock, label: "Tokens Consumidos", value: formatTokens(totalTokens), color: "text-amber" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 bg-card surface-elevated">
            <CardContent className="p-3.5 flex items-center gap-3">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((t) => {
          const pct = (t.cost / maxCost) * 100;
          const costPer = t.calls > 0 ? (t.cost / t.calls) : 0;

          return (
            <Card key={`${t.tool}-${t.agent}`} className="border-border/50 bg-card surface-elevated group hover:border-border transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-cyan">{t.tool}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">via {t.agent}</p>
                  </div>
                  <span className="text-lg font-bold text-terminal tabular-nums">${t.cost.toFixed(2)}</span>
                </div>

                <Progress value={pct} className="h-1" />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-medium">Chamadas</p>
                    <p className="text-[12px] font-semibold text-foreground tabular-nums">{t.calls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-medium">Tokens</p>
                    <p className="text-[12px] font-semibold text-foreground tabular-nums">{formatTokens(t.tokens)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-medium">$/Chamada</p>
                    <p className="text-[12px] font-semibold text-foreground tabular-nums">${costPer.toFixed(3)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />Avg: {t.avgDuration}
                  </span>
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-border/50 rounded-full font-medium">
                    {((t.cost / totalCost) * 100).toFixed(1)}% do total
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ToolCostTable;
