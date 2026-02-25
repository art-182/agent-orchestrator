import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { useProviderLimits, useDailyCosts } from "@/hooks/use-supabase-data";

const statusColor: Record<string, string> = {
  healthy: "bg-terminal",
  degraded: "bg-amber",
  down: "bg-rose",
};

const ProviderStatus = () => {
  const { data: providers } = useProviderLimits();
  const { data: costs } = useDailyCosts();

  // Real cost by provider from daily_costs columns
  const totalGoogle = (costs ?? []).reduce((s, c) => s + (c.google ?? 0), 0);
  const totalAnthropic = (costs ?? []).reduce((s, c) => s + (c.anthropic ?? 0), 0);
  const totalOpenAI = (costs ?? []).reduce((s, c) => s + (c.openai ?? 0), 0);
  const totalCost = totalGoogle + totalAnthropic + totalOpenAI;

  const providerList = (providers ?? []).map(p => {
    const uptime = p.uptime ?? 99;
    const status = uptime >= 99.5 ? "healthy" : uptime >= 95 ? "degraded" : "down";
    return {
      name: p.provider ?? "?",
      status,
      latency: p.avg_latency ?? 0,
      dailySpent: p.daily_spent ?? 0,
      monthlySpent: p.monthly_spent ?? 0,
    };
  });

  return (
    <Card className="border-border/50 bg-card surface-elevated flex-1 flex flex-col">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold tracking-tight">
          <div className="flex items-center gap-2.5">
            <div className="bg-terminal/10 text-terminal p-1.5 rounded-lg">
              <Wifi className="h-4 w-4" />
            </div>
            Providers
          </div>
          <span className="text-[11px] text-muted-foreground font-normal tabular-nums">${totalCost.toFixed(2)} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="space-y-3">
          {providerList.map((p) => (
            <div key={p.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${statusColor[p.status]} ${p.status !== "down" ? "animate-pulse-dot" : ""}`} />
                <div>
                  <span className="text-[13px] text-foreground/90 font-medium">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">${p.monthlySpent.toFixed(2)}</span>
                </div>
              </div>
              <span className={`text-[12px] tabular-nums font-medium ${p.latency > 1000 ? "text-amber" : "text-muted-foreground"}`}>
                {p.latency}ms
              </span>
            </div>
          ))}
          {providerList.length === 0 && (
            <p className="text-[11px] text-muted-foreground">Carregando...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderStatus;
