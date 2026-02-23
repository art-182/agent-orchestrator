import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useMissions } from "@/hooks/use-supabase-data";
import { useNavigate } from "react-router-dom";

const priorityColor: Record<string, string> = {
  critical: "bg-rose/15 text-rose border-rose/30",
  high: "bg-amber/15 text-amber border-amber/30",
  medium: "bg-cyan/15 text-cyan border-cyan/30",
  low: "bg-muted text-muted-foreground border-border",
};

const ActiveMissions = () => {
  const { data: missions } = useMissions();
  const navigate = useNavigate();
  const active = (missions ?? []).filter((m) => m.status !== "done").slice(0, 5);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-mono">
          <Target className="h-4 w-4 text-terminal" />
          Missões Ativas
          <Badge variant="outline" className="ml-auto rounded px-1.5 py-0 text-[10px] border-border font-mono">
            {active.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2.5">
        {active.length === 0 && (
          <p className="font-mono text-xs text-muted-foreground text-center py-4">Nenhuma missão ativa</p>
        )}
        {active.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate("/missions")}
            className="w-full text-left rounded-lg border border-border bg-muted/20 p-3 space-y-2 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-foreground truncate flex-1">{m.name}</span>
              <Badge variant="outline" className={`rounded px-1.5 py-0 text-[9px] border font-mono shrink-0 ${priorityColor[m.priority] ?? priorityColor.medium}`}>
                {m.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={m.progress ?? 0} className="h-1.5 flex-1" />
              <span className="font-mono text-[10px] text-muted-foreground shrink-0">{m.progress ?? 0}%</span>
            </div>
            {m.deadline && (
              <p className="font-mono text-[9px] text-muted-foreground">
                Prazo: {new Date(m.deadline).toLocaleDateString("pt-BR")}
              </p>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveMissions;
