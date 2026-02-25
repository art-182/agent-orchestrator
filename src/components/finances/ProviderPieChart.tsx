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

/** Antigravity is the only free provider (subscription, no per-inference cost) */
const FREE_PROVIDERS = new Set(["Antigravity"]);

const ProviderPieChart = ({ data }: ProviderPieChartProps) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  // Pie needs value > 0 to render slices
  const pieData = data.filter(d => d.value > 0);

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground tracking-tight">
          <span>Distribuição por Provider</span>
          <span className="text-[11px] text-muted-foreground font-normal tabular-nums">${total.toFixed(2)} operacional</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="flex items-center gap-6">
          <div className="h-[160px] w-[160px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 11,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {data.map((item) => {
              const isFree = FREE_PROVIDERS.has(item.name);
              const pct = total > 0 && item.value > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] font-medium text-foreground">{item.name}</span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {isFree ? "Assinatura" : `$${item.value.toFixed(2)}`}
                  </span>
                  {pct > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderPieChart;
