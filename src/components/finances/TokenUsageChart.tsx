import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Uso Diário de Tokens</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 14%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }}
              axisLine={{ stroke: "hsl(230, 15%, 14%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(220, 10%, 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatK}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(230, 22%, 5%)",
                border: "1px solid hsl(230, 15%, 14%)",
                borderRadius: "8px",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
              }}
              labelStyle={{ color: "hsl(220, 20%, 95%)" }}
              formatter={(value: number) => [formatK(value), undefined]}
            />
            <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            <Bar dataKey="input" name="Input" fill="hsl(187, 80%, 53%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="output" name="Output" fill="hsl(260, 67%, 70%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default TokenUsageChart;
