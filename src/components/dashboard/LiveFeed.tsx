import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useInteractions } from "@/hooks/use-supabase-data";

const LiveFeed = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: interactions } = useInteractions();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interactions]);

  const list = (interactions ?? []).slice(0, 20);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-mono">
          <Terminal className="h-4 w-4 text-terminal" />
          Live Feed
          <span className="ml-auto h-2 w-2 rounded-full bg-terminal animate-pulse-dot" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px] px-4 pb-4">
          <div className="space-y-0.5">
            {list.map((inter) => {
              const fromAgent = inter.from as any;
              const toAgent = inter.to as any;
              return (
                <div key={inter.id} className="flex items-start gap-2 rounded px-2 py-1.5 font-mono text-xs transition-colors hover:bg-muted/50">
                  <span className="shrink-0 text-muted-foreground">{new Date(inter.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  <Badge variant="outline" className="shrink-0 rounded px-1.5 py-0 text-[10px] border bg-terminal/15 text-terminal border-terminal/30">
                    {fromAgent?.name ?? "—"}
                  </Badge>
                  <span className="text-muted-foreground">{inter.type}</span>
                  <span className="flex-1 truncate text-foreground">{inter.message}</span>
                  <span className="shrink-0 text-muted-foreground">{inter.latency}</span>
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
