import { useEffect, useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InteractionItem {
  id: string;
  from_agent: string | null;
  to_agent: string | null;
  message: string;
  type: string;
  tokens: number | null;
  created_at: string;
  from?: { name: string; emoji: string } | null;
  to?: { name: string; emoji: string } | null;
}

const typeColor: Record<string, string> = {
  delegation: "bg-violet/15 text-violet border-violet/20",
  response: "bg-terminal/15 text-terminal border-terminal/20",
  escalation: "bg-rose/15 text-rose border-rose/20",
  feedback: "bg-amber/15 text-amber border-amber/20",
  query: "bg-cyan/15 text-cyan border-cyan/20",
};

interface LiveInteractionFeedProps {
  interactions: InteractionItem[];
  newIds: Set<string>;
}

const LiveInteractionFeed = ({ interactions, newIds }: LiveInteractionFeedProps) => {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions.length]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s atrás`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min atrás`;
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="border border-border/50 rounded-2xl bg-card surface-elevated overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan" />
          <span className="text-[13px] font-semibold text-foreground tracking-tight">Feed ao Vivo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-terminal animate-pulse" />
          <span className="text-[10px] text-terminal font-medium">Realtime</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div ref={topRef} />
        <div className="p-2 space-y-1.5">
          {interactions.slice(0, 20).map((inter) => {
            const isNew = newIds.has(inter.id);
            return (
              <div
                key={inter.id}
                className={`rounded-xl p-3 transition-all duration-500 ${
                  isNew
                    ? "bg-cyan/5 border border-cyan/20 shadow-sm shadow-cyan/5"
                    : "bg-muted/10 border border-transparent hover:border-border/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{inter.from?.emoji ?? "🤖"}</span>
                  <span className="text-[11px] font-semibold text-foreground">{inter.from?.name ?? "—"}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{inter.to?.emoji ?? "🤖"}</span>
                  <span className="text-[11px] font-semibold text-foreground">{inter.to?.name ?? "—"}</span>
                  <Badge
                    variant="outline"
                    className={`ml-auto text-[9px] px-1.5 py-0 border rounded-full font-medium ${typeColor[inter.type] ?? "text-muted-foreground border-border/50"}`}
                  >
                    {inter.type}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{inter.message}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground/60">{formatTime(inter.created_at)}</span>
                  {(inter.tokens ?? 0) > 0 && (
                    <span className="text-[10px] text-cyan/60 tabular-nums">{inter.tokens?.toLocaleString()} tokens</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LiveInteractionFeed;
