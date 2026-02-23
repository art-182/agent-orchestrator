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
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-mono">
          <Users className="h-5 w-5 text-terminal" />
          Agent Fleet
          <div className="ml-auto flex items-center gap-3">
            {(["online", "busy", "idle", "error"] as AgentStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusDot[s]}`} />
                <span className="font-mono text-xs text-muted-foreground">{counts[s]}</span>
              </div>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {list.map((agent) => {
            const status = (agent.status as AgentStatus) ?? "online";
            return (
              <button
                key={agent.id}
                onClick={() => navigate("/agents")}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${statusBg[status]}`}
              >
                <span className="text-xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${statusDot[status]} ${status !== "error" && status !== "idle" ? "animate-pulse-dot" : ""}`} />
                    <span className="font-mono text-sm font-semibold text-foreground truncate">{agent.name}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate mt-0.5">{agent.current_task ?? "Idle"}</p>
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
