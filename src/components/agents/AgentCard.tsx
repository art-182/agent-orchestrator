import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Agent } from "@/lib/mock-data";
import { statusBgMap } from "@/lib/mock-data";

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

const AgentCard = ({ agent, onClick }: AgentCardProps) => (
  <Card
    className="border-border bg-card cursor-pointer transition-all hover:border-terminal/40 hover:glow-terminal"
    onClick={onClick}
  >
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.emoji}</span>
          <span className="font-mono text-sm font-semibold text-foreground">{agent.name}</span>
        </div>
        <Badge
          variant="outline"
          className={`rounded px-1.5 py-0 text-[10px] border font-mono ${statusBgMap[agent.status]}`}
        >
          {agent.status}
        </Badge>
      </div>
      <p className="font-mono text-xs text-muted-foreground truncate">{agent.currentTask}</p>
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span>{agent.model}</span>
        <span className="text-border">|</span>
        <span>{agent.provider}</span>
      </div>
    </CardContent>
  </Card>
);

export default AgentCard;
