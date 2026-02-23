import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

type TaskPriority = "critical" | "high" | "medium" | "low";

const priorityColor: Record<TaskPriority, string> = {
  critical: "bg-rose/10 text-rose border-rose/20",
  high: "bg-amber/10 text-amber border-amber/20",
  medium: "bg-violet/10 text-violet border-violet/20",
  low: "bg-muted/50 text-muted-foreground border-border/50",
};

const formatTokens = (n: number) => n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();

interface TaskKanbanCardProps {
  task: any;
  onClick: () => void;
}

export default function TaskKanbanCard({ task, onClick }: TaskKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`border-border/50 bg-card surface-elevated hover:border-border transition-all duration-200 cursor-pointer active:scale-[0.98] ${isDragging ? "shadow-lg shadow-terminal/10 ring-1 ring-terminal/20" : ""}`}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <button {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
                <GripVertical className="h-4 w-4" />
              </button>
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate tracking-tight">{task.name}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border shrink-0 rounded-full font-medium ${priorityColor[task.priority as TaskPriority] ?? ""}`}>
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{task.agents?.emoji} {task.agents?.name}</span>
            <span>·</span>
            <span className="truncate">{task.missions?.name}</span>
          </div>
          {task.status === "done" && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{task.duration}</span>
              <span className="text-terminal font-semibold tabular-nums">${(task.cost ?? 0).toFixed(2)}</span>
            </div>
          )}
          {(task.tokens ?? 0) > 0 && (
            <div className="text-[11px] text-muted-foreground tabular-nums">{formatTokens(task.tokens ?? 0)} tokens</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
