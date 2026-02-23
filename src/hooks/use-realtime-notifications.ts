import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Global realtime subscription hook.
 * Listens to agents, tasks, and interactions changes and shows toast notifications.
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("global-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "agents" }, (payload) => {
        const agent = payload.new as any;
        const old = payload.old as any;
        if (old.status !== agent.status) {
          const emoji = agent.emoji || "🤖";
          const statusMap: Record<string, string> = { online: "ficou online", busy: "está ocupado", idle: "ficou idle", error: "entrou em erro" };
          toast(`${emoji} ${agent.name}`, {
            description: statusMap[agent.status] ?? `status: ${agent.status}`,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, (payload) => {
        const task = payload.new as any;
        toast("📋 Nova tarefa criada", { description: task.name });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, (payload) => {
        const task = payload.new as any;
        const old = payload.old as any;
        if (old.status !== task.status) {
          const statusMap: Record<string, string> = { done: "✅ Tarefa concluída", in_progress: "🔄 Tarefa em progresso", blocked: "🚫 Tarefa bloqueada" };
          toast(statusMap[task.status] ?? "📋 Tarefa atualizada", { description: task.name });
        }
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "interactions" }, (payload) => {
        const inter = payload.new as any;
        toast("💬 Nova interação", { description: inter.message?.slice(0, 80) });
        queryClient.invalidateQueries({ queryKey: ["interactions"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
