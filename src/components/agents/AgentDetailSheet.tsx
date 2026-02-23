import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tables, Json } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type AgentStatus = "online" | "busy" | "idle" | "error";

interface AgentSkill { name: string; level: number; category: string; connections: string[]; }
interface AgentROI { hoursPerWeekSaved: number; costPerHourHuman: number; weeklySavings: number; monthlySavings: number; roiMultiplier: number; tasksAutomated: number; automationRate: number; avgTaskTimeHuman: string; avgTaskTimeAgent: string; speedup: string; qualityScore: number; incidentsPrevented: number; revenueImpact: string; }

const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/15 text-terminal border-terminal/30",
  busy: "bg-amber/15 text-amber border-amber/30",
  idle: "bg-muted text-muted-foreground border-border",
  error: "bg-rose/15 text-rose border-rose/30",
};

const categoryColor: Record<string, string> = {
  Core: "text-terminal", Security: "text-rose", Language: "text-cyan", Frontend: "text-cyan",
  Backend: "text-violet", Quality: "text-amber", Analysis: "text-amber", DevOps: "text-terminal",
  Infra: "text-violet", Ops: "text-amber", Compliance: "text-muted-foreground", Output: "text-muted-foreground",
  Standards: "text-cyan", Data: "text-violet",
};

interface SkillNodePos { skill: AgentSkill; x: number; y: number; }

const SkillsGraph = ({ skills }: { skills: AgentSkill[] }) => {
  const nodes = useMemo<SkillNodePos[]>(() => {
    const cx = 160, cy = 140, radius = 100;
    return skills.map((skill, i) => ({ skill, x: cx + radius * Math.cos((2 * Math.PI * i) / skills.length - Math.PI / 2), y: cy + radius * Math.sin((2 * Math.PI * i) / skills.length - Math.PI / 2) }));
  }, [skills]);
  const nameToPos = useMemo(() => { const m = new Map<string, SkillNodePos>(); nodes.forEach((n) => m.set(n.skill.name, n)); return m; }, [nodes]);
  const hslMap: Record<string, string> = { "text-terminal": "hsl(160, 51%, 49%)", "text-cyan": "hsl(187, 80%, 53%)", "text-violet": "hsl(260, 67%, 70%)", "text-amber": "hsl(45, 93%, 56%)", "text-rose": "hsl(350, 80%, 55%)", "text-muted-foreground": "hsl(220, 10%, 50%)" };
  return (
    <div className="relative w-full">
      <svg width="320" height="280" className="mx-auto" viewBox="0 0 320 280">
        {nodes.map((node) => node.skill.connections.map((cn) => { const t = nameToPos.get(cn); if (!t || cn < node.skill.name) return null; return <line key={`${node.skill.name}-${cn}`} x1={node.x} y1={node.y} x2={t.x} y2={t.y} stroke="hsl(230, 15%, 20%)" strokeWidth={1} opacity={0.6} />; }))}
        {nodes.map((node) => { const lr = 6 + (node.skill.level / 100) * 14; const color = categoryColor[node.skill.category] ?? "text-muted-foreground"; const fill = hslMap[color] ?? "hsl(220, 10%, 50%)"; return (<g key={node.skill.name}><circle cx={node.x} cy={node.y} r={lr} fill={fill} opacity={0.2} stroke={fill} strokeWidth={1.5} /><circle cx={node.x} cy={node.y} r={3} fill={fill} /><text x={node.x} y={node.y + lr + 12} textAnchor="middle" fill="hsl(220, 20%, 85%)" fontSize={9} fontFamily="JetBrains Mono">{node.skill.name}</text><text x={node.x} y={node.y + lr + 22} textAnchor="middle" fill="hsl(220, 10%, 50%)" fontSize={8} fontFamily="JetBrains Mono">{node.skill.level}%</text></g>); })}
      </svg>
    </div>
  );
};

const SoulMdViewer = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 font-mono text-xs">
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith("# ")) return <h3 key={i} className="text-sm font-bold text-terminal mt-2">{t.slice(2)}</h3>;
        if (t.startsWith("## ")) return <h4 key={i} className="text-xs font-semibold text-foreground mt-3 mb-1">{t.slice(3)}</h4>;
        if (t.startsWith("- **")) { const m = t.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/); if (m) return <p key={i} className="text-muted-foreground pl-2"><span className="text-foreground font-semibold">• {m[1]}</span>{m[2] && <span>: {m[2]}</span>}</p>; }
        if (t.startsWith("- ")) return <p key={i} className="text-muted-foreground pl-2">• {t.slice(2)}</p>;
        return <p key={i} className="text-muted-foreground">{t}</p>;
      })}
    </div>
  );
};

