import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  // Build chart config from data
  const chartConfig = useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {};
    for (const d of data) {
      cfg[d.name] = { label: d.name, color: d.color };
    }
    return cfg;
  }, [data]);

  // Recharts needs fill from CSS vars when using ChartContainer
  // But we pass fill directly via data, so we use custom fill
  const chartData = useMemo(() => {
    return data
      .filter(d => d.value > 0)
      .map(d => ({
        provider: d.name,
        value: Math.round(d.value * 100) / 100,
        fill: d.color,
      }));
  }, [data]);

  return (
    <Card className="border-border/50 bg-card surface-elevated flex flex-col">
      <CardHeader className="p-5 pb-0">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground tracking-tight">
          <span>Distribuição por Provider</span>
          <span className="text-[11px] text-muted-foreground font-normal tabular-nums">
            ${total.toFixed(2)} operacional
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-5 pt-2">
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <ChartContainer config={chartConfig} className="h-[180px] w-[180px] shrink-0">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value: any, name: any) =>
                      [`$${Number(value).toFixed(2)}`, name]
                    }
                    hideLabel
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="provider"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            ${total.toFixed(0)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-[10px]"
                          >
                            total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="space-y-2.5">
            {data.map((item) => {
              const isFree = FREE_PROVIDERS.has(item.name);
              const pct = total > 0 && item.value > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
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
