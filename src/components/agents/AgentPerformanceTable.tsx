import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

const AgentPerformanceTable = ({ agents }: { agents: DbAgent[] }) => (
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
        {agents.map((a) => (
          <TableRow key={a.id} className="border-border">
            <TableCell className="font-mono text-xs">
              <span className="mr-1.5">{a.emoji}</span>
              {a.name}
            </TableCell>
            <TableCell className="font-mono text-xs text-right">{a.tasks_completed ?? 0}</TableCell>
            <TableCell className="font-mono text-xs text-right">{a.avg_time ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs text-right">{a.error_rate ?? 0}%</TableCell>
            <TableCell className="font-mono text-xs text-right">${(a.total_cost ?? 0).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default AgentPerformanceTable;
