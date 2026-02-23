import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;

interface AgentSkill {
  name: string;
  level: number;
  category: string;
  connections: string[];
}

interface GraphNode {
  id: string;
  label: string;
  type: "agent" | "skill";
  x: number;
  y: number;
  agentId?: string;
  agentEmoji?: string;
  agentStatus?: string;
  category?: string;
  level?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  type: "agent-skill" | "skill-skill";
}

const categoryColors: Record<string, { fill: string; stroke: string; label: string }> = {
  Core: { fill: "hsl(158, 64%, 52%)", stroke: "hsl(158, 64%, 42%)", label: "Core" },
  Security: { fill: "hsl(0, 72%, 51%)", stroke: "hsl(0, 72%, 41%)", label: "Security" },
  Language: { fill: "hsl(190, 90%, 55%)", stroke: "hsl(190, 90%, 45%)", label: "Language" },
  Frontend: { fill: "hsl(190, 90%, 55%)", stroke: "hsl(190, 90%, 45%)", label: "Frontend" },
  Backend: { fill: "hsl(258, 70%, 68%)", stroke: "hsl(258, 70%, 58%)", label: "Backend" },
  Quality: { fill: "hsl(42, 100%, 62%)", stroke: "hsl(42, 100%, 52%)", label: "Quality" },
  Analysis: { fill: "hsl(42, 100%, 62%)", stroke: "hsl(42, 100%, 52%)", label: "Analysis" },
  DevOps: { fill: "hsl(158, 64%, 52%)", stroke: "hsl(158, 64%, 42%)", label: "DevOps" },
  Infra: { fill: "hsl(258, 70%, 68%)", stroke: "hsl(258, 70%, 58%)", label: "Infra" },
  Ops: { fill: "hsl(42, 100%, 62%)", stroke: "hsl(42, 100%, 52%)", label: "Ops" },
  Compliance: { fill: "hsl(220, 10%, 50%)", stroke: "hsl(220, 10%, 40%)", label: "Compliance" },
  Output: { fill: "hsl(220, 10%, 50%)", stroke: "hsl(220, 10%, 40%)", label: "Output" },
  Standards: { fill: "hsl(190, 90%, 55%)", stroke: "hsl(190, 90%, 45%)", label: "Standards" },
  Data: { fill: "hsl(258, 70%, 68%)", stroke: "hsl(258, 70%, 58%)", label: "Data" },
};

const statusColors: Record<string, string> = {
  online: "hsl(158, 64%, 52%)",
  busy: "hsl(42, 100%, 62%)",
  idle: "hsl(220, 10%, 50%)",
  error: "hsl(0, 72%, 51%)",
};

const defaultCat = { fill: "hsl(220, 10%, 50%)", stroke: "hsl(220, 10%, 40%)", label: "Other" };

function buildGraph(agents: DbAgent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const skillMap = new Map<string, { category: string; level: number; agentIds: string[] }>();

  // Collect all unique skills
  agents.forEach((agent) => {
    const skills = (agent.skills as unknown as AgentSkill[]) ?? [];
    skills.forEach((s) => {
      const existing = skillMap.get(s.name);
      if (existing) {
        existing.agentIds.push(agent.id);
        existing.level = Math.max(existing.level, s.level);
      } else {
        skillMap.set(s.name, { category: s.category, level: s.level, agentIds: [agent.id] });
      }
    });
  });

  // Position agents in an inner circle
  const cx = 500, cy = 400;
  const agentRadius = 140;
  agents.forEach((agent, i) => {
    const angle = (2 * Math.PI * i) / agents.length - Math.PI / 2;
    nodes.push({
      id: `agent-${agent.id}`,
      label: agent.name,
      type: "agent",
      x: cx + agentRadius * Math.cos(angle),
      y: cy + agentRadius * Math.sin(angle),
      agentId: agent.id,
      agentEmoji: agent.emoji,
      agentStatus: agent.status,
    });
  });

  // Position skills in an outer circle
  const skillArray = Array.from(skillMap.entries());
  const skillRadius = 320;
  skillArray.forEach(([name, data], i) => {
    const angle = (2 * Math.PI * i) / skillArray.length - Math.PI / 2;
    nodes.push({
      id: `skill-${name}`,
      label: name,
      type: "skill",
      x: cx + skillRadius * Math.cos(angle),
      y: cy + skillRadius * Math.sin(angle),
      category: data.category,
      level: data.level,
    });

    // Edges from agents to their skills
    data.agentIds.forEach((agentId) => {
      edges.push({ from: `agent-${agentId}`, to: `skill-${name}`, type: "agent-skill" });
    });
  });

  // Edges between skills (connections)
  agents.forEach((agent) => {
    const skills = (agent.skills as unknown as AgentSkill[]) ?? [];
    skills.forEach((s) => {
      s.connections.forEach((cn) => {
        if (skillMap.has(cn) && s.name < cn) {
          edges.push({ from: `skill-${s.name}`, to: `skill-${cn}`, type: "skill-skill" });
        }
      });
    });
  });

  return { nodes, edges };
}

