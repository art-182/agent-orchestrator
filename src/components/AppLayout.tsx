import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
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
    <span className="font-mono text-sm text-terminal tabular-nums tracking-tight">
      {time.toLocaleTimeString("pt-BR", { hour12: false })}
    </span>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const label = routeLabels[location.pathname] ?? "Revenue OS";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-3 border-b border-border px-5">
            <SidebarTrigger className="text-muted-foreground hover:text-terminal transition-colors" />
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">{label}</span>
            <div className="ml-auto">
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
