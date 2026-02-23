import type { Tables } from "@/integrations/supabase/types";

type DbAgent = Tables<"agents">;
type AgentStatus = "online" | "busy" | "idle" | "error";

const statusBgMap: Record<AgentStatus, string> = {
  online: "bg-terminal/15 text-terminal border-terminal/30",
  busy: "bg-amber/15 text-amber border-amber/30",
  idle: "bg-muted text-muted-foreground border-border",
  error: "bg-rose/15 text-rose border-rose/30",
};

const OrgNode = ({ agent, onClick }: { agent: DbAgent; onClick: (a: DbAgent) => void }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => onClick(agent)}>
    <div className="relative rounded-lg border border-border bg-card px-4 py-3 text-center transition-all group-hover:border-terminal/50 group-hover:shadow-[0_0_12px_hsl(var(--terminal)/0.15)] min-w-[120px]">
      <span className="text-2xl block">{agent.emoji}</span>
      <p className="font-mono text-xs font-semibold text-foreground mt-1">{agent.name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{agent.model}</p>
      <span className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-mono border ${statusBgMap[(agent.status as AgentStatus) ?? "online"]}`}>
        {agent.status}
      </span>
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
    <div className="flex flex-col items-center gap-0 py-4 overflow-x-auto">
      <OrgNode agent={parent} onClick={onSelectAgent} />
      <div className="w-px h-8 bg-border" />
      <div className="relative flex items-start justify-center">
        <div className="absolute top-0 h-px bg-border" style={{ left: `calc(${100 / children.length / 2}%)`, right: `calc(${100 / children.length / 2}%)` }} />
        <div className="flex gap-4 md:gap-6">
          {children.map((child) => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-px h-8 bg-border" />
              <OrgNode agent={child} onClick={onSelectAgent} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentOrgChart;
