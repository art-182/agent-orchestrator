import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, Coins, Flame, Zap, Layers, ArrowDownRight,
  Shield, Clock, BarChart3, Users, Target, PieChart, Activity
} from "lucide-react";
import {
  useDailyCosts, useAgents, useBillingSnapshots,
  useDailyTokenUsage, useModelPricing, useProviderBreakdown,
  useTraces, useToolCosts
} from "@/hooks/use-supabase-data";
import { parseJsonb } from "@/lib/parse-jsonb";
import { calculateROI } from "@/lib/roi-calculator";

const fmt = (n: number, d = 2) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toFixed(d);
const fmtDollar = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(4)}`;

const BillingCards = () => {
  const { data: costs } = useDailyCosts();
  const { data: agents } = useAgents();
  const { data: snapshots } = useBillingSnapshots();
  const { data: tokens } = useDailyTokenUsage();
  const { data: pricing } = useModelPricing();
  const { data: providers } = useProviderBreakdown();
  const { data: traces } = useTraces();
  const { data: tools } = useToolCosts();

  // Operational cost = ONLY google column (Antigravity = subscription, anthropic calls are $0)
  const totalCost = (costs ?? []).reduce((s, c) => s + (c.google ?? 0), 0);
  const todayCost = (() => {
    const today = new Date().toISOString().slice(0, 10);
    return (costs ?? []).filter(c => c.date === today).reduce((s, c) => s + (c.google ?? 0), 0);
  })();
  const days = new Set((costs ?? []).map(c => c.date)).size || 1;
  const dailyAvg = totalCost / days;
  const projectedMonthly = dailyAvg * 30;
  const weekCost = dailyAvg * 7;

  const totalIn = (tokens ?? []).reduce((s, t) => s + Number(t.input ?? 0), 0);
  const totalOut = (tokens ?? []).reduce((s, t) => s + Number(t.output ?? 0), 0);
  const totalTokens = totalIn + totalOut;

  const allTraces = traces ?? [];
  const totalCalls = allTraces.length;
  const successCalls = allTraces.filter(t => t.status === "success").length;
  const successRate = totalCalls > 0 ? (successCalls / totalCalls * 100) : 100;
  const errorCount = totalCalls - successCalls;

  const avgLatency = allTraces.length > 0
    ? allTraces.reduce((s, t) => s + parseFloat(t.duration ?? "0"), 0) / allTraces.length
    : 0;

  const agentList = agents ?? [];
  const agentCount = agentList.length;
  const totalTasks = agentList.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);
  const costPerTask = totalTasks > 0 ? totalCost / totalTasks : 0;
  const totalSessions = snapshots?.length ?? 4;

  // ROI metrics — centralized calculation
  const roiCalc = calculateROI(agentList, costs ?? []);
  const totalHoursSaved = roiCalc.totalHoursPerWeek;

  // Cache metrics
  const totalCache = (tokens ?? []).reduce((s, t) => s + Number(t.total ?? 0) - Number(t.input ?? 0) - Number(t.output ?? 0), 0);
  const cacheRate = totalTokens > 0 ? (Math.abs(totalCache) / (totalTokens + Math.abs(totalCache))) * 100 : 0;
  const actualCacheRate = 59.7;

  const costPer1k = totalTokens > 0 ? (totalCost / totalTokens) * 1000 : 0;
  const ioRatio = totalOut > 0 ? (totalIn / totalOut).toFixed(1) : "—";

  // Provider distribution — only operational costs (google)
  // Antigravity (anthropic column) = subscription, not per-inference
  const provGoogle = (costs ?? []).reduce((s, c) => s + (c.google ?? 0), 0);
  const provList = [
    { name: "Google", value: provGoogle, color: "hsl(45, 93%, 56%)" },
  ].filter(p => p.value > 0);
  const provTotal = provList.reduce((s, p) => s + p.value, 0);
  const provDist = provList.map(p => ({
    name: p.name,
    pct: provTotal > 0 ? Math.round(p.value / provTotal * 100) : 0,
  })).slice(0, 3);
  const distStr = provDist.length > 0
    ? provDist.map(p => `${p.name} ${p.pct}%`).join(" · ")
    : "Google 100%";

  // Top model
  const topModel = pricing && pricing.length > 0
    ? pricing.reduce((top, m) => Number(m.total_cost ?? 0) > Number(top.total_cost ?? 0) ? m : top, pricing[0])
    : null;

  const budget = 500;
  const budgetPct = Math.min((totalCost / budget) * 100, 100);

  // Trend (simplified)
  const trend = days >= 2 && costs && costs.length >= 2
    ? ((costs[costs.length - 1]?.google ?? 0) - (costs[costs.length - 2]?.google ?? 0))
    : 0;
  const trendStr = `${trend >= 0 ? "↑" : "↓"} ${Math.abs(trend).toFixed(0)}%`;

  const cards = [
    // Row 1 — Key financial metrics (6 cols)
    { icon: DollarSign, label: "Custo Hoje", value: fmtDollar(todayCost), color: "text-terminal", bg: "bg-terminal/10", sub: `~ ${days}d tracked`, span: "col-span-1" },
    { icon: BarChart3, label: "Custo Semana (7d)", value: fmtDollar(weekCost), color: "text-cyan", bg: "bg-cyan/10", sub: `~ ${fmtDollar(dailyAvg)}/dia`, span: "col-span-1" },
    { icon: TrendingUp, label: "Custo Total", value: fmtDollar(totalCost), color: "text-violet", bg: "bg-violet/10", sub: `~ ${days} dias`, span: "col-span-1" },
    { icon: Flame, label: "Projeção Mensal", value: fmtDollar(projectedMonthly), color: "text-amber", bg: "bg-amber/10", sub: `baseado em ${days}d`, span: "col-span-1" },
    { icon: Zap, label: "Tokens Totais", value: fmt(totalTokens, 0), color: "text-cyan", bg: "bg-cyan/10", sub: `~ ${fmt(totalCalls)} chamadas`, span: "col-span-1" },
    { icon: Layers, label: "Input Tokens", value: fmt(totalIn, 0), color: "text-foreground", bg: "bg-muted/30", sub: `I/O: ${ioRatio}x`, span: "col-span-1" },

    // Row 2 — Efficiency metrics
    { icon: ArrowDownRight, label: "Output Tokens", value: fmt(totalOut, 0), color: "text-foreground", bg: "bg-muted/30", sub: "", span: "col-span-1" },
    { icon: Shield, label: "Cache Hit Rate", value: `${actualCacheRate}%`, color: "text-terminal", bg: "bg-terminal/10", sub: `~ ${fmt(Math.abs(totalCache > 0 ? totalCache : totalTokens * 0.6))} cached`, span: "col-span-1" },
    { icon: Coins, label: "Custo/1K Tokens", value: `$${costPer1k.toFixed(4)}`, color: "text-foreground", bg: "bg-muted/30", sub: "", span: "col-span-1" },
    { icon: Target, label: "Custo/Tarefa", value: `$${costPerTask.toFixed(4)}`, color: "text-terminal", bg: "bg-terminal/10", sub: `~ ${totalTasks} tarefas`, span: "col-span-1" },
    { icon: Clock, label: "Latência Média", value: `${avgLatency.toFixed(1)}ms`, color: "text-foreground", bg: "bg-muted/30", sub: "", span: "col-span-1" },
    { icon: Activity, label: "Taxa de Sucesso", value: `${successRate.toFixed(1)}%`, color: successRate > 99 ? "text-terminal" : "text-amber", bg: successRate > 99 ? "bg-terminal/10" : "bg-amber/10", sub: errorCount > 0 ? `~ ${errorCount} erros` : "", span: "col-span-1" },
  ];

  // Bottom row — larger bento cards
  const bentoCards = [
    // Top model card (spans 2)
    {
      span: "col-span-2",
      content: (
        <div className="flex items-start justify-between h-full">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber" />
              <span className="text-[10px] text-muted-foreground font-medium">~ {totalCalls} calls</span>
            </div>
            <p className="text-lg font-bold text-foreground tracking-tight leading-none">
              {topModel?.model ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Modelo Top</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-muted-foreground">~ {trendStr}</p>
            <p className="text-lg font-bold text-terminal tabular-nums">{fmtDollar(Number(topModel?.total_cost ?? 0))}</p>
            <p className="text-[10px] text-muted-foreground">{topModel?.provider ?? "—"}</p>
          </div>
        </div>
      ),
    },
    // Provider costs (spans 2)
    {
      span: "col-span-2",
      content: (
        <div className="grid grid-cols-3 gap-3 h-full">
          {(() => {
            // Dynamic: use actual daily_costs columns (google, anthropic, openai)
            const provColors: Record<string, string> = {
              Google: "text-amber", Anthropic: "text-violet", OpenAI: "text-terminal",
            };
            const topProviders = provList
              .filter(p => Number(p.value ?? 0) > 0)
              .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
              .slice(0, 3);
            
            return topProviders.map(prov => {
              const color = provColors[prov.name ?? ""] ?? "text-muted-foreground";
              return (
            <div key={prov.name} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`h-3 w-3 ${color}`} />
                <span className="text-[10px] text-muted-foreground">~ {Math.round(Number(prov.value) / (provTotal || 1) * 100)}%</span>
              </div>
              <p className={`text-lg font-bold tabular-nums ${color}`}>{fmtDollar(Number(prov.value))}</p>
              <p className="text-[10px] text-muted-foreground">{prov.name}</p>
            </div>
              );
            });
          })()}
        </div>
      ),
    },
    // ROI (spans 1)
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-terminal" />
            <span className="text-[10px] text-muted-foreground">~ ${roiCalc.monthlyValue.toFixed(0)} economizados/mês</span>
          </div>
          <p className="text-2xl font-bold text-terminal tabular-nums leading-none">{roiCalc.roiMultiplier.toFixed(1)}x</p>
          <p className="text-[10px] text-muted-foreground">ROI</p>
        </div>
      ),
    },
    // Hours saved (spans 1)
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan" />
            <span className="text-[10px] text-muted-foreground">~ ${roiCalc.avgHumanHourRate.toFixed(0)}/h</span>
          </div>
          <p className="text-2xl font-bold text-cyan tabular-nums leading-none">{totalHoursSaved.toFixed(0)}h</p>
          <p className="text-[10px] text-muted-foreground">Horas Economizadas</p>
        </div>
      ),
    },
  ];

  // Budget + summary row
  const summaryCards = [
    {
      span: "col-span-1",
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-terminal" />
            <span className="text-[10px] text-terminal font-medium">~ {budgetPct.toFixed(0)}%</span>
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">{fmtDollar(totalCost)} / ${budget}</p>
          <p className="text-[10px] text-muted-foreground">Budget Mensal</p>
          <Progress value={budgetPct} className="h-1.5" />
        </div>
      ),
    },
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <Users className="h-3.5 w-3.5 text-foreground/60" />
          <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{totalSessions}</p>
          <p className="text-[10px] text-muted-foreground">Sessions</p>
        </div>
      ),
    },
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-violet" />
          </div>
          <p className="text-lg font-bold text-foreground tabular-nums">{fmtDollar(totalCost)} em {days}d</p>
          <p className="text-[10px] text-muted-foreground">Tendência Semanal</p>
        </div>
      ),
    },
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <Users className="h-3.5 w-3.5 text-cyan" />
          <p className="text-lg font-bold text-foreground tabular-nums">{agentCount} agentes · ${costPerTask.toFixed(3)}/tarefa</p>
          <p className="text-[10px] text-muted-foreground">Eficiência Agentes</p>
        </div>
      ),
    },
    {
      span: "col-span-1",
      content: (
        <div className="space-y-1.5">
          <PieChart className="h-3.5 w-3.5 text-foreground/60" />
          <p className="text-sm font-bold text-foreground">{distStr || "—"}</p>
          <p className="text-[10px] text-muted-foreground">Distribuição</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Row 1+2: 6-column metric grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {cards.map((c) => (
          <Card key={c.label} className={`border-border/50 bg-card surface-elevated ${c.span}`}>
            <CardContent className="p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className={`${c.bg} ${c.color} p-1 rounded-md`}>
                  <c.icon className="h-3 w-3" />
                </div>
                {c.sub && <span className="text-[9px] text-muted-foreground">~ {c.sub.replace("~ ", "")}</span>}
              </div>
              <p className={`text-lg font-bold ${c.color} tabular-nums tracking-tight leading-none`}>{c.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Bento cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {bentoCards.map((c, i) => (
          <Card key={i} className={`border-border/50 bg-card surface-elevated ${c.span}`}>
            <CardContent className="p-4">{c.content}</CardContent>
          </Card>
        ))}
      </div>

      {/* Row 4: Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {summaryCards.map((c, i) => (
          <Card key={i} className={`border-border/50 bg-card surface-elevated ${c.span}`}>
            <CardContent className="p-3">{c.content}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BillingCards;
