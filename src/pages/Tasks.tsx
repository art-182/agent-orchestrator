import { ListChecks } from "lucide-react";
import TerminalCursor from "@/components/TerminalCursor";

const Tasks = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <ListChecks className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Tarefas</h1>
    </div>
    <p className="font-mono text-sm text-muted-foreground">{">"} aguardando dados...<TerminalCursor /></p>
  </div>
);

export default Tasks;