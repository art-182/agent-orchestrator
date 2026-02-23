import { GitBranch, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useInteractions } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const typeConfig: Record<string, { color: string; label: string }> = {
  delegation: { color: "bg-violet/15 text-violet border-violet/30", label: "Delegação" },
  response: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Resposta" },
  escalation: { color: "bg-rose/15 text-rose border-rose/30", label: "Escalação" },
  feedback: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Feedback" },
  sync: { color: "bg-amber/15 text-amber border-amber/30", label: "Sync" },
};

const Interactions = () => {
  const { data: interactions, isLoading } = useInteractions();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Interações</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      </PageTransition>
    );
  }

  const list = interactions ?? [];
  const totalTokens = list.reduce((s, i) => s + (i.tokens ?? 0), 0);

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Interações</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: list.length.toString(), color: "text-foreground" },
          { label: "Delegações", value: list.filter((i) => i.type === "delegation").length.toString(), color: "text-violet" },
          { label: "Escalações", value: list.filter((i) => i.type === "escalation").length.toString(), color: "text-rose" },
          { label: "Tokens", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), color: "text-cyan" },
          { label: "Agentes", value: new Set([...list.map((i) => i.from_agent), ...list.map((i) => i.to_agent)].filter(Boolean)).size.toString(), color: "text-terminal" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-2">
          {list.map((inter) => {
            const tc = typeConfig[inter.type] ?? typeConfig.sync;
            const fromAgent = inter.from as any;
            const toAgent = inter.to as any;
            return (
              <Card key={inter.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2 w-2 rounded-full bg-terminal" />
                      <div className="w-px h-full bg-border mt-1" />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-muted-foreground">{new Date(inter.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="font-mono text-xs font-semibold text-foreground">{fromAgent?.emoji} {fromAgent?.name}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-mono text-xs font-semibold text-foreground">{toAgent?.emoji} {toAgent?.name}</span>
                        <Badge variant="outline" className={`font-mono text-[8px] px-1 py-0 border ${tc.color}`}>
                          {tc.label}
                        </Badge>
                        {inter.missions && (
                          <span className="font-mono text-[9px] text-muted-foreground">· {(inter.missions as any)?.name}</span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{inter.message}</p>
                      <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
                        <span><Zap className="h-2.5 w-2.5 inline mr-0.5" />{inter.tokens ?? 0} tokens</span>
                        <span>⏱ {inter.latency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </PageTransition>
  );
};

export default Interactions;
