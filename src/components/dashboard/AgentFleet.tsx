import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useAgents } from "@/hooks/use-supabase-data";
import { useNavigate } from "react-router-dom";

type AgentStatus = "online" | "busy" | "idle" | "error";

const statusDot: Record<AgentStatus, string> = {
  online: "bg-terminal",
  busy: "bg-amber",
  idle: "bg-muted-foreground",
  error: "bg-rose",
};

const statusBg: Record<AgentStatus, string> = {
  online: "bg-terminal/10 border-terminal/20",
  busy: "bg-amber/10 border-amber/20",
  idle: "bg-muted/50 border-border",
  error: "bg-rose/10 border-rose/20",
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
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-mono">
          <Users className="h-4 w-4 text-terminal" />
          Agent Fleet
          <div className="ml-auto flex items-center gap-2">
            {(["online", "busy", "idle", "error"] as AgentStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s]}`} />
                <span className="font-mono text-[10px] text-muted-foreground">{counts[s]}</span>
              </div>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {list.map((agent) => {
            const status = (agent.status as AgentStatus) ?? "online";
            return (
              <button
                key={agent.id}
                onClick={() => navigate("/agents")}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all hover:brightness-110 ${statusBg[status]}`}
              >
                <span className="text-lg">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[status]} ${status !== "error" && status !== "idle" ? "animate-pulse-dot" : ""}`} />
                    <span className="font-mono text-[11px] font-semibold text-foreground truncate">{agent.name}</span>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground truncate mt-0.5">{agent.current_task ?? "Idle"}</p>
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
