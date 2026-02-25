import { TrendingUp, DollarSign, Clock, ShieldCheck, Target, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useRealTimeROI } from "@/hooks/use-realtime-roi";
import { useDailyCosts } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const chartStyle = {
  bg: "hsl(228, 18%, 6%)",
  border: "hsl(228, 12%, 12%)",
  grid: "hsl(228, 12%, 10%)",
  text: "hsl(220, 10%, 45%)",
  terminal: "hsl(158, 64%, 52%)",
  cyan: "hsl(190, 90%, 55%)",
  rose: "hsl(0, 72%, 51%)",
};

const ROIDashboard = () => {
  const roi = useRealTimeROI();
  const { data: dailyCosts } = useDailyCosts();

  if (roi.isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">ROI & Investimento</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div>
      </PageTransition>
    );
  }

  // ── Derived metrics ──
  const annualSavings = roi.monthlyValue * 12;
  const paybackDays = roi.monthlyValue > 0
    ? Math.max(1, Math.round(roi.operationalCost / (roi.monthlyValue / 30)))
    : 0;
  const ftesEquivalent = (roi.hoursPerDay * 30) / 160; // 160h/month = 1 FTE

  // ── Savings chart from daily_costs ──
  const costsByDate = [...(dailyCosts ?? [])].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const dailySavingsRate = roi.monthlyValue / 30;
  let cumSavings = 0;
  let cumCost = 0;
  const savingsChartData = costsByDate.map((c) => {
    cumSavings += dailySavingsRate;
    cumCost += c.google ?? 0;
    return { date: (c.date ?? "").slice(5), savings: Math.round(cumSavings), cost: Math.round(cumCost) };
  });

  // ── Agent ROI chart ──
  const agentROIChart = roi.agents
    .filter(a => a.hoursSaved > 0)
    .map(a => ({
      name: `${a.emoji} ${a.name}`,
      hours: a.hoursSaved,
      speedup: a.speedup,
    }))
    .sort((a, b) => b.hours - a.hours);

  // ── Cost distribution pie ──
  const costDistribution = [
    { name: "Equivalente Humano", value: Math.round(roi.monthlyValue), color: chartStyle.rose },
    { name: "Custo IA (real)", value: Math.round(roi.monthlyCostProjection), color: chartStyle.terminal },
  ];

  // ── Maturity label ──
  const maturityLabel = roi.dataMaturity === "bootstrap" ? "Bootstrap (<3d)"
    : roi.dataMaturity === "early" ? "Early (3-7d)" : "Stable (7d+)";

  const statCards = [
    { icon: DollarSign, label: "Economia Mensal", value: `$${(roi.monthlyValue / 1000).toFixed(1)}K`, color: "text-terminal", bg: "bg-terminal/10", sub: `$${(annualSavings / 1000).toFixed(0)}K/ano` },
    { icon: TrendingUp, label: "ROI", value: `${roi.roiMultiplier.toFixed(1)}x`, color: "text-cyan", bg: "bg-cyan/10", sub: "retorno sobre custo IA" },
    { icon: Clock, label: "Horas Poupadas", value: `${roi.totalHoursSaved.toFixed(1)}h`, color: "text-violet", bg: "bg-violet/10", sub: `${roi.hoursPerDay.toFixed(1)}h/dia · ${roi.operatingDays.toFixed(1)}d` },
    { icon: ShieldCheck, label: "Quality Score", value: `${roi.avgQualityScore}%`, color: "text-amber", bg: "bg-amber/10", sub: `${roi.totalCalls} chamadas LLM` },
    { icon: Target, label: "Custo/Hora Salva", value: `$${roi.costPerHourSaved.toFixed(2)}`, color: "text-terminal", bg: "bg-terminal/10", sub: `payback ${paybackDays}d` },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">

        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">ROI & Investimento</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Calculado em tempo real a partir de {roi.totalCalls} traces · {roi.operatingDays.toFixed(1)} dias</p>
          </div>
          <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-terminal/20 bg-terminal/8 text-terminal rounded-full font-medium ml-2">
            {maturityLabel}
          </Badge>
        </div>

        {/* Stat Cards */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statCards.map((m) => (
            <FadeIn key={m.label}>
              <Card className="border-border/50 bg-card surface-elevated">
                <CardContent className="p-4 space-y-2">
                  <div className={`${m.bg} ${m.color} p-1.5 rounded-lg w-fit`}>
                    <m.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className={`text-2xl font-bold ${m.color} tracking-tight leading-none`}>{m.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </StaggerContainer>

        {/* Automation + Quality + Cost bars */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Taxa de Automação", value: roi.avgAutomationRate, color: "text-terminal", sub: `${roi.totalTasksDone} tarefas concluídas` },
            { label: "Quality Score", value: roi.avgQualityScore, color: "text-cyan", sub: `${roi.totalCalls} traces · taxa de sucesso` },
            { label: "Custo IA vs Humano", value: roi.monthlyCostProjection + roi.monthlyValue > 0 ? +((roi.monthlyCostProjection / (roi.monthlyCostProjection + roi.monthlyValue)) * 100).toFixed(1) : 0, color: "text-violet", sub: `$${roi.operationalCost.toFixed(2)} IA vs $${Math.round(roi.monthlyValue)} humano/mês` },
          ].map((m) => (
            <FadeIn key={m.label}>
              <Card className="border-border/50 bg-card surface-elevated">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground font-medium">{m.label}</span>
                    <span className={`text-[13px] font-bold ${m.color}`}>{typeof m.value === "number" ? `${m.value}%` : m.value}</span>
                  </div>
                  <Progress value={typeof m.value === "number" ? m.value : 0} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </StaggerContainer>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card surface-elevated lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">Economia Acumulada vs Custo IA</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartStyle.terminal} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartStyle.terminal} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={{ stroke: chartStyle.grid }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, borderRadius: "12px", fontSize: 11, color: "hsl(var(--foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                    <Area type="monotone" dataKey="savings" name="Economia" stroke={chartStyle.terminal} fill="url(#savingsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cost" name="Custo IA" stroke={chartStyle.rose} fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card surface-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">IA vs Humano (mensal)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="h-[160px] w-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={costDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {costDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, borderRadius: "12px", fontSize: 11, color: "hsl(var(--foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {costDistribution.map((c) => (
                    <div key={c.name} className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[11px] text-foreground/80 font-medium">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums ml-auto">${c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent ROI chart */}
        {agentROIChart.length > 0 && (
          <Card className="border-border/50 bg-card surface-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">Horas Economizadas por Agente</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentROIChart} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, borderRadius: "12px", fontSize: 11, color: "hsl(var(--foreground))" }} formatter={(value: number) => [`${value.toFixed(1)}h`, undefined]} />
                    <Bar dataKey="hours" name="Horas Salvas" fill={chartStyle.cyan} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roi.agents.map((a) => (
            <FadeIn key={a.id}>
              <Card className="border-border/50 bg-card surface-elevated glow-line transition-all duration-300">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-foreground">{a.emoji} {a.name}</span>
                    <span className="text-lg font-bold text-terminal">{a.speedup > 0 ? `${a.speedup}x` : "—"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[10px] text-muted-foreground">Horas Salvas</p><p className="text-[13px] font-bold text-terminal">{a.hoursSaved.toFixed(1)}h</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Por Dia</p><p className="text-[13px] font-bold text-foreground">{a.hoursPerDay.toFixed(1)}h/d</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Speedup</p><p className="text-[13px] font-bold text-cyan">{a.speedup > 0 ? `${a.speedup}x` : "—"}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Calls</p><p className="text-[13px] font-bold text-violet">{a.calls}</p></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]"><span className="text-muted-foreground">Quality Score</span><span className="text-terminal font-medium">{a.qualityScore}%</span></div>
                    <Progress value={a.qualityScore} className="h-1" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>${a.traceCost.toFixed(2)} custo</span>
                    <span>{a.tasksDone} tarefas</span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </StaggerContainer>

        {/* Investor summary */}
        <Card className="border-terminal/15 bg-card surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-terminal flex items-center gap-2 tracking-tight">
              <ArrowUpRight className="h-4 w-4" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] text-muted-foreground font-medium">Economia Anual (proj.)</p><p className="text-xl font-bold text-terminal tracking-tight">${(annualSavings / 1000).toFixed(0)}K</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">Custo IA Acumulado</p><p className="text-xl font-bold text-foreground tracking-tight">${roi.operationalCost.toFixed(2)}</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">ROI do Sistema</p><p className="text-xl font-bold text-cyan tracking-tight">{roi.roiMultiplier.toFixed(1)}x</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">FTEs Equivalentes</p><p className="text-xl font-bold text-violet tracking-tight">{ftesEquivalent.toFixed(1)}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ROIDashboard;
