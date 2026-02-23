import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

type TaskPriority = "critical" | "high" | "medium" | "low";

const priorityColor: Record<TaskPriority, string> = {
  critical: "bg-rose/15 text-rose border-rose/30",
  high: "bg-amber/15 text-amber border-amber/30",
  medium: "bg-violet/15 text-violet border-violet/30",
  low: "bg-muted text-muted-foreground border-border",
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
        className={`border-border bg-card hover:border-muted-foreground/30 transition-all duration-200 cursor-pointer active:scale-[0.98] ${isDragging ? "shadow-lg shadow-terminal/10 ring-1 ring-terminal/30" : ""}`}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <button {...attributes} {...listeners} className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
                <GripVertical className="h-4 w-4" />
              </button>
              <p className="font-mono text-sm font-semibold text-foreground leading-tight truncate">{task.name}</p>
            </div>
            <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0.5 border shrink-0 rounded-md ${priorityColor[task.priority as TaskPriority] ?? ""}`}>
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{task.agents?.emoji} {task.agents?.name}</span>
            <span>·</span>
            <span className="truncate">{task.missions?.name}</span>
          </div>
          {task.status === "done" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{task.duration}</span>
              <span className="text-terminal font-semibold">${(task.cost ?? 0).toFixed(2)}</span>
            </div>
          )}
          {(task.tokens ?? 0) > 0 && (
            <div className="font-mono text-xs text-muted-foreground">{formatTokens(task.tokens ?? 0)} tokens</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
