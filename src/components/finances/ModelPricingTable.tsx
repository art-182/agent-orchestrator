import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ModelPricing } from "@/lib/finance-data";

interface ModelPricingTableProps {
  data: ModelPricing[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const providerColor: Record<string, string> = {
  OpenAI: "bg-terminal/10 text-terminal border-terminal/20",
  Anthropic: "bg-violet/10 text-violet border-violet/20",
  Google: "bg-amber/10 text-amber border-amber/20",
};

const ModelPricingTable = ({ data }: ModelPricingTableProps) => (
  <Card className="border-border/50 bg-card surface-elevated">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Custo por Token & Modelo</CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-[11px] text-muted-foreground font-medium">Modelo</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium">Provider</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">$/1K Input</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">$/1K Output</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tokens In</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tokens Out</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Custo Total</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Latência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.model} className="border-border/50">
              <TableCell className="text-[12px] font-semibold text-foreground">{m.model}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded-full px-2 py-0 text-[9px] border font-medium ${providerColor[m.provider] ?? ""}`}>
                  {m.provider}
                </Badge>
              </TableCell>
              <TableCell className="text-[12px] text-right text-muted-foreground tabular-nums">${m.inputCostPer1k.toFixed(5)}</TableCell>
              <TableCell className="text-[12px] text-right text-muted-foreground tabular-nums">${m.outputCostPer1k.toFixed(5)}</TableCell>
              <TableCell className="text-[12px] text-right text-foreground tabular-nums">{formatTokens(m.inputTokens)}</TableCell>
              <TableCell className="text-[12px] text-right text-foreground tabular-nums">{formatTokens(m.outputTokens)}</TableCell>
              <TableCell className="text-[12px] text-right text-terminal font-semibold tabular-nums">${m.totalCost.toFixed(2)}</TableCell>
              <TableCell className="text-[12px] text-right text-muted-foreground tabular-nums">{m.avgLatency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default ModelPricingTable;
