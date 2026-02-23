import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAgents = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const useMissions = () =>
  useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTasks = () =>
  useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*, agents(name, emoji), missions(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useInteractions = () =>
  useQuery({
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

export const useDeliverables = () =>
  useQuery({
    queryKey: ["deliverables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("deliverables").select("*, agents(name, emoji), missions(name), url").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useMemoryEntries = () =>
  useQuery({
    queryKey: ["memory_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("memory_entries").select("*, agents:source_agent(name, emoji)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTraces = () =>
  useQuery({
    queryKey: ["traces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("traces").select("*, agents:agent_id(name, emoji)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useTimelineEvents = () =>
  useQuery({
    queryKey: ["timeline_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("timeline_events").select("*, agents:agent_id(name, emoji), missions:mission_id(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
