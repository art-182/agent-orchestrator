import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  OpenAI: "bg-terminal/15 text-terminal border-terminal/30",
  Anthropic: "bg-violet/15 text-violet border-violet/30",
  Google: "bg-amber/15 text-amber border-amber/30",
};

const ModelPricingTable = ({ data }: ModelPricingTableProps) => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Custo por Token & Modelo</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground">Modelo</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">Provider</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">$/1K Input</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">$/1K Output</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Tokens In</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Tokens Out</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Custo Total</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Latência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.model} className="border-border">
              <TableCell className="font-mono text-xs font-semibold text-foreground">{m.model}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded px-1.5 py-0 text-[9px] border font-mono ${providerColor[m.provider] ?? ""}`}>
                  {m.provider}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-muted-foreground">${m.inputCostPer1k.toFixed(5)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-muted-foreground">${m.outputCostPer1k.toFixed(5)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">{formatTokens(m.inputTokens)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">{formatTokens(m.outputTokens)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-terminal font-semibold">${m.totalCost.toFixed(2)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-muted-foreground">{m.avgLatency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default ModelPricingTable;
