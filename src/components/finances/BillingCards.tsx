import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign, Zap, Cpu, Clock, Target, ArrowRightLeft, ShieldCheck, BarChart3, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBillingSnapshots, useDailyCosts, useAgents } from "@/hooks/use-supabase-data";
import type { DailyCost, AgentCost } from "@/lib/finance-data";

const trendIcon = {
  up: <TrendingUp className="h-3 w-3" />,
  down: <TrendingDown className="h-3 w-3" />,
  neutral: <Minus className="h-3 w-3" />,
};

interface BentoMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  accent: string;
  span?: string;
  extra?: React.ReactNode;
  description?: string;
}

const iconForLabel: Record<string, React.ReactNode> = {
  "Custo Hoje": <DollarSign className="h-4 w-4" />,
  "Custo Semana": <BarChart3 className="h-4 w-4" />,
  "Custo Mês": <TrendingUp className="h-4 w-4" />,
  "Tokens Totais": <Zap className="h-4 w-4" />,
};

const accentForLabel: Record<string, string> = {
  "Custo Hoje": "text-rose",
  "Custo Semana": "text-terminal",
  "Custo Mês": "text-amber",
  "Tokens Totais": "text-cyan",
};

const BillingCards = () => {
  const { data: snapshots } = useBillingSnapshots();
  const { data: dbCosts } = useDailyCosts();
  const { data: agents } = useAgents();

  const dailyCosts: DailyCost[] = (dbCosts ?? []).map((c) => ({
    date: c.date, openai: c.openai ?? 0, anthropic: c.anthropic ?? 0, google: c.google ?? 0, total: c.total ?? 0,
  }));

  const agentCosts: AgentCost[] = (agents ?? []).map((a) => ({
    id: a.id, name: a.name, emoji: a.emoji, status: (a.status as AgentCost["status"]) ?? "online",
    tokens: 0, cost: a.total_cost ?? 0, tasks: a.tasks_completed ?? 0,
    costPerTask: a.tasks_completed ? (a.total_cost ?? 0) / a.tasks_completed : 0,
  }));

  // Summary text builders
  const weeklyTrend = dailyCosts.length >= 7
    ? (() => {
        const last7 = dailyCosts.slice(-7);
        const prev7 = dailyCosts.slice(-14, -7);
        const sumLast = last7.reduce((s, c) => s + c.total, 0);
        const sumPrev = prev7.reduce((s, c) => s + c.total, 0);
        const pct = sumPrev > 0 ? ((sumLast - sumPrev) / sumPrev * 100).toFixed(1) : "0";
        return `$${sumLast.toFixed(2)} (${Number(pct) >= 0 ? "+" : ""}${pct}% vs anterior)`;
      })()
    : `$${dailyCosts.reduce((s, c) => s + c.total, 0).toFixed(2)} em ${dailyCosts.length}d`;

  const agentEfficiency = agentCosts.length > 0
    ? `${agentCosts.length} agentes · $${(agentCosts.reduce((s, a) => s + a.costPerTask, 0) / agentCosts.length).toFixed(3)}/tarefa`
    : "Sem dados";

  const distribution = dailyCosts.length > 0
    ? (() => {
        const t = { openai: 0, anthropic: 0, google: 0 };
        dailyCosts.forEach(c => { t.openai += c.openai; t.anthropic += c.anthropic; t.google += c.google; });
        const sum = t.openai + t.anthropic + t.google || 1;
        return `OAI ${(t.openai / sum * 100).toFixed(0)}% · Ant ${(t.anthropic / sum * 100).toFixed(0)}% · Goo ${(t.google / sum * 100).toFixed(0)}%`;
      })()
    : "Sem dados";

  const dbMetrics: BentoMetric[] = (snapshots ?? []).slice(0, 4).map((s) => ({
    label: s.label,
    value: s.value,
    change: s.change ?? "",
    trend: (s.trend as "up" | "down" | "neutral") ?? "neutral",
    icon: iconForLabel[s.label] ?? <DollarSign className="h-4 w-4" />,
    accent: accentForLabel[s.label] ?? "text-foreground",
    span: "col-span-1",
  }));

  const topRow = dbMetrics.length > 0 ? dbMetrics : [
    { label: "Custo Hoje", value: "$31.40", change: "+12%", trend: "up" as const, icon: <DollarSign className="h-4 w-4" />, accent: "text-rose", span: "col-span-1" },
    { label: "Custo Semana", value: "$198.54", change: "-5%", trend: "down" as const, icon: <BarChart3 className="h-4 w-4" />, accent: "text-terminal", span: "col-span-1" },
    { label: "Custo Mês", value: "$527.78", change: "+8%", trend: "up" as const, icon: <TrendingUp className="h-4 w-4" />, accent: "text-amber", span: "col-span-1" },
    { label: "Tokens Totais", value: "2.1M", change: "+15%", trend: "up" as const, icon: <Zap className="h-4 w-4" />, accent: "text-cyan", span: "col-span-1" },
  ];

  const summaryCards: BentoMetric[] = [
    { label: "Tendência Semanal", value: weeklyTrend, change: "", trend: "neutral", icon: <TrendingUp className="h-4 w-4" />, accent: "text-terminal", span: "col-span-2 md:col-span-1" },
    { label: "Eficiência Agentes", value: agentEfficiency, change: "", trend: "neutral", icon: <Users className="h-4 w-4" />, accent: "text-cyan", span: "col-span-2 md:col-span-1" },
    { label: "Distribuição", value: distribution, change: "", trend: "neutral", icon: <BarChart3 className="h-4 w-4" />, accent: "text-violet", span: "col-span-2 md:col-span-1" },
  ];

  const extras: BentoMetric[] = [
    { label: "Custo/Token Médio", value: "$0.00025", change: "-3%", trend: "down", icon: <Cpu className="h-4 w-4" />, accent: "text-terminal", span: "col-span-1" },
    { label: "Budget Restante", value: "$272.22", change: "34%", trend: "neutral", icon: <Target className="h-4 w-4" />, accent: "text-violet", span: "col-span-1", extra: <Progress value={66} className="h-1 mt-1.5" /> },
    { label: "Latência Média", value: "287ms", change: "-8%", trend: "down", icon: <Clock className="h-4 w-4" />, accent: "text-terminal", span: "col-span-1" },
    { label: "Fallbacks 24h", value: "8", change: "+3", trend: "up", icon: <ArrowRightLeft className="h-4 w-4" />, accent: "text-amber", span: "col-span-1" },
    { label: "Taxa de Sucesso", value: "96.4%", change: "+0.2%", trend: "up", icon: <ShieldCheck className="h-4 w-4" />, accent: "text-terminal", span: "col-span-1" },
  ];

  const allMetrics = [...topRow, ...summaryCards, ...extras];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-fr">
      {allMetrics.map((m) => {
        const isSummary = !m.change;
        const trendColor = m.trend === "up" ? (m.accent === "text-terminal" ? "text-terminal" : "text-rose") : m.trend === "down" ? "text-terminal" : "text-muted-foreground";

        return (
          <Card key={m.label} className={`border-border/50 bg-card surface-elevated ${m.span ?? "col-span-1"}`}>
            <CardContent className="p-3.5 flex flex-col justify-between h-full gap-1.5">
              <div className="flex items-center justify-between">
                <span className={m.accent}>{m.icon}</span>
                {m.change && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium tabular-nums ${trendColor}`}>
                    {trendIcon[m.trend]}
                    {m.change}
                  </div>
                )}
              </div>
              <p className={`${isSummary ? "text-xs" : "text-lg"} font-bold text-foreground leading-tight tabular-nums break-words`}>
                {m.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
              {m.extra}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BillingCards;
