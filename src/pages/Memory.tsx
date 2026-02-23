import { Brain, Database, FileText, MessageSquare, Search, Tag, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MemoryEntry {
  id: string;
  type: "fact" | "decision" | "context" | "preference" | "error_pattern";
  content: string;
  source: string;
  sourceEmoji: string;
  created: string;
  accessCount: number;
  lastAccessed: string;
  tags: string[];
  confidence: number;
}

interface KnowledgeBase {
  name: string;
  entries: number;
  size: string;
  lastUpdated: string;
  category: string;
}

const memoryEntries: MemoryEntry[] = [
  { id: "m1", type: "fact", content: "O projeto usa TypeScript strict mode com ESLint flat config.", source: "Coder", sourceEmoji: "💻", created: "Feb 18", accessCount: 47, lastAccessed: "14:32", tags: ["typescript", "config"], confidence: 99 },
  { id: "m2", type: "decision", content: "JWT tokens usam RS256 com key rotation a cada 24h. Decidido em Auth Feature v2.", source: "OraCLI Main", sourceEmoji: "🧠", created: "Feb 19", accessCount: 23, lastAccessed: "14:28", tags: ["auth", "security", "jwt"], confidence: 97 },
  { id: "m3", type: "context", content: "API de métricas (metrics.internal.io) apresenta timeouts frequentes entre 14h-15h UTC.", source: "Analyst", sourceEmoji: "📊", created: "Feb 20", accessCount: 12, lastAccessed: "14:29", tags: ["api", "metrics", "reliability"], confidence: 85 },
  { id: "m4", type: "preference", content: "Code reviews devem priorizar: bugs > perf > style. Reviewer prefere sugestões construtivas.", source: "Reviewer", sourceEmoji: "📝", created: "Feb 01", accessCount: 89, lastAccessed: "14:30", tags: ["review", "standards"], confidence: 98 },
  { id: "m5", type: "error_pattern", content: "jsonwebtoken@8.5.1 tem CVE-2022-23529 (JWT verification bypass). Upgrade para v9.0.2+.", source: "Scout", sourceEmoji: "🔍", created: "Feb 21", accessCount: 8, lastAccessed: "14:31", tags: ["security", "cve", "npm"], confidence: 100 },
  { id: "m6", type: "fact", content: "Staging deploy usa blue-green strategy com health check interval de 10s.", source: "Deployer", sourceEmoji: "🚀", created: "Feb 15", accessCount: 34, lastAccessed: "14:20", tags: ["deploy", "staging", "infra"], confidence: 96 },
  { id: "m7", type: "decision", content: "Cache layer usa Redis com TTL de 5min para queries frequentes. LRU eviction.", source: "Coder", sourceEmoji: "💻", created: "Feb 12", accessCount: 19, lastAccessed: "14:15", tags: ["cache", "redis", "performance"], confidence: 94 },
  { id: "m8", type: "context", content: "Anthropic rate limit é 2000 RPM para claude-3.5-sonnet no tier Scale. Fallback: gpt-4o-mini.", source: "OraCLI Main", sourceEmoji: "🧠", created: "Feb 10", accessCount: 56, lastAccessed: "14:32", tags: ["provider", "rate-limit", "anthropic"], confidence: 100 },
  { id: "m9", type: "error_pattern", content: "N+1 queries no UserService.findWithRoles() causam latência >2s em produção.", source: "Analyst", sourceEmoji: "📊", created: "Feb 08", accessCount: 6, lastAccessed: "Feb 20", tags: ["performance", "database", "n+1"], confidence: 88 },
  { id: "m10", type: "preference", content: "Commits seguem Conventional Commits. feat/fix/chore/refactor como prefixos.", source: "Coder", sourceEmoji: "💻", created: "Feb 01", accessCount: 142, lastAccessed: "14:32", tags: ["git", "conventions"], confidence: 100 },
];

const knowledgeBases: KnowledgeBase[] = [
  { name: "Codebase Context", entries: 1247, size: "2.4MB", lastUpdated: "14:32", category: "Code" },
  { name: "Security Findings", entries: 89, size: "340KB", lastUpdated: "14:31", category: "Security" },
  { name: "Architecture Decisions", entries: 34, size: "128KB", lastUpdated: "Feb 19", category: "Architecture" },
  { name: "API Schemas", entries: 56, size: "890KB", lastUpdated: "Feb 15", category: "API" },
  { name: "Deploy History", entries: 312, size: "1.1MB", lastUpdated: "14:20", category: "Ops" },
  { name: "Error Patterns", entries: 67, size: "210KB", lastUpdated: "14:29", category: "Debug" },
];

const typeConfig: Record<string, { color: string; label: string }> = {
  fact: { color: "bg-terminal/15 text-terminal border-terminal/30", label: "Fato" },
  decision: { color: "bg-violet/15 text-violet border-violet/30", label: "Decisão" },
  context: { color: "bg-cyan/15 text-cyan border-cyan/30", label: "Contexto" },
  preference: { color: "bg-amber/15 text-amber border-amber/30", label: "Preferência" },
  error_pattern: { color: "bg-rose/15 text-rose border-rose/30", label: "Erro" },
};

const categoryColor: Record<string, string> = {
  Code: "text-terminal",
  Security: "text-rose",
  Architecture: "text-violet",
  API: "text-cyan",
  Ops: "text-amber",
  Debug: "text-rose",
};

const Memory = () => {
  const totalEntries = memoryEntries.length;
  const totalAccess = memoryEntries.reduce((s, m) => s + m.accessCount, 0);
  const avgConfidence = Math.round(memoryEntries.reduce((s, m) => s + m.confidence, 0) / memoryEntries.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-terminal" />
        <h1 className="font-mono text-xl font-semibold text-foreground">Memória</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Entradas", value: totalEntries.toString(), color: "text-foreground" },
          { label: "Acessos Total", value: totalAccess.toString(), color: "text-cyan" },
          { label: "Confiança Média", value: `${avgConfidence}%`, color: "text-terminal" },
          { label: "Knowledge Bases", value: knowledgeBases.length.toString(), color: "text-violet" },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-3">
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="entries">
        <TabsList className="font-mono">
          <TabsTrigger value="entries" className="font-mono text-xs">Entradas</TabsTrigger>
          <TabsTrigger value="knowledge" className="font-mono text-xs">Knowledge Bases</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="mt-4">
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-2">
              {memoryEntries.map((entry) => {
                const tc = typeConfig[entry.type];
                return (
                  <Card key={entry.id} className="border-border bg-card hover:border-muted-foreground/30 transition-colors">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`font-mono text-[8px] px-1.5 py-0 border ${tc.color}`}>
                            {tc.label}
                          </Badge>
                          <span className="font-mono text-[10px] text-muted-foreground">{entry.sourceEmoji} {entry.source}</span>
                          <span className="font-mono text-[9px] text-muted-foreground">· {entry.created}</span>
                        </div>
                        <span className={`font-mono text-[10px] font-semibold ${entry.confidence >= 95 ? "text-terminal" : entry.confidence >= 85 ? "text-amber" : "text-rose"}`}>
                          {entry.confidence}%
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-foreground">{entry.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{entry.accessCount}x acessado · {entry.lastAccessed}</span>
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
    </div>
  );
};

export default Memory;
