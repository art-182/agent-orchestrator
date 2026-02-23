import type { AgentStatus } from "./mock-data";

// ── Finance Types ──────────────────────────────────────

export interface DailyCost {
  date: string;
  openai: number;
  anthropic: number;
  google: number;
  total: number;
}

export interface AgentCost {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  tokens: number;
  cost: number;
  tasks: number;
  costPerTask: number;
}

export interface BillingSummary {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface ModelPricing {
  model: string;
  provider: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  avgLatency: string;
}

export interface DailyTokenUsage {
  date: string;
  input: number;
  output: number;
  total: number;
}

export interface ToolCost {
  tool: string;
  agent: string;
  calls: number;
  tokens: number;
  cost: number;
  avgDuration: string;
}

export interface MonthlyProjection {
  month: string;
  actual: number | null;
  projected: number;
}

export interface SkillCost {
  skill: string;
  category: string;
  executions: number;
  tokens: number;
  cost: number;
  successRate: number;
}

// ── Mock Daily Costs (last 14 days) ────────────────────

export const mockDailyCosts: DailyCost[] = [
  { date: "Feb 09", openai: 12.4, anthropic: 8.2, google: 1.8, total: 22.4 },
  { date: "Feb 10", openai: 15.1, anthropic: 9.5, google: 2.1, total: 26.7 },
  { date: "Feb 11", openai: 11.8, anthropic: 7.9, google: 1.5, total: 21.2 },
  { date: "Feb 12", openai: 18.3, anthropic: 11.2, google: 3.4, total: 32.9 },
  { date: "Feb 13", openai: 14.6, anthropic: 10.1, google: 2.7, total: 27.4 },
  { date: "Feb 14", openai: 16.9, anthropic: 12.8, google: 3.1, total: 32.8 },
  { date: "Feb 15", openai: 13.2, anthropic: 8.7, google: 1.9, total: 23.8 },
  { date: "Feb 16", openai: 10.5, anthropic: 6.4, google: 1.2, total: 18.1 },
  { date: "Feb 17", openai: 9.8, anthropic: 5.9, google: 0.9, total: 16.6 },
  { date: "Feb 18", openai: 17.4, anthropic: 13.1, google: 3.8, total: 34.3 },
  { date: "Feb 19", openai: 19.2, anthropic: 14.5, google: 4.2, total: 37.9 },
  { date: "Feb 20", openai: 15.7, anthropic: 10.8, google: 2.9, total: 29.4 },
  { date: "Feb 21", openai: 14.1, anthropic: 9.3, google: 2.4, total: 25.8 },
  { date: "Feb 22", openai: 16.5, anthropic: 11.6, google: 3.3, total: 31.4 },
];

// ── Mock Agent Costs ───────────────────────────────────

export const mockAgentCosts: AgentCost[] = [
  { id: "coder", name: "Coder", emoji: "💻", status: "online", tokens: 892400, cost: 234.12, tasks: 2103, costPerTask: 0.11 },
  { id: "oracli-main", name: "OraCLI Main", emoji: "🧠", status: "online", tokens: 548200, cost: 127.45, tasks: 1247, costPerTask: 0.10 },
  { id: "scout", name: "Scout", emoji: "🔍", status: "busy", tokens: 312800, cost: 89.30, tasks: 892, costPerTask: 0.10 },
  { id: "reviewer", name: "Reviewer", emoji: "📝", status: "idle", tokens: 198500, cost: 45.67, tasks: 567, costPerTask: 0.08 },
  { id: "deployer", name: "Deployer", emoji: "🚀", status: "online", tokens: 87300, cost: 18.90, tasks: 312, costPerTask: 0.06 },
  { id: "analyst", name: "Analyst", emoji: "📊", status: "error", tokens: 67100, cost: 12.34, tasks: 445, costPerTask: 0.03 },
];

// ── Billing Summary ────────────────────────────────────

export const mockBillingSummary: BillingSummary[] = [
  { label: "Custo Hoje", value: "$31.40", change: "+12%", trend: "up" },
  { label: "Custo Semana", value: "$198.54", change: "-5%", trend: "down" },
  { label: "Custo Mês", value: "$527.78", change: "+8%", trend: "up" },
  { label: "Tokens Totais", value: "2.1M", change: "+15%", trend: "up" },
];

// ── Provider Cost Breakdown ────────────────────────────

export const mockProviderBreakdown = [
  { name: "OpenAI", value: 63, color: "hsl(160, 51%, 49%)" },
  { name: "Anthropic", value: 28, color: "hsl(260, 67%, 70%)" },
  { name: "Google", value: 9, color: "hsl(45, 93%, 56%)" },
];

// ── Model Pricing & Usage ──────────────────────────────

export const mockModelPricing: ModelPricing[] = [
  { model: "gpt-4o", provider: "OpenAI", inputCostPer1k: 0.005, outputCostPer1k: 0.015, inputTokens: 685200, outputTokens: 342100, totalCost: 8.56, avgLatency: "1.2s" },
  { model: "gpt-4o-mini", provider: "OpenAI", inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, inputTokens: 412800, outputTokens: 198400, totalCost: 0.18, avgLatency: "0.6s" },
  { model: "claude-3.5-sonnet", provider: "Anthropic", inputCostPer1k: 0.003, outputCostPer1k: 0.015, inputTokens: 398500, outputTokens: 187200, totalCost: 4.00, avgLatency: "1.8s" },
  { model: "claude-3-haiku", provider: "Anthropic", inputCostPer1k: 0.00025, outputCostPer1k: 0.00125, inputTokens: 215300, outputTokens: 98700, totalCost: 0.18, avgLatency: "0.4s" },
  { model: "gemini-1.5-pro", provider: "Google", inputCostPer1k: 0.00125, outputCostPer1k: 0.005, inputTokens: 145600, outputTokens: 67800, totalCost: 0.52, avgLatency: "2.1s" },
];

// ── Daily Token Usage ──────────────────────────────────

export const mockDailyTokens: DailyTokenUsage[] = [
  { date: "Feb 09", input: 98200, output: 45100, total: 143300 },
  { date: "Feb 10", input: 112400, output: 52300, total: 164700 },
  { date: "Feb 11", input: 89700, output: 41200, total: 130900 },
  { date: "Feb 12", input: 134500, output: 63800, total: 198300 },
  { date: "Feb 13", input: 108300, output: 49700, total: 158000 },
  { date: "Feb 14", input: 125800, output: 58200, total: 184000 },
  { date: "Feb 15", input: 97400, output: 44800, total: 142200 },
  { date: "Feb 16", input: 78600, output: 36100, total: 114700 },
  { date: "Feb 17", input: 72100, output: 33200, total: 105300 },
  { date: "Feb 18", input: 138900, output: 64500, total: 203400 },
  { date: "Feb 19", input: 152300, output: 71200, total: 223500 },
  { date: "Feb 20", input: 118700, output: 54800, total: 173500 },
  { date: "Feb 21", input: 105200, output: 48300, total: 153500 },
  { date: "Feb 22", input: 128400, output: 59100, total: 187500 },
];

// ── Tool Costs ─────────────────────────────────────────

export const mockToolCosts: ToolCost[] = [
  { tool: "code_write", agent: "Coder", calls: 847, tokens: 312400, cost: 98.45, avgDuration: "8.2s" },
  { tool: "code_review", agent: "Reviewer", calls: 312, tokens: 198500, cost: 45.67, avgDuration: "12.1s" },
  { tool: "security_scan", agent: "Scout", calls: 256, tokens: 145200, cost: 34.80, avgDuration: "6.4s" },
  { tool: "web_search", agent: "Scout", calls: 189, tokens: 67300, cost: 12.50, avgDuration: "3.2s" },
  { tool: "deploy", agent: "Deployer", calls: 98, tokens: 42100, cost: 8.90, avgDuration: "25.3s" },
  { tool: "metrics_query", agent: "Analyst", calls: 445, tokens: 67100, cost: 12.34, avgDuration: "2.1s" },
  { tool: "file_read", agent: "Coder", calls: 1256, tokens: 89400, cost: 5.20, avgDuration: "0.8s" },
  { tool: "git_commit", agent: "Coder", calls: 423, tokens: 34200, cost: 2.10, avgDuration: "1.1s" },
  { tool: "plan_create", agent: "OraCLI Main", calls: 67, tokens: 98700, cost: 18.90, avgDuration: "4.5s" },
  { tool: "task_delegate", agent: "OraCLI Main", calls: 342, tokens: 45600, cost: 8.40, avgDuration: "1.8s" },
];

// ── Monthly Projections ────────────────────────────────

export const mockMonthlyProjections: MonthlyProjection[] = [
  { month: "Out", actual: 312.40, projected: 312.40 },
  { month: "Nov", actual: 398.70, projected: 398.70 },
  { month: "Dez", actual: 445.20, projected: 445.20 },
  { month: "Jan", actual: 487.90, projected: 487.90 },
  { month: "Fev", actual: null, projected: 527.78 },
  { month: "Mar", actual: null, projected: 578.50 },
  { month: "Abr", actual: null, projected: 635.20 },
  { month: "Mai", actual: null, projected: 698.70 },
];

// ── Skill Costs ────────────────────────────────────────

export const mockSkillCosts: SkillCost[] = [
  { skill: "Code Generation", category: "Development", executions: 1847, tokens: 542300, cost: 145.80, successRate: 94.2 },
  { skill: "Code Review", category: "Quality", executions: 567, tokens: 198500, cost: 45.67, successRate: 98.7 },
  { skill: "Security Analysis", category: "Security", executions: 445, tokens: 167800, cost: 42.30, successRate: 96.1 },
  { skill: "Deployment", category: "DevOps", executions: 312, tokens: 87300, cost: 18.90, successRate: 97.5 },
  { skill: "Planning", category: "Strategy", executions: 409, tokens: 144300, cost: 27.30, successRate: 99.1 },
  { skill: "Data Analysis", category: "Analytics", executions: 445, tokens: 67100, cost: 12.34, successRate: 91.8 },
  { skill: "Testing", category: "Quality", executions: 623, tokens: 112400, cost: 22.50, successRate: 88.4 },
  { skill: "Documentation", category: "Development", executions: 234, tokens: 78900, cost: 9.80, successRate: 99.5 },
];
