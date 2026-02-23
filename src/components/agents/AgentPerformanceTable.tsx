import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockAgents } from "@/lib/mock-data";

const AgentPerformanceTable = () => (
  <div className="rounded-lg border border-border">
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="font-mono text-xs">Agente</TableHead>
          <TableHead className="font-mono text-xs text-right">Tarefas</TableHead>
          <TableHead className="font-mono text-xs text-right">Tempo Médio</TableHead>
          <TableHead className="font-mono text-xs text-right">Taxa Erro</TableHead>
          <TableHead className="font-mono text-xs text-right">Custo Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockAgents.map((a) => (
          <TableRow key={a.id} className="border-border">
            <TableCell className="font-mono text-xs">
              <span className="mr-1.5">{a.emoji}</span>
              {a.name}
            </TableCell>
            <TableCell className="font-mono text-xs text-right">{a.metrics.tasksCompleted}</TableCell>
            <TableCell className="font-mono text-xs text-right">{a.metrics.avgTime}</TableCell>
            <TableCell className="font-mono text-xs text-right">{a.metrics.errorRate}%</TableCell>
            <TableCell className="font-mono text-xs text-right">${a.metrics.totalCost.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default AgentPerformanceTable;
