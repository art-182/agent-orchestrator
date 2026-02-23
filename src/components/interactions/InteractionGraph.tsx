import { useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type DbTask = Tables<"tasks">;

interface InteractionData {
  id: string;
  from_agent: string | null;
  to_agent: string | null;
  message: string;
  type: string;
  tokens: number | null;
  created_at: string;
}

interface NodePos {
  id: string;
  emoji: string;
  name: string;
  status: string;
  x: number;
  y: number;
  type: "agent" | "task" | "message";
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  type: "hierarchy" | "interaction" | "task";
  animated?: boolean;
}

const statusEmoji: Record<string, string> = { online: "🟢", busy: "⚡", idle: "😴", error: "🔴" };
const statusLabel: Record<string, string> = { online: "online", busy: "working", idle: "idle", error: "error" };

interface InteractionGraphProps {
  agents: DbAgent[];
  tasks: DbTask[];
  interactions: InteractionData[];
  liveAgents: Record<string, string>;
  pulsingEdges: Set<string>;
  newInteractionIds: Set<string>;
}

const InteractionGraph = ({ agents, tasks, interactions, liveAgents, pulsingEdges, newInteractionIds }: InteractionGraphProps) => {
  const { nodes, edges } = useMemo(() => {
    const n: NodePos[] = [];
    const e: Edge[] = [];
    const agentList = agents.filter((a) => !a.parent_id);
    const subAgents = agents.filter((a) => a.parent_id);

    const CANVAS_W = 900;
    const colSpacing = CANVAS_W / Math.max(agentList.length + 1, 2);

    agentList.forEach((agent, idx) => {
      const x = colSpacing * (idx + 1);
      const y = 80;
      const resolvedStatus = liveAgents[agent.id] ?? agent.status;
      n.push({ id: agent.id, emoji: agent.emoji, name: agent.name, status: resolvedStatus, x, y, type: "agent" });

      const children = subAgents.filter((s) => s.parent_id === agent.id);
      children.forEach((child, ci) => {
        const cx = x + (ci - (children.length - 1) / 2) * 170;
        const cy = y + 200;
        const childStatus = liveAgents[child.id] ?? child.status;
        n.push({ id: child.id, emoji: child.emoji, name: child.name, status: childStatus, x: cx, y: cy, type: "agent" });
        e.push({ from: agent.id, to: child.id, type: "hierarchy" });

        const childTasks = tasks.filter((t) => t.agent_id === child.id).slice(0, 2);
        childTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: cx - 150, y: cy + 90 + ti * 55, type: "task" });
          e.push({ from: tid, to: child.id, label: task.status === "done" ? "✓" : "⟳", type: "task", animated: task.status === "in_progress" });
        });
      });

      if (children.length === 0) {
        const agTasks = tasks.filter((t) => t.agent_id === agent.id).slice(0, 2);
        agTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          n.push({ id: tid, emoji: "", name: task.name, status: task.status, x: x - 130, y: y + 130 + ti * 55, type: "task" });
          e.push({ from: tid, to: agent.id, label: task.status === "done" ? "✓" : "⟳", type: "task", animated: task.status === "in_progress" });
        });
      }
    });

    const recentInteractions = interactions.slice(0, 8);
    recentInteractions.forEach((inter, idx) => {
      const fromNode = n.find((nd) => nd.id === inter.from_agent);
      const toNode = n.find((nd) => nd.id === inter.to_agent);
      if (fromNode && toNode) {
        const mid = `msg-${inter.id}`;
        const angle = (idx / recentInteractions.length) * Math.PI * 0.5 - Math.PI * 0.25;
        const offset = 60 + idx * 15;
        const mx = (fromNode.x + toNode.x) / 2 + Math.cos(angle) * offset;
        const my = (fromNode.y + toNode.y) / 2 + 50 + idx * 25;
        n.push({ id: mid, emoji: "", name: inter.message.slice(0, 50) + (inter.message.length > 50 ? "…" : ""), status: inter.type, x: mx, y: my, type: "message" });
        e.push({ from: fromNode.id, to: mid, type: "interaction" });
        e.push({ from: mid, to: toNode.id, label: inter.type, type: "interaction" });
      }
    });

    return { nodes: n, edges: e };
  }, [agents, tasks, interactions, liveAgents]);

  const canvasHeight = useMemo(() => Math.max(650, ...nodes.map((n) => n.y + 120)), [nodes]);
  const canvasWidth = useMemo(() => Math.max(950, ...nodes.map((n) => n.x + 180)), [nodes]);

  return (
    <svg width={canvasWidth} height={canvasHeight} className="min-w-full">
      <defs>
        <marker id="arrow-interaction" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(190, 80%, 50%)" />
        </marker>
        <filter id="glow-green">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(0,0%,0%)" floodOpacity="0.4" />
        </filter>
        {/* Animated dash for in-progress edges */}
        <style>{`
          @keyframes dash-flow { to { stroke-dashoffset: -20; } }
          @keyframes pulse-ring { 0%,100% { opacity: 0.15; } 50% { opacity: 0.35; } }
          @keyframes msg-appear { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        `}</style>
      </defs>

      {/* Edges */}
      {edges.map((edge, idx) => {
        const fromN = nodes.find((n) => n.id === edge.from);
        const toN = nodes.find((n) => n.id === edge.to);
        if (!fromN || !toN) return null;
        const isPulsing = pulsingEdges.has(`${edge.from}-${edge.to}`) || pulsingEdges.has(`${edge.to}-${edge.from}`);

        if (edge.type === "hierarchy") {
          const mx = (fromN.x + toN.x) / 2;
          const my1 = fromN.y + 40;
          const my2 = toN.y - 40;
          return (
            <g key={`e-${idx}`}>
              <path
                d={`M ${fromN.x} ${fromN.y + 40} C ${fromN.x} ${my1 + 40}, ${toN.x} ${my2 - 40}, ${toN.x} ${toN.y - 40}`}
                fill="none"
                stroke="hsl(260, 50%, 40%)"
                strokeWidth={1.5}
                opacity={0.4}
                strokeDasharray="6,4"
              />
            </g>
          );
        }

        if (edge.type === "interaction") {
          const color = isPulsing ? "hsl(190, 95%, 60%)" : "hsl(190, 70%, 45%)";
          return (
            <g key={`e-${idx}`}>
              {isPulsing && (
                <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y}
                  stroke="hsl(190, 90%, 55%)" strokeWidth={6} opacity={0.15}
                  filter="url(#glow-cyan)"
                />
              )}
              <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y}
                stroke={color} strokeWidth={isPulsing ? 2.5 : 1.2}
                strokeDasharray="5,4"
                opacity={isPulsing ? 1 : 0.5}
                markerEnd="url(#arrow-interaction)"
                style={isPulsing ? { animation: "dash-flow 0.6s linear infinite" } : undefined}
              />
              {isPulsing && (
                <>
                  <circle cx={(fromN.x + toN.x) / 2} cy={(fromN.y + toN.y) / 2} r={4} fill="hsl(190, 90%, 60%)">
                    <animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {edge.label && (
                <text x={(fromN.x + toN.x) / 2} y={(fromN.y + toN.y) / 2 - 8}
                  textAnchor="middle" fill="hsl(190, 60%, 55%)" fontSize={9}
                  fontFamily="system-ui" fontWeight="500"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        }

        // Task edges
        const taskColor = edge.label === "✓" ? "hsl(158, 64%, 45%)" : "hsl(45, 80%, 50%)";
        return (
          <g key={`e-${idx}`}>
            <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y}
              stroke={taskColor} strokeWidth={1} opacity={0.35}
              strokeDasharray="4,4"
              style={edge.animated ? { animation: "dash-flow 1s linear infinite" } : undefined}
            />
            {edge.label && (
              <text x={(fromN.x + toN.x) / 2 - 10} y={(fromN.y + toN.y) / 2}
                fill={taskColor} fontSize={11} fontFamily="system-ui"
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
          const isOnline = node.status === "online";
          const isBusy = node.status === "busy";
          const isError = node.status === "error";
          const borderColor = isOnline ? "hsl(158, 64%, 50%)" : isBusy ? "hsl(45, 90%, 55%)" : isError ? "hsl(0, 72%, 50%)" : "hsl(220, 15%, 22%)";
          const glowFilter = isOnline ? "url(#glow-green)" : undefined;

          return (
            <g key={node.id}>
              {/* Pulse ring for active agents */}
              {(isOnline || isBusy) && (
                <rect x={node.x - 72} y={node.y - 47} width={144} height={94} rx={20}
                  fill="none" stroke={borderColor} strokeWidth={1}
                  style={{ animation: "pulse-ring 2.5s ease-in-out infinite" }}
                />
              )}
              {/* Card shadow */}
              <rect x={node.x - 70} y={node.y - 45} width={140} height={90} rx={18}
                fill="hsl(228, 20%, 8%)" filter="url(#shadow)"
              />
              {/* Card bg */}
              <rect x={node.x - 70} y={node.y - 45} width={140} height={90} rx={18}
                fill="hsl(228, 18%, 11%)" stroke={borderColor} strokeWidth={1.5}
                filter={glowFilter}
              />
              {/* Status dot */}
              <circle cx={node.x + 55} cy={node.y - 30} r={4} fill={borderColor}>
                {(isOnline || isBusy) && (
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                )}
              </circle>
              {/* Emoji */}
              <text x={node.x} y={node.y - 8} textAnchor="middle" fontSize={24}>{node.emoji}</text>
              {/* Name */}
              <text x={node.x} y={node.y + 14} textAnchor="middle" fill="hsl(220, 25%, 92%)"
                fontSize={12} fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif"
              >
                {node.name.length > 14 ? node.name.slice(0, 14) + "…" : node.name}
              </text>
              {/* Status */}
              <text x={node.x} y={node.y + 30} textAnchor="middle" fill="hsl(220, 10%, 50%)"
                fontSize={10} fontFamily="system-ui, -apple-system, sans-serif"
              >
                {statusEmoji[node.status] ?? "⚪"} {statusLabel[node.status] ?? node.status}
              </text>
            </g>
          );
        }

        if (node.type === "task") {
          const isDone = node.status === "done";
          const isInProgress = node.status === "in_progress";
          const bg = isDone ? "hsl(158, 18%, 10%)" : isInProgress ? "hsl(45, 18%, 10%)" : "hsl(228, 12%, 9%)";
          const border = isDone ? "hsl(158, 50%, 30%)" : isInProgress ? "hsl(45, 50%, 35%)" : "hsl(220, 10%, 18%)";
          const textColor = isDone ? "hsl(158, 50%, 60%)" : isInProgress ? "hsl(45, 70%, 60%)" : "hsl(220, 15%, 55%)";
          return (
            <g key={node.id}>
              <rect x={node.x - 70} y={node.y - 20} width={140} height={40} rx={12}
                fill={bg} stroke={border} strokeWidth={1}
              />
              <text x={node.x - 55} y={node.y + 1} fill={textColor} fontSize={10}
                fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500"
              >
                {isDone ? "✓" : isInProgress ? "⟳" : "○"} {node.name.length > 18 ? node.name.slice(0, 18) + "…" : node.name}
              </text>
            </g>
          );
        }

        if (node.type === "message") {
          const isNew = newInteractionIds.has(node.id.replace("msg-", ""));
          return (
            <g key={node.id} style={isNew ? { animation: "msg-appear 0.5s ease-out" } : undefined}>
              {isNew && (
                <rect x={node.x - 108} y={node.y - 26} width={216} height={52} rx={16}
                  fill="none" stroke="hsl(190, 80%, 50%)" strokeWidth={1} opacity={0.3}
                  filter="url(#glow-cyan)"
                />
              )}
              <rect x={node.x - 105} y={node.y - 24} width={210} height={48} rx={14}
                fill={isNew ? "hsl(190, 25%, 12%)" : "hsl(190, 15%, 9%)"}
                stroke={isNew ? "hsl(190, 70%, 45%)" : "hsl(190, 40%, 25%)"}
                strokeWidth={isNew ? 1.5 : 1}
              />
              {/* Type badge */}
              <rect x={node.x - 95} y={node.y - 16} width={50} height={16} rx={8}
                fill="hsl(190, 50%, 18%)"
              />
              <text x={node.x - 70} y={node.y - 5} textAnchor="middle"
                fill="hsl(190, 70%, 60%)" fontSize={8} fontWeight="600"
                fontFamily="system-ui"
              >
                {node.status}
              </text>
              {/* Message text */}
              <text x={node.x - 95} y={node.y + 12} fill="hsl(220, 15%, 70%)" fontSize={9}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {node.name.length > 38 ? node.name.slice(0, 38) + "…" : node.name}
              </text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};

export default InteractionGraph;
