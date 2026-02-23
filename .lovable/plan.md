

# Revenue OS 2.0 — Fase 2: Command Center + Agentes

A Fase 1 (design system, sidebar, routing) esta concluida e funcionando. Agora vamos construir as duas primeiras paginas com dados demo, usando exclusivamente **Tailwind CSS** e **shadcn/ui**.

---

## 1. Command Center (Home `/`)

### 1.1 Barra de Status Superior
- 4 mini-badges usando `Badge` do shadcn: Agentes Online, Taxa de Sucesso, Custo/Hora, Uptime
- Layout: `flex gap-3` com icones Lucide e valores em `font-mono`

### 1.2 Grid de Metricas (4 cards)
- Componente `MetricCard` usando `Card`, `CardHeader`, `CardContent` do shadcn
- Metricas: Tarefas Hoje, Tokens Consumidos, Custo Acumulado, Tempo Economizado
- Cada card com: icone, valor grande em `font-mono`, label, e sparkline miniatura (Recharts `LineChart` de 30px de altura, sem eixos)
- Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`

### 1.3 Live Feed Terminal
- Componente `LiveFeed` usando `Card` + `ScrollArea` do shadcn
- Lista de eventos mock com: timestamp (`font-mono text-xs text-muted-foreground`), agente (badge colorido), acao, resultado, custo
- Auto-scroll para baixo, max 50 eventos vissiveis
- Estetica terminal: fundo levemente diferente, linhas com hover sutil

### 1.4 Status dos Providers
- Componente `ProviderStatus` com 4 cards pequenos (OpenAI, Anthropic, Google, Vercel)
- Cada um com: nome, dot de status (verde/amarelo/vermelho via `animate-pulse-dot`), latencia em ms
- Layout: `grid grid-cols-2 lg:grid-cols-4 gap-3`

### Layout geral da pagina
```text
[============ Barra de Status ============]
[Card1] [Card2] [Card3] [Card4]   <- metricas
[====== Live Feed ======] [Providers]     <- 2 colunas
```
- Grid principal: `grid grid-cols-1 lg:grid-cols-3 gap-6` (feed ocupa 2 cols, providers 1 col)

---

## 2. Pagina de Agentes (`/agents`)

### 2.1 Grid de Cards de Agentes
- Componente `AgentCard` usando `Card` do shadcn
- Dados mock: 6 agentes (OraCLI Main, Scout, Coder, Reviewer, Deployer, Analyst)
- Cada card mostra: emoji/icone, nome, status badge (`Badge` variant), tarefa atual, modelo (ex: gpt-4o), provider
- Status com cores: online=terminal, busy=amber, idle=muted, error=rose
- Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### 2.2 Metricas por Agente
- Abaixo do grid: `Tabs` do shadcn com abas "Visao Geral" e "Desempenho"
- Tab Visao Geral: hierarquia de agentes (lista indentada com icones, usando `Collapsible` do shadcn)
- Tab Desempenho: tabela (`Table` do shadcn) com colunas: Agente, Tarefas, Tempo Medio, Taxa Erro, Custo Total

### 2.3 Drawer de Detalhe do Agente
- Ao clicar num card, abre `Sheet` do shadcn (lado direito)
- Mostra: nome, modelo, provider, uptime, historico recente (lista de tarefas), metricas detalhadas
- Preparado para receber o grafo 3D de skills na Fase 3

---

## 3. Dados Mock

Criar `src/lib/mock-data.ts` com dados estaticos para:
- 6 agentes com status, modelo, provider, metricas
- 20 eventos do live feed com timestamps
- Metricas agregadas (tarefas, tokens, custos)
- 4 providers com status e latencia

---

## 4. Componentes a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/mock-data.ts` | Dados demo estaticos |
| `src/components/dashboard/MetricCard.tsx` | Card de metrica com sparkline |
| `src/components/dashboard/LiveFeed.tsx` | Feed terminal com ScrollArea |
| `src/components/dashboard/ProviderStatus.tsx` | Grid de status dos providers |
| `src/components/dashboard/StatusBar.tsx` | Barra de status superior |
| `src/components/agents/AgentCard.tsx` | Card individual do agente |
| `src/components/agents/AgentGrid.tsx` | Grid de todos os agentes |
| `src/components/agents/AgentDetailSheet.tsx` | Sheet lateral com detalhes |
| `src/components/agents/AgentPerformanceTable.tsx` | Tabela de metricas |
| `src/pages/CommandCenter.tsx` | Pagina atualizada com componentes |
| `src/pages/Agents.tsx` | Pagina atualizada com componentes |

---

## 5. Componentes shadcn/ui Utilizados

- `Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Badge`
- `ScrollArea`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`
- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- `Separator`
- `Tooltip` (para icones)
- Recharts (`LineChart`, `AreaChart`) para sparklines e graficos

Todos ja instalados no projeto. Apenas Tailwind CSS para estilizacao — sem CSS custom adicional.

---

## 6. Secao Tecnica

- Sparklines: `recharts` `LineChart` com `width={80} height={30}`, sem `XAxis`/`YAxis`/`CartesianGrid`, apenas `Line` com `stroke="hsl(var(--terminal))"` e `strokeWidth={1.5}`
- Cores de status mapeadas via objeto: `{ online: "text-terminal", busy: "text-amber", idle: "text-muted-foreground", error: "text-rose" }`
- Feed items com `key` baseado em timestamp + index
- Sheet controlado via `useState<string | null>` (ID do agente selecionado)
- Todos os componentes tipados com TypeScript interfaces

