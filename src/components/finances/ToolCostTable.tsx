import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { ToolCost } from "@/lib/finance-data";

interface ToolCostTableProps {
  data: ToolCost[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const ToolCostTable = ({ data }: ToolCostTableProps) => {
  const maxCost = Math.max(...data.map((t) => t.cost));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-sm text-foreground">Custo por Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs text-muted-foreground">Tool</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground">Agente</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Chamadas</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Tokens</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Custo</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Duração</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((t) => (
              <TableRow key={`${t.tool}-${t.agent}`} className="border-border">
                <TableCell className="font-mono text-xs text-cyan font-semibold">{t.tool}</TableCell>
                <TableCell className="font-mono text-xs text-foreground">{t.agent}</TableCell>
                <TableCell className="font-mono text-xs text-right text-foreground">{t.calls.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-xs text-right text-foreground">{formatTokens(t.tokens)}</TableCell>
                <TableCell className="font-mono text-xs text-right text-terminal font-semibold">${t.cost.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-xs text-right text-muted-foreground">{t.avgDuration}</TableCell>
                <TableCell>
                  <Progress value={(t.cost / maxCost) * 100} className="h-1.5" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ToolCostTable;
