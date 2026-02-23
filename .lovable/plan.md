

# Revenue OS 2.0 — Plano Final de Implementação

## Visão Geral
Dashboard de observabilidade em tempo real para o enxame de agentes OraCLI. Estética **retro terminal com feeling Apple** — limpo, elegante, minimalista, tipografia monospace, paleta escura refinada. Backend Supabase com ingestão via Edge Functions e sync em tempo real.

---

## 🎨 Fase 1 — Design System & Shell de Navegação

### Design System
- **Tema dark permanente** — background `#08090d`, cards `#0f1117`, bordas `#1a1d27`
- **Acentos**: verde terminal `#34d399`, cyan `#22d3ee`, âmbar `#fbbf24`, vermelho `#f43f5e`, roxo `#a78bfa`
- **Google Font JetBrains Mono** para dados/métricas, Inter para UI
- Cards com `border-radius: 12px` estilo Apple, glassmorphism sutil, glow nos ícones ativos

### Sidebar Enxuta (10 seções)
- Logo `>_ Revenue OS` em JetBrains Mono verde no topo
- Colapsável para modo ícones com tooltips
- Indicador de conexão Realtime no rodapé (dot pulsante verde/vermelho)

| Rota | Label | Ícone |
|------|-------|-------|
| `/` | Command Center | `LayoutDashboard` |
| `/agents` | Agentes | `Bot` |
| `/interactions` | Interações | `GitBranch` |
| `/missions` | Missões | `Rocket` |
| `/tasks` | Tarefas | `ListChecks` |
| `/deliverables` | Entregáveis | `PackageCheck` |
| `/timeline` | Timeline | `GanttChart` |
| `/memory` | Memória | `Brain` |
| `/finances` | Finanças | `DollarSign` |
| `/traces` | Traces & Erros | `Activity` |

### Layout Shell
- `AppLayout` com `SidebarProvider` + `AppSidebar` + `SidebarInset`
- Header com `SidebarTrigger`, breadcrumb e clock monospace verde
- Routing para todas as 10 páginas com placeholders estilo terminal (`> aguardando dados...` com cursor piscante)

### Supabase
- Conectar usando publishable key `sb_publishable_YhwDFPg8Ac2pwPZMkNLscg_v6thhjYM`
- Criar client em `src/integrations/supabase/client.ts`

---

## 📊 Fase 2 — Command Center + Agentes

### Command Center (Home)
- Barra de status: agentes online, taxa de sucesso, custo/hora, clock real
- Grid de cards de métricas com sparklines (Recharts): tarefas hoje, tokens, custo acumulado, tempo economizado, Net P&L
- Live Feed estilo terminal — scroll de eventos com timestamps, agente, ação, resultado, custo
- Status dos providers (OpenAI, Anthropic, Google, Vercel) com latência
- Quick Actions — botões para ações comuns

### Agentes
- Grid de cards — nome, avatar/emoji, status (online/busy/idle/error), tarefa atual, modelo, provider
- Árvore hierárquica (agente principal → sub-agentes)
- Detalhe do agente (drawer): histórico, uptime, taxa de sucesso, modelo
- Métricas de desempenho: tarefas completadas, tempo médio, taxa de erro, custo total

---

## 🧊 Fase 3 — Grafo 3D de Skills

- Instalar `@react-three/fiber` + `@react-three/drei`
- Visualização 3D interativa na página de Agentes
- Nós = ferramentas/skills (Jira, Slack, GitHub, Terminal, etc.)
- Tamanho do nó = frequência de uso, cor = categoria
- Arestas = co-uso de ferramentas na mesma tarefa
- Rotação orbital, zoom, click para detalhes
- Transições animadas ao trocar de agente

---

## 🔗 Fase 4 — Interações & Missões

### Interações
- Grafo node-based 2D: agentes como nós, interações como arestas
- Timeline slider para navegar no histórico
- Tipos de conexão: linhas sólidas (ativas), tracejadas (building), cores por tipo
- Cards de mensagens inline no grafo
- Play/Stop para reproduzir sequência temporal

### Missões & Workflows
- Lista de missões com título, due date, progresso
- Pipeline visual: plan → setup → implement → verify → test → pr → review
- Status por step: Done ✅, Running 🔄, Pending ⏳, Error ❌
- Detalhe expandível com agente por step, recursos, linked docs
- Ações: Run Workflow, Refresh Status, Add Step

---

## ✅ Fase 5 — Tarefas, Entregáveis & Timeline

### Tarefas
- Tabela/lista filtrável por agente, status, prioridade, data
- Kanban view: Pendente → Em Progresso → Verificação → Concluída → Erro
- Detalhe: agente, duração, custo, tokens, spans, resultado
- Bulk actions: reagendar, cancelar, reatribuir

