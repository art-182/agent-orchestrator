import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type AgentStatus = "online" | "busy" | "idle" | "error";

const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/10 text-terminal border-terminal/20",
  busy: "bg-amber/10 text-amber border-amber/20",
  idle: "bg-muted/50 text-muted-foreground border-border/50",
  error: "bg-rose/10 text-rose border-rose/20",
};

const statusDot: Record<AgentStatus, string> = {
  online: "bg-terminal", busy: "bg-amber", idle: "bg-muted-foreground/40", error: "bg-rose",
};

const OrgNode = ({ agent, onClick }: { agent: DbAgent; onClick: (a: DbAgent) => void }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => onClick(agent)}>
    <div className="relative rounded-2xl border border-border/50 bg-card px-5 py-4 text-center transition-all duration-250 group-hover:border-terminal/30 group-hover:shadow-[0_0_20px_hsl(var(--terminal)/0.1)] min-w-[130px] surface-elevated">
      <span className="text-2xl block select-none">{agent.emoji}</span>
      <p className="text-[13px] font-semibold text-foreground mt-1.5 tracking-tight">{agent.name}</p>
      <p className="text-[10px] text-muted-foreground/60 font-medium">{agent.model}</p>
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[(agent.status as AgentStatus) ?? "online"]}`} />
        <span className={`text-[10px] font-medium ${statusBgMap[(agent.status as AgentStatus) ?? "online"].split(' ')[1]}`}>
          {agent.status}
        </span>
      </div>
    </div>
  </div>
);

interface AgentOrgChartProps {
  agents: DbAgent[];
  onSelectAgent: (agent: DbAgent) => void;
}

const AgentOrgChart = ({ agents, onSelectAgent }: AgentOrgChartProps) => {
  const parent = agents.find((a) => !a.parent_id);
  const children = agents.filter((a) => a.parent_id);

  if (!parent) return null;

  return (
    <div className="flex flex-col items-center gap-0 py-6 overflow-x-auto">
      <OrgNode agent={parent} onClick={onSelectAgent} />
      <div className="w-px h-8 bg-border/40" />
      <div className="relative flex items-start justify-center">
        <div className="absolute top-0 h-px bg-border/40" style={{ left: `calc(${100 / children.length / 2}%)`, right: `calc(${100 / children.length / 2}%)` }} />
        <div className="flex gap-5 md:gap-7">
          {children.map((child) => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-px h-8 bg-border/40" />
              <OrgNode agent={child} onClick={onSelectAgent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentOrgChart;
