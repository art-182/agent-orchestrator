import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type AgentStatus = "online" | "busy" | "idle" | "error";

const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/10 text-terminal border-terminal/20",
  busy: "bg-amber/10 text-amber border-amber/20",
  idle: "bg-muted/50 text-muted-foreground border-border/50",
  error: "bg-rose/10 text-rose border-rose/20",
};

const AgentCard = ({ agent, onClick }: { agent: DbAgent; onClick: () => void }) => (
  <Card className="border-border/50 bg-card surface-elevated cursor-pointer transition-all duration-200 hover:border-terminal/30 glow-line" onClick={onClick}>
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{agent.emoji}</span>
          <span className="text-[13px] font-semibold text-foreground tracking-tight">{agent.name}</span>
        </div>
        <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] border font-medium ${statusBgMap[(agent.status as AgentStatus) ?? "online"]}`}>
          {agent.status}
        </Badge>
      </div>
      <p className="text-[12px] text-muted-foreground truncate">{agent.current_task}</p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{agent.model}</span>
        <span className="text-border/50">|</span>
        <span>{agent.provider}</span>
      </div>
    </CardContent>
  </Card>
);

export default AgentCard;
