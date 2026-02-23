import { ListChecks, CheckCircle2, Play, Clock, AlertTriangle, Filter, Plus } from "lucide-react";
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
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";

const statusConfig: Record<TaskStatus, { color: string; dotColor: string; icon: React.ReactNode; label: string }> = {
  done: { color: "text-terminal", dotColor: "bg-terminal", icon: <CheckCircle2 className="h-4 w-4 text-terminal" />, label: "Concluído" },
  in_progress: { color: "text-cyan", dotColor: "bg-cyan", icon: <Play className="h-4 w-4 text-cyan" />, label: "Em Progresso" },
  todo: { color: "text-muted-foreground", dotColor: "bg-muted-foreground/50", icon: <Clock className="h-4 w-4 text-muted-foreground" />, label: "Pendente" },
  blocked: { color: "text-rose", dotColor: "bg-rose", icon: <AlertTriangle className="h-4 w-4 text-rose" />, label: "Bloqueado" },
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
    <div ref={setNodeRef} className={`space-y-2.5 min-h-[140px] rounded-2xl p-2.5 transition-all duration-200 ${isOver ? "bg-terminal/5 ring-1 ring-terminal/15" : ""}`}>
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
    queryClient.setQueryData(["tasks"], (old: any[]) => old?.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    if (error) { toast.error("Erro ao mover tarefa"); queryClient.invalidateQueries({ queryKey: ["tasks"] }); }
    else { toast.success(`Tarefa → ${statusConfig[newStatus as TaskStatus]?.label ?? newStatus}`); }
  }, [tasks, queryClient]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2 rounded-xl"><ListChecks className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Tarefas</h1>
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
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2 rounded-xl">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Tarefas</h1>
            <p className="text-[11px] text-muted-foreground font-medium">{allTasks.length} tarefas · {allTasks.filter(t => t.status === 'done').length} concluídas</p>
          </div>
          {missionFilter && (
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-violet/20 bg-violet/8 text-violet rounded-full font-medium">
              {baseTasks[0]?.missions?.name ?? missionFilter}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskDialog />
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", ...agents].map((a) => (
              <button
                key={a ?? "all"}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                  filter === a
                    ? "bg-terminal/10 text-terminal border-terminal/20"
                    : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
                onClick={() => setFilter(a!)}
              >
                {a === "all" ? "Todos" : a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            const sc = statusConfig[col.key];
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2.5 px-1">
                  <span className={`h-2 w-2 rounded-full ${sc.dotColor}`} />
                  <span className="text-[13px] font-semibold text-foreground tracking-tight">{col.label}</span>
                  <span className="text-[11px] text-muted-foreground font-medium ml-auto">{colTasks.length}</span>
                </div>
                <DroppableColumn id={col.key}>
                  <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map((t) => (
                      <TaskKanbanCard key={t.id} task={t} onClick={() => setSelectedTask(t)} />
                    ))}
                  </SortableContext>
                  {colTasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center">
                      <p className="text-[12px] text-muted-foreground/50 font-medium">Arraste tarefas aqui</p>
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-1 scale-105 shadow-2xl">
              <TaskKanbanCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailSheet task={selectedTask} open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
    </PageTransition>
  );
};

export default Tasks;
