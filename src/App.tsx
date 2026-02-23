import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import CommandCenter from "./pages/CommandCenter";
import Agents from "./pages/Agents";
import Interactions from "./pages/Interactions";
import Missions from "./pages/Missions";
import Tasks from "./pages/Tasks";
import Deliverables from "./pages/Deliverables";
import TimelinePage from "./pages/TimelinePage";
import Memory from "./pages/Memory";
import Finances from "./pages/Finances";
import Traces from "./pages/Traces";
import ROIDashboard from "./pages/ROIDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/deliverables" element={<Deliverables />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/memory" element={<Memory />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/traces" element={<Traces />} />
            <Route path="/roi" element={<ROIDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;