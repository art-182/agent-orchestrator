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
import type { SkillCost } from "@/lib/finance-data";

interface SkillCostTableProps {
  data: SkillCost[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const categoryColor: Record<string, string> = {
  Development: "bg-terminal/15 text-terminal border-terminal/30",
  Quality: "bg-cyan/15 text-cyan border-cyan/30",
  Security: "bg-rose/15 text-rose border-rose/30",
  DevOps: "bg-amber/15 text-amber border-amber/30",
  Strategy: "bg-violet/15 text-violet border-violet/30",
  Analytics: "bg-muted text-muted-foreground border-border",
};

const SkillCostTable = ({ data }: SkillCostTableProps) => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Custo por Skill</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground">Skill</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">Categoria</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Execuções</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Tokens</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Custo</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Sucesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((s) => (
            <TableRow key={s.skill} className="border-border">
              <TableCell className="font-mono text-xs font-semibold text-foreground">{s.skill}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded px-1.5 py-0 text-[9px] border font-mono ${categoryColor[s.category] ?? ""}`}>
                  {s.category}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">{s.executions.toLocaleString()}</TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">{formatTokens(s.tokens)}</TableCell>
              <TableCell className="font-mono text-xs text-right text-terminal font-semibold">${s.cost.toFixed(2)}</TableCell>
              <TableCell className={`font-mono text-xs text-right font-semibold ${s.successRate >= 95 ? "text-terminal" : s.successRate >= 90 ? "text-amber" : "text-rose"}`}>
                {s.successRate}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default SkillCostTable;
