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

const ProviderStatus = () => (
  <Card className="border-border bg-card">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="flex items-center gap-2.5 text-base font-mono">
        <Wifi className="h-5 w-5 text-terminal" />
        Providers
      </CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <div className="space-y-3.5">
        {providers.map((p) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${statusColor[p.status]} ${p.status !== "down" ? "animate-pulse-dot" : ""}`} />
              <span className="font-mono text-sm text-foreground">{p.name}</span>
            </div>
            <span className="font-mono text-sm text-muted-foreground">{p.latency}ms</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ProviderStatus;
