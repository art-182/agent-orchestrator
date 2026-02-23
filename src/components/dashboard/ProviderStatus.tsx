import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

const providers: { name: string; status: string; latency: number }[] = [
  { name: "OpenAI", status: "healthy", latency: 142 },
  { name: "Anthropic", status: "healthy", latency: 198 },
  { name: "Google", status: "degraded", latency: 523 },
  { name: "Vercel", status: "healthy", latency: 89 },
];

const statusColor: Record<string, string> = {
  healthy: "bg-terminal",
  degraded: "bg-amber",
  down: "bg-rose",
};

const statusLabel: Record<string, string> = {
  healthy: "Operacional",
  degraded: "Degradado",
  down: "Offline",
};

const ProviderStatus = () => (
  <Card className="border-border/50 bg-card surface-elevated">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
        <div className="bg-terminal/10 text-terminal p-1.5 rounded-lg">
          <Wifi className="h-4 w-4" />
        </div>
        Providers
      </CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <div className="space-y-3">
        {providers.map((p) => (
          <div key={p.name} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${statusColor[p.status]} ${p.status !== "down" ? "animate-pulse-dot" : ""}`} />
              <span className="text-[13px] text-foreground/90 font-medium">{p.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
                {statusLabel[p.status]}
              </span>
              <span className={`text-[12px] tabular-nums font-medium ${p.latency > 400 ? "text-amber" : "text-muted-foreground"}`}>
                {p.latency}ms
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProviderStatus;
