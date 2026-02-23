import { Activity } from "lucide-react";
import TerminalCursor from "@/components/TerminalCursor";

const Traces = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <Activity className="h-6 w-6 text-terminal" />
      <h1 className="font-mono text-xl font-semibold text-foreground">Traces & Erros</h1>
    </div>
    <p className="font-mono text-sm text-muted-foreground">{">"} aguardando dados...<TerminalCursor /></p>
  </div>
);

export default Traces;