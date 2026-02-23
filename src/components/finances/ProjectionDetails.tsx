import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Shield, Zap, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── Scenario Data ──────────────────────────────────────

interface Scenario {
  label: string;
  description: string;
  monthlyCost: number;
  annualCost: number;
  savings: number;
  risk: "low" | "medium" | "high";
}

const scenarios: Scenario[] = [
  { label: "Conservador", description: "Manter uso atual, sem novos agentes", monthlyCost: 527, annualCost: 6324, savings: 0, risk: "low" },
  { label: "Crescimento Moderado", description: "+2 agentes, +30% volume de tarefas", monthlyCost: 745, annualCost: 8940, savings: -2616, risk: "medium" },
  { label: "Otimizado", description: "Migrar 40% para modelos menores + cache", monthlyCost: 385, annualCost: 4620, savings: 1704, risk: "low" },
  { label: "Escala Total", description: "+5 agentes, pipeline completo 24/7", monthlyCost: 1280, annualCost: 15360, savings: -9036, risk: "high" },
];

const riskColor = { low: "text-terminal", medium: "text-amber", high: "text-rose" };
const riskBg = { low: "bg-terminal/10", medium: "bg-amber/10", high: "bg-rose/10" };

// ── ROI Metrics ────────────────────────────────────────

const roiMetrics = [
  { label: "Horas Dev Economizadas", value: "342h", subtext: "~$17,100 em salário", icon: Clock, color: "text-terminal" },
  { label: "ROI Atual", value: "32.4x", subtext: "retorno sobre investimento", icon: TrendingUp, color: "text-terminal" },
  { label: "Custo por Tarefa", value: "$0.08", subtext: "média dos últimos 30d", icon: Zap, color: "text-cyan" },
  { label: "Break-even", value: "Dia 3", subtext: "do ciclo mensal", icon: Target, color: "text-violet" },
];

// ── Budget Alerts ──────────────────────────────────────

const budgetAlerts = [
  { label: "Orçamento Mensal", budget: 600, spent: 527.78, status: "ok" as const },
  { label: "Limite OpenAI", budget: 400, spent: 361.57, status: "warning" as const },
  { label: "Limite Anthropic", budget: 200, spent: 134.97, status: "ok" as const },
  { label: "Limite Google", budget: 50, spent: 31.24, status: "ok" as const },
];

const alertStatusIcon = {
  ok: <CheckCircle className="h-3.5 w-3.5 text-terminal" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber" />,
  critical: <Shield className="h-3.5 w-3.5 text-rose" />,
};

// ── Efficiency by Day of Week ──────────────────────────

const efficiencyByDay = [
  { day: "Seg", costPerTask: 0.11, tasks: 28 },
  { day: "Ter", costPerTask: 0.09, tasks: 34 },
  { day: "Qua", costPerTask: 0.08, tasks: 31 },
  { day: "Qui", costPerTask: 0.10, tasks: 29 },
  { day: "Sex", costPerTask: 0.07, tasks: 35 },
  { day: "Sáb", costPerTask: 0.12, tasks: 15 },
  { day: "Dom", costPerTask: 0.14, tasks: 8 },
];

// ── Component ──────────────────────────────────────────

const ProjectionDetails = () => (
  <div className="space-y-6">
    {/* ROI Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {roiMetrics.map((m) => (
        <Card key={m.label} className="border-border/50 bg-card surface-elevated">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
                <p className={`text-2xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.subtext}</p>
              </div>
              <m.icon className={`h-4 w-4 ${m.color} opacity-60`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Budget Alerts */}
    <Card className="border-border/50 bg-card surface-elevated">
      <CardContent className="p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground tracking-tight">Alertas de Orçamento</p>
        {budgetAlerts.map((a) => {
          const pct = (a.spent / a.budget) * 100;
          return (
            <div key={a.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alertStatusIcon[a.status]}
                  <span className="text-[12px] text-foreground font-medium">{a.label}</span>
                </div>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  ${a.spent.toFixed(2)} / ${a.budget}
                  <span className={`ml-2 ${pct > 85 ? "text-amber" : "text-muted-foreground"}`}>
                    ({pct.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scenarios */}
      <Card className="border-border/50 bg-card surface-elevated">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground tracking-tight">Cenários de Custo</p>
          {scenarios.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/40 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-foreground">{s.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${riskBg[s.risk]} ${riskColor[s.risk]}`}>
                  risco {s.risk}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{s.description}</p>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="text-foreground tabular-nums">${s.monthlyCost}/mês</span>
                <span className="text-muted-foreground tabular-nums">${s.annualCost.toLocaleString()}/ano</span>
                {s.savings !== 0 && (
                  <span className={`flex items-center gap-0.5 ${s.savings > 0 ? "text-terminal" : "text-rose"}`}>
                    {s.savings > 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {s.savings > 0 ? "Economia" : "Aumento"} ${Math.abs(s.savings).toLocaleString()}/ano
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Efficiency by Day */}
      <Card className="border-border/50 bg-card surface-elevated">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground mb-3 tracking-tight">Eficiência por Dia da Semana</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 11,
                  }}
                  formatter={(value: number, name: string) => [
                    name === "costPerTask" ? `$${value.toFixed(2)}` : value,
                    name === "costPerTask" ? "$/Tarefa" : "Tarefas",
                  ]}
                />
                <Bar dataKey="costPerTask" name="costPerTask" radius={[4, 4, 0, 0]}>
                  {efficiencyByDay.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.costPerTask <= 0.09 ? "hsl(160, 51%, 49%)" : entry.costPerTask <= 0.11 ? "hsl(45, 93%, 56%)" : "hsl(350, 80%, 55%)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center font-medium">
            Custo por tarefa — verde ≤ $0.09 · amarelo ≤ $0.11 · vermelho {">"} $0.11
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ProjectionDetails;
