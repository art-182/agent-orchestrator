// ── Types ──────────────────────────────────────────────

export type AgentStatus = "online" | "busy" | "idle" | "error";
export type ProviderHealthStatus = "healthy" | "degraded" | "down";

export interface AgentSkill {
  name: string;
  level: number; // 0-100
  category: string;
  connections: string[]; // names of connected skills
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  currentTask: string;
  model: string;
  provider: string;
  parentId: string | null;
  uptime: string;
  metrics: {
    tasksCompleted: number;
    avgTime: string;
    errorRate: number;
    totalCost: number;
  };
  recentTasks: { name: string; status: "done" | "running" | "error"; duration: string }[];
  skills: AgentSkill[];
  soulMd: string;
}

export interface FeedEvent {
  timestamp: string;
  agent: string;
  agentColor: string;
  action: string;
  result: string;
  cost: string;
}

export interface ProviderInfo {
  name: string;
  status: ProviderHealthStatus;
  latency: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  icon: string;
  sparkline: number[];
}

// ── Status Color Map ───────────────────────────────────

export const statusColorMap: Record<AgentStatus, string> = {
  online: "text-terminal",
  busy: "text-amber",
  idle: "text-muted-foreground",
  error: "text-rose",
};

export const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/15 text-terminal border-terminal/30",
  busy: "bg-amber/15 text-amber border-amber/30",
  idle: "bg-muted text-muted-foreground border-border",
  error: "bg-rose/15 text-rose border-rose/30",
};

export const providerStatusColor: Record<ProviderHealthStatus, string> = {
  healthy: "bg-terminal",
  degraded: "bg-amber",
  down: "bg-rose",
};

// ── Mock Agents ────────────────────────────────────────

export const mockAgents: Agent[] = [
  {
    id: "oracli-main",
    name: "OraCLI Main",
    emoji: "🧠",
    status: "online",
    currentTask: "Coordenando pipeline de deploy",
    model: "gpt-4o",
    provider: "OpenAI",
    parentId: null,
    uptime: "14d 7h 32m",
    metrics: { tasksCompleted: 1247, avgTime: "4.2s", errorRate: 0.8, totalCost: 127.45 },
    recentTasks: [
      { name: "Deploy v2.3.1 para staging", status: "done", duration: "3.1s" },
      { name: "Review PR #482", status: "running", duration: "1.8s" },
      { name: "Sync config com prod", status: "done", duration: "2.4s" },
      { name: "Atualizar dependências", status: "done", duration: "5.7s" },
    ],
  },
  {
    id: "scout",
    name: "Scout",
    emoji: "🔍",
    status: "busy",
    currentTask: "Analisando repo para vulnerabilidades",
    model: "claude-3.5-sonnet",
    provider: "Anthropic",
    parentId: "oracli-main",
    uptime: "14d 7h 30m",
    metrics: { tasksCompleted: 892, avgTime: "6.1s", errorRate: 1.2, totalCost: 89.30 },
    recentTasks: [
      { name: "Scan dependências npm", status: "running", duration: "8.2s" },
      { name: "Audit logs de acesso", status: "done", duration: "3.5s" },
      { name: "Verificar endpoints expostos", status: "done", duration: "4.1s" },
    ],
  },
  {
    id: "coder",
    name: "Coder",
    emoji: "💻",
    status: "online",
    currentTask: "Implementando feature de auth",
    model: "gpt-4o",
    provider: "OpenAI",
    parentId: "oracli-main",
    uptime: "14d 7h 28m",
    metrics: { tasksCompleted: 2103, avgTime: "8.3s", errorRate: 2.1, totalCost: 234.12 },
    recentTasks: [
      { name: "Criar middleware JWT", status: "done", duration: "12.3s" },
      { name: "Refatorar UserService", status: "done", duration: "7.8s" },
      { name: "Adicionar testes e2e", status: "error", duration: "15.2s" },
    ],
  },
  {
    id: "reviewer",
    name: "Reviewer",
    emoji: "📝",
    status: "idle",
    currentTask: "Aguardando PRs para review",
    model: "claude-3.5-sonnet",
    provider: "Anthropic",
    parentId: "oracli-main",
    uptime: "14d 7h 25m",
    metrics: { tasksCompleted: 567, avgTime: "12.5s", errorRate: 0.3, totalCost: 45.67 },
    recentTasks: [
      { name: "Review PR #481", status: "done", duration: "11.2s" },
      { name: "Review PR #479", status: "done", duration: "9.8s" },
    ],
  },
  {
    id: "deployer",
    name: "Deployer",
    emoji: "🚀",
    status: "online",
    currentTask: "Monitorando deploy em staging",
    model: "gemini-1.5-pro",
    provider: "Google",
    parentId: "oracli-main",
    uptime: "14d 7h 20m",
    metrics: { tasksCompleted: 312, avgTime: "25.1s", errorRate: 1.5, totalCost: 18.90 },
    recentTasks: [
      { name: "Deploy staging v2.3.1", status: "running", duration: "32.1s" },
      { name: "Rollback prod v2.3.0", status: "done", duration: "8.4s" },
    ],
  },
  {
    id: "analyst",
    name: "Analyst",
    emoji: "📊",
    status: "error",
    currentTask: "Erro: timeout na API de métricas",
    model: "gpt-4o-mini",
    provider: "OpenAI",
    parentId: "oracli-main",
    uptime: "14d 5h 12m",
    metrics: { tasksCompleted: 445, avgTime: "3.8s", errorRate: 4.7, totalCost: 12.34 },
    recentTasks: [
      { name: "Gerar relatório semanal", status: "error", duration: "—" },
      { name: "Coletar métricas de custo", status: "done", duration: "2.1s" },
      { name: "Atualizar dashboard KPIs", status: "done", duration: "1.9s" },
    ],
  },
];

