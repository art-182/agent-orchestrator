import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { BillingSummary } from "@/lib/finance-data";

const trendIcon = {
  up: <TrendingUp className="h-3.5 w-3.5 text-rose" />,
  down: <TrendingDown className="h-3.5 w-3.5 text-terminal" />,
  neutral: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

const trendColor = {
  up: "text-rose",
  down: "text-terminal",
  neutral: "text-muted-foreground",
};

interface BillingCardsProps {
  data: BillingSummary[];
}

const BillingCards = ({ data }: BillingCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {data.map((item) => (
      <Card key={item.label} className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs text-muted-foreground font-normal">
            {item.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <span className="font-mono text-2xl font-bold text-foreground">{item.value}</span>
            <div className={`flex items-center gap-1 font-mono text-xs ${trendColor[item.trend]}`}>
              {trendIcon[item.trend]}
              {item.change}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default BillingCards;
