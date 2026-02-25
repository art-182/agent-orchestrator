import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";
import { useTraces } from "@/hooks/use-supabase-data";
import { parseJsonb } from "@/lib/parse-jsonb";

/* ── model colors ────────────────────────────────────────────── */
const MODEL_COLORS: Record<string, string> = {
  "claude-opus-4-6-thinking": "hsl(260, 67%, 70%)",
  "claude-sonnet-4":          "hsl(280, 60%, 65%)",
  "gemini-3-flash-preview":   "hsl(45, 93%, 56%)",
  "gemini-2.5-flash":         "hsl(35, 85%, 50%)",
  "gemini-2.5-pro":           "hsl(25, 80%, 55%)",
};
const FALLBACK_COLOR = "hsl(0, 0%, 50%)";

interface Span {
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  cache_read?: number;
  cost?: number;
}

export interface ModelStats {
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  totalCost: number;
  color: string;
}

interface HourlyBucket {
  hour: string;
  [model: string]: number | string;
}

const formatK = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

/** Shared hook — parse traces into model stats + hourly buckets */
export function useModelMetrics() {
  const { data: traces } = useTraces();

  return useMemo(() => {
    const traceList = traces ?? [];
    const modelMap = new Map<string, ModelStats>();
    const hourlyMap = new Map<string, Record<string, number>>();
    const modelSet = new Set<string>();
    let total = 0;

    for (const t of traceList) {
      const spans = parseJsonb<Span[]>(t.spans, []);
      const ts = (t.created_at ?? "").slice(0, 13);

      for (const s of spans) {
        const m = s.model ?? "unknown";
        modelSet.add(m);
        total++;

        if (!modelMap.has(m)) {
          modelMap.set(m, {
            model: m, calls: 0, inputTokens: 0, outputTokens: 0,
            cacheRead: 0, totalCost: 0,
            color: MODEL_COLORS[m] ?? FALLBACK_COLOR,
          });
        }
        const stats = modelMap.get(m)!;
        stats.calls++;
        stats.inputTokens += s.input_tokens ?? 0;
        stats.outputTokens += s.output_tokens ?? 0;
        stats.cacheRead += s.cache_read ?? 0;
        stats.totalCost += s.cost ?? 0;

        if (ts) {
          if (!hourlyMap.has(ts)) hourlyMap.set(ts, {});
          hourlyMap.get(ts)![m] = (hourlyMap.get(ts)![m] ?? 0) + 1;
        }
      }
    }

    const models = Array.from(modelMap.values()).sort((a, b) => b.calls - a.calls);
    const allModelKeys = Array.from(modelSet);
    const hourlyData: HourlyBucket[] = Array.from(hourlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24)
      .map(([hour, counts]) => ({ hour: hour.slice(5) + "h", ...counts }));

    return { models, hourlyData, allModelKeys, totalCalls: total };
  }, [traces]);
}

/** Hourly request volume chart — the "monitor" graph */
const ModelObservability = () => {
  const { hourlyData, allModelKeys, totalCalls, models } = useModelMetrics();

  return (
    <Card className="border-border/50 bg-card surface-elevated">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground tracking-tight">
          <div className="flex items-center gap-2.5">
            <div className="bg-violet/10 text-violet p-1.5 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
            Requests LLM / Hora
          </div>
          <span className="text-[11px] text-muted-foreground font-normal tabular-nums">
            {totalCalls} chamadas · {models.length} modelos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 11,
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {allModelKeys.map((m) => (
                <Bar
                  key={m}
                  dataKey={m}
                  name={m}
                  fill={MODEL_COLORS[m] ?? FALLBACK_COLOR}
                  radius={[3, 3, 0, 0]}
                  stackId="models"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelObservability;
