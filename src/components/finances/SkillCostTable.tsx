import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import type { SkillCost } from "@/lib/finance-data";

interface SkillCostTableProps {
  data: SkillCost[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
  Development: { bg: "bg-terminal/10", text: "text-terminal", border: "border-terminal/30" },
  Quality: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/30" },
  Security: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/30" },
  DevOps: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/30" },
  Strategy: { bg: "bg-violet/10", text: "text-violet", border: "border-violet/30" },
  Analytics: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

const SkillCostTable = ({ data }: SkillCostTableProps) => {
  const maxExec = Math.max(...data.map((s) => s.executions));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.map((s) => {
        const cat = categoryColor[s.category] ?? categoryColor.Analytics;
        const failRate = 100 - s.successRate;
        const costPerExec = s.executions > 0 ? (s.cost / s.executions) : 0;

        return (
          <Card key={s.skill} className={`border-border bg-card hover:border-muted-foreground/30 transition-colors`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-semibold text-foreground">{s.skill}</p>
                  <Badge variant="outline" className={`rounded px-1.5 py-0 text-[9px] border font-mono ${cat.bg} ${cat.text} ${cat.border}`}>
                    {s.category}
                  </Badge>
                </div>
                <span className="font-mono text-lg font-bold text-terminal">${s.cost.toFixed(2)}</span>
              </div>

              {/* Execution bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-muted-foreground">Execuções</span>
                  <span className="text-foreground">{s.executions.toLocaleString()}</span>
                </div>
                <Progress value={(s.executions / maxExec) * 100} className="h-1" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="font-mono text-[9px] text-muted-foreground">Tokens</p>
                  <p className="font-mono text-xs font-semibold text-foreground">{formatTokens(s.tokens)}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-muted-foreground">$/Exec</p>
                  <p className="font-mono text-xs font-semibold text-foreground">${costPerExec.toFixed(3)}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-muted-foreground">Sucesso</p>
                  <div className="flex items-center gap-1">
                    {s.successRate >= 95 ? (
                      <CheckCircle className="h-3 w-3 text-terminal" />
                    ) : (
                      <XCircle className="h-3 w-3 text-amber" />
                    )}
                    <span className={`font-mono text-xs font-semibold ${s.successRate >= 95 ? "text-terminal" : s.successRate >= 90 ? "text-amber" : "text-rose"}`}>
                      {s.successRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Success/Failure micro bar */}
              <div className="flex h-1 rounded-full overflow-hidden">
                <div className="bg-terminal" style={{ width: `${s.successRate}%` }} />
                <div className="bg-rose" style={{ width: `${failRate}%` }} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SkillCostTable;
