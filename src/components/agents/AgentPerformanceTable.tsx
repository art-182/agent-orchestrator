import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";
import { useDailyCosts } from "@/hooks/use-supabase-data";

type DbAgent = Tables<"agents">;

const AgentPerformanceTable = ({ agents }: { agents: DbAgent[] }) => {
  const { data: costs } = useDailyCosts();
  const totalCost = (costs ?? []).reduce((s, c) => s + (c.google ?? 0), 0);
  const totalTasks = agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0);

  return (
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
        {agents.map((a) => {
          const agentTasks = a.tasks_completed ?? 0;
          const costShare = totalTasks > 0 ? totalCost * (agentTasks / totalTasks) : 0;
          return (
          <TableRow key={a.id} className="border-border/20 hover:bg-muted/20 transition-colors">
            <TableCell className="text-[12px] font-medium">
              <span className="mr-2">{a.emoji}</span>
              {a.name}
            </TableCell>
            <TableCell className="text-[12px] text-right tabular-nums">{agentTasks}</TableCell>
            <TableCell className="text-[12px] text-right tabular-nums text-muted-foreground">{a.avg_time ?? "—"}</TableCell>
            <TableCell className={`text-[12px] text-right tabular-nums ${(a.error_rate ?? 0) > 3 ? "text-rose" : "text-muted-foreground"}`}>{a.error_rate ?? 0}%</TableCell>
            <TableCell className="text-[12px] text-right tabular-nums font-medium">${costShare.toFixed(2)}</TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Card>
  );
};

export default AgentPerformanceTable;
