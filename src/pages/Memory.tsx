import { Brain, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition, StaggerContainer, FadeIn } from "@/components/animations/MotionPrimitives";
import { useMemoryEntries } from "@/hooks/use-supabase-data";
import { Skeleton } from "@/components/ui/skeleton";

const typeConfig: Record<string, { color: string; label: string }> = {
  fact: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Fato" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", label: "Decisão" },
  context: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Contexto" },
  preference: { color: "bg-amber/15 text-amber border-amber/30", label: "Preferência" },
  error_pattern: { color: "bg-rose/15 text-rose border-rose/30", label: "Erro" },
};

const knowledgeBases = [
  { name: "Codebase Context", entries: 1247, size: "2.4MB", lastUpdated: "14:32", category: "Code" },
  { name: "Security Findings", entries: 89, size: "340KB", lastUpdated: "14:31", category: "Security" },
  { name: "Architecture Decisions", entries: 34, size: "128KB", lastUpdated: "Feb 19", category: "Architecture" },
  { name: "API Schemas", entries: 56, size: "890KB", lastUpdated: "Feb 15", category: "API" },
  { name: "Deploy History", entries: 312, size: "1.1MB", lastUpdated: "14:20", category: "Ops" },
  { name: "Error Patterns", entries: 67, size: "210KB", lastUpdated: "14:29", category: "Debug" },
];

const categoryColor: Record<string, string> = {
  Code: "text-terminal", Security: "text-rose", Architecture: "text-violet",
  API: "text-cyan", Ops: "text-amber", Debug: "text-rose",
};

const Memory = () => {
  const { data: memoryEntries, isLoading } = useMemoryEntries();

  if (isLoading) {
    return (
      <PageTransition className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-terminal" />
          <h1 className="font-mono text-xl font-semibold text-foreground">Memória</h1>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </PageTransition>
    );
  }

  const list = memoryEntries ?? [];
  const totalAccess = list.reduce((s, m) => s + (m.access_count ?? 0), 0);
  const avgConfidence = list.length > 0 ? Math.round(list.reduce((s, m) => s + (m.confidence ?? 0), 0) / list.length) : 0;

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Memória</h1>
      </div>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Entradas", value: list.length.toString(), color: "text-foreground" },
          { label: "Acessos Total", value: totalAccess.toString(), color: "text-cyan" },
          { label: "Confiança Média", value: `${avgConfidence}%`, color: "text-terminal" },
          { label: "Knowledge Bases", value: knowledgeBases.length.toString(), color: "text-violet" },
        ].map((s) => (
          <FadeIn key={s.label}>
            <Card className="border-border bg-card">
              <CardContent className="p-3">
                <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </StaggerContainer>

      <Tabs defaultValue="entries">
        <TabsList className="font-mono">
          <TabsTrigger value="entries" className="font-mono text-xs">Entradas</TabsTrigger>
          <TabsTrigger value="knowledge" className="font-mono text-xs">Knowledge Bases</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-4">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-2">
              {list.map((entry) => {
                const tc = typeConfig[entry.type] ?? typeConfig.fact;
                const agent = entry.agents as any;
                return (
                  <Card key={entry.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${tc.color}`}>
                            {tc.label}
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">{agent?.emoji} {agent?.name}</span>
                        </div>
                        <span className={`font-mono text-[10px] font-semibold ${(entry.confidence ?? 0) >= 95 ? "text-terminal" : (entry.confidence ?? 0) >= 85 ? "text-amber" : "text-rose"}`}>
                          {entry.confidence}%
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {(entry.tags ?? []).map((tag) => (
                            <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{entry.access_count}x acessado</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {knowledgeBases.map((kb) => (
              <Card key={kb.name} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Database className={`h-4 w-4 ${categoryColor[kb.category] ?? "text-foreground"}`} />
                    <div>
                      <p className="font-mono text-xs font-semibold text-foreground">{kb.name}</p>
                      <p className="font-mono text-[9px] text-muted-foreground">{kb.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground">Entradas</p>
                      <p className="font-mono text-sm font-bold text-foreground">{kb.entries.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground">Tamanho</p>
                      <p className="font-mono text-sm font-bold text-foreground">{kb.size}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] text-muted-foreground">Atualizado</p>
                      <p className="font-mono text-sm font-bold text-foreground">{kb.lastUpdated}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default Memory;
