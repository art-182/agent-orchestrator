import { useState, useMemo, useCallback, useEffect } from "react";
import { GitBranch, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { Card, CardContent } from "@/components/ui/card";
import { useAgents, useTasks, useInteractions } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const statusEmoji: Record<string, string> = {
  online: "🟢", busy: "⚡", idle: "😴", error: "🔴",
};
const statusLabel: Record<string, string> = {
  online: "communicating", busy: "working", idle: "idle", error: "error",
};
const statusBorder: Record<string, string> = {
  online: "border-terminal/60", busy: "border-amber/60", idle: "border-muted-foreground/40", error: "border-rose/60",
};

interface NodePos {
  id: string;
  emoji: string;
  name: string;
  status: string;
  x: number;
  y: number;
  type: "agent" | "task" | "message";
  label?: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  type: "hierarchy" | "interaction" | "task";
  animated?: boolean;
}

const Interactions = () => {
  const { data: agents, isLoading: la } = useAgents();
  const { data: tasks, isLoading: lt } = useTasks();
  const { data: interactions, isLoading: li } = useInteractions();
  const [liveMode, setLiveMode] = useState(false);
  const [liveAgents, setLiveAgents] = useState<Record<string, string>>({});

  // Realtime subscription
  useEffect(() => {
    if (!liveMode) return;
    const channel = supabase
      .channel("agents-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "agents" }, (payload) => {
        const updated = payload.new as any;
        setLiveAgents((prev) => ({ ...prev, [updated.id]: updated.status }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [liveMode]);

  const isLoading = la || lt || li;

  // Build graph nodes & edges
  const { nodes, edges } = useMemo(() => {
    if (!agents || !tasks || !interactions) return { nodes: [], edges: [] };

    const n: NodePos[] = [];
    const e: Edge[] = [];
    const agentList = agents.filter((a) => !a.parent_id);
    const subAgents = agents.filter((a) => a.parent_id);

    const CANVAS_W = 800;
    const colSpacing = CANVAS_W / Math.max(agentList.length + 1, 2);

    // Place top-level agents in a row
    agentList.forEach((agent, idx) => {
      const x = colSpacing * (idx + 1);
      const y = 60;
      const resolvedStatus = liveAgents[agent.id] ?? agent.status;
      n.push({ id: agent.id, emoji: agent.emoji, name: agent.name, status: resolvedStatus, x, y, type: "agent" });

      // Sub-agents below
      const children = subAgents.filter((s) => s.parent_id === agent.id);
      children.forEach((child, ci) => {
        const cx = x + (ci - (children.length - 1) / 2) * 160;
        const cy = y + 180;
        const childStatus = liveAgents[child.id] ?? child.status;
        n.push({ id: child.id, emoji: child.emoji, name: child.name, status: childStatus, x: cx, y: cy, type: "agent" });
        e.push({ from: agent.id, to: child.id, type: "hierarchy" });

        // Tasks for this child
        const childTasks = tasks.filter((t) => t.agent_id === child.id).slice(0, 3);
        childTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          const tx = cx - 160;
          const ty = cy + 80 + ti * 50;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: tx, y: ty, type: "task", label: task.name });
          e.push({ from: tid, to: child.id, label: task.status === "done" ? "completed" : "building", type: "task", animated: task.status === "in_progress" });
        });
      });

      // Tasks directly on agent (if no children)
      if (children.length === 0) {
        const agTasks = tasks.filter((t) => t.agent_id === agent.id).slice(0, 3);
        agTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: x - 120, y: y + 120 + ti * 50, type: "task" });
          e.push({ from: tid, to: agent.id, label: task.status === "done" ? "completed" : "building", type: "task", animated: task.status === "in_progress" });
        });
      }
    });

    // Interactions as message nodes
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

  // Calculate canvas size
  const canvasHeight = useMemo(() => Math.max(600, ...nodes.map((n) => n.y + 100)), [nodes]);
  const canvasWidth = useMemo(() => Math.max(900, ...nodes.map((n) => n.x + 160)), [nodes]);

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <GitBranch className="h-7 w-7 text-terminal" />
          <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Interações</h1>
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
          <GitBranch className="h-7 w-7 text-terminal" />
          <div>
            <h1 className="font-mono text-2xl font-semibold text-foreground tracking-tight">Interações</h1>
            <p className="text-xs text-muted-foreground">Grafo de agentes, tarefas e mensagens</p>
          </div>
        </div>
        <Button
          variant={liveMode ? "default" : "outline"}
          size="sm"
          className={`font-mono text-xs gap-2 ${liveMode ? "bg-terminal text-background hover:bg-terminal/80" : ""}`}
          onClick={() => setLiveMode(!liveMode)}
        >
          <span className={`h-2 w-2 rounded-full ${liveMode ? "bg-background animate-pulse" : "bg-muted-foreground"}`} />
          {liveMode ? "Live" : "Enable Live"}
        </Button>
      </div>

      {/* Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Interações", value: (interactions ?? []).length.toString(), color: "text-foreground" },
          { label: "Agentes", value: agentCount.toString(), color: "text-terminal" },
          { label: "Tokens", value: totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens.toString(), color: "text-cyan" },
          { label: "Tarefas", value: (tasks ?? []).length.toString(), color: "text-amber" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      {/* Graph */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="overflow-x-auto">
            <svg width={canvasWidth} height={canvasHeight} className="min-w-full">
              <defs>
                <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(220, 10%, 30%)" />
                </marker>
              </defs>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const fromN = nodes.find((n) => n.id === edge.from);
                const toN = nodes.find((n) => n.id === edge.to);
                if (!fromN || !toN) return null;

                const color = edge.type === "hierarchy"
                  ? "hsl(260, 67%, 50%)"
                  : edge.type === "interaction"
                    ? "hsl(210, 80%, 60%)"
                    : edge.label === "completed"
                      ? "hsl(160, 51%, 49%)"
                      : "hsl(45, 93%, 46%)";

                const dashArray = edge.type === "task" ? "6,4" : edge.type === "interaction" ? "4,4" : "none";

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={fromN.x} y1={fromN.y}
                      x2={toN.x} y2={toN.y}
                      stroke={color} strokeWidth={1.5}
                      strokeDasharray={dashArray}
                      opacity={0.6}
                      markerEnd={edge.type === "interaction" ? "url(#arrow)" : undefined}
                    />
                    {edge.label && (
                      <text
                        x={(fromN.x + toN.x) / 2}
                        y={(fromN.y + toN.y) / 2 - 6}
                        textAnchor="middle"
                        fill="hsl(220, 10%, 50%)"
                        fontSize={10}
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                if (node.type === "agent") {
                  const border = statusBorder[node.status] ?? "border-border";
                  const borderColor = border.includes("terminal") ? "hsl(160, 51%, 49%)" : border.includes("amber") ? "hsl(45, 93%, 56%)" : border.includes("rose") ? "hsl(350, 80%, 55%)" : "hsl(220, 10%, 25%)";
                  return (
                    <g key={node.id}>
                      <rect x={node.x - 65} y={node.y - 40} width={130} height={80} rx={8} fill="hsl(230, 20%, 14%)" stroke={borderColor} strokeWidth={2} />
                      <text x={node.x} y={node.y - 8} textAnchor="middle" fontSize={22}>{node.emoji}</text>
                      <text x={node.x} y={node.y + 12} textAnchor="middle" fill="hsl(220, 20%, 90%)" fontSize={13} fontWeight="bold" fontFamily="JetBrains Mono, monospace">{node.name}</text>
                      <text x={node.x} y={node.y + 28} textAnchor="middle" fill="hsl(220, 10%, 50%)" fontSize={10} fontFamily="JetBrains Mono, monospace">
                        {statusEmoji[node.status] ?? "⚪"} {statusLabel[node.status] ?? node.status}
                      </text>
                      {/* Connection dots */}
                      <circle cx={node.x} cy={node.y - 40} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
                      <circle cx={node.x} cy={node.y + 40} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
                    </g>
                  );
                }

                if (node.type === "task") {
                  const bg = node.status === "done" ? "hsl(160, 30%, 12%)" : node.status === "in_progress" ? "hsl(45, 30%, 12%)" : "hsl(230, 15%, 12%)";
                  const borderC = node.status === "done" ? "hsl(160, 51%, 35%)" : node.status === "in_progress" ? "hsl(45, 60%, 40%)" : "hsl(220, 10%, 25%)";
                  return (
                    <g key={node.id}>
                      <rect x={node.x - 65} y={node.y - 18} width={130} height={36} rx={4} fill={bg} stroke={borderC} strokeWidth={1.5} strokeDasharray="4,3" />
                      <text x={node.x} y={node.y - 2} textAnchor="middle" fill="hsl(220, 20%, 85%)" fontSize={10} fontFamily="JetBrains Mono, monospace">Task</text>
                      <text x={node.x} y={node.y + 12} textAnchor="middle" fill="hsl(220, 20%, 75%)" fontSize={10} fontFamily="JetBrains Mono, monospace">
                        {node.name.length > 16 ? node.name.slice(0, 16) + "…" : node.name}
                      </text>
                      <circle cx={node.x + 65} cy={node.y} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
                      <circle cx={node.x - 65} cy={node.y} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
                    </g>
                  );
                }

                if (node.type === "message") {
                  return (
                    <g key={node.id}>
                      <rect x={node.x - 100} y={node.y - 22} width={200} height={44} rx={6} fill="hsl(210, 30%, 14%)" stroke="hsl(210, 60%, 40%)" strokeWidth={1.5} />
                      <text x={node.x} y={node.y + 2} textAnchor="middle" fill="hsl(220, 20%, 80%)" fontSize={9} fontFamily="JetBrains Mono, monospace">
                        {node.name.length > 40 ? node.name.slice(0, 40) + "…" : node.name}
                      </text>
                      <circle cx={node.x} cy={node.y - 22} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
                      <circle cx={node.x} cy={node.y + 22} r={3} fill="hsl(220, 10%, 30%)" stroke="hsl(220, 10%, 40%)" strokeWidth={1} />
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
