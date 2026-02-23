import { useState, useMemo, useEffect } from "react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { Card, CardContent } from "@/components/ui/card";
import { useAgents, useTasks, useInteractions } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const statusEmoji: Record<string, string> = { online: "🟢", busy: "⚡", idle: "😴", error: "🔴" };
const statusLabel: Record<string, string> = { online: "communicating", busy: "working", idle: "idle", error: "error" };

interface NodePos {
  id: string; emoji: string; name: string; status: string; x: number; y: number;
  type: "agent" | "task" | "message"; label?: string;
}
interface Edge {
  from: string; to: string; label?: string; type: "hierarchy" | "interaction" | "task"; animated?: boolean;
}

const Interactions = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: interactions, isLoading: li } = useInteractions();
  const queryClient = useQueryClient();
  const [liveAgents, setLiveAgents] = useState<Record<string, string>>({});
  const [pulsingEdges, setPulsingEdges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase
      .channel("interactions-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "agents" }, (payload) => {
        const updated = payload.new as any;
        setLiveAgents((prev) => ({ ...prev, [updated.id]: updated.status }));
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "interactions" }, (payload) => {
        const inter = payload.new as any;
        const edgeKey = `${inter.from_agent}-${inter.to_agent}`;
        setPulsingEdges((prev) => new Set(prev).add(edgeKey));
        setTimeout(() => setPulsingEdges((prev) => { const n = new Set(prev); n.delete(edgeKey); return n; }), 3000);
        queryClient.invalidateQueries({ queryKey: ["interactions"] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const isLoading = la || lt || li;

  const { nodes, edges } = useMemo(() => {
    if (!agents || !tasks || !interactions) return { nodes: [], edges: [] };

    const n: NodePos[] = [];
    const e: Edge[] = [];
    const agentList = agents.filter((a) => !a.parent_id);
    const subAgents = agents.filter((a) => a.parent_id);

    const CANVAS_W = 800;
    const colSpacing = CANVAS_W / Math.max(agentList.length + 1, 2);

    agentList.forEach((agent, idx) => {
      const x = colSpacing * (idx + 1);
      const y = 60;
      const resolvedStatus = liveAgents[agent.id] ?? agent.status;
      n.push({ id: agent.id, emoji: agent.emoji, name: agent.name, status: resolvedStatus, x, y, type: "agent" });

      const children = subAgents.filter((s) => s.parent_id === agent.id);
      children.forEach((child, ci) => {
        const cx = x + (ci - (children.length - 1) / 2) * 160;
        const cy = y + 180;
        const childStatus = liveAgents[child.id] ?? child.status;
        n.push({ id: child.id, emoji: child.emoji, name: child.name, status: childStatus, x: cx, y: cy, type: "agent" });
        e.push({ from: agent.id, to: child.id, type: "hierarchy" });

        const childTasks = tasks.filter((t) => t.agent_id === child.id).slice(0, 3);
        childTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: cx - 160, y: cy + 80 + ti * 50, type: "task" });
          e.push({ from: tid, to: child.id, label: task.status === "done" ? "completed" : "building", type: "task", animated: task.status === "in_progress" });
        });
      });

      if (children.length === 0) {
        const agTasks = tasks.filter((t) => t.agent_id === agent.id).slice(0, 3);
        agTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: x - 120, y: y + 120 + ti * 50, type: "task" });
          e.push({ from: tid, to: agent.id, label: task.status === "done" ? "completed" : "building", type: "task", animated: task.status === "in_progress" });
        });
      }
    });

    const recentInteractions = interactions.slice(0, 6);
    recentInteractions.forEach((inter, idx) => {
      const fromNode = n.find((nd) => nd.id === inter.from_agent);
      const toNode = n.find((nd) => nd.id === inter.to_agent);
      if (fromNode && toNode) {
        const mid = `msg-${inter.id}`;
        const mx = (fromNode.x + toNode.x) / 2 + (idx % 2 === 0 ? -80 : 80);
        const my = (fromNode.y + toNode.y) / 2 + 40 + idx * 20;
        n.push({ id: mid, emoji: "", name: inter.message.slice(0, 60) + (inter.message.length > 60 ? "..." : ""), status: inter.type, x: mx, y: my, type: "message" });
        e.push({ from: fromNode.id, to: mid, type: "interaction" });
        e.push({ from: mid, to: toNode.id, label: inter.type, type: "interaction" });
      }
    });

    return { nodes: n, edges: e };
  }, [agents, tasks, interactions, liveAgents]);

  const canvasHeight = useMemo(() => Math.max(600, ...nodes.map((n) => n.y + 100)), [nodes]);
  const canvasWidth = useMemo(() => Math.max(900, ...nodes.map((n) => n.x + 160)), [nodes]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2 rounded-xl"><GitBranch className="h-5 w-5" /></div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Interações</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      </PageTransition>
    );
  }

  const totalTokens = (interactions ?? []).reduce((s, i) => s + (i.tokens ?? 0), 0);
  const agentCount = new Set([...(interactions ?? []).map((i) => i.from_agent), ...(interactions ?? []).map((i) => i.to_agent)].filter(Boolean)).size;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan/10 text-cyan p-2 rounded-xl">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Interações</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Grafo em tempo real · agentes, tarefas e mensagens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-terminal animate-pulse" />
          <span className="text-[11px] text-terminal font-medium">Live</span>
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Interações", value: (interactions ?? []).length.toString(), color: "text-foreground" },
          { label: "Agentes", value: agentCount.toString(), color: "text-terminal" },
          { label: "Tokens", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), color: "text-cyan" },
          { label: "Tarefas", value: (tasks ?? []).length.toString(), color: "text-amber" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border/50 bg-card surface-elevated">
              <CardContent className="p-4">
                <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
                <p className={`text-xl font-bold ${s.color} tracking-tight`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <div className="border border-border/50 rounded-2xl bg-card surface-elevated overflow-hidden">
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="overflow-x-auto">
            <svg width={canvasWidth} height={canvasHeight} className="min-w-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(220, 10%, 30%)" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {edges.map((edge, idx) => {
                const fromN = nodes.find((n) => n.id === edge.from);
                const toN = nodes.find((n) => n.id === edge.to);
                if (!fromN || !toN) return null;
                const isPulsing = pulsingEdges.has(`${edge.from}-${edge.to}`) || pulsingEdges.has(`${edge.to}-${edge.from}`);
                const color = edge.type === "hierarchy" ? "hsl(260, 67%, 50%)" : edge.type === "interaction" ? "hsl(190, 90%, 55%)" : edge.label === "completed" ? "hsl(158, 64%, 52%)" : "hsl(45, 93%, 46%)";
                const dashArray = edge.type === "task" ? "6,4" : edge.type === "interaction" ? "4,4" : "none";
                return (
                  <g key={`edge-${idx}`}>
                    <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke={color} strokeWidth={isPulsing ? 3 : 1.5} strokeDasharray={dashArray} opacity={isPulsing ? 1 : 0.5} markerEnd={edge.type === "interaction" ? "url(#arrow)" : undefined} filter={isPulsing ? "url(#glow)" : undefined}>
                      {isPulsing && <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="3" />}
                    </line>
                    {edge.label && (
                      <text x={(fromN.x + toN.x) / 2} y={(fromN.y + toN.y) / 2 - 6} textAnchor="middle" fill="hsl(220, 10%, 45%)" fontSize={10} fontFamily="system-ui, -apple-system, sans-serif">
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {nodes.map((node) => {
                if (node.type === "agent") {
                  const borderColor = node.status === "online" ? "hsl(158, 64%, 52%)" : node.status === "busy" ? "hsl(45, 93%, 56%)" : node.status === "error" ? "hsl(0, 72%, 51%)" : "hsl(220, 10%, 20%)";
                  const isActive = node.status === "online" || node.status === "busy";
                  return (
                    <g key={node.id}>
                      {isActive && <rect x={node.x - 67} y={node.y - 42} width={134} height={84} rx={16} fill="none" stroke={borderColor} strokeWidth={1} opacity={0.2}>
                        <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2s" repeatCount="indefinite" />
                      </rect>}
                      <rect x={node.x - 65} y={node.y - 40} width={130} height={80} rx={14} fill="hsl(228, 18%, 10%)" stroke={borderColor} strokeWidth={1.5} />
                      <text x={node.x} y={node.y - 8} textAnchor="middle" fontSize={22}>{node.emoji}</text>
                      <text x={node.x} y={node.y + 12} textAnchor="middle" fill="hsl(220, 20%, 90%)" fontSize={12} fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{node.name}</text>
                      <text x={node.x} y={node.y + 26} textAnchor="middle" fill="hsl(220, 10%, 45%)" fontSize={10} fontFamily="system-ui, -apple-system, sans-serif">
                        {statusEmoji[node.status] ?? "⚪"} {statusLabel[node.status] ?? node.status}
                      </text>
                    </g>
                  );
                }
                if (node.type === "task") {
                  const bg = node.status === "done" ? "hsl(158, 20%, 10%)" : node.status === "in_progress" ? "hsl(45, 20%, 10%)" : "hsl(228, 12%, 10%)";
                  const borderC = node.status === "done" ? "hsl(158, 64%, 30%)" : node.status === "in_progress" ? "hsl(45, 60%, 35%)" : "hsl(220, 10%, 18%)";
                  return (
                    <g key={node.id}>
                      <rect x={node.x - 65} y={node.y - 18} width={130} height={36} rx={10} fill={bg} stroke={borderC} strokeWidth={1} strokeDasharray="4,3" />
                      <text x={node.x} y={node.y - 2} textAnchor="middle" fill="hsl(220, 20%, 75%)" fontSize={9} fontFamily="system-ui, -apple-system, sans-serif">Task</text>
                      <text x={node.x} y={node.y + 12} textAnchor="middle" fill="hsl(220, 20%, 65%)" fontSize={10} fontFamily="system-ui, -apple-system, sans-serif">
                        {node.name.length > 16 ? node.name.slice(0, 16) + "…" : node.name}
                      </text>
                    </g>
                  );
                }
                if (node.type === "message") {
                  return (
                    <g key={node.id}>
                      <rect x={node.x - 100} y={node.y - 22} width={200} height={44} rx={12} fill="hsl(190, 20%, 10%)" stroke="hsl(190, 60%, 35%)" strokeWidth={1} />
                      <text x={node.x} y={node.y + 2} textAnchor="middle" fill="hsl(220, 20%, 75%)" fontSize={9} fontFamily="system-ui, -apple-system, sans-serif">
                        {node.name.length > 40 ? node.name.slice(0, 40) + "…" : node.name}
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        </ScrollArea>
      </div>
    </PageTransition>
  );
};

export default Interactions;
