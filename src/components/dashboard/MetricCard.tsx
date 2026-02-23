import { ListChecks, Zap, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const iconMap: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  ListChecks: { icon: <ListChecks className="h-4 w-4" />, color: "text-terminal", bg: "bg-terminal/10" },
  Zap: { icon: <Zap className="h-4 w-4" />, color: "text-cyan", bg: "bg-cyan/10" },
  DollarSign: { icon: <DollarSign className="h-4 w-4" />, color: "text-amber", bg: "bg-amber/10" },
  Clock: { icon: <Clock className="h-4 w-4" />, color: "text-violet", bg: "bg-violet/10" },
};

const strokeColors: Record<string, string> = {
  ListChecks: "hsl(158, 64%, 52%)",
  Zap: "hsl(190, 90%, 55%)",
  DollarSign: "hsl(42, 100%, 62%)",
  Clock: "hsl(258, 70%, 68%)",
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
  const { icon, color, bg } = iconMap[metric.icon] ?? { icon: null, color: "text-foreground", bg: "bg-muted" };
  const stroke = strokeColors[metric.icon] ?? "hsl(158, 64%, 52%)";
  const isPositive = (metric.icon === "DollarSign" && metric.trend === "down") || (metric.icon !== "DollarSign" && metric.trend === "up");
  const trendColor = isPositive ? "text-terminal" : "text-rose";

  return (
    <motion.div whileHover={{ y: -3, transition: { duration: 0.25, ease: "easeOut" } }}>
      <Card className="border-border/50 bg-card surface-elevated glow-line overflow-hidden group transition-all duration-300">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className={`${bg} ${color} p-2 rounded-xl transition-transform duration-200 group-hover:scale-110`}>
              {icon}
            </div>
            {metric.change && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
                {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : metric.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                {metric.change}
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <motion.span
              key={metric.value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[26px] font-bold text-foreground block tracking-tight leading-none"
            >
              {metric.value}
            </motion.span>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">{metric.label}</span>
          </div>
          <div className="h-[36px] w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <defs>
                  <linearGradient id={`grad-${metric.icon}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={stroke} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={stroke} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={`url(#grad-${metric.icon})`}
                  strokeWidth={2}
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