const AgentROIView = ({ roi, agent }: { roi: AgentROI; agent: DbAgent }) => (
  <ScrollArea className="h-[450px] pr-2">
    <div className="space-y-4">
      <div className="rounded-lg border border-terminal/30 bg-terminal/5 p-4 text-center">
        <p className="font-mono text-[10px] text-muted-foreground">ROI deste agente</p>
        <p className="font-mono text-3xl font-bold text-terminal">{roi.roiMultiplier}x</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Economia Mensal", value: `$${roi.monthlySavings.toLocaleString()}`, sub: `$${roi.weeklySavings.toLocaleString()}/sem`, color: "text-terminal" },
          { label: "Horas Poupadas/Sem", value: `${roi.hoursPerWeekSaved}h`, sub: `@$${roi.costPerHourHuman}/h humano`, color: "text-cyan" },
          { label: "Speedup vs Humano", value: roi.speedup, sub: `${roi.avgTaskTimeHuman} → ${roi.avgTaskTimeAgent}`, color: "text-amber" },
          { label: "Impacto em Receita", value: roi.revenueImpact, sub: "", color: "text-violet" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[10px] font-mono text-muted-foreground">{m.label}</p>
            <p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p>
            {m.sub && <p className="text-[9px] font-mono text-muted-foreground">{m.sub}</p>}
          </div>
        ))}
      </div>
      <Separator className="bg-border" />
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">Taxa de Automação</span>
            <span className="text-foreground font-semibold">{roi.automationRate}%</span>
          </div>
          <Progress value={roi.automationRate} className="h-2" />
          <p className="text-[9px] font-mono text-muted-foreground">{roi.tasksAutomated.toLocaleString()} tarefas automatizadas</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">Quality Score</span>
            <span className={`font-semibold ${roi.qualityScore >= 95 ? "text-terminal" : roi.qualityScore >= 90 ? "text-amber" : "text-rose"}`}>{roi.qualityScore}%</span>
          </div>
          <Progress value={roi.qualityScore} className="h-2" />
        </div>
      </div>
      <Separator className="bg-border" />
      <div className="space-y-2">
        <p className="font-mono text-xs font-semibold text-foreground">Métricas para Investidores</p>
        {[
          { label: "Custo Operacional (agente)", value: `$${(agent.total_cost ?? 0).toFixed(2)}/mês` },
          { label: "Custo Equivalente (humano)", value: `$${(roi.hoursPerWeekSaved * roi.costPerHourHuman * 4.33).toFixed(0)}/mês` },
          { label: "Economia Anual Projetada", value: `$${(roi.monthlySavings * 12).toLocaleString()}` },
          { label: "Incidentes Prevenidos", value: `${roi.incidentsPrevented} este mês` },
          { label: "Payback Period", value: roi.roiMultiplier > 20 ? "< 2 dias" : roi.roiMultiplier > 10 ? "< 1 semana" : "< 2 semanas" },
          { label: "Custo por Tarefa", value: `$${((agent.total_cost ?? 0) / Math.max(roi.tasksAutomated, 1)).toFixed(3)}` },
        ].map((m) => (
          <div key={m.label} className="flex items-center justify-between font-mono text-xs py-1 border-b border-border/50 last:border-0">
            <span className="text-muted-foreground">{m.label}</span>
            <span className="text-foreground font-semibold">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  </ScrollArea>
);

interface AgentDetailSheetProps {
  agent: DbAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgentDetailSheet = ({ agent, open, onOpenChange }: AgentDetailSheetProps) => {
  if (!agent) return null;

  const skills = (agent.skills as unknown as AgentSkill[]) ?? [];
  const roi = agent.roi as unknown as AgentROI | null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-border bg-card overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-mono">
            <span className="text-xl">{agent.emoji}</span>
            {agent.name}
            <Badge variant="outline" className={`rounded px-1.5 py-0 text-[10px] border font-mono ml-auto ${statusBgMap[(agent.status as AgentStatus) ?? "online"]}`}>
              {agent.status}
            </Badge>
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {agent.model} · {agent.provider} · Uptime: {agent.uptime ?? "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="roi">
            <TabsList className="font-mono w-full">
              <TabsTrigger value="roi" className="font-mono text-[10px] flex-1">ROI</TabsTrigger>
              <TabsTrigger value="skills" className="font-mono text-[10px] flex-1">Skills</TabsTrigger>
              <TabsTrigger value="soul" className="font-mono text-[10px] flex-1">Soul.md</TabsTrigger>
              <TabsTrigger value="metrics" className="font-mono text-[10px] flex-1">Métricas</TabsTrigger>
            </TabsList>

            <TabsContent value="roi" className="mt-4">
              {roi ? <AgentROIView roi={roi} agent={agent} /> : <p className="font-mono text-xs text-muted-foreground">Sem dados de ROI</p>}
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              {skills.length > 0 ? (
                <>
                  <SkillsGraph skills={skills} />
                  <Separator className="bg-border my-4" />
                  <div className="space-y-2">
                    {skills.sort((a, b) => b.level - a.level).map((skill) => (
                      <div key={skill.name} className="flex items-center gap-2 font-mono text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${(categoryColor[skill.category] ?? "text-muted-foreground").replace("text-", "bg-")}`} />
                        <span className="text-foreground flex-1">{skill.name}</span>
                        <span className="text-muted-foreground text-[10px]">{skill.category}</span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-terminal" style={{ width: `${skill.level}%` }} />
                        </div>
                        <span className="text-muted-foreground w-8 text-right">{skill.level}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="font-mono text-xs text-muted-foreground">Sem skills</p>}
            </TabsContent>

            <TabsContent value="soul" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <SoulMdViewer content={agent.soul_md ?? ""} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tarefas", value: (agent.tasks_completed ?? 0).toString() },
                  { label: "Tempo Médio", value: agent.avg_time ?? "—" },
                  { label: "Taxa Erro", value: `${agent.error_rate ?? 0}%` },
                  { label: "Custo Total", value: `$${(agent.total_cost ?? 0).toFixed(2)}` },
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
                <p className="text-sm font-mono text-foreground">{agent.current_task ?? "Nenhuma"}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgentDetailSheet;
