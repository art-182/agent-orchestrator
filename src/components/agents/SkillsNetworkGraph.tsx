import { useState, useMemo, useRef, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
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
  position: [number, number, number];
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

const categoryColors: Record<string, string> = {
  Core: "#3ecf8e",
  Security: "#ef4444",
  Language: "#38bdf8",
  Frontend: "#38bdf8",
  Backend: "#a78bfa",
  Quality: "#fbbf24",
  Analysis: "#fbbf24",
  DevOps: "#3ecf8e",
  Infra: "#a78bfa",
  Ops: "#fbbf24",
  Compliance: "#94a3b8",
  Output: "#94a3b8",
  Standards: "#38bdf8",
  Data: "#a78bfa",
};

const statusColorsHex: Record<string, string> = {
  online: "#3ecf8e",
  busy: "#fbbf24",
  idle: "#94a3b8",
  error: "#ef4444",
};

const defaultColor = "#94a3b8";

function buildGraph(agents: DbAgent[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const skillMap = new Map<string, { category: string; level: number; agentIds: string[] }>();

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

  // Agents in inner sphere
  const agentRadius = 3;
  agents.forEach((agent, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / agents.length);
    const theta = Math.sqrt(agents.length * Math.PI) * phi;
    nodes.push({
      id: `agent-${agent.id}`,
      label: agent.name,
      type: "agent",
      position: [
        agentRadius * Math.cos(theta) * Math.sin(phi),
        agentRadius * Math.cos(phi),
        agentRadius * Math.sin(theta) * Math.sin(phi),
      ],
      agentId: agent.id,
      agentEmoji: agent.emoji,
      agentStatus: agent.status,
    });
  });

  // Skills in outer sphere
  const skillArray = Array.from(skillMap.entries());
  const skillRadius = 7;
  skillArray.forEach(([name, data], i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / skillArray.length);
    const theta = Math.sqrt(skillArray.length * Math.PI) * phi;
    nodes.push({
      id: `skill-${name}`,
      label: name,
      type: "skill",
      position: [
        skillRadius * Math.cos(theta) * Math.sin(phi),
        skillRadius * Math.cos(phi),
        skillRadius * Math.sin(theta) * Math.sin(phi),
      ],
      category: data.category,
      level: data.level,
    });

    data.agentIds.forEach((agentId) => {
      edges.push({ from: `agent-${agentId}`, to: `skill-${name}`, type: "agent-skill" });
    });
  });

  // Skill-skill connections
  const addedEdges = new Set<string>();
  agents.forEach((agent) => {
    const skills = (agent.skills as unknown as AgentSkill[]) ?? [];
    skills.forEach((s) => {
      s.connections.forEach((cn) => {
        if (skillMap.has(cn)) {
          const key = [s.name, cn].sort().join("--");
          if (!addedEdges.has(key)) {
            addedEdges.add(key);
            edges.push({ from: `skill-${s.name}`, to: `skill-${cn}`, type: "skill-skill" });
          }
        }
      });
    });
  });

  return { nodes, edges };
}

// --- 3D Components ---

function EdgeLine({ from, to, highlighted, type }: { from: [number, number, number]; to: [number, number, number]; highlighted: boolean; type: string }) {
  const ref = useRef<THREE.Line>(null);
  const points = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], [from, to]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const isSkill = type === "skill-skill";
  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: highlighted ? (isSkill ? "#38bdf8" : "#3ecf8e") : "#1e293b",
    transparent: true,
    opacity: highlighted ? 0.7 : 0.12,
  }), [highlighted, isSkill]);

  const lineObj = useMemo(() => {
    const l = new THREE.Line(geometry, material);
    return l;
  }, [geometry, material]);

  return <primitive ref={ref} object={lineObj} />;
}

