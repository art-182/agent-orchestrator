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
  <Card className="border-border bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="font-mono text-sm text-foreground">Custo por Agente</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground">Agente</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Tokens</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Custo Total</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">Tarefas</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">$/Tarefa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((agent) => (
            <TableRow key={agent.id} className="border-border">
              <TableCell className="font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>{agent.emoji}</span>
                  <span className="text-foreground">{agent.name}</span>
                  <Badge
                    variant="outline"
                    className={`rounded px-1 py-0 text-[9px] border font-mono ${statusBgMap[agent.status]}`}
                  >
                    {agent.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">
                {formatTokens(agent.tokens)}
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-terminal font-semibold">
                ${agent.cost.toFixed(2)}
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-foreground">
                {agent.tasks.toLocaleString()}
              </TableCell>
              <TableCell className="font-mono text-xs text-right text-muted-foreground">
                ${agent.costPerTask.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default AgentCostTable;
