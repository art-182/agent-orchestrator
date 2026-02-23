import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type AgentStatus = "online" | "busy" | "idle" | "error";

const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/15 text-terminal border-terminal/30",
  busy: "bg-amber/15 text-amber border-amber/30",
  idle: "bg-muted text-muted-foreground border-border",
  error: "bg-rose/15 text-rose border-rose/30",
};

const AgentCard = ({ agent, onClick }: { agent: DbAgent; onClick: () => void }) => (
  <Card className="border-border bg-card cursor-pointer transition-all hover:border-terminal/40 hover:glow-terminal" onClick={onClick}>
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.emoji}</span>
          <span className="font-mono text-sm font-semibold text-foreground">{agent.name}</span>
        </div>
        <Badge variant="outline" className={`rounded px-1.5 py-0 text-[10px] border font-mono ${statusBgMap[(agent.status as AgentStatus) ?? "online"]}`}>
          {agent.status}
        </Badge>
      </div>
      <p className="font-mono text-xs text-muted-foreground truncate">{agent.current_task}</p>
      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
        <span>{agent.model}</span>
        <span className="text-border">|</span>
        <span>{agent.provider}</span>
      </div>
    </CardContent>
  </Card>
);

export default AgentCard;
