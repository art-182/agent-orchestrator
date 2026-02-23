import { ListChecks, Zap, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  ListChecks: { icon: <ListChecks className="h-4 w-4" />, color: "text-terminal" },
  Zap: { icon: <Zap className="h-4 w-4" />, color: "text-cyan" },
  DollarSign: { icon: <DollarSign className="h-4 w-4" />, color: "text-amber" },
  Clock: { icon: <Clock className="h-4 w-4" />, color: "text-violet" },
};

const strokeColors: Record<string, string> = {
  ListChecks: "hsl(160, 51%, 49%)",
  Zap: "hsl(187, 80%, 53%)",
  DollarSign: "hsl(45, 93%, 56%)",
  Clock: "hsl(260, 67%, 70%)",
};

export interface DashboardMetric {
  label: string;
  value: string;
  icon: string;
  sparkline: number[];
  change?: string;
  trend?: "up" | "down";
}

const MetricCard = ({ metric }: { metric: DashboardMetric }) => {
  const data = metric.sparkline.map((v, i) => ({ v, i }));
  const { icon, color } = iconMap[metric.icon] ?? { icon: null, color: "text-foreground" };
  const stroke = strokeColors[metric.icon] ?? "hsl(160, 51%, 49%)";
  const isPositive = (metric.icon === "DollarSign" && metric.trend === "down") || (metric.icon !== "DollarSign" && metric.trend === "up");
  const trendColor = isPositive ? "text-terminal" : "text-rose";

  return (
    <motion.div whileHover={{ y: -2, transition: { duration: 0.2 } }}>
      <Card className="border-border bg-card hover:border-muted-foreground/30 transition-colors overflow-hidden relative group">
        {/* Glow line at top */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${color.replace("text-", "via-")}/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`${color} opacity-80`}>{icon}</span>
            {metric.change && (
              <div className={`flex items-center gap-0.5 font-mono text-[10px] ${trendColor}`}>
                {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : metric.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                {metric.change}
              </div>
            )}
          </div>
          <div>
            <motion.span
              key={metric.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold font-mono text-foreground block"
            >
              {metric.value}
            </motion.span>
            <span className="text-[10px] text-muted-foreground font-mono">{metric.label}</span>
          </div>
          <div className="h-[32px] w-full -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <defs>
                  <linearGradient id={`grad-${metric.icon}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={`url(#grad-${metric.icon})`}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