### Entregáveis
- Lista de entregas: artefatos produzidos (relatórios, PRs, mensagens, deploys)
- Cards: tipo, agente, data, destinatário, status (entregue/pendente/falhou)
- Métricas: taxa no prazo, entregas por dia/semana, distribuição por tipo
- Timeline cronológica de entregas com filtros

### Timeline (Gantt)
- Visão horizontal de tarefas e missões ao longo do tempo
- Uma linha por agente mostrando tarefas em paralelo
- Marcos/milestones para entregas importantes
- Zoom: dia/semana/mês com scroll horizontal

---

## 🧠 Fase 6 — Memória & Finanças

### Memória (Inspetor L1-L5)
- Representação visual das 5 camadas: L1 (RAM) → L2 (Episódica) → L3 (Semântica) → L4 (Longo Prazo) → L5 (Métricas)
- Barras de preenchimento com contagem, tamanho em bytes, última atualização
- Preview de entradas recentes em cada camada
- Gráfico de tendência de crescimento por camada
- Filtro por agente

### Finanças
- Custo total + projeção para fim do mês
- Breakdown por provider (donut chart): OpenAI vs Anthropic vs Google vs Vercel
- Breakdown por modelo (tabela ordenada por custo)
- Custo por tarefa/agente (ranking)
- Tracker de tokens (gráfico de área: input vs output)
- Calculadora de ROI: tempo economizado × custo/hora manual vs custo tokens
- Alertas de orçamento: barras de progresso com limites
- P&L: receita vs custos, Net P&L do período

---

## 🔍 Fase 7 — Erros, Traces & Edge Functions

### Erros & Traces
- Painel de erros: lista com severidade, agente, span, mensagem, timestamp
- Taxa de erro (gráfico de tendência)
- Lista de traces: tabela pesquisável com nome, duração, status, spans
- Waterfall de spans estilo Jaeger (barras horizontais hierárquicas)
- Detalhe do span: atributos, eventos, tool calls, erros
- Histograma de distribuição de latência

### Supabase — 15 Tabelas
1. `agents` (hierarquia via parent_agent_id, provider, modelo, skills)
2. `agent_heartbeats` (status, memória L1-L5)
3. `agent_skills` (skills por agente com métricas)
4. `tasks` (duração, agente, prioridade, resultado)
5. `scheduled_tasks` (cron jobs)
6. `missions` (workflows com steps e progresso)
7. `mission_steps` (steps individuais com agente e status)
8. `deliverables` (artefatos entregues)
9. `traces` (traces OpenTelemetry)
10. `spans` (hierarquia e atributos)
11. `tool_executions` (log de ferramentas)
12. `provider_usage` (custo por requisição multi-provider)
13. `daily_cost_summary` (agregação diária)
14. `memory_snapshots` (estado L1-L5)
15. `agent_interactions` (mensagens e delegações entre agentes)

### Edge Functions (6 funções)
1. **`ingest-telemetry`** — batch de traces, spans, tool executions, interactions (endpoint principal, o agente na VM faz POST direto)
2. **`agent-heartbeat`** — status, sub-agentes, memória, skills (a cada 30-60s)
3. **`track-cost`** — custos multi-provider com normalização (OpenAI, Anthropic, Google, Vercel AI Gateway)
4. **`manage-missions`** — CRUD de missões, steps, entregáveis
5. **`dashboard-query`** — leituras otimizadas e agregações para o frontend
6. **`sync-providers`** — cron 15min para puxar dados do Vercel AI Gateway

### Integração VM → Dashboard
- Agente na VM faz HTTP POST direto para as Edge Functions
- Supabase Realtime entrega updates instantâneos ao dashboard (sem polling)
- Autenticação via API key no header `Authorization`

---

## Resultado Final
- ✅ 10 páginas funcionais com visual retro terminal Apple
- ✅ Sidebar enxuta colapsável com logo `>_ Revenue OS`
- ✅ Grafo 3D de skills dos agentes (React Three Fiber)
- ✅ Grafo de interações 2D com timeline
- ✅ Pipeline visual de missões/workflows
- ✅ Kanban de tarefas + Gantt de timeline
- ✅ Página de entregáveis com métricas
- ✅ Inspetor de memória L1-L5
- ✅ Dashboard financeiro completo com ROI e P&L
- ✅ Waterfall de traces OpenTelemetry
- ✅ 15 tabelas Supabase com RLS e Realtime
- ✅ 6 Edge Functions para ingestão de dados
- ✅ Sync em tempo real VM → Dashboard

