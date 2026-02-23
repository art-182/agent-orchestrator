export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          avg_time: string | null
          created_at: string
          current_task: string | null
          emoji: string
          error_rate: number | null
          id: string
          model: string
          name: string
          parent_id: string | null
          provider: string
          roi: Json | null
          skills: Json | null
          soul_md: string | null
          status: string
          tasks_completed: number | null
          total_cost: number | null
          updated_at: string
          uptime: string | null
        }
        Insert: {
          avg_time?: string | null
          created_at?: string
          current_task?: string | null
          emoji?: string
          error_rate?: number | null
          id: string
          model: string
          name: string
          parent_id?: string | null
          provider: string
          roi?: Json | null
          skills?: Json | null
          soul_md?: string | null
          status?: string
          tasks_completed?: number | null
          total_cost?: number | null
          updated_at?: string
          uptime?: string | null
        }
        Update: {
          avg_time?: string | null
          created_at?: string
          current_task?: string | null
          emoji?: string
          error_rate?: number | null
          id?: string
          model?: string
          name?: string
          parent_id?: string | null
          provider?: string
          roi?: Json | null
          skills?: Json | null
          soul_md?: string | null
          status?: string
          tasks_completed?: number | null
          total_cost?: number | null
          updated_at?: string
          uptime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_snapshots: {
        Row: {
          change: string | null
          created_at: string
          id: string
          label: string
          trend: string | null
          value: string
        }
        Insert: {
          change?: string | null
          created_at?: string
          id?: string
          label: string
          trend?: string | null
          value: string
        }
        Update: {
          change?: string | null
          created_at?: string
          id?: string
          label?: string
          trend?: string | null
          value?: string
        }
        Relationships: []
      }
      daily_costs: {
        Row: {
          anthropic: number | null
          created_at: string
          date: string
          google: number | null
          id: string
          openai: number | null
          total: number | null
        }
        Insert: {
          anthropic?: number | null
          created_at?: string
          date: string
          google?: number | null
          id?: string
          openai?: number | null
          total?: number | null
        }
        Update: {
          anthropic?: number | null
          created_at?: string
          date?: string
          google?: number | null
          id?: string
          openai?: number | null
          total?: number | null
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          agent_id: string | null
          created_at: string
          description: string | null
          files: number | null
          id: string
          lines_changed: number | null
          mission_id: string | null
          name: string
          status: string
          type: string
          url: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          files?: number | null
          id?: string
          lines_changed?: number | null
          mission_id?: string | null
          name: string
          status?: string
          type: string
          url?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          files?: number | null
          id?: string
          lines_changed?: number | null
          mission_id?: string | null
          name?: string
          status?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          created_at: string
          from_agent: string | null
          id: string
          latency: string | null
          message: string
          mission_id: string | null
          to_agent: string | null
          tokens: number | null
          type: string
        }
        Insert: {
          created_at?: string
          from_agent?: string | null
          id?: string
          latency?: string | null
          message: string
          mission_id?: string | null
          to_agent?: string | null
          tokens?: number | null
          type: string
        }
        Update: {
          created_at?: string
          from_agent?: string | null
          id?: string
          latency?: string | null
          message?: string
          mission_id?: string | null
          to_agent?: string | null
          tokens?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_from_agent_fkey"
            columns: ["from_agent"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_to_agent_fkey"
            columns: ["to_agent"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_entries: {
        Row: {
          access_count: number | null
          confidence: number | null
          content: string
          created_at: string
          id: string
          last_accessed: string | null
          source_agent: string | null
          tags: string[] | null
          type: string
        }
        Insert: {
          access_count?: number | null
          confidence?: number | null
          content: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          source_agent?: string | null
          tags?: string[] | null
          type: string
        }
        Update: {
          access_count?: number | null
          confidence?: number | null
          content?: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          source_agent?: string | null
          tags?: string[] | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_entries_source_agent_fkey"
            columns: ["source_agent"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          cost: number | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          name: string
          owner: string | null
          priority: string
          progress: number | null
          status: string
          tokens_used: number | null
          updated_at: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          owner?: string | null
          priority?: string
          progress?: number | null
          status?: string
          tokens_used?: number | null
          updated_at?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          owner?: string | null
          priority?: string
          progress?: number | null
          status?: string
          tokens_used?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          agent_id: string | null
          cost: number | null
          created_at: string
          duration: string | null
          id: string
          mission_id: string | null
          name: string
          priority: string
          status: string
          tokens: number | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string
          duration?: string | null
          id?: string
          mission_id?: string | null
          name: string
          priority?: string
          status?: string
          tokens?: number | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          cost?: number | null
          created_at?: string
          duration?: string | null
          id?: string
          mission_id?: string | null
          name?: string
          priority?: string
          status?: string
          tokens?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          agent_id: string | null
          created_at: string
          description: string | null
          id: string
          mission_id: string | null
          title: string
          type: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_id?: string | null
          title: string
          type: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mission_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      traces: {
        Row: {
          agent_id: string | null
          created_at: string
          duration: string | null
          error: string | null
          id: string
          name: string
          spans: Json | null
          status: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          duration?: string | null
          error?: string | null
          id?: string
          name: string
          spans?: Json | null
          status?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          duration?: string | null
          error?: string | null
          id?: string
          name?: string
          spans?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "traces_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
