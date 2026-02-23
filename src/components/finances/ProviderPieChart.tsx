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
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Distribuição por Provider</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-6">
        <div className="h-[160px] w-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(230, 22%, 5%)",
                  border: "1px solid hsl(230, 15%, 14%)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                }}
                formatter={(value: number) => [`${value}%`, undefined]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-mono text-xs text-foreground">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProviderPieChart;
