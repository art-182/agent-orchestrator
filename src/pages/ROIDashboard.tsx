import { TrendingUp, DollarSign, Clock, ShieldCheck, Target, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useAgents, useDailyCosts, useTraces } from "@/hooks/use-supabase-data";
import { parseJsonb } from "@/lib/parse-jsonb";
import { calculateROI } from "@/lib/roi-calculator";
import { Skeleton } from "@/components/ui/skeleton";

interface AgentROI {
  hoursPerWeekSaved: number;
  costPerHourHuman: number;
  weeklySavings: number;
  monthlySavings: number;
  roiMultiplier: number;
  tasksAutomated: number;
  automationRate: number;
  avgTaskTimeHuman: string;
  avgTaskTimeAgent: string;
  speedup: string;
  qualityScore: number;
  incidentsPrevented: number;
  revenueImpact: string;
}

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
  const { data: agents, isLoading: loadingAgents } = useAgents();
  const { data: dailyCosts, isLoading: loadingCosts } = useDailyCosts();
  const { data: traces, isLoading: loadingTraces } = useTraces();

  const isLoading = loadingAgents || loadingCosts || loadingTraces;

  if (isLoading) {
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

  const agentList = (agents ?? []).filter(a => a.id !== "ceo");
  const agentROIs = agentList.map((a) => {
    const roi = parseJsonb<AgentROI | null>(a.roi, null);
    return {
      name: a.name,
      emoji: a.emoji,
      totalCost: a.total_cost ?? 0,
      hoursPerWeekSaved: roi?.hoursPerWeekSaved ?? 0,
      costPerHourHuman: roi?.costPerHourHuman ?? 50,
      weeklySavings: roi?.weeklySavings ?? 0,
      monthlySavings: roi?.monthlySavings ?? 0,
      roiMultiplier: roi?.roiMultiplier ?? 0,
      tasksAutomated: roi?.tasksAutomated ?? 0,
      automationRate: roi?.automationRate ?? 0,
      avgTaskTimeHuman: roi?.avgTaskTimeHuman ?? "—",
      avgTaskTimeAgent: roi?.avgTaskTimeAgent ?? "—",
      speedup: roi?.speedup ?? "—",
      qualityScore: roi?.qualityScore ?? 0,
      incidentsPrevented: roi?.incidentsPrevented ?? 0,
      revenueImpact: roi?.revenueImpact ?? "—",
    };
  });

  // Compute real totals from DB — using centralized ROI
  const roiCalc = calculateROI(agents ?? [], dailyCosts ?? []);
  const totalMonthlySavings = roiCalc.monthlyValue;
  const totalHoursWeek = roiCalc.totalHoursPerWeek;
  const totalIncidents = agentROIs.reduce((s, r) => s + r.incidentsPrevented, 0);
  const totalAutomated = agentROIs.reduce((s, r) => s + r.tasksAutomated, 0);
  const avgROI = roiCalc.roiMultiplier;
  const avgQuality = agentROIs.length > 0 ? Math.round(agentROIs.reduce((s, r) => s + r.qualityScore, 0) / agentROIs.length) : 0;
  const avgAutomation = agentROIs.length > 0 ? Math.round(agentROIs.reduce((s, r) => s + r.automationRate, 0) / agentROIs.length) : 0;

  // Real operating cost from daily_costs table
  const totalOperatingCost = roiCalc.totalCost;
  const annualSavings = totalMonthlySavings * 12;
  const paybackDays = totalMonthlySavings > 0
    ? Math.max(1, Math.round(totalOperatingCost / (totalMonthlySavings / 30)))
    : 0;

  // Build chart from real daily_costs — cumulative savings over time
  const costsByDate = (dailyCosts ?? []).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const dailySavingsRate = totalMonthlySavings / 30; // daily savings estimate
  let cumSavings = 0;
  let cumCost = 0;
  const savingsChartData = costsByDate.map((c) => {
    cumSavings += dailySavingsRate;
    cumCost += c.google ?? 0;
    return {
      date: (c.date ?? "").slice(5), // MM-DD
      savings: Math.round(cumSavings),
      cost: Math.round(cumCost),
    };
  });

  // If we have very few data points, pad with projections
  if (savingsChartData.length < 3) {
    const lastSaving = savingsChartData.length > 0 ? savingsChartData[savingsChartData.length - 1].savings : 0;
    const lastCost = savingsChartData.length > 0 ? savingsChartData[savingsChartData.length - 1].cost : 0;
    for (let i = savingsChartData.length; i < 6; i++) {
      savingsChartData.push({
        date: `+${i - savingsChartData.length + 1}d`,
        savings: Math.round(lastSaving + dailySavingsRate * (i + 1)),
        cost: Math.round(lastCost + (totalOperatingCost / Math.max(1, costsByDate.length)) * (i + 1)),
      });
    }
  }

  // Real trace data for success rate
  const traceList = traces ?? [];
  const successRate = traceList.length > 0
    ? (traceList.filter(t => t.status === "success").length / traceList.length * 100)
    : 100;

  const agentROIChart = agentROIs
    .map((r) => ({ name: `${r.emoji} ${r.name}`, roi: r.roiMultiplier, savings: r.monthlySavings }))
    .sort((a, b) => b.roi - a.roi);

  const costDistribution = [
    { name: "Operação Humana (sem IA)", value: totalMonthlySavings, color: chartStyle.rose },
    { name: "Custo IA", value: totalOperatingCost, color: chartStyle.terminal },
  ];

  const statCards = [
    { icon: DollarSign, label: "Economia Mensal", value: `$${(totalMonthlySavings / 1000).toFixed(1)}K`, color: "text-terminal", bg: "bg-terminal/10", sub: `$${(annualSavings / 1000).toFixed(0)}K/ano` },
    { icon: TrendingUp, label: "ROI Médio", value: `${avgROI.toFixed(1)}x`, color: "text-cyan", bg: "bg-cyan/10", sub: "retorno sobre custo IA" },
    { icon: Clock, label: "Horas Poupadas", value: `${totalHoursWeek.toFixed(1)}h/sem`, color: "text-violet", bg: "bg-violet/10", sub: `${(totalHoursWeek * 4).toFixed(0)}h/mês` },
    { icon: ShieldCheck, label: "Incidentes Evitados", value: totalIncidents.toString(), color: "text-amber", bg: "bg-amber/10", sub: "últimos 30 dias" },
    { icon: Target, label: "Payback", value: `${paybackDays}d`, color: "text-terminal", bg: "bg-terminal/10", sub: "para ROI positivo" },
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
            <p className="text-[11px] text-muted-foreground font-medium">Análise de retorno sobre investimento em IA — dados em tempo real</p>
          </div>
          <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-terminal/20 bg-terminal/8 text-terminal rounded-full font-medium ml-2">Live</Badge>
        </div>

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

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Taxa de Automação", value: avgAutomation, color: "text-terminal", sub: `${totalAutomated.toLocaleString()} tarefas automatizadas` },
            { label: "Quality Score", value: avgQuality, color: "text-cyan", sub: `${successRate.toFixed(1)}% success rate (${traceList.length} traces)` },
            { label: "Custo IA vs Humano", value: totalMonthlySavings + totalOperatingCost > 0 ? +((totalOperatingCost / (totalMonthlySavings + totalOperatingCost)) * 100).toFixed(1) : 0, color: "text-violet", sub: `$${totalOperatingCost.toFixed(2)} IA vs $${(totalMonthlySavings + totalOperatingCost).toLocaleString()} humano` },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card surface-elevated lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">Economia Acumulada (Real)</CardTitle></CardHeader>
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
                    <YAxis tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, borderRadius: "12px", fontSize: 11, color: "hsl(var(--foreground))" }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                    <Area type="monotone" dataKey="savings" name="Economia" stroke={chartStyle.terminal} fill="url(#savingsGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cost" name="Custo IA" stroke={chartStyle.rose} fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card surface-elevated">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">IA vs Humano</CardTitle></CardHeader>
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

        <Card className="border-border/50 bg-card surface-elevated">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-foreground tracking-tight">ROI por Agente</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentROIChart} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: chartStyle.text }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ backgroundColor: chartStyle.bg, border: `1px solid ${chartStyle.border}`, borderRadius: "12px", fontSize: 11, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="roi" name="ROI" fill={chartStyle.cyan} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentROIs.map((r) => (
            <FadeIn key={r.name}>
              <Card className="border-border/50 bg-card surface-elevated glow-line transition-all duration-300">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-foreground">{r.emoji} {r.name}</span>
                    <span className="text-lg font-bold text-terminal">{r.roiMultiplier}x</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[10px] text-muted-foreground">Economia/Mês</p><p className="text-[13px] font-bold text-terminal">${r.monthlySavings.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Horas/Sem</p><p className="text-[13px] font-bold text-foreground">{r.hoursPerWeekSaved}h</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Speedup</p><p className="text-[13px] font-bold text-cyan">{r.speedup}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Impacto</p><p className="text-[13px] font-bold text-violet">{r.revenueImpact}</p></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]"><span className="text-muted-foreground">Automação</span><span className="text-terminal font-medium">{r.automationRate}%</span></div>
                    <Progress value={r.automationRate} className="h-1" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>Custo IA: ${r.totalCost.toFixed(2)}</span>
                    <span>{r.tasksAutomated} tarefas</span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </StaggerContainer>

        <Card className="border-terminal/15 bg-card surface-elevated">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-terminal flex items-center gap-2 tracking-tight">
              <ArrowUpRight className="h-4 w-4" />
              Resumo para Investidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] text-muted-foreground font-medium">Economia Anual</p><p className="text-xl font-bold text-terminal tracking-tight">${(annualSavings / 1000).toFixed(0)}K</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">Custo IA Total</p><p className="text-xl font-bold text-foreground tracking-tight">${totalOperatingCost.toFixed(2)}</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">ROI do Sistema</p><p className="text-xl font-bold text-cyan tracking-tight">{avgROI.toFixed(1)}x</p></div>
              <div><p className="text-[10px] text-muted-foreground font-medium">FTEs Equivalentes</p><p className="text-xl font-bold text-violet tracking-tight">{(totalHoursWeek / 40).toFixed(1)}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ROIDashboard;
