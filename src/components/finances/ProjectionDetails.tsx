import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Shield, Zap, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDailyCosts, useAgents, useTraces, useDailyTokenUsage } from "@/hooks/use-supabase-data";
import { calculateROI } from "@/lib/roi-calculator";

const ProjectionDetails = () => {
  const { data: dbCosts } = useDailyCosts();
  const { data: agents } = useAgents();
  const { data: traces } = useTraces();
  const { data: tokenUsage } = useDailyTokenUsage();

  const dailyCosts = dbCosts ?? [];
  const agentList = agents ?? [];
  const traceList = traces ?? [];

  // ── Centralized ROI ──
  const roi = calculateROI(agentList, dailyCosts);

  const totalGoogle = dailyCosts.reduce((s, c) => s + (c.google ?? 0), 0);
  const totalAnthro = dailyCosts.reduce((s, c) => s + (c.anthropic ?? 0), 0);
  const totalOpenAI = dailyCosts.reduce((s, c) => s + (c.openai ?? 0), 0);

  const successRate = traceList.length > 0
    ? (traceList.filter(t => t.status === "success").length / traceList.length * 100)
    : 100;

  // ── ROI Metrics ──
  const roiMetrics = [
    { label: "Horas Economizadas", value: `${roi.totalHoursPerWeek.toFixed(1)}h/sem`, subtext: `~$${(roi.totalHoursPerWeek * roi.avgHumanHourRate).toFixed(0)} em valor humano/sem`, icon: Clock, color: "text-terminal" },
    { label: "ROI Atual", value: `${roi.roiMultiplier.toFixed(1)}x`, subtext: `custo $${roi.monthlyProjection.toFixed(0)}/mês · valor $${roi.monthlyValue.toFixed(0)}/mês`, icon: TrendingUp, color: "text-terminal" },
    { label: "Custo por Tarefa", value: `$${roi.costPerTask.toFixed(4)}`, subtext: `média · ${roi.totalTasks} tarefas`, icon: Zap, color: "text-cyan" },
    { label: "Taxa de Sucesso", value: `${successRate.toFixed(1)}%`, subtext: `${traceList.length} chamadas LLM`, icon: Target, color: "text-violet" },
  ];

  // ── Budget Alerts ──
  const mp = roi.monthlyProjection;
  const days = roi.days;
  const budgetAlerts = [
    { label: "Budget Mensal", budget: 500, spent: mp, status: mp > 450 ? "warning" as const : "ok" as const },
    { label: "Google (Gemini)", budget: 400, spent: totalGoogle * (30 / days), status: totalGoogle * (30 / days) > 350 ? "warning" as const : "ok" as const },
    { label: "Anthropic (Claude)", budget: 100, spent: totalAnthro * (30 / days), status: totalAnthro * (30 / days) > 85 ? "warning" as const : "ok" as const },
    { label: "OpenAI", budget: 50, spent: totalOpenAI * (30 / days), status: "ok" as const },
  ];

  const alertStatusIcon = {
    ok: <CheckCircle className="h-3.5 w-3.5 text-terminal" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 text-amber" />,
    critical: <Shield className="h-3.5 w-3.5 text-rose" />,
  };

  // ── Scenarios ──
  const scenarios = [
    { label: "Conservador", description: "Manter uso atual, sem novos agentes", monthlyCost: Math.round(mp * 0.8), annualCost: Math.round(mp * 0.8 * 12), savings: Math.round(mp * 0.2 * 12), risk: "low" as const },
    { label: "Uso Atual", description: `Projeção baseada em ${days}d de dados reais`, monthlyCost: Math.round(mp), annualCost: Math.round(mp * 12), savings: 0, risk: "medium" as const },
    { label: "Otimizado (Cache++)", description: "Aumentar cache hit rate para 80%+", monthlyCost: Math.round(mp * 0.5), annualCost: Math.round(mp * 0.5 * 12), savings: Math.round(mp * 0.5 * 12), risk: "low" as const },
    { label: "Escala Total", description: "+5 agentes, pipeline 24/7 com Pro", monthlyCost: Math.round(mp * 2.5), annualCost: Math.round(mp * 2.5 * 12), savings: -Math.round(mp * 1.5 * 12), risk: "high" as const },
  ];

  const riskColor = { low: "text-terminal", medium: "text-amber", high: "text-rose" };
  const riskBg = { low: "bg-terminal/10", medium: "bg-amber/10", high: "bg-rose/10" };

  // ── Efficiency by Day ──
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const effByDay: Record<string, { cost: number; count: number }> = {};
  dayNames.forEach(d => { effByDay[d] = { cost: 0, count: 0 }; });

  dailyCosts.forEach((c) => {
    try {
      const d = new Date(c.date);
      const dayName = dayNames[d.getUTCDay()];
      effByDay[dayName].cost += c.google ?? 0;
      effByDay[dayName].count += 1;
    } catch {}
  });

  const efficiencyByDay = dayNames
    .filter(d => effByDay[d].count > 0)
    .map(d => ({
      day: d,
      costPerDay: effByDay[d].cost / effByDay[d].count,
      dias: effByDay[d].count,
    }));

  return (
    <div className="space-y-6">
      {/* ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roiMetrics.map((m) => (
          <Card key={m.label} className="border-border/50 bg-card surface-elevated">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.subtext}</p>
                </div>
                <m.icon className={`h-4 w-4 ${m.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Alerts */}
      <Card className="border-border/50 bg-card surface-elevated">
        <CardContent className="p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground tracking-tight">Alertas de Orçamento (projeção mensal)</p>
          {budgetAlerts.map((a) => {
            const pct = (a.spent / a.budget) * 100;
            return (
              <div key={a.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alertStatusIcon[a.status]}
                    <span className="text-[12px] text-foreground font-medium">{a.label}</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    ${a.spent.toFixed(2)} / ${a.budget}
                    <span className={`ml-2 ${pct > 85 ? "text-amber" : "text-muted-foreground"}`}>
                      ({pct.toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <Progress value={Math.min(pct, 100)} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenarios */}
        <Card className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground tracking-tight">Cenários de Custo</p>
            {scenarios.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/40 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-foreground">{s.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${riskBg[s.risk]} ${riskColor[s.risk]}`}>
                    risco {s.risk}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{s.description}</p>
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="text-foreground tabular-nums">${s.monthlyCost}/mês</span>
                  <span className="text-muted-foreground tabular-nums">${s.annualCost.toLocaleString()}/ano</span>
                  {s.savings !== 0 && (
                    <span className={`flex items-center gap-0.5 ${s.savings > 0 ? "text-terminal" : "text-rose"}`}>
                      {s.savings > 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                      {s.savings > 0 ? "Economia" : "Aumento"} ${Math.abs(s.savings).toLocaleString()}/ano
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Efficiency by Day */}
        <Card className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground mb-3 tracking-tight">Custo Médio por Dia da Semana</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={efficiencyByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: 11,
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`,
                      "Custo/Dia",
                    ]}
                  />
                  <Bar dataKey="costPerDay" name="costPerDay" radius={[4, 4, 0, 0]}>
                    {efficiencyByDay.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.costPerDay <= 20 ? "hsl(160, 51%, 49%)" : entry.costPerDay <= 30 ? "hsl(45, 93%, 56%)" : "hsl(350, 80%, 55%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center font-medium">
              Custo médio/dia — verde ≤ $20 · amarelo ≤ $30 · vermelho {">"} $30
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectionDetails;
