import { Bot, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useAgents, useTraces, useProviderLimits, useDailyCosts } from "@/hooks/use-supabase-data";

const iconMap: Record<string, React.ReactNode> = {
  Bot: <Bot className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  DollarSign: <DollarSign className="h-3.5 w-3.5" />,
  Activity: <Activity className="h-3.5 w-3.5" />,
};

const StatusBar = () => {
  const { data: agents } = useAgents();
  const { data: traces } = useTraces();
  const { data: providers } = useProviderLimits();
  const { data: costs } = useDailyCosts();

  const list = agents ?? [];
  const online = list.filter((a) => a.status !== "error").length;
  const total = list.length;

  // Real cost from daily_costs
  const totalCost = (costs ?? []).reduce((s, c) => s + (c.total ?? 0), 0);
  const days = new Set((costs ?? []).map(c => c.date)).size || 1;
  const costPerHour = totalCost / (days * 24);

  // Real success rate from traces
  const traceList = traces ?? [];
  const successRate = traceList.length > 0
    ? (traceList.filter(t => t.status === "success").length / traceList.length * 100).toFixed(1)
    : "100";

  // Real uptime from providers (average)
  const provList = providers ?? [];
  const avgUptime = provList.length > 0
    ? (provList.reduce((s, p) => s + (p.uptime ?? 99), 0) / provList.length).toFixed(1)
    : "99.9";

  const badges = [
    { label: "Agentes", value: `${online}/${total}`, icon: "Bot" },
    { label: "Sucesso", value: `${successRate}%`, icon: "TrendingUp" },
    { label: "Custo/h", value: `$${costPerHour.toFixed(2)}`, icon: "DollarSign" },
    { label: "Uptime", value: `${avgUptime}%`, icon: "Activity" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm px-3.5 py-1.5 transition-colors hover:border-border/70"
        >
          <span className="text-terminal/70">{iconMap[badge.icon]}</span>
          <span className="text-[11px] text-muted-foreground font-medium">{badge.label}</span>
          <span className="text-[12px] text-foreground font-semibold">{badge.value}</span>
        </div>
      ))}
    </div>
  );
};

export default StatusBar;