// ── Mock Feed Events ───────────────────────────────────

export const mockFeedEvents: FeedEvent[] = [
  { timestamp: "14:32:01", agent: "Coder", agentColor: "bg-terminal/15 text-terminal", action: "commit pushed", result: "feat: add JWT middleware", cost: "$0.03" },
  { timestamp: "14:31:45", agent: "Scout", agentColor: "bg-amber/15 text-amber", action: "scan completed", result: "2 vulnerabilities found", cost: "$0.01" },
  { timestamp: "14:31:22", agent: "Deployer", agentColor: "bg-terminal/15 text-terminal", action: "deploy started", result: "staging v2.3.1", cost: "$0.00" },
  { timestamp: "14:30:58", agent: "OraCLI", agentColor: "bg-violet/15 text-violet", action: "task delegated", result: "Scout → security audit", cost: "$0.02" },
  { timestamp: "14:30:33", agent: "Reviewer", agentColor: "bg-cyan/15 text-cyan", action: "PR approved", result: "PR #481 merged", cost: "$0.04" },
  { timestamp: "14:30:01", agent: "Analyst", agentColor: "bg-rose/15 text-rose", action: "error", result: "API timeout after 30s", cost: "$0.00" },
  { timestamp: "14:29:45", agent: "Coder", agentColor: "bg-terminal/15 text-terminal", action: "file created", result: "src/auth/jwt.ts", cost: "$0.02" },
  { timestamp: "14:29:12", agent: "Scout", agentColor: "bg-amber/15 text-amber", action: "scan started", result: "npm audit running", cost: "$0.01" },
  { timestamp: "14:28:55", agent: "OraCLI", agentColor: "bg-violet/15 text-violet", action: "mission updated", result: "Auth Feature → 67%", cost: "$0.01" },
  { timestamp: "14:28:30", agent: "Deployer", agentColor: "bg-terminal/15 text-terminal", action: "health check", result: "all services green", cost: "$0.00" },
  { timestamp: "14:28:01", agent: "Coder", agentColor: "bg-terminal/15 text-terminal", action: "tests passed", result: "42/42 specs green", cost: "$0.05" },
  { timestamp: "14:27:33", agent: "Reviewer", agentColor: "bg-cyan/15 text-cyan", action: "review started", result: "PR #482 — 12 files", cost: "$0.03" },
  { timestamp: "14:27:10", agent: "Analyst", agentColor: "bg-rose/15 text-rose", action: "retry", result: "reconnecting to metrics API", cost: "$0.00" },
  { timestamp: "14:26:45", agent: "Scout", agentColor: "bg-amber/15 text-amber", action: "report generated", result: "security_report_v23.md", cost: "$0.02" },
  { timestamp: "14:26:20", agent: "OraCLI", agentColor: "bg-violet/15 text-violet", action: "agent spawned", result: "Deployer activated", cost: "$0.01" },
  { timestamp: "14:25:58", agent: "Coder", agentColor: "bg-terminal/15 text-terminal", action: "refactor done", result: "UserService → 3 files", cost: "$0.04" },
  { timestamp: "14:25:30", agent: "Deployer", agentColor: "bg-terminal/15 text-terminal", action: "rollback completed", result: "prod → v2.3.0 stable", cost: "$0.00" },
  { timestamp: "14:25:01", agent: "Reviewer", agentColor: "bg-cyan/15 text-cyan", action: "comment added", result: "PR #479: fix naming", cost: "$0.01" },
  { timestamp: "14:24:40", agent: "Analyst", agentColor: "bg-rose/15 text-rose", action: "metrics collected", result: "cost data updated", cost: "$0.01" },
  { timestamp: "14:24:15", agent: "OraCLI", agentColor: "bg-violet/15 text-violet", action: "plan created", result: "Deploy Pipeline v2.3.1", cost: "$0.03" },
];

// ── Mock Dashboard Metrics ─────────────────────────────

export const mockDashboardMetrics: DashboardMetric[] = [
  {
    label: "Tarefas Hoje",
    value: "127",
    icon: "ListChecks",
    sparkline: [8, 12, 15, 11, 18, 22, 19, 25, 21, 27, 24, 30],
  },
  {
    label: "Tokens Consumidos",
    value: "1.2M",
    icon: "Zap",
    sparkline: [45, 52, 49, 60, 55, 68, 72, 65, 78, 82, 75, 88],
  },
  {
    label: "Custo Acumulado",
    value: "$47.82",
    icon: "DollarSign",
    sparkline: [2, 5, 8, 12, 15, 19, 22, 27, 31, 36, 41, 47],
  },
  {
    label: "Tempo Economizado",
    value: "34.5h",
    icon: "Clock",
    sparkline: [1, 3, 5, 8, 11, 14, 18, 21, 25, 28, 31, 34],
  },
];

// ── Mock Providers ─────────────────────────────────────

export const mockProviders: ProviderInfo[] = [
  { name: "OpenAI", status: "healthy", latency: 142 },
  { name: "Anthropic", status: "healthy", latency: 198 },
  { name: "Google", status: "degraded", latency: 523 },
  { name: "Vercel", status: "healthy", latency: 89 },
];

// ── Status Badges ──────────────────────────────────────

export const mockStatusBadges = [
  { label: "Agentes Online", value: "5/6", icon: "Bot" },
  { label: "Taxa de Sucesso", value: "97.2%", icon: "TrendingUp" },
  { label: "Custo/Hora", value: "$3.41", icon: "DollarSign" },
  { label: "Uptime", value: "99.8%", icon: "Activity" },
];
