import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { useProviderLimits, useDailyCosts } from "@/hooks/use-supabase-data";

const statusColor: Record<string, string> = {
  healthy: "bg-terminal",
  degraded: "bg-amber",
  down: "bg-rose",
};

/**
 * Provider cost mapping:
 *   Google / Google CLI  → daily_costs.google (real cost, API key)
 *   Antigravity          → $0 (subscription, no per-inference cost)
 *   Vercel AI Gateway    → $0 (configured, not used)
 *   Minimax              → $0 (configured, not used)
 */
const providerCostKey: Record<string, "google" | null> = {
  "Google":              "google",
  "Google CLI":          "google",
  "Antigravity":          null,
  "Vercel AI Gateway":    null,
  "Minimax":              null,
};

const providerTag: Record<string, string> = {
  "Antigravity":        "Assinatura",
  "Vercel AI Gateway":  "Não utilizado",
  "Minimax":            "Não utilizado",
};

const ProviderStatus = () => {
  const { data: providers } = useProviderLimits();
  const { data: costs } = useDailyCosts();

  // Operational cost = only google
  const operationalCost = Math.round(
    (costs ?? []).reduce((s, c) => s + (c.google ?? 0), 0) * 100
  ) / 100;

  const providerList = (providers ?? []).map(p => {
    const uptime = p.uptime ?? 99;
    const status = uptime >= 99.5 ? "healthy" : uptime >= 95 ? "degraded" : "down";
    const key = providerCostKey[p.provider ?? ""];
    const cost = key ? operationalCost : 0;
    const tag = providerTag[p.provider ?? ""];
    return {
      name: p.provider ?? "?",
      tier: p.tier ?? "",
      status,
      latency: p.avg_latency ?? 0,
      cost,
      tag,
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
          <span className="text-[11px] text-muted-foreground font-normal tabular-nums">${operationalCost.toFixed(2)} operacional</span>
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
                  <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
                    {p.tag ? p.tag : p.cost > 0 ? `$${p.cost.toFixed(2)}` : "$0"}
                  </span>
                </div>
              </div>
              <span className={`text-[12px] tabular-nums font-medium ${p.latency > 1000 ? "text-amber" : "text-muted-foreground"}`}>
                {p.latency > 0 ? `${p.latency}ms` : "—"}
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
