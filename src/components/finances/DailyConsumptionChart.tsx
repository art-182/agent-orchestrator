import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DailyTokenUsage } from "@/lib/finance-types";

interface Props {
  data: DailyTokenUsage[];
}

const formatK = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

/** Aggregate multiple rows per date into single values */
function aggregate(raw: DailyTokenUsage[]) {
  const byDate = new Map<string, { input: number; output: number }>();
  for (const r of raw) {
    const d = r.date;
    if (!byDate.has(d)) byDate.set(d, { input: 0, output: 0 });
    const acc = byDate.get(d)!;
    acc.input  += r.input ?? 0;
    acc.output += r.output ?? 0;
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
}

const DailyConsumptionChart = ({ data }: Props) => {
  const series = aggregate(data);

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Consumo Diário de Tokens</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={formatK}
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
                formatter={(value: number) => [formatK(value), undefined]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="input"  name="Input Tokens"  fill="hsl(187, 80%, 53%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="output" name="Output Tokens" fill="hsl(260, 67%, 70%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyConsumptionChart;
