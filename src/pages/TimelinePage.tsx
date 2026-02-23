import { GanttChart, CheckCircle2, Play, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useTimelineEvents } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TimelineEventType = "mission_start" | "task_done" | "deploy" | "error" | "escalation" | "milestone" | "decision";

const typeConfig: Record<TimelineEventType, { color: string; icon: React.ReactNode; accent: string }> = {
  mission_start: { color: "bg-violet/15 text-violet border-violet/30", icon: <Play className="h-3 w-3" />, accent: "bg-violet" },
  task_done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-3 w-3" />, accent: "bg-terminal" },
  deploy: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-3 w-3" />, accent: "bg-cyan" },
  error: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-3 w-3" />, accent: "bg-rose" },
  escalation: { color: "bg-amber/15 text-amber border-amber/30", icon: <AlertTriangle className="h-3 w-3" />, accent: "bg-amber" },
  milestone: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-3 w-3" />, accent: "bg-terminal" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", icon: <Clock className="h-3 w-3" />, accent: "bg-violet" },
};

const typeLabel: Record<TimelineEventType, string> = {
  mission_start: "Missão Iniciada", task_done: "Tarefa Concluída", deploy: "Deploy",
  error: "Erro", escalation: "Escalação", milestone: "Marco", decision: "Decisão",
};

const TimelinePage = () => {
  const { data: events, isLoading } = useTimelineEvents();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <GanttChart className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Timeline</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </PageTransition>
    );
  }

  const list = events ?? [];

  // Group by date
  const groups: Record<string, typeof list> = {};
  list.forEach((e) => {
    const dateKey = format(new Date(e.created_at), "dd MMM", { locale: ptBR });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(e);
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <GanttChart className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Timeline</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Eventos", value: list.length.toString(), color: "text-foreground" },
          { label: "Deploys", value: list.filter((e) => e.type === "deploy").length.toString(), color: "text-cyan" },
          { label: "Erros", value: list.filter((e) => e.type === "error").length.toString(), color: "text-rose" },
          { label: "Marcos", value: list.filter((e) => e.type === "milestone").length.toString(), color: "text-terminal" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6">
          {Object.entries(groups).map(([date, evts]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground px-2">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="relative pl-6 space-y-3">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
                {evts.map((evt) => {
                  const tc = typeConfig[(evt.type as TimelineEventType) ?? "task_done"];
                  const agent = evt.agents as any;
                  const mission = evt.missions as any;
                  return (
                    <div key={evt.id} className="relative">
                      <div className={`absolute left-[-18px] top-2.5 h-2.5 w-2.5 rounded-full ${tc.accent} ring-2 ring-background`} />
                      <Card className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                        <CardContent className="p-3 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {format(new Date(evt.created_at), "HH:mm")}
                            </span>
                            {tc.icon}
                            <span className="font-mono text-xs font-semibold text-foreground">{evt.title}</span>
                            <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border ${tc.color}`}>
                              {typeLabel[(evt.type as TimelineEventType) ?? "task_done"]}
                            </Badge>
                            {mission && (
                              <span className="font-mono text-[9px] text-muted-foreground">· {mission.name}</span>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground">{evt.description}</p>
                          <span className="font-mono text-[9px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </PageTransition>
  );
};

export default TimelinePage;