function SkillNode({
  node,
  isActive,
  isConnected,
  dimmed,
  onClick,
  onHover,
}: {
  node: GraphNode;
  isActive: boolean;
  isConnected: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const color = categoryColors[node.category ?? ""] ?? defaultColor;
  const r = 0.1 + ((node.level ?? 80) / 100) * 0.2;

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.15);
    }
  });

  return (
    <group position={node.position}>
      {isActive && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[r + 0.15, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.12} />
        </mesh>
      )}
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={(e: ThreeEvent<PointerEvent>) => { onHover(false); document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.6 : 0.15}
          transparent
          opacity={dimmed ? 0.08 : (isActive ? 0.95 : 0.5)}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {(isActive || isConnected) && !dimmed && (
        <Billboard>
          <Text
            position={[0, r + 0.25, 0]}
            fontSize={0.22}
            color={isActive ? "#f1f5f9" : "#94a3b8"}
            anchorX="center"
            anchorY="bottom"
            font="/fonts/inter-v12-latin-500.woff"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            {node.label}
          </Text>
          {isActive && (
            <Text
              position={[0, r + 0.5, 0]}
              fontSize={0.15}
              color="#64748b"
              anchorX="center"
              anchorY="bottom"
            >
              {`${node.level}% · ${node.category}`}
            </Text>
          )}
        </Billboard>
      )}
    </group>
  );
}

