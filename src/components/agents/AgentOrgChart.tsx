import { mockAgents, statusBgMap, statusColorMap } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";

interface OrgNodeProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
}

const OrgNode = ({ agent, onClick }: OrgNodeProps) => (
  <div
    className="flex flex-col items-center gap-1 cursor-pointer group"
    onClick={() => onClick(agent)}
  >
    <div className="relative rounded-lg border border-border bg-card px-4 py-3 text-center transition-all group-hover:border-terminal/50 group-hover:shadow-[0_0_12px_hsl(var(--terminal)/0.15)] min-w-[120px]">
      <span className="text-2xl block">{agent.emoji}</span>
      <p className="font-mono text-xs font-semibold text-foreground mt-1">{agent.name}</p>
      <p className="font-mono text-[10px] text-muted-foreground">{agent.model}</p>
      <span
        className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-mono border ${statusBgMap[agent.status]}`}
      >
        {agent.status}
      </span>
    </div>
  </div>
);

interface AgentOrgChartProps {
  onSelectAgent: (agent: Agent) => void;
}

const AgentOrgChart = ({ onSelectAgent }: AgentOrgChartProps) => {
  const parent = mockAgents.find((a) => !a.parentId);
  const children = mockAgents.filter((a) => a.parentId);

  if (!parent) return null;

  return (
    <div className="flex flex-col items-center gap-0 py-4 overflow-x-auto">
      {/* Parent node */}
      <OrgNode agent={parent} onClick={onSelectAgent} />

      {/* Vertical line from parent */}
      <div className="w-px h-8 bg-border" />

      {/* Horizontal connector bar */}
      <div className="relative flex items-start justify-center">
        {/* Horizontal line spanning all children */}
        <div
          className="absolute top-0 h-px bg-border"
          style={{
            left: `calc(${100 / children.length / 2}% )`,
            right: `calc(${100 / children.length / 2}% )`,
          }}
        />

        {/* Children with vertical stubs */}
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
