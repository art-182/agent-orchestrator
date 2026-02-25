import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useAgents = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        queryClient.invalidateQueries({ queryKey: ["agents"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
};

export const useMissions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        queryClient.invalidateQueries({ queryKey: ["missions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useTasks = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*, agents(name, emoji), missions(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useInteractions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ["interactions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["interactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactions")
        .select("*, from:agents!interactions_from_agent_fkey(name, emoji), to:agents!interactions_to_agent_fkey(name, emoji), missions(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useDeliverables = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-deliverables')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverables' }, () => {
        queryClient.invalidateQueries({ queryKey: ["deliverables"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["deliverables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deliverables").select("*, agents(name, emoji), missions(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useMemoryEntries = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-memory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memory_entries' }, () => {
        queryClient.invalidateQueries({ queryKey: ["memory_entries"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["memory_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("memory_entries").select("*, agents:source_agent(name, emoji)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useTraces = () =>
  useQuery({
    queryKey: ["traces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traces").select("*, agents:agent_id(name, emoji)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTimelineEvents = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes-timeline')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_events' }, () => {
        queryClient.invalidateQueries({ queryKey: ["timeline_events"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["timeline_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("timeline_events").select("*, agents:agent_id(name, emoji), missions:mission_id(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useDailyCosts = () =>
  useQuery({
    queryKey: ["daily_costs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_costs").select("*").order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useBillingSnapshots = () =>
  useQuery({
    queryKey: ["billing_snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("billing_snapshots").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const useTasksByMission = (missionId: string | null) =>
  useQuery({
    queryKey: ["tasks", "mission", missionId],
    queryFn: async () => {
      let query = supabase.from("tasks").select("*, agents(name, emoji), missions(name)").order("created_at", { ascending: false });
      if (missionId) query = query.eq("mission_id", missionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

// ── Finance hooks (replacing mock data) ────────────────

export const useModelPricing = () =>
  useQuery({
    queryKey: ["model_pricing"],
    queryFn: async () => {
      const { data, error } = await supabase.from("model_pricing").select("*").order("total_cost", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useDailyTokenUsage = () =>
  useQuery({
    queryKey: ["daily_token_usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_token_usage").select("*").order("date");
      if (error) throw error;
      return data;
    },
  });

export const useToolCosts = () =>
  useQuery({
    queryKey: ["tool_costs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tool_costs").select("*").order("cost", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useSkillCosts = () =>
  useQuery({
    queryKey: ["skill_costs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skill_costs").select("*").order("cost", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProviderLimits = () =>
  useQuery({
    queryKey: ["provider_limits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("provider_limits").select("*").order("monthly_spent", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMonthlyProjections = () =>
  useQuery({
    queryKey: ["monthly_projections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("monthly_projections").select("*").order("month");
      if (error) throw error;
      return data;
    },
  });

export const useRateLimitEvents = () =>
  useQuery({
    queryKey: ["rate_limit_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_limit_events").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useCostAnomalies = () =>
  useQuery({
    queryKey: ["cost_anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_anomalies").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useProviderBreakdown = () =>
  useQuery({
    queryKey: ["provider_breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.from("provider_breakdown").select("*").order("value", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
