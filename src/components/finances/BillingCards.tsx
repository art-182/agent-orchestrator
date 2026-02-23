import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, DollarSign, Zap, Cpu, Clock, Target, ArrowRightLeft, ShieldCheck, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBillingSnapshots, useDailyCosts } from "@/hooks/use-supabase-data";

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
  size?: "sm" | "md" | "lg";
  extra?: React.ReactNode;
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

  const dbMetrics: BentoMetric[] = (snapshots ?? []).slice(0, 4).map((s) => ({
    label: s.label,
    value: s.value,
    change: s.change ?? "",
    trend: (s.trend as "up" | "down" | "neutral") ?? "neutral",
    icon: iconForLabel[s.label] ?? <DollarSign className="h-4 w-4" />,
    accent: accentForLabel[s.label] ?? "text-foreground",
    size: "md" as const,
  }));

  const extras: BentoMetric[] = [
    { label: "Custo/Token Médio", value: "$0.00025", change: "-3%", trend: "down", icon: <Cpu className="h-4 w-4" />, accent: "text-terminal", size: "sm" },
    { label: "Budget Restante", value: "$272.22", change: "34%", trend: "neutral", icon: <Target className="h-4 w-4" />, accent: "text-violet", size: "sm", extra: <Progress value={66} className="h-1 mt-1.5" /> },
    { label: "Latência Média", value: "287ms", change: "-8%", trend: "down", icon: <Clock className="h-4 w-4" />, accent: "text-terminal", size: "sm" },
    { label: "Fallbacks 24h", value: "8", change: "+3", trend: "up", icon: <ArrowRightLeft className="h-4 w-4" />, accent: "text-amber", size: "sm" },
    { label: "Taxa de Sucesso", value: "96.4%", change: "+0.2%", trend: "up", icon: <ShieldCheck className="h-4 w-4" />, accent: "text-terminal", size: "sm" },
  ];

  const metrics = dbMetrics.length > 0 ? [...dbMetrics, ...extras] : [
    { label: "Custo Hoje", value: "$31.40", change: "+12%", trend: "up" as const, icon: <DollarSign className="h-4 w-4" />, accent: "text-rose", size: "md" as const } as BentoMetric,
    { label: "Custo Semana", value: "$198.54", change: "-5%", trend: "down" as const, icon: <BarChart3 className="h-4 w-4" />, accent: "text-terminal", size: "md" as const } as BentoMetric,
    { label: "Custo Mês", value: "$527.78", change: "+8%", trend: "up" as const, icon: <TrendingUp className="h-4 w-4" />, accent: "text-amber", size: "md" as const } as BentoMetric,
    { label: "Tokens Totais", value: "2.1M", change: "+15%", trend: "up" as const, icon: <Zap className="h-4 w-4" />, accent: "text-cyan", size: "md" as const } as BentoMetric,
    ...extras,
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
      {metrics.map((m) => {
        const span = m.size === "lg" ? "col-span-2 md:col-span-2 lg:col-span-3" : m.size === "md" ? "col-span-1 md:col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-1";
        const trendColor = m.trend === "up" ? (m.accent === "text-terminal" ? "text-terminal" : "text-rose") : m.trend === "down" ? "text-terminal" : "text-muted-foreground";

        return (
          <Card key={m.label} className={`border-border/50 bg-card surface-elevated ${span}`}>
            <CardContent className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`${m.accent}`}>{m.icon}</span>
                <div className={`flex items-center gap-0.5 text-[10px] font-medium tabular-nums ${trendColor}`}>
                  {trendIcon[m.trend]}
                  {m.change}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground leading-none tabular-nums">{m.value}</p>
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
