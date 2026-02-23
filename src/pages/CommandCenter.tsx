import { LayoutDashboard } from "lucide-react";
import StatusBar from "@/components/dashboard/StatusBar";
import MetricCard from "@/components/dashboard/MetricCard";
import LiveFeed from "@/components/dashboard/LiveFeed";
import ProviderStatus from "@/components/dashboard/ProviderStatus";
import AgentFleet from "@/components/dashboard/AgentFleet";
import ActiveMissions from "@/components/dashboard/ActiveMissions";
import QuickStats from "@/components/dashboard/QuickStats";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useAgents, useTasks, useDailyCosts } from "@/hooks/use-supabase-data";
import type { DashboardMetric } from "@/components/dashboard/MetricCard";

const CommandCenter = () => {
  const { data: agents } = useAgents();
  const { data: tasks } = useTasks();
  const { data: costs } = useDailyCosts();

  const tasksDone = (tasks ?? []).filter((t) => t.status === "done").length;
  const totalTasks = (tasks ?? []).length;
  const totalCost = (costs ?? []).reduce((s, c) => s + (c.total ?? 0), 0);
  const totalHours = (agents ?? []).reduce((s, a) => {
    const roi = a.roi as any;
    return s + (roi?.hoursPerWeekSaved ?? 0);
  }, 0);

  const totalTokens = (agents ?? []).reduce((s, a) => s + (a.tasks_completed ?? 0) * 450, 0);
  const tokensFormatted = totalTokens > 1_000_000 ? `${(totalTokens / 1_000_000).toFixed(1)}M` : totalTokens > 1_000 ? `${(totalTokens / 1_000).toFixed(0)}K` : totalTokens.toString();

  const metrics: DashboardMetric[] = [
    { label: "Tarefas Concluídas", value: `${tasksDone}/${totalTasks}`, icon: "ListChecks", sparkline: [8, 12, 15, 11, 18, 22, 19, 25, 21, 27, 24, 30], change: "+12%", trend: "up" },
    { label: "Tokens Consumidos", value: tokensFormatted, icon: "Zap", sparkline: [45, 52, 49, 60, 55, 68, 72, 65, 78, 82, 75, 88], change: "+8%", trend: "up" },
    { label: "Custo Acumulado", value: `$${totalCost.toFixed(2)}`, icon: "DollarSign", sparkline: [2, 5, 8, 12, 15, 19, 22, 27, 31, 36, 41, 47], change: "-5%", trend: "down" },
    { label: "Horas Economizadas/Sem", value: `${totalHours}h`, icon: "Clock", sparkline: [1, 3, 5, 8, 11, 14, 18, 21, 25, 28, 31, 34], change: "+18%", trend: "up" },
  ];

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Command Center</h1>
      </div>

      {/* Status badges */}
      <StatusBar />

      {/* Metric cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <FadeIn key={m.label}><MetricCard metric={m} /></FadeIn>
        ))}
      </StaggerContainer>

      {/* Agent Fleet */}
      <AgentFleet />

      {/* Main content: Feed + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <LiveFeed />
        </div>
        <div className="space-y-4">
          <ActiveMissions />
          <ProviderStatus />
          <QuickStats />
        </div>
      </div>
    </PageTransition>
  );
};

export default CommandCenter;