interface SkillsNetworkGraphProps {
  agents: DbAgent[];
  onSelectAgent?: (agent: DbAgent) => void;
}

const SkillsNetworkGraph = ({ agents, onSelectAgent }: SkillsNetworkGraphProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => buildGraph(agents), [agents]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  // Get connected node ids for highlighting
  const connectedIds = useMemo(() => {
    const active = hoveredNode ?? selectedNode;
    if (!active) return new Set<string>();
    const set = new Set<string>([active]);
    edges.forEach((e) => {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    });
    return set;
  }, [hoveredNode, selectedNode, edges]);

  const activeNode = hoveredNode ?? selectedNode;

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
    const node = nodeMap.get(nodeId);
    if (node?.type === "agent" && node.agentId && onSelectAgent) {
      const agent = agents.find((a) => a.id === node.agentId);
      if (agent) onSelectAgent(agent);
    }
  }, [nodeMap, agents, onSelectAgent]);

  // Sidebar info
  const selectedNodeData = selectedNode ? nodeMap.get(selectedNode) : null;
  const selectedSkillAgents = useMemo(() => {
    if (!selectedNodeData || selectedNodeData.type !== "skill") return [];
    return edges
      .filter((e) => (e.from === selectedNode || e.to === selectedNode) && e.type === "agent-skill")
      .map((e) => {
        const agentNodeId = e.from === selectedNode ? e.to : e.from;
        return nodeMap.get(agentNodeId);
      })
      .filter(Boolean) as GraphNode[];
  }, [selectedNode, selectedNodeData, edges, nodeMap]);

  // Categories legend
  const categories = useMemo(() => {
    const cats = new Set<string>();
    nodes.forEach((n) => { if (n.category) cats.add(n.category); });
    return Array.from(cats).sort();
  }, [nodes]);

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Graph Area */}
      <Card className="flex-1 border-border/50 bg-card surface-elevated overflow-hidden">
        <CardContent className="p-0 h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 800"
            className="cursor-grab"
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(228, 12%, 10%)" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(158, 64%, 52%)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="hsl(158, 64%, 52%)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1000" height="800" fill="url(#grid)" />
            <circle cx="500" cy="400" r="200" fill="url(#center-glow)" />

            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;
              const isHighlighted = activeNode && (connectedIds.has(edge.from) && connectedIds.has(edge.to));
              const isSkillEdge = edge.type === "skill-skill";
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHighlighted ? (isSkillEdge ? "hsl(190, 90%, 55%)" : "hsl(158, 64%, 52%)") : "hsl(228, 12%, 14%)"}
                  strokeWidth={isHighlighted ? 1.5 : 0.5}
                  opacity={activeNode ? (isHighlighted ? 0.8 : 0.08) : (isSkillEdge ? 0.15 : 0.25)}
                  strokeDasharray={isSkillEdge ? "4 3" : undefined}
                />
              );
            })}

            {/* Skill nodes */}
            {nodes.filter((n) => n.type === "skill").map((node) => {
              const cat = categoryColors[node.category ?? ""] ?? defaultCat;
              const r = 4 + ((node.level ?? 80) / 100) * 10;
              const isActive = activeNode === node.id;
              const isConnected = connectedIds.has(node.id);
              const dimmed = activeNode && !isConnected;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                  opacity={dimmed ? 0.15 : 1}
                >
                  {isActive && (
                    <circle cx={node.x} cy={node.y} r={r + 6} fill="none" stroke={cat.fill} strokeWidth={1} opacity={0.4}>
                      <animate attributeName="r" from={r + 4} to={r + 10} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={node.x} cy={node.y} r={r} fill={cat.fill} opacity={isActive ? 0.4 : 0.15} stroke={cat.stroke} strokeWidth={isActive ? 2 : 1} />
                  <circle cx={node.x} cy={node.y} r={3} fill={cat.fill} opacity={0.9} />
                  <text
                    x={node.x}
                    y={node.y + r + 14}
                    textAnchor="middle"
                    fill={isActive || isConnected ? "hsl(220, 20%, 92%)" : "hsl(220, 10%, 55%)"}
                    fontSize={10}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontWeight={isActive ? 600 : 400}
                  >
                    {node.label}
                  </text>
                  {(isActive || isConnected) && (
                    <text
                      x={node.x}
                      y={node.y + r + 26}
                      textAnchor="middle"
                      fill="hsl(220, 10%, 45%)"
                      fontSize={9}
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {node.level}% · {node.category}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Agent nodes */}
            {nodes.filter((n) => n.type === "agent").map((node) => {
              const isActive = activeNode === node.id;
              const isConnected = connectedIds.has(node.id);
              const dimmed = activeNode && !isConnected;
              const statusColor = statusColors[node.agentStatus ?? "online"] ?? statusColors.online;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                  opacity={dimmed ? 0.15 : 1}
                >
                  {isActive && (
                    <circle cx={node.x} cy={node.y} r={32} fill="none" stroke={statusColor} strokeWidth={1.5} opacity={0.3}>
                      <animate attributeName="r" from="28" to="38" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={24}
                    fill="hsl(228, 18%, 9%)"
                    stroke={isActive ? statusColor : "hsl(228, 12%, 16%)"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {/* Status dot */}
                  <circle cx={node.x + 16} cy={node.y - 16} r={4} fill={statusColor} />
                  {/* Emoji */}
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fontSize={18}
                    dominantBaseline="central"
                  >
                    {node.agentEmoji}
                  </text>
                  {/* Name */}
                  <text
                    x={node.x}
                    y={node.y + 40}
                    textAnchor="middle"
                    fill={isActive || isConnected ? "hsl(220, 20%, 96%)" : "hsl(220, 10%, 65%)"}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <Card className="w-[260px] border-border/50 bg-card surface-elevated shrink-0">
        <CardContent className="p-4 h-full flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3 tracking-tight">Legenda</h3>
          <div className="space-y-1.5 mb-4">
            {categories.map((cat) => {
              const c = categoryColors[cat] ?? defaultCat;
              return (
                <div key={cat} className="flex items-center gap-2 text-[12px]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.fill }} />
                  <span className="text-muted-foreground">{cat}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-muted-foreground space-y-1 mb-4 border-t border-border/30 pt-3">
            <p><span className="text-foreground font-medium">{nodes.filter(n => n.type === "agent").length}</span> agentes</p>
            <p><span className="text-foreground font-medium">{nodes.filter(n => n.type === "skill").length}</span> skills únicas</p>
            <p><span className="text-foreground font-medium">{edges.length}</span> conexões</p>
          </div>

          {selectedNodeData && (
            <div className="border-t border-border/30 pt-3 flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                {selectedNodeData.type === "agent" ? `${selectedNodeData.agentEmoji} ${selectedNodeData.label}` : selectedNodeData.label}
              </h4>
              {selectedNodeData.type === "skill" && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    <div className="text-[11px]">
                      <span className="text-muted-foreground">Categoria: </span>
                      <Badge variant="outline" className="text-[10px] rounded-full px-1.5 py-0" style={{ borderColor: (categoryColors[selectedNodeData.category ?? ""] ?? defaultCat).fill, color: (categoryColors[selectedNodeData.category ?? ""] ?? defaultCat).fill }}>
                        {selectedNodeData.category}
                      </Badge>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-muted-foreground">Nível máx: </span>
                      <span className="text-foreground font-semibold">{selectedNodeData.level}%</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2">Usada por:</div>
                    {selectedSkillAgents.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-[12px] py-1">
                        <span>{a.agentEmoji}</span>
                        <span className="text-foreground">{a.label}</span>
                        <div className="w-2 h-2 rounded-full ml-auto" style={{ background: statusColors[a.agentStatus ?? "online"] }} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {selectedNodeData.type === "agent" && (
                <div className="text-[11px] text-muted-foreground">
                  <p>Clique para ver detalhes completos</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColors[selectedNodeData.agentStatus ?? "online"] }} />
                    <span className="text-foreground">{selectedNodeData.agentStatus}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedNodeData && (
            <div className="border-t border-border/30 pt-3 text-[11px] text-muted-foreground">
              <p>Passe o mouse ou clique em um nó para ver detalhes.</p>
              <p className="mt-1">Agentes no centro, skills ao redor.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsNetworkGraph;
