import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Play, Clock, AlertTriangle, User, GitBranch, Brain, Zap, ArrowRight, Pencil, Trash2, Save, X } from "lucide-react";
import { useInteractions, useMemoryEntries, useTraces } from "@/hooks/use-supabase-data";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type TaskStatus = "done" | "in_progress" | "todo" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";

const statusConfig: Record<TaskStatus, { color: string; icon: React.ReactNode; label: string }> = {
  done: { color: "bg-terminal/15 text-terminal border-terminal/30", icon: <CheckCircle2 className="h-4 w-4" />, label: "Concluído" },
  in_progress: { color: "bg-cyan/15 text-cyan border-cyan/30", icon: <Play className="h-4 w-4" />, label: "Em Progresso" },
  todo: { color: "bg-muted text-muted-foreground border-border", icon: <Clock className="h-4 w-4" />, label: "Pendente" },
  blocked: { color: "bg-rose/15 text-rose border-rose/30", icon: <AlertTriangle className="h-4 w-4" />, label: "Bloqueado" },
};

const bmadStages = [
  { key: "briefing", label: "Briefing", description: "Definição do escopo e requisitos" },
  { key: "mapping", label: "Mapping", description: "Mapeamento de dependências e arquitetura" },
  { key: "acting", label: "Acting", description: "Execução e implementação" },
  { key: "delivering", label: "Delivering", description: "Entrega e validação" },
];

function getBmadStage(status: string): number {
  if (status === "todo") return 0;
  if (status === "blocked") return 1;
  if (status === "in_progress") return 2;
  if (status === "done") return 3;
  return 0;
}

