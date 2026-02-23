import { ListChecks, Zap, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { DashboardMetric } from "@/lib/mock-data";

const iconMap: Record<string, React.ReactNode> = {
  ListChecks: <ListChecks className="h-4 w-4 text-terminal" />,
  Zap: <Zap className="h-4 w-4 text-cyan" />,
  DollarSign: <DollarSign className="h-4 w-4 text-amber" />,
  Clock: <Clock className="h-4 w-4 text-violet" />,
};

interface MetricCardProps {
  metric: DashboardMetric;
}

const MetricCard = ({ metric }: MetricCardProps) => {
  const data = metric.sparkline.map((v, i) => ({ v, i }));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
        <span className="text-xs text-muted-foreground font-mono">{metric.label}</span>
        {iconMap[metric.icon]}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-bold font-mono text-foreground">{metric.value}</span>
          <div className="h-[30px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--terminal))"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
