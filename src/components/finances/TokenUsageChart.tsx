import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DailyTokenUsage } from "@/lib/finance-data";

interface TokenUsageChartProps {
  data: DailyTokenUsage[];
}

const formatK = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

const TokenUsageChart = ({ data }: TokenUsageChartProps) => (
  <Card className="border-border/50 bg-card surface-elevated">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Uso Diário de Tokens</CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={formatK} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: 11,
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [formatK(value), undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="input" name="Input" fill="hsl(187, 80%, 53%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="output" name="Output" fill="hsl(260, 67%, 70%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default TokenUsageChart;
