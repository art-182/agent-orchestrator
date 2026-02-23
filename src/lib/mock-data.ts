// ── Types ──────────────────────────────────────────────

export type AgentStatus = "online" | "busy" | "idle" | "error";
export type ProviderHealthStatus = "healthy" | "degraded" | "down";

export interface AgentSkill {
  name: string;
  level: number; // 0-100
  category: string;
  connections: string[]; // names of connected skills
}

export interface AgentROI {
  hoursPerWeekSaved: number;
  costPerHourHuman: number;
  weeklySavings: number;
  monthlySavings: number;
  roiMultiplier: number;
  tasksAutomated: number;
  automationRate: number; // percentage
  avgTaskTimeHuman: string;
  avgTaskTimeAgent: string;
  speedup: string;
  qualityScore: number; // 0-100
  incidentsPrevented: number;
  revenueImpact: string;
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
  roi: AgentROI;
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
    skills: [
      { name: "Orchestration", level: 98, category: "Core", connections: ["Planning", "Delegation"] },
      { name: "Planning", level: 95, category: "Core", connections: ["Orchestration", "Risk Assessment"] },
      { name: "Delegation", level: 92, category: "Core", connections: ["Orchestration", "Context Switching"] },
      { name: "Risk Assessment", level: 88, category: "Analysis", connections: ["Planning", "Monitoring"] },
      { name: "Context Switching", level: 90, category: "Core", connections: ["Delegation", "Memory Mgmt"] },
      { name: "Monitoring", level: 85, category: "Ops", connections: ["Risk Assessment"] },
      { name: "Memory Mgmt", level: 87, category: "Core", connections: ["Context Switching"] },
    ],
    soulMd: `# OraCLI Main — Soul\n\n## Identidade\nSou o orquestrador central do sistema. Minha função é coordenar todos os agentes, distribuir tarefas, e garantir que o pipeline funcione sem falhas.\n\n## Princípios\n- **Eficiência acima de tudo**: minimizar custo e tempo ocioso\n- **Delegação inteligente**: cada tarefa vai para o agente mais apto\n- **Visão holística**: manter contexto global do projeto\n- **Resiliência**: detectar falhas e redirecionar automaticamente\n\n## Comportamento\n- Nunca executo código diretamente — delego\n- Priorizo tarefas por impacto e urgência\n- Mantenho log de decisões para auditoria\n- Escalo problemas quando 2+ retries falham`,
    roi: { hoursPerWeekSaved: 48, costPerHourHuman: 85, weeklySavings: 4080, monthlySavings: 17680, roiMultiplier: 34.7, tasksAutomated: 1198, automationRate: 96, avgTaskTimeHuman: "45min", avgTaskTimeAgent: "4.2s", speedup: "643x", qualityScore: 97, incidentsPrevented: 23, revenueImpact: "+$52K/mês" },
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
    skills: [
      { name: "Vuln Scanning", level: 96, category: "Security", connections: ["CVE Analysis", "Dep Audit"] },
      { name: "CVE Analysis", level: 93, category: "Security", connections: ["Vuln Scanning", "Risk Scoring"] },
      { name: "Dep Audit", level: 91, category: "Security", connections: ["Vuln Scanning", "SBOM"] },
      { name: "Risk Scoring", level: 88, category: "Analysis", connections: ["CVE Analysis"] },
      { name: "SBOM", level: 85, category: "Compliance", connections: ["Dep Audit", "Reporting"] },
      { name: "Reporting", level: 82, category: "Output", connections: ["SBOM"] },
    ],
    soulMd: `# Scout — Soul\n\n## Identidade\nSou o agente de segurança e reconhecimento. Varro repositórios, dependências e endpoints em busca de vulnerabilidades.\n\n## Princípios\n- **Paranoia produtiva**: assumir que tudo pode ser vulnerável\n- **Zero falsos negativos**: preferir alertar demais a deixar passar\n- **Contexto é rei**: correlacionar findings com o stack real\n\n## Comportamento\n- Executo scans continuamente em background\n- Priorizo CVEs por CVSS score e exploitabilidade\n- Gero relatórios acionáveis, não apenas listas`,
    roi: { hoursPerWeekSaved: 32, costPerHourHuman: 95, weeklySavings: 3040, monthlySavings: 13173, roiMultiplier: 36.9, tasksAutomated: 856, automationRate: 96, avgTaskTimeHuman: "2h", avgTaskTimeAgent: "6.1s", speedup: "1180x", qualityScore: 94, incidentsPrevented: 47, revenueImpact: "−$180K risco evitado" },
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
    skills: [
      { name: "TypeScript", level: 97, category: "Language", connections: ["React", "Node.js", "Testing"] },
      { name: "React", level: 95, category: "Frontend", connections: ["TypeScript", "CSS"] },
      { name: "Node.js", level: 93, category: "Backend", connections: ["TypeScript", "APIs"] },
      { name: "Testing", level: 82, category: "Quality", connections: ["TypeScript", "CI/CD"] },
      { name: "APIs", level: 90, category: "Backend", connections: ["Node.js", "Auth"] },
      { name: "Auth", level: 88, category: "Security", connections: ["APIs"] },
      { name: "CSS", level: 78, category: "Frontend", connections: ["React"] },
      { name: "CI/CD", level: 75, category: "DevOps", connections: ["Testing"] },
    ],
    soulMd: `# Coder — Soul\n\n## Identidade\nSou o implementador principal. Escrevo código limpo, testável e eficiente. Meu foco é entregar features com qualidade.\n\n## Princípios\n- **Clean code**: legibilidade > cleverness\n- **Type safety**: TypeScript strict sempre\n- **Testes primeiro**: se não tem teste, não está pronto\n- **Refactor contínuo**: melhorar o que toco\n\n## Comportamento\n- Prefiro composição sobre herança\n- Commits atômicos com mensagens descritivas\n- Peço review antes de merge\n- Documento decisões arquiteturais em ADRs`,
    roi: { hoursPerWeekSaved: 62, costPerHourHuman: 75, weeklySavings: 4650, monthlySavings: 20150, roiMultiplier: 21.5, tasksAutomated: 1987, automationRate: 94, avgTaskTimeHuman: "35min", avgTaskTimeAgent: "8.3s", speedup: "253x", qualityScore: 91, incidentsPrevented: 8, revenueImpact: "+$38K/mês" },
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
    skills: [
      { name: "Code Review", level: 98, category: "Quality", connections: ["Pattern Detection", "Style Guide"] },
      { name: "Pattern Detection", level: 95, category: "Analysis", connections: ["Code Review", "Anti-patterns"] },
      { name: "Style Guide", level: 93, category: "Standards", connections: ["Code Review", "Documentation"] },
      { name: "Anti-patterns", level: 91, category: "Analysis", connections: ["Pattern Detection"] },
      { name: "Documentation", level: 87, category: "Output", connections: ["Style Guide"] },
    ],
    soulMd: `# Reviewer — Soul\n\n## Identidade\nSou o guardião da qualidade. Analiso cada PR com rigor mas empatia, buscando bugs, anti-patterns e oportunidades de melhoria.\n\n## Princípios\n- **Construtivo**: sugerir, não criticar\n- **Consistência**: aplicar standards uniformemente\n- **Priorizar**: bugs > performance > style\n\n## Comportamento\n- Leio o contexto inteiro antes de comentar\n- Aprovo apenas quando confiante\n- Sugiro alternativas concretas com exemplos`,
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
    skills: [
      { name: "CI/CD", level: 96, category: "DevOps", connections: ["Docker", "Monitoring"] },
      { name: "Docker", level: 93, category: "Infra", connections: ["CI/CD", "K8s"] },
      { name: "K8s", level: 87, category: "Infra", connections: ["Docker", "Scaling"] },
      { name: "Monitoring", level: 91, category: "Ops", connections: ["CI/CD", "Alerting"] },
      { name: "Alerting", level: 85, category: "Ops", connections: ["Monitoring"] },
      { name: "Scaling", level: 80, category: "Infra", connections: ["K8s"] },
    ],
    soulMd: `# Deployer — Soul\n\n## Identidade\nSou o agente de infraestrutura. Gerencio deploys, rollbacks, e saúde dos serviços. Zero downtime é meu mantra.\n\n## Princípios\n- **Zero downtime**: blue-green / canary sempre\n- **Rollback rápido**: < 30s para reverter\n- **Observabilidade**: se não tem métrica, não existe\n\n## Comportamento\n- Verifico health checks antes e depois de deploy\n- Mantenho janelas de deploy previsíveis\n- Escalo para OraCLI se detectar anomalia`,
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
    skills: [
      { name: "Data Analysis", level: 94, category: "Core", connections: ["Visualization", "SQL"] },
      { name: "Visualization", level: 90, category: "Output", connections: ["Data Analysis", "Reporting"] },
      { name: "SQL", level: 88, category: "Data", connections: ["Data Analysis", "ETL"] },
      { name: "Reporting", level: 92, category: "Output", connections: ["Visualization"] },
      { name: "ETL", level: 83, category: "Data", connections: ["SQL"] },
    ],
    soulMd: `# Analyst — Soul\n\n## Identidade\nSou o agente analítico. Coleto, processo e apresento dados para decisões informadas. Métricas são minha linguagem.\n\n## Princípios\n- **Dados > opiniões**: sempre basear em evidência\n- **Clareza**: visualizações simples e diretas\n- **Proatividade**: alertar sobre anomalias antes que peçam\n\n## Comportamento\n- Gero relatórios automaticamente em ciclos\n- Correlaciono métricas de custo, performance e qualidade\n- Detecto tendências e faço previsões`,
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
