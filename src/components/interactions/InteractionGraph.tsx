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
  type: "agent" | "task";
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  type: "hierarchy" | "task";
  animated?: boolean;
}

interface InteractionEdge {
  fromId: string;
  toId: string;
  type: string;
  message: string;
  id: string;
}

const statusEmoji: Record<string, string> = { online: "🟢", busy: "⚡", idle: "😴", error: "🔴" };
const statusLabel: Record<string, string> = { online: "online", busy: "working", idle: "idle", error: "error" };

const typeColor: Record<string, string> = {
  delegation: "hsl(260, 60%, 55%)",
  response: "hsl(158, 64%, 50%)",
  escalation: "hsl(0, 72%, 55%)",
  feedback: "hsl(45, 90%, 55%)",
  query: "hsl(190, 80%, 55%)",
};

interface InteractionGraphProps {
  agents: DbAgent[];
  tasks: DbTask[];
  interactions: InteractionData[];
  liveAgents: Record<string, string>;
  pulsingEdges: Set<string>;
  newInteractionIds: Set<string>;
}

const InteractionGraph = ({ agents, tasks, interactions, liveAgents, pulsingEdges, newInteractionIds }: InteractionGraphProps) => {
  const agentNodes = useMemo(() => {
    const n: NodePos[] = [];
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
      });
    });
    return n;
  }, [agents, liveAgents]);

  const { taskNodes, hierarchyEdges, taskEdges } = useMemo(() => {
    const tn: NodePos[] = [];
    const he: Edge[] = [];
    const te: Edge[] = [];
    const agentList = agents.filter((a) => !a.parent_id);
    const subAgents = agents.filter((a) => a.parent_id);

    agentList.forEach((agent) => {
      const parentNode = agentNodes.find((n) => n.id === agent.id);
      if (!parentNode) return;

      const children = subAgents.filter((s) => s.parent_id === agent.id);
      children.forEach((child) => {
        const childNode = agentNodes.find((n) => n.id === child.id);
        if (!childNode) return;
        he.push({ from: agent.id, to: child.id, type: "hierarchy" });

        const childTasks = tasks.filter((t) => t.agent_id === child.id).slice(0, 2);
        childTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          tn.push({ id: tid, emoji: "", name: task.name, status: task.status, x: childNode.x - 150, y: childNode.y + 90 + ti * 55, type: "task" });
          te.push({ from: tid, to: child.id, label: task.status === "done" ? "✓" : "⟳", type: "task", animated: task.status === "in_progress" });
        });
      });

      if (children.length === 0) {
        const agTasks = tasks.filter((t) => t.agent_id === agent.id).slice(0, 2);
        agTasks.forEach((task, ti) => {
          const tid = `task-${task.id}`;
          tn.push({ id: tid, emoji: "", name: task.name, status: task.status, x: parentNode.x - 130, y: parentNode.y + 130 + ti * 55, type: "task" });
          te.push({ from: tid, to: agent.id, label: task.status === "done" ? "✓" : "⟳", type: "task", animated: task.status === "in_progress" });
        });
      }
    });
    return { taskNodes: tn, hierarchyEdges: he, taskEdges: te };
  }, [agents, tasks, agentNodes]);

  // Interaction edges — draw directly between agent nodes, no message nodes
  const interactionEdges = useMemo<InteractionEdge[]>(() => {
    return interactions.slice(0, 10).map((inter) => ({
      fromId: inter.from_agent ?? "",
      toId: inter.to_agent ?? "",
      type: inter.type,
      message: inter.message,
      id: inter.id,
    })).filter((e) => agentNodes.some((n) => n.id === e.fromId) && agentNodes.some((n) => n.id === e.toId));
  }, [interactions, agentNodes]);

  const allNodes = [...agentNodes, ...taskNodes];
  const canvasHeight = useMemo(() => Math.max(550, ...allNodes.map((n) => n.y + 120)), [allNodes]);
  const canvasWidth = useMemo(() => Math.max(950, ...allNodes.map((n) => n.x + 180)), [allNodes]);

  return (
    <svg width={canvasWidth} height={canvasHeight} className="min-w-full">
      <defs>
        <marker id="arrow-int" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(190, 80%, 50%)" />
        </marker>
        <filter id="glow-g"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="glow-c"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="shad"><feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="hsl(0,0%,0%)" floodOpacity="0.4" /></filter>
        <style>{`
          @keyframes dash-flow { to { stroke-dashoffset: -20; } }
          @keyframes pulse-ring { 0%,100% { opacity: 0.15; } 50% { opacity: 0.35; } }
        `}</style>
      </defs>

      {/* Hierarchy edges (bezier curves) */}
      {hierarchyEdges.map((edge, idx) => {
        const fromN = agentNodes.find((n) => n.id === edge.from);
        const toN = agentNodes.find((n) => n.id === edge.to);
        if (!fromN || !toN) return null;
        return (
          <path key={`h-${idx}`}
            d={`M ${fromN.x} ${fromN.y + 45} C ${fromN.x} ${fromN.y + 100}, ${toN.x} ${toN.y - 100}, ${toN.x} ${toN.y - 45}`}
            fill="none" stroke="hsl(260, 50%, 35%)" strokeWidth={1.5} opacity={0.35} strokeDasharray="6,4"
          />
        );
      })}

      {/* Task edges */}
      {taskEdges.map((edge, idx) => {
        const fromN = allNodes.find((n) => n.id === edge.from);
        const toN = allNodes.find((n) => n.id === edge.to);
        if (!fromN || !toN) return null;
        const taskColor = edge.label === "✓" ? "hsl(158, 64%, 45%)" : "hsl(45, 80%, 50%)";
        return (
          <g key={`t-${idx}`}>
            <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y}
              stroke={taskColor} strokeWidth={1} opacity={0.3} strokeDasharray="4,4"
              style={edge.animated ? { animation: "dash-flow 1s linear infinite" } : undefined}
            />
          </g>
        );
      })}

      {/* Interaction edges — curved arcs between agents */}
      {interactionEdges.map((ie, idx) => {
        const fromN = agentNodes.find((n) => n.id === ie.fromId);
        const toN = agentNodes.find((n) => n.id === ie.toId);
        if (!fromN || !toN) return null;
        const isPulsing = pulsingEdges.has(`${ie.fromId}-${ie.toId}`) || pulsingEdges.has(`${ie.toId}-${ie.fromId}`);
        const isNew = newInteractionIds.has(ie.id);
        const color = typeColor[ie.type] ?? "hsl(190, 70%, 45%)";
        
        // Offset arcs so multiple interactions between same agents don't overlap
        const arcOffset = 30 + idx * 12;
        const midX = (fromN.x + toN.x) / 2;
        const midY = (fromN.y + toN.y) / 2;
        const dx = toN.x - fromN.x;
        const dy = toN.y - fromN.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        // Perpendicular offset
        const px = -dy / len * arcOffset;
        const py = dx / len * arcOffset;
        const cx1 = midX + px;
        const cy1 = midY + py;

        return (
          <g key={`ie-${idx}`}>
            {(isPulsing || isNew) && (
              <path
                d={`M ${fromN.x} ${fromN.y} Q ${cx1} ${cy1}, ${toN.x} ${toN.y}`}
                fill="none" stroke={color} strokeWidth={5} opacity={0.1}
                filter="url(#glow-c)"
              />
            )}
            <path
              d={`M ${fromN.x} ${fromN.y} Q ${cx1} ${cy1}, ${toN.x} ${toN.y}`}
              fill="none" stroke={color}
              strokeWidth={isPulsing ? 2.5 : 1}
              strokeDasharray="5,4"
              opacity={isPulsing ? 0.9 : 0.35}
              markerEnd="url(#arrow-int)"
              style={isPulsing ? { animation: "dash-flow 0.6s linear infinite" } : undefined}
            />
            {/* Type label on the arc */}
            <text x={cx1} y={cy1 - 6} textAnchor="middle" fill={color}
              fontSize={8} fontWeight="600" fontFamily="system-ui" opacity={isPulsing ? 1 : 0.6}
            >
              {ie.type}
            </text>
            {isPulsing && (
              <circle cx={cx1} cy={cy1} r={3} fill={color}>
                <animate attributeName="r" values="2;5;2" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Agent nodes */}
      {agentNodes.map((node) => {
        const isOnline = node.status === "online";
        const isBusy = node.status === "busy";
        const isError = node.status === "error";
        const borderColor = isOnline ? "hsl(158, 64%, 50%)" : isBusy ? "hsl(45, 90%, 55%)" : isError ? "hsl(0, 72%, 50%)" : "hsl(220, 15%, 22%)";
        const glowFilter = isOnline ? "url(#glow-g)" : undefined;

        return (
          <g key={node.id}>
            {(isOnline || isBusy) && (
              <rect x={node.x - 72} y={node.y - 47} width={144} height={94} rx={20}
                fill="none" stroke={borderColor} strokeWidth={1}
                style={{ animation: "pulse-ring 2.5s ease-in-out infinite" }}
              />
            )}
            <rect x={node.x - 70} y={node.y - 45} width={140} height={90} rx={18}
              fill="hsl(228, 20%, 8%)" filter="url(#shad)"
            />
            <rect x={node.x - 70} y={node.y - 45} width={140} height={90} rx={18}
              fill="hsl(228, 18%, 11%)" stroke={borderColor} strokeWidth={1.5}
              filter={glowFilter}
            />
            <circle cx={node.x + 55} cy={node.y - 30} r={4} fill={borderColor}>
              {(isOnline || isBusy) && (
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            <text x={node.x} y={node.y - 8} textAnchor="middle" fontSize={24}>{node.emoji}</text>
            <text x={node.x} y={node.y + 14} textAnchor="middle" fill="hsl(220, 25%, 92%)"
              fontSize={12} fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif"
            >
              {node.name.length > 14 ? node.name.slice(0, 14) + "…" : node.name}
            </text>
            <text x={node.x} y={node.y + 30} textAnchor="middle" fill="hsl(220, 10%, 50%)"
              fontSize={10} fontFamily="system-ui, -apple-system, sans-serif"
            >
              {statusEmoji[node.status] ?? "⚪"} {statusLabel[node.status] ?? node.status}
            </text>
          </g>
        );
      })}

      {/* Task nodes */}
      {taskNodes.map((node) => {
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
      })}
    </svg>
  );
};

export default InteractionGraph;
