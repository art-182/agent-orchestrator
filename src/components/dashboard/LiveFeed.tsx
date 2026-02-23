import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInteractions } from "@/hooks/use-supabase-data";

const typeColor: Record<string, string> = {
  delegation: "text-terminal",
  result: "text-cyan",
  error: "text-rose",
  question: "text-amber",
  command: "text-violet",
};

const LiveFeed = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: interactions } = useInteractions();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const list = (interactions ?? []).slice(0, 20);

  return (
    <Card className="border-border/50 bg-card surface-elevated flex-1 flex flex-col min-w-0 overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <div className="bg-terminal/10 text-terminal p-1.5 rounded-lg">
            <Terminal className="h-4 w-4" />
          </div>
          Live Feed
          <span className="ml-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-terminal animate-pulse-dot" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Streaming</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1 min-h-[300px] px-5 pb-5">
          <div className="space-y-0.5">
            {list.map((inter) => {
              const fromAgent = inter.from as any;
              return (
                <div key={inter.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-[12px] transition-all hover:bg-muted/30">
                  <span className="shrink-0 text-muted-foreground/60 mt-0.5 tabular-nums text-[11px]">
                    {new Date(inter.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-terminal/80 min-w-[64px]">
                    {fromAgent?.name ?? "—"}
                  </span>
                  <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wider ${typeColor[inter.type] ?? "text-muted-foreground"}`}>
                    {inter.type}
                  </span>
                  <span className="flex-1 truncate text-foreground/80">{inter.message}</span>
                  <span className="shrink-0 text-muted-foreground/50 text-[11px] tabular-nums">{inter.latency}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveFeed;
