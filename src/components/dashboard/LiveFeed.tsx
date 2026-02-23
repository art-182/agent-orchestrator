import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { mockFeedEvents } from "@/lib/mock-data";

const LiveFeed = () => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
            {mockFeedEvents.map((event, i) => (
              <div
                key={`${event.timestamp}-${i}`}
                className="flex items-start gap-2 rounded px-2 py-1.5 font-mono text-xs transition-colors hover:bg-muted/50"
              >
                <span className="shrink-0 text-muted-foreground">{event.timestamp}</span>
                <Badge
                  variant="outline"
                  className={`shrink-0 rounded px-1.5 py-0 text-[10px] border ${event.agentColor}`}
                >
                  {event.agent}
                </Badge>
                <span className="text-muted-foreground">{event.action}</span>
                <span className="flex-1 truncate text-foreground">{event.result}</span>
                <span className="shrink-0 text-muted-foreground">{event.cost}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveFeed;