function AgentNode({
  node,
  isActive,
  isConnected,
  dimmed,
  onClick,
  onHover,
}: {
  node: GraphNode;
  isActive: boolean;
  isConnected: boolean;
  dimmed: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const statusColor = statusColorsHex[node.agentStatus ?? "online"] ?? statusColorsHex.online;

  useFrame(() => {
    if (glowRef.current && isActive) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.1);
    }
  });

  return (
    <group position={node.position}>
      {isActive && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.08} />
        </mesh>
      )}
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerEnter={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={(e: ThreeEvent<PointerEvent>) => { onHover(false); document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial
          color="#1a1f2e"
          emissive={statusColor}
          emissiveIntensity={isActive ? 0.3 : 0.08}
          transparent
          opacity={dimmed ? 0.1 : 1}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 32]} />
        <meshBasicMaterial color={statusColor} transparent opacity={dimmed ? 0.05 : (isActive ? 0.8 : 0.3)} />
      </mesh>
      {!dimmed && (
        <Billboard>
          <Text
            position={[0, 0, 0]}
            fontSize={0.35}
            anchorX="center"
            anchorY="middle"
          >
            {node.agentEmoji}
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.2}
            color={isActive || isConnected ? "#f1f5f9" : "#94a3b8"}
            fontWeight={600}
            anchorX="center"
            anchorY="top"
            outlineWidth={0.02}
            outlineColor="#0f172a"
          >
            {node.label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function SceneContent({
  nodes,
  edges,
  nodeMap,
  hoveredNode,
  selectedNode,
  setHoveredNode,
  setSelectedNode,
  agents,
  onSelectAgent,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeMap: Map<string, GraphNode>;
  hoveredNode: string | null;
  selectedNode: string | null;
  setHoveredNode: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  agents: DbAgent[];
  onSelectAgent?: (agent: DbAgent) => void;
}) {
  const activeNode = hoveredNode ?? selectedNode;

  const connectedIds = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const set = new Set<string>([activeNode]);
    edges.forEach((e) => {
      if (e.from === activeNode) set.add(e.to);
      if (e.to === activeNode) set.add(e.from);
    });
    return set;
  }, [activeNode, edges]);

  const handleClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    const node = nodeMap.get(nodeId);
    if (node?.type === "agent" && node.agentId && onSelectAgent) {
      const agent = agents.find((a) => a.id === node.agentId);
      if (agent) onSelectAgent(agent);
    }
  }, [nodeMap, agents, onSelectAgent, selectedNode, setSelectedNode]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#3ecf8e" />
      <pointLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[0, 8, 0]} intensity={0.3} color="#a78bfa" />

      {/* Edges */}
      {edges.map((edge, i) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;
        const highlighted = !!(activeNode && connectedIds.has(edge.from) && connectedIds.has(edge.to));
        return (
          <EdgeLine
            key={i}
            from={fromNode.position}
            to={toNode.position}
            highlighted={highlighted}
            type={edge.type}
          />
        );
      })}

      {/* Skill nodes */}
      {nodes.filter((n) => n.type === "skill").map((node) => (
        <SkillNode
          key={node.id}
          node={node}
          isActive={activeNode === node.id}
          isConnected={connectedIds.has(node.id)}
          dimmed={!!activeNode && !connectedIds.has(node.id)}
          onClick={() => handleClick(node.id)}
          onHover={(h) => setHoveredNode(h ? node.id : null)}
        />
      ))}

      {/* Agent nodes */}
      {nodes.filter((n) => n.type === "agent").map((node) => (
        <AgentNode
          key={node.id}
          node={node}
          isActive={activeNode === node.id}
          isConnected={connectedIds.has(node.id)}
          dimmed={!!activeNode && !connectedIds.has(node.id)}
          onClick={() => handleClick(node.id)}
          onHover={(h) => setHoveredNode(h ? node.id : null)}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={5}
        maxDistance={20}
        enablePan={false}
      />
    </>
  );
}

// --- Main Component ---

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

  const categories = useMemo(() => {
    const cats = new Set<string>();
    nodes.forEach((n) => { if (n.category) cats.add(n.category); });
    return Array.from(cats).sort();
  }, [nodes]);

  return (
    <div className="flex gap-4 h-[600px]">
      {/* 3D Canvas */}
      <Card className="flex-1 border-border/50 bg-card surface-elevated overflow-hidden">
        <CardContent className="p-0 h-full">
          <Canvas
            camera={{ position: [0, 5, 14], fov: 50 }}
            style={{ background: "hsl(228, 20%, 4%)" }}
            onPointerMissed={() => setSelectedNode(null)}
          >
            <SceneContent
              nodes={nodes}
              edges={edges}
              nodeMap={nodeMap}
              hoveredNode={hoveredNode}
              selectedNode={selectedNode}
              setHoveredNode={setHoveredNode}
              setSelectedNode={setSelectedNode}
              agents={agents}
              onSelectAgent={onSelectAgent}
            />
          </Canvas>
        </CardContent>
      </Card>

      {/* Sidebar */}
      <Card className="w-[260px] border-border/50 bg-card surface-elevated shrink-0">
        <CardContent className="p-4 h-full flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3 tracking-tight">Legenda</h3>
          <div className="space-y-1.5 mb-4">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2 text-[12px]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColors[cat] ?? defaultColor }} />
                <span className="text-muted-foreground">{cat}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground space-y-1 mb-4 border-t border-border/30 pt-3">
            <p><span className="text-foreground font-medium">{nodes.filter(n => n.type === "agent").length}</span> agentes</p>
            <p><span className="text-foreground font-medium">{nodes.filter(n => n.type === "skill").length}</span> skills únicas</p>
            <p><span className="text-foreground font-medium">{edges.length}</span> conexões</p>
          </div>

          <div className="text-[10px] text-muted-foreground mb-4 border-t border-border/30 pt-3">
            <p>🖱️ Arrastar para rotacionar</p>
            <p>🔍 Scroll para zoom</p>
            <p>👆 Clique nos nós para detalhes</p>
          </div>

          {selectedNodeData && (
            <div className="border-t border-border/30 pt-3 flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                {selectedNodeData.type === "agent" ? `${selectedNodeData.agentEmoji} ${selectedNodeData.label}` : selectedNodeData.label}
              </h4>
              {selectedNodeData.type === "skill" && (
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    <div className="text-[11px]">
                      <span className="text-muted-foreground">Categoria: </span>
                      <Badge variant="outline" className="text-[10px] rounded-full px-1.5 py-0" style={{ borderColor: categoryColors[selectedNodeData.category ?? ""] ?? defaultColor, color: categoryColors[selectedNodeData.category ?? ""] ?? defaultColor }}>
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
                        <div className="w-2 h-2 rounded-full ml-auto" style={{ background: statusColorsHex[a.agentStatus ?? "online"] }} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {selectedNodeData.type === "agent" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full" style={{ background: statusColorsHex[selectedNodeData.agentStatus ?? "online"] }} />
                    <span className="text-foreground">{selectedNodeData.agentStatus}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2 text-[12px] rounded-xl"
                    onClick={() => {
                      if (onSelectAgent && selectedNodeData.agentId) {
                        const agent = agents.find((a) => a.id === selectedNodeData.agentId);
                        if (agent) onSelectAgent(agent);
                      }
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver Detalhes
                  </Button>
                </div>
              )}
            </div>
          )}

          {!selectedNodeData && (
            <div className="border-t border-border/30 pt-3 text-[11px] text-muted-foreground">
              <p>Selecione um nó para ver detalhes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsNetworkGraph;
