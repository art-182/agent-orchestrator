import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAgents } from "@/hooks/use-supabase-data";
import { useNavigate } from "react-router-dom";

type AgentStatus = "online" | "busy" | "idle" | "error";

const statusDot: Record<AgentStatus, string> = {
  online: "bg-terminal",
  busy: "bg-amber",
  idle: "bg-muted-foreground/50",
  error: "bg-rose",
};

const statusBg: Record<AgentStatus, string> = {
  online: "bg-terminal/5 border-terminal/15 hover:bg-terminal/10 hover:border-terminal/25",
  busy: "bg-amber/5 border-amber/15 hover:bg-amber/10 hover:border-amber/25",
  idle: "bg-muted/30 border-border/50 hover:bg-muted/50",
  error: "bg-rose/5 border-rose/15 hover:bg-rose/10",
};

const statusLabel: Record<AgentStatus, string> = {
  online: "Online", busy: "Ocupado", idle: "Inativo", error: "Erro",
};

const AgentFleet = () => {
  const { data: agents } = useAgents();
  const navigate = useNavigate();
  const list = agents ?? [];

  const counts = {
    online: list.filter((a) => a.status === "online").length,
    busy: list.filter((a) => a.status === "busy").length,
    idle: list.filter((a) => a.status === "idle").length,
    error: list.filter((a) => a.status === "error").length,
  };

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <div className="bg-terminal/10 text-terminal p-1.5 rounded-lg">
            <Users className="h-4 w-4" />
          </div>
          Fleet de Agentes
          <div className="ml-auto flex items-center gap-3">
            {(["online", "busy", "idle", "error"] as AgentStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
                <span className="text-[11px] text-muted-foreground font-medium">{counts[s]}</span>
              </div>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {list.map((agent) => {
            const status = (agent.status as AgentStatus) ?? "online";
            return (
              <button
                key={agent.id}
                onClick={() => navigate("/agents")}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-250 hover:scale-[1.02] active:scale-[0.98] ${statusBg[status]}`}
              >
                <span className="text-xl select-none">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[status]} ${status === "online" || status === "busy" ? "animate-pulse-dot" : ""}`} />
                    <span className="text-[13px] font-semibold text-foreground truncate">{agent.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 pl-3.5">{agent.current_task ?? statusLabel[status]}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentFleet;
