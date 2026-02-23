import { ListChecks, CheckCircle2, Play, Clock, AlertTriangle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/animations/MotionPrimitives";
import { useTasks } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import TaskKanbanCard from "@/components/tasks/TaskKanbanCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; label: string }> = {
  done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-4 w-4" />, label: "Concluído" },
  in_progress: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-4 w-4" />, label: "Em Progresso" },
  todo: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-4 w-4" />, label: "Pendente" },
  blocked: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-4 w-4" />, label: "Bloqueado" },
};

const columns: { key: TaskStatus; label: string }[] = [
  { key: "in_progress", label: "Em Progresso" },
  { key: "todo", label: "Pendente" },
  { key: "done", label: "Concluído" },
  { key: "blocked", label: "Bloqueado" },
];

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`space-y-3 min-h-[120px] rounded-lg p-2 transition-colors ${isOver ? "bg-terminal/5 ring-1 ring-terminal/20" : ""}`}>
      {children}
    </div>
  );
}

const Tasks = () => {
  const [searchParams] = useSearchParams();
  const missionFilter = searchParams.get("mission");
  const [filter, setFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: tasks, isLoading } = useTasks();
  const queryClient = useQueryClient();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = (tasks ?? []).find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    queryClient.setQueryData(["tasks"], (old: any[]) =>
      old?.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) {
      toast.error("Erro ao mover tarefa");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else {
      toast.success(`Tarefa movida para ${statusConfig[newStatus as TaskStatus]?.label ?? newStatus}`);
    }
  }, [tasks, queryClient]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <div className="flex items-center gap-3">
          <ListChecks className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Tarefas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </PageTransition>
    );
  }

  const allTasks = tasks ?? [];
  const baseTasks = missionFilter ? allTasks.filter((t) => t.mission_id === missionFilter) : allTasks;
  const filteredTasks = filter === "all" ? baseTasks : baseTasks.filter((t) => t.agents?.name === filter);
  const agents = [...new Set(baseTasks.map((t) => t.agents?.name).filter(Boolean))];
  const activeTask = allTasks.find((t) => t.id === activeId);

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ListChecks className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Tarefas</h1>
          {missionFilter && (
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 border-violet/30 bg-violet/10 text-violet rounded-lg">
              {baseTasks[0]?.missions?.name ?? missionFilter}
            </Badge>
          )}
          <CreateTaskDialog />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={`font-mono text-xs px-2.5 py-1 cursor-pointer border rounded-lg transition-all ${filter === "all" ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
              onClick={() => setFilter("all")}
            >
              Todos
            </Badge>
            {agents.map((a) => (
              <Badge
                key={a}
                variant="outline"
                className={`font-mono text-xs px-2.5 py-1 cursor-pointer border rounded-lg transition-all ${filter === a ? "bg-terminal/15 text-terminal border-terminal/30" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                onClick={() => setFilter(a!)}
              >
                {a}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            const sc = statusConfig[col.key];
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  {sc.icon}
                  <span className="font-mono text-sm font-semibold text-foreground">{col.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">({colTasks.length})</span>
                </div>
                <DroppableColumn id={col.key}>
                  <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map((t) => (
                      <TaskKanbanCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                    ))}
                  </SortableContext>
                  {colTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">Arraste tarefas aqui</p>
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-2 scale-105">
              <TaskKanbanCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </PageTransition>
  );
};

export default Tasks;
