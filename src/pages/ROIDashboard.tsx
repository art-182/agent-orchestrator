import { Rocket, TrendingUp, DollarSign, Clock, Users, Zap, ShieldCheck, BarChart3, Target, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { mockAgents } from "@/lib/mock-data";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";

// Aggregate ROI data from agents
const agentROIs = mockAgents.map((a) => ({
  name: a.name,
  emoji: a.emoji,
  ...a.roi,
}));

const totalMonthlySavings = agentROIs.reduce((s, r) => s + r.monthlySavings, 0);
const totalWeeklySavings = agentROIs.reduce((s, r) => s + r.weeklySavings, 0);
const totalHoursWeek = agentROIs.reduce((s, r) => s + r.hoursPerWeekSaved, 0);
const totalIncidents = agentROIs.reduce((s, r) => s + r.incidentsPrevented, 0);
const totalAutomated = agentROIs.reduce((s, r) => s + r.tasksAutomated, 0);
const avgROI = agentROIs.reduce((s, r) => s + r.roiMultiplier, 0) / agentROIs.length;
const avgQuality = Math.round(agentROIs.reduce((s, r) => s + r.qualityScore, 0) / agentROIs.length);
const avgAutomation = Math.round(agentROIs.reduce((s, r) => s + r.automationRate, 0) / agentROIs.length);
const totalOperatingCost = mockAgents.reduce((s, a) => s + a.metrics.totalCost, 0);
const annualSavings = totalMonthlySavings * 12;
const paybackDays = Math.round((totalOperatingCost / (totalMonthlySavings / 30)));

// Chart data
const monthlySavingsData = [
  { month: "Set", savings: 42000, cost: 280 },
  { month: "Out", savings: 48000, cost: 312 },
  { month: "Nov", savings: 55000, cost: 399 },
  { month: "Dez", savings: 61000, cost: 445 },
  { month: "Jan", savings: 68000, cost: 488 },
  { month: "Fev", savings: totalMonthlySavings, cost: totalOperatingCost },
];

const agentROIChart = agentROIs.map((r) => ({
  name: `${r.emoji} ${r.name}`,
  roi: r.roiMultiplier,
  savings: r.monthlySavings,
})).sort((a, b) => b.roi - a.roi);

const costDistribution = [
  { name: "Operação Humana\n(equivalente)", value: totalMonthlySavings + totalOperatingCost, color: "hsl(350, 80%, 55%)" },
  { name: "Custo IA Atual", value: totalOperatingCost, color: "hsl(160, 51%, 49%)" },
];

const ROIDashboard = () => (
  <PageTransition>
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">ROI & Investimento</h1>
        <Badge variant="outline" className="font-mono text-[10px] px-2 py-0 border-terminal/30 bg-terminal/10 text-terminal">
          Live
        </Badge>
      </div>

      {/* Hero metrics */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          { icon: DollarSign, label: "Economia Mensal", value: `$${(totalMonthlySavings / 1000).toFixed(1)}K`, color: "text-terminal", sub: `$${(annualSavings / 1000).toFixed(0)}K/ano` },
          { icon: TrendingUp, label: "ROI Médio", value: `${avgROI.toFixed(1)}x`, color: "text-cyan", sub: "retorno sobre custo IA" },
          { icon: Clock, label: "Horas Poupadas/Sem", value: `${totalHoursWeek}h`, color: "text-violet", sub: `${(totalHoursWeek * 4).toFixed(0)}h/mês` },
          { icon: ShieldCheck, label: "Incidentes Evitados", value: totalIncidents.toString(), color: "text-amber", sub: "últimos 30 dias" },
          { icon: Target, label: "Payback Period", value: `${paybackDays}d`, color: "text-terminal", sub: "para ROI positivo" },
        ].map((m) => (
          <FadeIn key={m.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-1">
                <m.icon className={`h-4 w-4 ${m.color}`} />
                <p className={`font-mono text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{m.label}</p>
                <p className="font-mono text-[9px] text-muted-foreground">{m.sub}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Progress bars */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FadeIn>
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">Taxa de Automação</span>
                <span className="font-mono text-sm font-bold text-terminal">{avgAutomation}%</span>
              </div>
              <Progress value={avgAutomation} className="h-2" />
              <p className="font-mono text-[9px] text-muted-foreground">{totalAutomated.toLocaleString()} tarefas automatizadas</p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">Quality Score</span>
                <span className="font-mono text-sm font-bold text-cyan">{avgQuality}%</span>
              </div>
              <Progress value={avgQuality} className="h-2" />
              <p className="font-mono text-[9px] text-muted-foreground">Média ponderada de todos os agentes</p>
            </CardContent>
          </Card>
        </FadeIn>
        <FadeIn>
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">Custo IA vs Humano</span>
                <span className="font-mono text-sm font-bold text-violet">
                  {((totalOperatingCost / (totalMonthlySavings + totalOperatingCost)) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(totalOperatingCost / (totalMonthlySavings + totalOperatingCost)) * 100} className="h-2" />
              <p className="font-mono text-[9px] text-muted-foreground">${totalOperatingCost.toFixed(2)} IA vs ${(totalMonthlySavings + totalOperatingCost).toLocaleString()} humano</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Savings trend */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-foreground">Economia Acumulada (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySavingsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 14%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }} axisLine={{ stroke: "hsl(230, 15%, 14%)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(230, 22%, 5%)", border: "1px solid hsl(230, 15%, 14%)", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: 11 }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                  <Area type="monotone" dataKey="savings" name="Economia" stroke="hsl(160, 51%, 49%)" fill="url(#savingsGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost distribution pie */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-mono text-sm text-foreground">Custo IA vs Equivalente Humano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {costDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(230, 22%, 5%)", border: "1px solid hsl(230, 15%, 14%)", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: 11 }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-center">
                {costDistribution.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-mono text-[10px] text-foreground">{c.name.replace('\n', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent ROI breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-foreground">ROI por Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentROIChart} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 14%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}x`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(230, 22%, 5%)", border: "1px solid hsl(230, 15%, 14%)", borderRadius: "8px", fontFamily: "JetBrains Mono", fontSize: 11 }} formatter={(value: number, name: string) => [name === "roi" ? `${value}x` : `$${value.toLocaleString()}`, undefined]} />
                <Bar dataKey="roi" name="ROI" fill="hsl(187, 80%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Agent detail cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agentROIs.map((r) => (
          <FadeIn key={r.name}>
            <Card className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">{r.emoji} {r.name}</span>
                  <span className="font-mono text-lg font-bold text-terminal">{r.roiMultiplier}x</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground">Economia/Mês</p>
                    <p className="font-mono text-xs font-bold text-terminal">${r.monthlySavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground">Horas/Semana</p>
                    <p className="font-mono text-xs font-bold text-foreground">{r.hoursPerWeekSaved}h</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground">Speedup</p>
                    <p className="font-mono text-xs font-bold text-cyan">{r.speedup}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-muted-foreground">Impacto</p>
                    <p className="font-mono text-xs font-bold text-violet">{r.revenueImpact}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="text-muted-foreground">Automação</span>
                    <span className="text-terminal">{r.automationRate}%</span>
                  </div>
                  <Progress value={r.automationRate} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Investor summary */}
      <Card className="border-border bg-card border-terminal/20">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-terminal flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Resumo para Investidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-mono text-[10px] text-muted-foreground">Economia Anual Projetada</p>
              <p className="font-mono text-xl font-bold text-terminal">${(annualSavings / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground">Custo Operacional IA/Mês</p>
              <p className="font-mono text-xl font-bold text-foreground">${totalOperatingCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground">ROI Médio do Sistema</p>
              <p className="font-mono text-xl font-bold text-cyan">{avgROI.toFixed(1)}x</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground">FTEs Equivalentes</p>
              <p className="font-mono text-xl font-bold text-violet">{(totalHoursWeek / 40).toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageTransition>
);

export default ROIDashboard;
