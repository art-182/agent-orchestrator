-- ═══════════════════════════════════════════════════════
-- AIOS Sync Layer — Schema Migration
-- ═══════════════════════════════════════════════════════
-- Projeto: apkflemxmsbdltziouls (openclaw dashboard)
-- Executar em: https://supabase.com/dashboard/project/apkflemxmsbdltziouls/sql/new
-- Data: 2026-02-26
-- ═══════════════════════════════════════════════════════

-- ──────────────────────────────────────────
-- 1. TASKS — Adicionar campos para BMAD, Jira e Sprint tracking
-- ──────────────────────────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS bmad_stage TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS jira_key TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS github_commit TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_count INT DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'streamer';
-- source: 'streamer' | 'sync' | 'manual' | 'jira'

COMMENT ON COLUMN tasks.bmad_stage IS 'BMAD-CE stage: context_scout, architecture, specifier, developer, code_review, qa, stakeholder, knowledge';
COMMENT ON COLUMN tasks.jira_key IS 'Jira ticket key e.g. SCRUM-1635';
COMMENT ON COLUMN tasks.sprint_id IS 'Sprint identifier e.g. sprint-68';
COMMENT ON COLUMN tasks.source IS 'Origin: streamer (real-time), sync (reconciliation), manual, jira';

-- Index for sprint queries
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_jira ON tasks(jira_key);
CREATE INDEX IF NOT EXISTS idx_tasks_bmad ON tasks(bmad_stage);

-- ──────────────────────────────────────────
-- 2. DELIVERABLES — Adicionar campos para rastreabilidade completa
-- ──────────────────────────────────────────
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS jira_key TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS size_bytes INT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'code';
-- category: 'edge_function' | 'test' | 'migration' | 'report' | 'confluence' | 'ci_fix' | 'config' | 'doc'

COMMENT ON COLUMN deliverables.sprint_id IS 'Sprint identifier e.g. sprint-68';
COMMENT ON COLUMN deliverables.category IS 'Granular type: edge_function, test, migration, report, confluence, ci_fix, config, doc';
COMMENT ON COLUMN deliverables.content_hash IS 'SHA256 for dedup — prevents duplicate deliverables for same file';

CREATE INDEX IF NOT EXISTS idx_deliverables_sprint ON deliverables(sprint_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_category ON deliverables(category);
CREATE INDEX IF NOT EXISTS idx_deliverables_hash ON deliverables(content_hash);

-- ──────────────────────────────────────────
-- 3. MISSIONS — Mapear para EPICs / Sprints com auto-detecção
-- ──────────────────────────────────────────
ALTER TABLE missions ADD COLUMN IF NOT EXISTS mission_type TEXT DEFAULT 'epic';
-- mission_type: 'epic' | 'sprint' | 'initiative' | 'ad_hoc'
ALTER TABLE missions ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS jira_sprint_id INT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS jira_epic_key TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS total_sp INT DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS completed_sp INT DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS epic_ids TEXT[];
ALTER TABLE missions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS task_count INT DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS deliverable_count INT DEFAULT 0;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS detection_rule TEXT;
-- detection_rule: what triggered this mission creation (for traceability)

COMMENT ON COLUMN missions.mission_type IS 'epic=Jira EPIC, sprint=Jira Sprint, initiative=multi-epic effort, ad_hoc=detected from agent work';
COMMENT ON COLUMN missions.detection_rule IS 'How this mission was detected: jira_epic, jira_sprint, agent_pattern, manual';

CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_epic ON missions(jira_epic_key);

-- ──────────────────────────────────────────
-- 4. TIMELINE_EVENTS — Adicionar sprint tracking
-- ──────────────────────────────────────────
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS sprint_id TEXT;
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
-- metadata: flexible JSON for extra context (commit SHA, file size, page ID, etc.)

CREATE INDEX IF NOT EXISTS idx_timeline_sprint ON timeline_events(sprint_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_events(type);

-- ──────────────────────────────────────────
-- 5. INCREASE PostgREST default row limit
-- (affects ALL tables — traces, interactions, etc.)
-- ──────────────────────────────────────────
-- Option A: Set per-role max rows (recommended)
ALTER ROLE authenticator SET pgrst.db_max_rows = 10000;
-- Option B: If the above doesn't work, notify PostgREST to reload
NOTIFY pgrst, 'reload config';

-- ──────────────────────────────────────────
-- 6. VIEWS for dashboard aggregation (avoids loading 10K+ rows)
-- ──────────────────────────────────────────

-- Trace summary by day + agent (instead of loading all traces)
CREATE OR REPLACE VIEW v_trace_summary AS
SELECT 
  DATE(created_at) as trace_date,
  agent_id,
  COUNT(*) as trace_count,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
  COUNT(CASE WHEN status != 'success' THEN 1 END) as error_count
FROM traces
GROUP BY DATE(created_at), agent_id
ORDER BY trace_date DESC, trace_count DESC;

-- Mission progress view (auto-calculated)
CREATE OR REPLACE VIEW v_mission_progress AS
SELECT 
  m.id,
  m.name,
  m.mission_type,
  m.status,
  m.total_sp,
  m.completed_sp,
  COUNT(DISTINCT t.id) as actual_task_count,
  COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as done_task_count,
  COUNT(DISTINCT d.id) as actual_deliverable_count,
  CASE 
    WHEN COUNT(DISTINCT t.id) > 0 
    THEN ROUND(COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END)::numeric / COUNT(DISTINCT t.id) * 100)
    ELSE m.progress 
  END as calculated_progress
FROM missions m
LEFT JOIN tasks t ON t.mission_id = m.id
LEFT JOIN deliverables d ON d.mission_id = m.id
GROUP BY m.id, m.name, m.mission_type, m.status, m.total_sp, m.completed_sp, m.progress;

-- Deliverable summary by sprint
CREATE OR REPLACE VIEW v_deliverable_summary AS
SELECT
  sprint_id,
  category,
  COUNT(*) as count,
  SUM(COALESCE(size_bytes, 0)) as total_bytes,
  SUM(files) as total_files
FROM deliverables
WHERE sprint_id IS NOT NULL
GROUP BY sprint_id, category
ORDER BY sprint_id DESC, count DESC;

-- ──────────────────────────────────────────
-- 7. GRANT access to views
-- ──────────────────────────────────────────
GRANT SELECT ON v_trace_summary TO authenticated, anon, service_role;
GRANT SELECT ON v_mission_progress TO authenticated, anon, service_role;
GRANT SELECT ON v_deliverable_summary TO authenticated, anon, service_role;

-- ──────────────────────────────────────────
-- DONE. Verify:
-- ──────────────────────────────────────────
SELECT 'Migration complete' as status,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'bmad_stage') as tasks_bmad,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'sprint_id') as deliverables_sprint,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'mission_type') as missions_type;
