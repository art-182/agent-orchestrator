import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyCost } from "@/lib/finance-data";

interface CostChartProps {
  data: DailyCost[];
}

const CostChart = ({ data }: CostChartProps) => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Custo Diário por Provider</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOpenai" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAnthropic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(260, 67%, 70%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(260, 67%, 70%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGoogle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45, 93%, 56%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(45, 93%, 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `$${v}`}
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
              formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
            />
            <Legend
              wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="openai"
              name="OpenAI"
              stroke="hsl(160, 51%, 49%)"
              fill="url(#gradOpenai)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="anthropic"
              name="Anthropic"
              stroke="hsl(260, 67%, 70%)"
              fill="url(#gradAnthropic)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="google"
              name="Google"
              stroke="hsl(45, 93%, 56%)"
              fill="url(#gradGoogle)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export default CostChart;
