import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAgents, useMissions } from "@/hooks/use-supabase-data";
import { toast } from "sonner";

const CreateTaskDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [agentId, setAgentId] = useState("");
  const [missionId, setMissionId] = useState("");
  const queryClient = useQueryClient();
  const { data: agents } = useAgents();
  const { data: missions } = useMissions();

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert({
        name,
        priority,
        status: "todo",
        agent_id: agentId || null,
        mission_id: missionId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setName("");
      setPriority("medium");
      setAgentId("");
      setMissionId("");
      toast.success("Tarefa criada com sucesso");
    },
    onError: () => toast.error("Erro ao criar tarefa"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-terminal text-primary-foreground hover:bg-terminal/90 text-[12px] rounded-xl">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-foreground tracking-tight">Nova Tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-[11px] text-muted-foreground font-medium">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da tarefa" className="text-[13px] bg-muted/20 border-border/50 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] text-muted-foreground font-medium">Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="text-[12px] border-border/50 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] text-muted-foreground font-medium">Agente</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="text-[12px] border-border/50 rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {(agents ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.emoji} {a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] text-muted-foreground font-medium">Missão</Label>
            <Select value={missionId} onValueChange={setMissionId}>
              <SelectTrigger className="text-[12px] border-border/50 rounded-xl"><SelectValue placeholder="Selecionar missão" /></SelectTrigger>
              <SelectContent>
                {(missions ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full gap-1.5 bg-terminal text-primary-foreground hover:bg-terminal/90 text-[13px] rounded-xl"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
          >
            <Plus className="h-4 w-4" /> Criar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
