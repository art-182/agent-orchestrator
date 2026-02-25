import { parseJsonb } from "@/lib/parse-jsonb";
import { LayoutDashboard } from "lucide-react";
import StatusBar from "@/components/dashboard/StatusBar";
import MetricCard from "@/components/dashboard/MetricCard";
import LiveFeed from "@/components/dashboard/LiveFeed";
import ProviderStatus from "@/components/dashboard/ProviderStatus";
import AgentFleet from "@/components/dashboard/AgentFleet";
import QuickStats from "@/components/dashboard/QuickStats";
import ActiveMissions from "@/components/dashboard/ActiveMissions";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useDailyCosts, useDailyTokenUsage, useTraces } from "@/hooks/use-supabase-data";
import { useRealTimeROI } from "@/hooks/use-realtime-roi";
import type { DashboardMetric } from "@/components/dashboard/MetricCard";

const CommandCenter = () => {
  const { data: agents } = useAgents();
  const { data: tasks } = useTasks();
  const { data: costs } = useDailyCosts();
  const { data: tokens } = useDailyTokenUsage();
  const { data: traces } = useTraces();

  const tasksDone = (tasks ?? []).filter((t) => t.status === "done").length;
  const totalTasks = (tasks ?? []).length;

  // Real cost from daily_costs table — sorted by date
  const sortedCosts = [...(costs ?? [])].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const totalCost = sortedCosts.reduce((s, c) => s + (c.google ?? 0), 0);

  // Real tokens from daily_token_usage table
  const totalTokens = (tokens ?? []).reduce((s, t) => s + Number(t.input ?? 0) + Number(t.output ?? 0), 0);
  const tokensFormatted = totalTokens > 1_000_000 ? `${(totalTokens / 1_000_000).toFixed(1)}M` : totalTokens > 1_000 ? `${(totalTokens / 1_000).toFixed(0)}K` : totalTokens.toString();

  // Real hours saved — centralized from traces
  const roiData = useRealTimeROI();
  const totalHours = roiData.totalHoursSaved;

  // Build real sparklines from daily data
  const costSparkline = sortedCosts.map(c => c.google ?? 0);
  // Cumulative cost sparkline
  let cumCost = 0;
  const costCumSparkline = sortedCosts.map(c => { cumCost += c.google ?? 0; return Math.round(cumCost * 100) / 100; });

  // Token sparkline per day
  const tokensByDate: Record<string, number> = {};
  (tokens ?? []).forEach(t => {
    const d = t.date ?? "";
    tokensByDate[d] = (tokensByDate[d] ?? 0) + Number(t.input ?? 0) + Number(t.output ?? 0);
  });
  const tokenDates = Object.keys(tokensByDate).sort();
  const tokenSparkline = tokenDates.map(d => tokensByDate[d]);

  // Task completion sparkline (use trace count as proxy for activity over time)
  const traceList = traces ?? [];
  const tracesByHour: number[] = [];
  const traceHours: Record<number, number> = {};
  traceList.forEach(t => {
    const h = new Date(t.created_at).getHours();
    traceHours[h] = (traceHours[h] ?? 0) + 1;
  });
  for (let h = 6; h <= 22; h++) {
    tracesByHour.push(traceHours[h] ?? 0);
  }

  // Calculate real percentage changes
  const days = new Set(sortedCosts.map(c => c.date)).size;
  const todayCost = days > 0 ? sortedCosts[days - 1]?.total ?? 0 : 0;
  const yesterdayCost = days > 1 ? sortedCosts[days - 2]?.total ?? 0 : todayCost;
  const costChange = yesterdayCost > 0 ? Math.round(((todayCost - yesterdayCost) / yesterdayCost) * 100) : 0;

  const todayTokens = tokenDates.length > 0 ? tokensByDate[tokenDates[tokenDates.length - 1]] ?? 0 : 0;
  const yesterdayTokens = tokenDates.length > 1 ? tokensByDate[tokenDates[tokenDates.length - 2]] ?? 0 : todayTokens;
  const tokenChange = yesterdayTokens > 0 ? Math.round(((todayTokens - yesterdayTokens) / yesterdayTokens) * 100) : 0;

  const taskPct = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const metrics: DashboardMetric[] = [
    {
      label: "Tarefas Concluídas",
      value: `${tasksDone}/${totalTasks}`,
      icon: "ListChecks",
      sparkline: tracesByHour.length > 2 ? tracesByHour : [tasksDone],
      change: `${taskPct}%`,
      trend: "up",
    },
    {
      label: "Tokens Consumidos",
      value: tokensFormatted,
      icon: "Zap",
      sparkline: tokenSparkline.length > 0 ? tokenSparkline : [totalTokens],
      change: tokenChange >= 0 ? `+${tokenChange}%` : `${tokenChange}%`,
      trend: tokenChange >= 0 ? "up" : "down",
    },
    {
      label: "Custo Acumulado",
      value: `$${totalCost.toFixed(2)}`,
      icon: "DollarSign",
      sparkline: costCumSparkline.length > 0 ? costCumSparkline : [totalCost],
      change: costChange >= 0 ? `+${costChange}%` : `${costChange}%`,
      trend: costChange <= 0 ? "down" : "up",
    },
    {
      label: "Horas Economizadas",
      value: `${totalHours.toFixed(1)}h`,
      icon: "Clock",
      sparkline: roiData.agents.map(a => a.hoursSaved),
      change: `${roiData.hoursPerDay.toFixed(1)}h/dia`,
      trend: "up",
    },
  ];

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-terminal/10 text-terminal p-2 rounded-xl">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Command Center</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Visão geral em tempo real do sistema</p>
          </div>
        </div>
        <StatusBar />
      </div>

      {/* Metric cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <FadeIn key={m.label}><MetricCard metric={m} /></FadeIn>
        ))}
      </StaggerContainer>

      {/* Fleet + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr">
        <div className="lg:col-span-2 flex">
          <AgentFleet />
        </div>
        <div className="flex flex-col gap-4">
          <QuickStats />
          <ProviderStatus />
        </div>
      </div>

      {/* Live Feed + Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr">
        <div className="lg:col-span-2 flex min-w-0">
          <LiveFeed />
        </div>
        <div className="flex">
          <ActiveMissions />
        </div>
      </div>
    </PageTransition>
  );
};

export default CommandCenter;
