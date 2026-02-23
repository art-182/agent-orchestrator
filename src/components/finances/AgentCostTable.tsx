import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { statusBgMap } from "@/lib/mock-data";
import type { AgentCost } from "@/lib/finance-data";

interface AgentCostTableProps {
  data: AgentCost[];
}

const formatTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const AgentCostTable = ({ data }: AgentCostTableProps) => (
  <Card className="border-border/50 bg-card surface-elevated">
    <CardHeader className="p-5 pb-3">
      <CardTitle className="text-sm font-semibold text-foreground tracking-tight">Custo por Agente</CardTitle>
    </CardHeader>
    <CardContent className="p-5 pt-2">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-[11px] text-muted-foreground font-medium">Agente</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tokens</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Custo Total</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tarefas</TableHead>
            <TableHead className="text-[11px] text-muted-foreground font-medium text-right">$/Tarefa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((agent) => (
            <TableRow key={agent.id} className="border-border/50">
              <TableCell className="text-[12px]">
                <div className="flex items-center gap-2.5">
                  <span>{agent.emoji}</span>
                  <span className="text-foreground font-medium">{agent.name}</span>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-[9px] border font-medium ${statusBgMap[agent.status]}`}>
                    {agent.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-[12px] text-right text-foreground tabular-nums">{formatTokens(agent.tokens)}</TableCell>
              <TableCell className="text-[12px] text-right text-terminal font-semibold tabular-nums">${agent.cost.toFixed(2)}</TableCell>
              <TableCell className="text-[12px] text-right text-foreground tabular-nums">{agent.tasks.toLocaleString()}</TableCell>
              <TableCell className="text-[12px] text-right text-muted-foreground tabular-nums">${agent.costPerTask.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default AgentCostTable;