interface TaskDetailSheetProps {
  task: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailSheet = ({ task, open, onOpenChange }: TaskDetailSheetProps) => {
  const { data: interactions } = useInteractions();
  const { data: memoryEntries } = useMemoryEntries();
  const { data: traces } = useTraces();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");

  const startEditing = () => {
    if (!task) return;
    setEditName(task.name);
    setEditStatus(task.status as TaskStatus);
    setEditPriority(task.priority as TaskPriority);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const updateMutation = useMutation({
    mutationFn: async (updates: { name: string; status: string; priority: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ name: updates.name, status: updates.status, priority: updates.priority })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditing(false);
      toast.success("Tarefa atualizada");
    },
    onError: () => toast.error("Erro ao atualizar tarefa"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onOpenChange(false);
      toast.success("Tarefa excluída");
    },
    onError: () => toast.error("Erro ao excluir tarefa"),
  });

  const quickStatusChange = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Status atualizado");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  if (!task) return null;

  const sc = statusConfig[(task.status as TaskStatus) ?? "todo"];
  const bmadIdx = getBmadStage(task.status);

  const relatedInteractions = (interactions ?? [])
    .filter((i) => i.from_agent === task.agent_id || i.to_agent === task.agent_id)
    .slice(0, 8);

  const relatedMemory = (memoryEntries ?? [])
    .filter((m) => m.source_agent === task.agent_id)
    .slice(0, 5);

  const relatedTraces = (traces ?? [])
    .filter((t) => t.agent_id === task.agent_id)
    .slice(0, 5);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-border bg-card overflow-hidden">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sc.icon}
              <Badge variant="outline" className={`rounded-lg px-2.5 py-1 text-xs border font-mono ${sc.color}`}>
                {sc.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {!editing && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={startEditing}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-rose"
                onClick={() => {
                  if (confirm("Excluir esta tarefa?")) deleteMutation.mutate();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-3 pt-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-mono text-base bg-muted/30 border-border"
                placeholder="Nome da tarefa"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as TaskStatus)}>
                  <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as TaskPriority)}>
                  <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 bg-terminal text-primary-foreground hover:bg-terminal/90 font-mono text-xs"
                  onClick={() => updateMutation.mutate({ name: editName, status: editStatus, priority: editPriority })}
                  disabled={updateMutation.isPending}
                >
                  <Save className="h-3.5 w-3.5" /> Salvar
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs" onClick={cancelEditing}>
                  <X className="h-3.5 w-3.5" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <SheetTitle className="font-mono text-xl text-foreground">{task.name}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                {task.agents?.emoji} {task.agents?.name} · {task.missions?.name}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] pr-2">
          <div className="space-y-6">
            {/* Quick Status Change */}
            {!editing && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Alterar status rapidamente:</p>
                <div className="flex gap-2 flex-wrap">
                  {(["todo", "in_progress", "done", "blocked"] as TaskStatus[]).map((s) => {
                    const cfg = statusConfig[s];
                    const isActive = task.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => !isActive && quickStatusChange.mutate(s)}
                        disabled={isActive || quickStatusChange.isPending}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${isActive ? cfg.color + " border font-semibold" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator />

            {/* Task Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Prioridade", value: task.priority, color: "text-amber" },
                { label: "Duração", value: task.duration ?? "—", color: "text-foreground" },
                { label: "Custo", value: `$${(task.cost ?? 0).toFixed(2)}`, color: "text-terminal" },
                { label: "Tokens", value: (task.tokens ?? 0).toLocaleString(), color: "text-cyan" },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                  <p className={`font-mono text-sm font-semibold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* BMAD Process */}
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-terminal" />
                Processo BMAD
              </h3>
              <div className="space-y-0">
                {bmadStages.map((stage, idx) => {
                  const isActive = idx === bmadIdx;
                  const isDone = idx < bmadIdx;
                  const dotColor = isDone ? "bg-terminal" : isActive ? "bg-cyan animate-pulse-dot" : "bg-muted-foreground/30";
                  const textColor = isDone ? "text-terminal" : isActive ? "text-cyan" : "text-muted-foreground";
                  return (
                    <div key={stage.key} className="flex items-start gap-3 relative">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full mt-1 ${dotColor} shrink-0`} />
                        {idx < bmadStages.length - 1 && (
                          <div className={`w-px h-8 ${isDone ? "bg-terminal/40" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className={`font-mono text-sm font-semibold ${textColor}`}>{stage.label}</p>
                        <p className="text-xs text-muted-foreground">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Agent Details */}
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-violet" />
                Agente Responsável
              </h3>
              {task.agents && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{task.agents.emoji}</span>
                    <span className="font-mono text-sm font-semibold text-foreground">{task.agents.name}</span>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Related Interactions */}
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-cyan" />
                Interações Relacionadas
                <span className="text-xs text-muted-foreground font-normal">({relatedInteractions.length})</span>
              </h3>
              {relatedInteractions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma interação encontrada</p>
              ) : (
                <div className="space-y-2">
                  {relatedInteractions.map((inter) => {
                    const from = inter.from as any;
                    const to = inter.to as any;
                    return (
                      <div key={inter.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{new Date(inter.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="font-mono font-semibold text-foreground">{from?.emoji} {from?.name}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono font-semibold text-foreground">{to?.emoji} {to?.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border ml-auto">
                            {inter.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{inter.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            {/* Related Memory */}
            <div>
              <h3 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber" />
                Memórias
                <span className="text-xs text-muted-foreground font-normal">({relatedMemory.length})</span>
              </h3>
              {relatedMemory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma memória encontrada</p>
              ) : (
                <div className="space-y-2">
                  {relatedMemory.map((mem) => (
                    <div key={mem.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border">{mem.type}</Badge>
                        <span className={`font-mono text-xs font-semibold ${(mem.confidence ?? 0) >= 90 ? "text-terminal" : "text-amber"}`}>
                          {mem.confidence}%
                        </span>
                      </div>
                      <p className="text-xs text-foreground">{mem.content}</p>
                      <div className="flex gap-1 flex-wrap">
                        {(mem.tags ?? []).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Traces */}
            {relatedTraces.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-mono text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-rose" />
                    Traces
                    <span className="text-xs text-muted-foreground font-normal">({relatedTraces.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {relatedTraces.map((trace) => (
                      <div key={trace.id} className="rounded-lg border border-border bg-muted/20 p-3 flex items-center gap-3">
                        {trace.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-terminal shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-rose shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs font-semibold text-foreground truncate">{trace.name}</p>
                          {trace.error && <p className="text-xs text-rose truncate">{trace.error}</p>}
                        </div>
                        <span className="font-mono text-xs text-muted-foreground shrink-0">{trace.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailSheet;
