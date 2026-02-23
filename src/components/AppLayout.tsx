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
  "/traces": "Traces & Erros",
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs text-terminal tabular-nums">
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
          <header className="flex h-12 items-center gap-3 border-b border-border px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-terminal" />
            <span className="font-mono text-sm text-muted-foreground">/</span>
            <span className="font-mono text-sm text-foreground">{label}</span>
            <div className="ml-auto">
              <LiveClock />
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}