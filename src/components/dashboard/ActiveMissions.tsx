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
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-mono">
          <Target className="h-5 w-5 text-terminal" />
          Missões Ativas
          <Badge variant="outline" className="ml-auto rounded-lg px-2 py-0.5 text-xs border-border font-mono">
            {active.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-3">
        {active.length === 0 && (
          <p className="font-mono text-sm text-muted-foreground text-center py-6">Nenhuma missão ativa</p>
        )}
        {active.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate("/missions")}
            className="w-full text-left rounded-xl border border-border bg-muted/20 p-4 space-y-2.5 hover:border-muted-foreground/30 transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-foreground truncate flex-1">{m.name}</span>
              <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[10px] border font-mono shrink-0 ${priorityColor[m.priority] ?? priorityColor.medium}`}>
                {m.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={m.progress ?? 0} className="h-2 flex-1" />
              <span className="font-mono text-xs text-muted-foreground shrink-0">{m.progress ?? 0}%</span>
            </div>
            {m.deadline && (
              <p className="font-mono text-xs text-muted-foreground">
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
