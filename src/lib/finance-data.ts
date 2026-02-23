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
