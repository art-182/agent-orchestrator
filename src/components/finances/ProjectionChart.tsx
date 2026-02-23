import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthlyProjection } from "@/lib/finance-data";

interface ProjectionChartProps {
  data: MonthlyProjection[];
}

const ProjectionChart = ({ data }: ProjectionChartProps) => {
  const lastActualIdx = data.findIndex((d) => d.actual === null) - 1;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm text-foreground">Projeção Mensal de Custos</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-terminal" />
              <span className="font-mono text-[10px] text-muted-foreground">Realizado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-4 rounded-sm bg-amber opacity-60" />
              <span className="font-mono text-[10px] text-muted-foreground">Projetado</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 14%)" />
              <XAxis
                dataKey="month"
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
                formatter={(value: number | null) => [value !== null ? `$${value.toFixed(2)}` : "—", undefined]}
              />
              {lastActualIdx >= 0 && (
                <ReferenceLine
                  x={data[lastActualIdx].month}
                  stroke="hsl(220, 10%, 30%)"
                  strokeDasharray="4 4"
                  label={{ value: "Hoje", position: "top", fill: "hsl(220, 10%, 50%)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                />
              )}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(160, 51%, 49%)"
                fill="url(#gradActual)"
                strokeWidth={2}
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(45, 93%, 56%)"
                fill="url(#gradProjected)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectionChart;
