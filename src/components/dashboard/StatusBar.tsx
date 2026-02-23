import { Bot, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockStatusBadges } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  Bot: <Bot className="h-3 w-3" />,
  TrendingUp: <TrendingUp className="h-3 w-3" />,
  DollarSign: <DollarSign className="h-3 w-3" />,
  Activity: <Activity className="h-3 w-3" />,
};

const StatusBar = () => (
  <div className="flex flex-wrap gap-3">
    {mockStatusBadges.map((badge) => (
      <Badge
        key={badge.label}
        variant="outline"
        className="gap-1.5 rounded-md border-border bg-card px-3 py-1.5 font-mono text-xs"
      >
        <span className="text-terminal">{iconMap[badge.icon]}</span>
        <span className="text-muted-foreground">{badge.label}:</span>
        <span className="text-foreground">{badge.value}</span>
      </Badge>
    ))}
  </div>
);

export default StatusBar;
