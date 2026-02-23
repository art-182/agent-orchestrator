import {
  LayoutDashboard, Bot, GitBranch, Rocket, ListChecks,
  PackageCheck, GanttChart, Brain, DollarSign, Activity, Terminal, TrendingUp
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import RealtimeIndicator from "@/components/RealtimeIndicator";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Command Center", url: "/", icon: LayoutDashboard },
  { title: "Agentes", url: "/agents", icon: Bot },
  { title: "Interações", url: "/interactions", icon: GitBranch },
  { title: "Missões", url: "/missions", icon: Rocket },
  { title: "Tarefas", url: "/tasks", icon: ListChecks },
  { title: "Entregáveis", url: "/deliverables", icon: PackageCheck },
  { title: "Timeline", url: "/timeline", icon: GanttChart },
  { title: "Memória", url: "/memory", icon: Brain },
  { title: "Finanças", url: "/finances", icon: DollarSign },
  { title: "ROI", url: "/roi", icon: TrendingUp },
  { title: "Traces", url: "/traces", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Terminal className="h-5 w-5 text-terminal shrink-0 glow-icon" />
          {!collapsed && (
            <span className="font-mono text-base font-semibold text-terminal tracking-tight whitespace-nowrap">
              {">_"} Revenue OS
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 text-sidebar-foreground transition-all duration-200 py-2"
                      activeClassName="text-terminal bg-sidebar-accent glow-terminal"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate text-[14px]">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <RealtimeIndicator />
      </SidebarFooter>
    </Sidebar>
  );
}
