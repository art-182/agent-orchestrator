import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { mockProviders, providerStatusColor } from "@/lib/mock-data";

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
        {mockProviders.map((p) => (
          <div key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${providerStatusColor[p.status]} ${
                  p.status !== "down" ? "animate-pulse-dot" : ""
                }`}
              />
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
