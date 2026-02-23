import { Bot, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useAgents } from "@/hooks/use-supabase-data";

const iconMap: Record<string, React.ReactNode> = {
  Bot: <Bot className="h-3.5 w-3.5" />,
  TrendingUp: <TrendingUp className="h-3.5 w-3.5" />,
  DollarSign: <DollarSign className="h-3.5 w-3.5" />,
  Activity: <Activity className="h-3.5 w-3.5" />,
};

const StatusBar = () => {
  const { data: agents } = useAgents();
  const list = agents ?? [];
  const online = list.filter((a) => a.status !== "error").length;
  const total = list.length;
  const totalCost = list.reduce((s, a) => s + (a.total_cost ?? 0), 0);

  const badges = [
    { label: "Agentes", value: `${online}/${total}`, icon: "Bot" },
    { label: "Sucesso", value: "97.2%", icon: "TrendingUp" },
    { label: "Custo/h", value: `$${(totalCost / Math.max(total * 24 * 14, 1) * 24).toFixed(2)}`, icon: "DollarSign" },
    { label: "Uptime", value: "99.8%", icon: "Activity" },
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
