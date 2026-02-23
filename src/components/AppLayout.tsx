import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { AppSidebar } from "@/components/AppSidebar";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/": "Command Center",
  "/agents": "Agentes",
  "/interactions": "Interações",
  "/missions": "Missões",
  "/tasks": "Tarefas",
  "/deliverables": "Entregáveis",
  "/timeline": "Timeline",
  "/memory": "Memória",
  "/finances": "Finanças",
  "/roi": "ROI",
  "/traces": "Traces & Erros",
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-[13px] text-terminal/80 tabular-nums tracking-tight font-medium">
      {time.toLocaleTimeString("pt-BR", { hour12: false })}
    </span>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const label = routeLabels[location.pathname] ?? "Revenue OS";
  useRealtimeNotifications();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b border-border/40 px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-terminal transition-colors" />
            <div className="h-4 w-px bg-border/50" />
            <span className="text-[13px] font-medium text-foreground/90 tracking-tight">{label}</span>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-terminal animate-pulse-dot" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-terminal" />
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Live</span>
              </div>
              <LiveClock />
            </div>
          </header>
          <main className="flex-1 p-5 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
