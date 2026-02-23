import { Bot, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    { label: "Agentes Online", value: `${online}/${total}`, icon: "Bot" },
    { label: "Taxa de Sucesso", value: "97.2%", icon: "TrendingUp" },
    { label: "Custo/Hora", value: `$${(totalCost / Math.max(total * 24 * 14, 1) * 24).toFixed(2)}`, icon: "DollarSign" },
    { label: "Uptime", value: "99.8%", icon: "Activity" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((badge) => (
        <Badge key={badge.label} variant="outline" className="gap-2 rounded-lg border-border bg-card px-4 py-2 font-mono text-sm">
          <span className="text-terminal">{iconMap[badge.icon]}</span>
          <span className="text-muted-foreground">{badge.label}:</span>
          <span className="text-foreground font-semibold">{badge.value}</span>
        </Badge>
      ))}
    </div>
  );
};

export default StatusBar;
