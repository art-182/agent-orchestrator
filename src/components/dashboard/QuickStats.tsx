import { parseJsonb } from "@/lib/parse-jsonb";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useAgents, useDailyCosts } from "@/hooks/use-supabase-data";
import { useRealTimeROI } from "@/hooks/use-realtime-roi";

const QuickStats = () => {
  const { data: agents } = useAgents();
  const { data: costs } = useDailyCosts();
  const roiData = useRealTimeROI();

  const list = agents ?? [];
  const costData = (costs ?? []).slice(-7).map((c) => ({ v: c.google ?? 0 }));

  const totalTasks = list.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
  const avgError = list.length > 0 ? (list.reduce((s, a) => s + (a.error_rate ?? 0), 0) / list.length).toFixed(1) : "0";

  const totalROISavings = roiData.monthlyValue;

  return (
    <Card className="border-border/50 bg-card surface-elevated flex-1 flex flex-col">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground font-medium">Custo 7 Dias</span>
        </div>
        <div className="h-[52px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={costData.length > 0 ? costData : [{ v: 0 }]}>
              <defs>
                <linearGradient id="costMiniGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(158, 64%, 52%)" fill="url(#costMiniGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 pt-1">
          {[
            { label: "Total Tarefas", value: totalTasks.toLocaleString(), color: "text-terminal" },
            { label: "Taxa Erro", value: `${avgError}%`, color: parseFloat(avgError) < 2 ? "text-terminal" : "text-amber" },
            { label: "Economia/mês", value: `$${(totalROISavings / 1000).toFixed(1)}K`, color: "text-cyan" },
            { label: "Agentes Ativos", value: `${list.filter((a) => a.status !== "error").length}/${list.length}`, color: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">{s.label}</span>
              <span className={`font-semibold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
