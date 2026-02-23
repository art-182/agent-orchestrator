
-- ══════════════════════════════════════════════════════
-- Revenue OS — Full Schema
-- ══════════════════════════════════════════════════════

-- Agents
CREATE TABLE public.agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('online', 'busy', 'idle', 'error')),
  current_task TEXT DEFAULT '',
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  parent_id TEXT REFERENCES public.agents(id),
  uptime TEXT DEFAULT '0h',
  tasks_completed INTEGER DEFAULT 0,
  avg_time TEXT DEFAULT '0s',
  error_rate NUMERIC(5,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  skills JSONB DEFAULT '[]'::jsonb,
  soul_md TEXT DEFAULT '',
  roi JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  owner TEXT REFERENCES public.agents(id),
  deadline TIMESTAMPTZ,
  cost NUMERIC(10,2) DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_id TEXT REFERENCES public.agents(id),
  mission_id UUID REFERENCES public.missions(id),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('done', 'in_progress', 'todo', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  duration TEXT DEFAULT '—',
  tokens INTEGER DEFAULT 0,
  cost NUMERIC(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interactions (agent-to-agent communication)
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent TEXT REFERENCES public.agents(id),
  to_agent TEXT REFERENCES public.agents(id),
  type TEXT NOT NULL CHECK (type IN ('delegation', 'response', 'escalation', 'feedback', 'sync')),
  message TEXT NOT NULL,
  tokens INTEGER DEFAULT 0,
  latency TEXT DEFAULT '0s',
  mission_id UUID REFERENCES public.missions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deliverables
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('code', 'report', 'config', 'test', 'doc')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('delivered', 'in_progress', 'pending')),
  agent_id TEXT REFERENCES public.agents(id),
  mission_id UUID REFERENCES public.missions(id),
  files INTEGER DEFAULT 0,
  lines_changed INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memory entries
CREATE TABLE public.memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('fact', 'decision', 'context', 'preference', 'error_pattern')),
  content TEXT NOT NULL,
  source_agent TEXT REFERENCES public.agents(id),
  tags TEXT[] DEFAULT '{}',
  confidence INTEGER DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Traces
CREATE TABLE public.traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_id TEXT REFERENCES public.agents(id),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning', 'timeout')),
  duration TEXT DEFAULT '0s',
  spans JSONB DEFAULT '[]'::jsonb,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline events
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('mission_start', 'task_done', 'deploy', 'error', 'escalation', 'milestone', 'decision')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  agent_id TEXT REFERENCES public.agents(id),
  mission_id UUID REFERENCES public.missions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finance: daily costs
CREATE TABLE public.daily_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  openai NUMERIC(10,2) DEFAULT 0,
  anthropic NUMERIC(10,2) DEFAULT 0,
  google NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finance: billing summaries (snapshots)
CREATE TABLE public.billing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  change TEXT DEFAULT '',
  trend TEXT DEFAULT 'neutral' CHECK (trend IN ('up', 'down', 'neutral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access (this is a monitoring dashboard, data is read-only for viewers)
CREATE POLICY "Public read agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public read missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public read interactions" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Public read deliverables" ON public.deliverables FOR SELECT USING (true);
CREATE POLICY "Public read memory" ON public.memory_entries FOR SELECT USING (true);
CREATE POLICY "Public read traces" ON public.traces FOR SELECT USING (true);
CREATE POLICY "Public read timeline" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Public read daily_costs" ON public.daily_costs FOR SELECT USING (true);
CREATE POLICY "Public read billing" ON public.billing_snapshots FOR SELECT USING (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_ts BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_missions_ts BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tasks_ts BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
