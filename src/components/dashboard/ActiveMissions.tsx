import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useMissions } from "@/hooks/use-supabase-data";
import { useNavigate } from "react-router-dom";

const priorityColor: Record<string, string> = {
  critical: "bg-rose/10 text-rose border-rose/20",
  high: "bg-amber/10 text-amber border-amber/20",
  medium: "bg-cyan/10 text-cyan border-cyan/20",
  low: "bg-muted text-muted-foreground border-border/50",
};

const ActiveMissions = () => {
  const { data: missions } = useMissions();
  const navigate = useNavigate();
  const active = (missions ?? []).filter((m) => m.status !== "done").slice(0, 5);

  return (
    <Card className="border-border/50 bg-card surface-elevated flex-1 flex flex-col">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <div className="bg-terminal/10 text-terminal p-1.5 rounded-lg">
            <Target className="h-4 w-4" />
          </div>
          Missões Ativas
          <Badge variant="outline" className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] border-border/50 text-muted-foreground font-medium">
            {active.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-2.5">
        {active.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-8">Nenhuma missão ativa</p>
        )}
        {active.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate("/missions")}
            className="w-full text-left rounded-2xl border border-border/40 bg-muted/10 p-4 space-y-3 hover:border-border/70 hover:bg-muted/20 transition-all duration-250 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-foreground truncate flex-1">{m.name}</span>
              <Badge variant="outline" className={`rounded-full px-2 py-0 text-[9px] border font-medium shrink-0 ${priorityColor[m.priority] ?? priorityColor.medium}`}>
                {m.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={m.progress ?? 0} className="h-1.5 flex-1" />
              <span className="text-[12px] text-muted-foreground shrink-0 font-medium tabular-nums">{m.progress ?? 0}%</span>
            </div>
            {m.deadline && (
              <p className="text-[11px] text-muted-foreground/70">
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
