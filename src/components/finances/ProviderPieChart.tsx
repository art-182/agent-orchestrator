import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ProviderSlice {
  name: string;
  value: number;
  color: string;
}

interface ProviderPieChartProps {
  data: ProviderSlice[];
}

const ProviderPieChart = ({ data }: ProviderPieChartProps) => (
  <Card className="border-border/50 bg-card surface-elevated">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Distribuição por Provider</CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <div className="flex items-center gap-6">
        <div className="h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 11,
                }}
                formatter={(value: number) => [`${value}%`, undefined]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[12px] font-medium text-foreground">{item.name}</span>
              <span className="text-[12px] text-muted-foreground tabular-nums">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProviderPieChart;
