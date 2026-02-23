import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

// Provider status is not stored in DB yet, keep as static
const providers = [
  { name: "OpenAI", status: "healthy" as const, latency: 142 },
  { name: "Anthropic", status: "healthy" as const, latency: 198 },
  { name: "Google", status: "degraded" as const, latency: 523 },
  { name: "Vercel", status: "healthy" as const, latency: 89 },
];

const statusColor: Record<string, string> = {
  healthy: "bg-terminal",
  degraded: "bg-amber",
  down: "bg-rose",
};

const ProviderStatus = () => (
  <Card className="border-border bg-card">
    <CardHeader className="p-4 pb-2">
      <CardTitle className="flex items-center gap-2 text-sm font-mono">
        <Wifi className="h-4 w-4 text-terminal" />
        Providers
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-2">
      <div className="space-y-3">
        {providers.map((p) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${statusColor[p.status]} ${p.status !== "down" ? "animate-pulse-dot" : ""}`} />
              <span className="font-mono text-xs text-foreground">{p.name}</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{p.latency}ms</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProviderStatus;
