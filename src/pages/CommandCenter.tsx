import { LayoutDashboard } from "lucide-react";
import StatusBar from "@/components/dashboard/StatusBar";
import MetricCard from "@/components/dashboard/MetricCard";
import LiveFeed from "@/components/dashboard/LiveFeed";
import ProviderStatus from "@/components/dashboard/ProviderStatus";
import { mockDashboardMetrics } from "@/lib/mock-data";

const CommandCenter = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <LayoutDashboard className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Command Center</h1>
    </div>

    <StatusBar />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mockDashboardMetrics.map((m) => (
        <MetricCard key={m.label} metric={m} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <LiveFeed />
      </div>
      <ProviderStatus />
    </div>
  </div>
);

export default CommandCenter;
