import type { DailyCost, AgentCost } from "@/lib/finance-data";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDailyCostsCSV(data: DailyCost[]) {
  downloadCSV(
    `custos-diarios-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Data", "OpenAI", "Anthropic", "Google", "Total"],
    data.map((d) => [d.date, d.openai.toFixed(2), d.anthropic.toFixed(2), d.google.toFixed(2), d.total.toFixed(2)])
  );
}

export function exportAgentCostsCSV(data: AgentCost[]) {
  downloadCSV(
    `custos-agentes-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Agente", "Status", "Tokens", "Custo ($)", "Tarefas", "Custo/Tarefa ($)"],
    data.map((a) => [a.name, a.status, a.tokens.toString(), a.cost.toFixed(2), a.tasks.toString(), a.costPerTask.toFixed(3)])
  );
}

export function exportBillingCSV(snapshots: Array<{ label: string; value: string; change: string | null; trend: string | null }>) {
  downloadCSV(
    `billing-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Métrica", "Valor", "Variação", "Tendência"],
    snapshots.map((s) => [s.label, s.value, s.change ?? "", s.trend ?? ""])
  );
}
