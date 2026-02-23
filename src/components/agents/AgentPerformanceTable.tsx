import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

const AgentPerformanceTable = ({ agents }: { agents: DbAgent[] }) => (
  <Card className="border-border/50 bg-card surface-elevated overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="border-border/30 hover:bg-transparent">
          <TableHead className="text-[11px] text-muted-foreground font-medium">Agente</TableHead>
          <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tarefas</TableHead>
          <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Tempo Médio</TableHead>
          <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Taxa Erro</TableHead>
          <TableHead className="text-[11px] text-muted-foreground font-medium text-right">Custo Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agents.map((a) => (
          <TableRow key={a.id} className="border-border/20 hover:bg-muted/20 transition-colors">
            <TableCell className="text-[12px] font-medium">
              <span className="mr-2">{a.emoji}</span>
              {a.name}
            </TableCell>
            <TableCell className="text-[12px] text-right tabular-nums">{a.tasks_completed ?? 0}</TableCell>
            <TableCell className="text-[12px] text-right tabular-nums text-muted-foreground">{a.avg_time ?? "—"}</TableCell>
            <TableCell className={`text-[12px] text-right tabular-nums ${(a.error_rate ?? 0) > 3 ? "text-rose" : "text-muted-foreground"}`}>{a.error_rate ?? 0}%</TableCell>
            <TableCell className="text-[12px] text-right tabular-nums font-medium">${(a.total_cost ?? 0).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

export default AgentPerformanceTable;
