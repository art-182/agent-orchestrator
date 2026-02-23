import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { MonthlyProjection } from "@/lib/finance-data";

interface ProjectionChartProps {
  data: MonthlyProjection[];
}

const ProjectionChart = ({ data }: ProjectionChartProps) => {
  const lastActualIdx = data.findIndex((d) => d.actual === null) - 1;

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Projeção Mensal de Custos</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-terminal" />
              <span className="text-[10px] text-muted-foreground font-medium">Realizado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-amber opacity-60" />
              <span className="text-[10px] text-muted-foreground font-medium">Projetado</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 51%, 49%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(45, 93%, 56%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(45, 93%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 11,
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number | null) => [value !== null ? `$${value.toFixed(2)}` : "—", undefined]}
              />
              {lastActualIdx >= 0 && (
                <ReferenceLine
                  x={data[lastActualIdx].month}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  label={{ value: "Hoje", position: "top", fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
              )}
              <Area type="monotone" dataKey="actual" stroke="hsl(160, 51%, 49%)" fill="url(#gradActual)" strokeWidth={2} connectNulls={false} />
              <Area type="monotone" dataKey="projected" stroke="hsl(45, 93%, 56%)" fill="url(#gradProjected)" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionChart;
