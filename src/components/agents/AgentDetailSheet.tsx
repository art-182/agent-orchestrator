import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agent, AgentSkill } from "@/lib/mock-data";
import { statusBgMap } from "@/lib/mock-data";

interface AgentDetailSheetProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taskStatusIcon: Record<string, string> = {
  done: "✅",
  running: "🔄",
  error: "❌",
};

const categoryColor: Record<string, string> = {
  Core: "text-terminal",
  Security: "text-rose",
  Language: "text-cyan",
  Frontend: "text-cyan",
  Backend: "text-violet",
  Quality: "text-amber",
  Analysis: "text-amber",
  DevOps: "text-terminal",
  Infra: "text-violet",
  Ops: "text-amber",
  Compliance: "text-muted-foreground",
  Output: "text-muted-foreground",
  Standards: "text-cyan",
  Data: "text-violet",
};

// ── Skills Graph (force-directed-like static layout) ───

interface SkillNodePos {
  skill: AgentSkill;
  x: number;
  y: number;
}

const SkillsGraph = ({ skills }: { skills: AgentSkill[] }) => {
  const nodes = useMemo<SkillNodePos[]>(() => {
    const cx = 160;
    const cy = 140;
    const radius = 100;
    return skills.map((skill, i) => {
      const angle = (2 * Math.PI * i) / skills.length - Math.PI / 2;
      return {
        skill,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [skills]);

  const nameToPos = useMemo(() => {
    const map = new Map<string, SkillNodePos>();
    nodes.forEach((n) => map.set(n.skill.name, n));
    return map;
  }, [nodes]);

  return (
    <div className="relative w-full">
      <svg width="320" height="280" className="mx-auto" viewBox="0 0 320 280">
        {/* Connections */}
        {nodes.map((node) =>
          node.skill.connections.map((connName) => {
            const target = nameToPos.get(connName);
            if (!target) return null;
            // Avoid drawing duplicate lines
            if (connName < node.skill.name) return null;
            return (
              <line
                key={`${node.skill.name}-${connName}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="hsl(230, 15%, 20%)"
                strokeWidth={1}
                opacity={0.6}
              />
            );
          })
        )}

        {/* Nodes */}
        {nodes.map((node) => {
          const levelRadius = 6 + (node.skill.level / 100) * 14;
          const color = categoryColor[node.skill.category] ?? "text-muted-foreground";
          // Map to HSL
          const hslMap: Record<string, string> = {
            "text-terminal": "hsl(160, 51%, 49%)",
            "text-cyan": "hsl(187, 80%, 53%)",
            "text-violet": "hsl(260, 67%, 70%)",
            "text-amber": "hsl(45, 93%, 56%)",
            "text-rose": "hsl(350, 80%, 55%)",
            "text-muted-foreground": "hsl(220, 10%, 50%)",
          };
          const fill = hslMap[color] ?? "hsl(220, 10%, 50%)";

          return (
            <g key={node.skill.name}>
              <circle
                cx={node.x}
                cy={node.y}
                r={levelRadius}
                fill={fill}
                opacity={0.2}
                stroke={fill}
                strokeWidth={1.5}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={3}
                fill={fill}
              />
              <text
                x={node.x}
                y={node.y + levelRadius + 12}
                textAnchor="middle"
                fill="hsl(220, 20%, 85%)"
                fontSize={9}
                fontFamily="JetBrains Mono"
              >
                {node.skill.name}
              </text>
              <text
                x={node.x}
                y={node.y + levelRadius + 22}
                textAnchor="middle"
                fill="hsl(220, 10%, 50%)"
                fontSize={8}
                fontFamily="JetBrains Mono"
              >
                {node.skill.level}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Soul.md Renderer ───────────────────────────────────

const SoulMdViewer = ({ content }: { content: string }) => {
  const lines = content.split("\\n");

  return (
    <div className="space-y-1 font-mono text-xs">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith("# "))
          return <h3 key={i} className="text-sm font-bold text-terminal mt-2">{trimmed.slice(2)}</h3>;
        if (trimmed.startsWith("## "))
          return <h4 key={i} className="text-xs font-semibold text-foreground mt-3 mb-1">{trimmed.slice(3)}</h4>;
        if (trimmed.startsWith("- **"))  {
          const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
          if (match) return (
            <p key={i} className="text-muted-foreground pl-2">
              <span className="text-foreground font-semibold">• {match[1]}</span>
              {match[2] && <span>: {match[2]}</span>}
            </p>
          );
        }
        if (trimmed.startsWith("- "))
          return <p key={i} className="text-muted-foreground pl-2">• {trimmed.slice(2)}</p>;
        return <p key={i} className="text-muted-foreground">{trimmed}</p>;
      })}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────

const AgentDetailSheet = ({ agent, open, onOpenChange }: AgentDetailSheetProps) => {
  if (!agent) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-border bg-card overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-mono">
            <span className="text-xl">{agent.emoji}</span>
            {agent.name}
            <Badge
              variant="outline"
              className={`rounded px-1.5 py-0 text-[10px] border font-mono ml-auto ${statusBgMap[agent.status]}`}
            >
              {agent.status}
            </Badge>
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {agent.model} · {agent.provider} · Uptime: {agent.uptime}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="skills">
            <TabsList className="font-mono w-full">
              <TabsTrigger value="skills" className="font-mono text-[10px] flex-1">Skills</TabsTrigger>
              <TabsTrigger value="soul" className="font-mono text-[10px] flex-1">Soul.md</TabsTrigger>
              <TabsTrigger value="metrics" className="font-mono text-[10px] flex-1">Métricas</TabsTrigger>
              <TabsTrigger value="history" className="font-mono text-[10px] flex-1">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="mt-4">
              <SkillsGraph skills={agent.skills} />
              <Separator className="bg-border my-4" />
              <div className="space-y-2">
                {agent.skills
                  .sort((a, b) => b.level - a.level)
                  .map((skill) => (
                    <div key={skill.name} className="flex items-center gap-2 font-mono text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${categoryColor[skill.category] ? categoryColor[skill.category].replace("text-", "bg-") : "bg-muted-foreground"}`} />
                      <span className="text-foreground flex-1">{skill.name}</span>
                      <span className="text-muted-foreground text-[10px]">{skill.category}</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-terminal"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{skill.level}%</span>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="soul" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <SoulMdViewer content={agent.soulMd} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tarefas", value: agent.metrics.tasksCompleted.toString() },
                  { label: "Tempo Médio", value: agent.metrics.avgTime },
                  { label: "Taxa Erro", value: `${agent.metrics.errorRate}%` },
                  { label: "Custo Total", value: `$${agent.metrics.totalCost.toFixed(2)}` },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-mono text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-bold font-mono text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
              <Separator className="bg-border my-4" />
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-1">Tarefa Atual</p>
                <p className="text-sm font-mono text-foreground">{agent.currentTask}</p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-1.5">
                  {agent.recentTasks.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded px-2 py-1 font-mono text-xs hover:bg-muted/50"
                    >
                      <span>{taskStatusIcon[t.status]}</span>
                      <span className="flex-1 truncate text-foreground">{t.name}</span>
                      <span className="text-muted-foreground">{t.duration}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailSheet;
