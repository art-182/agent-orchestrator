import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Agent } from "@/lib/mock-data";
import { statusBgMap } from "@/lib/mock-data";

interface AgentDetailSheetProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taskStatusIcon: Record<string, string> = {
  done: "✅",
  running: "🔄",
  error: "❌",
};

const AgentDetailSheet = ({ agent, open, onOpenChange }: AgentDetailSheetProps) => {
  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-border bg-card overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-mono">
            <span className="text-xl">{agent.emoji}</span>
            {agent.name}
            <Badge
              variant="outline"
              className={`rounded px-1.5 py-0 text-[10px] border font-mono ml-auto ${statusBgMap[agent.status]}`}
            >
              {agent.status}
            </Badge>
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {agent.model} · {agent.provider} · Uptime: {agent.uptime}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Tarefas", value: agent.metrics.tasksCompleted.toString() },
              { label: "Tempo Médio", value: agent.metrics.avgTime },
              { label: "Taxa Erro", value: `${agent.metrics.errorRate}%` },
              { label: "Custo Total", value: `$${agent.metrics.totalCost.toFixed(2)}` },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[10px] font-mono text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold font-mono text-foreground">{m.value}</p>
              </div>
            ))}
          </div>

          <Separator className="bg-border" />

          {/* Current Task */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">Tarefa Atual</p>
            <p className="text-sm font-mono text-foreground">{agent.currentTask}</p>
          </div>

          <Separator className="bg-border" />

          {/* Recent Tasks */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-2">Histórico Recente</p>
            <div className="space-y-1.5">
              {agent.recentTasks.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded px-2 py-1 font-mono text-xs hover:bg-muted/50"
                >
                  <span>{taskStatusIcon[t.status]}</span>
                  <span className="flex-1 truncate text-foreground">{t.name}</span>
                  <span className="text-muted-foreground">{t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailSheet;
