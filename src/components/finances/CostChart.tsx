import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DailyCost } from "@/lib/finance-types";

interface CostChartProps {
  data: DailyCost[];
}

/* ── all configured providers ─────────────────────────────────
 *  Google + Google CLI   = paid (daily_costs.google)
 *  Antigravity           = subscription (daily_costs.anthropic tracked but $0 operational)
 *  Vercel AI Gateway     = paid, not used yet
 *  Minimax               = paid, not used yet
 */
const PROVIDERS = [
  { key: "google",       label: "Google (AI Studio)",     color: "hsl(45, 93%, 56%)" },
  { key: "googleCLI",    label: "Google CLI",             color: "hsl(30, 80%, 50%)" },
  { key: "antigravity",  label: "Antigravity (assinatura)", color: "hsl(200, 80%, 55%)" },
  { key: "vercelAI",     label: "Vercel AI Gateway",      color: "hsl(260, 67%, 70%)" },
  { key: "minimax",      label: "Minimax",                color: "hsl(340, 75%, 55%)" },
] as const;

/** Aggregate daily_costs rows per date → provider columns */
function toProviderSeries(raw: DailyCost[]) {
  const byDate = new Map<string, Record<string, number>>();

  for (const r of raw) {
    const d = r.date;
    if (!byDate.has(d)) byDate.set(d, { google: 0, googleCLI: 0, antigravity: 0, vercelAI: 0, minimax: 0 });
    const acc = byDate.get(d)!;
    acc.google      += r.google ?? 0;   // real operational cost
    acc.googleCLI    = 0;               // can't distinguish from google column yet
    acc.antigravity  = 0;               // subscription — not per-inference
    acc.vercelAI     = 0;               // configured, not used
    acc.minimax      = 0;               // configured, not used
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}

const CostChart = ({ data }: CostChartProps) => {
  const series = toProviderSeries(data);

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Custo Diário por Provider</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {PROVIDERS.map(p => (
                  <linearGradient key={p.key} id={`grad-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={p.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={p.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 11,
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {PROVIDERS.map(p => (
                <Area
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={p.label}
                  stroke={p.color}
                  fill={`url(#grad-${p.key})`}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostChart;
