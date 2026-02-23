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
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-mono">
          <Terminal className="h-5 w-5 text-terminal" />
          Live Feed
          <span className="ml-auto h-2.5 w-2.5 rounded-full bg-terminal animate-pulse-dot" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[360px] px-5 pb-5">
          <div className="space-y-1">
            {list.map((inter) => {
              const fromAgent = inter.from as any;
              return (
                <div key={inter.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors hover:bg-muted/50">
                  <span className="shrink-0 text-muted-foreground text-xs mt-0.5">{new Date(inter.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  <Badge variant="outline" className="shrink-0 rounded-md px-2 py-0.5 text-xs border bg-terminal/15 text-terminal border-terminal/30">
                    {fromAgent?.name ?? "—"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">{inter.type}</span>
                  <span className="flex-1 truncate text-foreground text-xs">{inter.message}</span>
                  <span className="shrink-0 text-muted-foreground text-xs">{inter.latency}</span>
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
