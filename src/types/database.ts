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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      article_analyses: {
        Row: {
          content_analysis: Json | null
          created_at: string | null
          id: string
          page_id: string | null
          seo_check: Json | null
          serp_analysis: Json | null
          structure_check: Json | null
          suggestions: Json | null
          url: string | null
          user_id: string
        }
        Insert: {
          content_analysis?: Json | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          seo_check?: Json | null
          serp_analysis?: Json | null
          structure_check?: Json | null
          suggestions?: Json | null
          url?: string | null
          user_id: string
        }
        Update: {
          content_analysis?: Json | null
          created_at?: string | null
          id?: string
          page_id?: string | null
          seo_check?: Json | null
          serp_analysis?: Json | null
          structure_check?: Json | null
          suggestions?: Json | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_analyses_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_statuses: {
        Row: {
          id: string
          notes: string | null
          optimized_at: string | null
          page_id: string | null
          status: string | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          optimized_at?: string | null
          page_id?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          optimized_at?: string | null
          page_id?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_statuses_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_statuses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          briefing_data: Json | null
          created_at: string | null
          id: string
          main_keyword: string
          secondary_keywords: string[] | null
          serp_data: Json | null
          user_id: string
        }
        Insert: {
          briefing_data?: Json | null
          created_at?: string | null
          id?: string
          main_keyword: string
          secondary_keywords?: string[] | null
          serp_data?: Json | null
          user_id: string
        }
        Update: {
          briefing_data?: Json | null
          created_at?: string | null
          id?: string
          main_keyword?: string
          secondary_keywords?: string[] | null
          serp_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gsc_connections: {
        Row: {
          created_at: string | null
          google_access_token: string | null
          google_refresh_token: string | null
          id: string
          last_synced_at: string | null
          property_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          id?: string
          last_synced_at?: string | null
          property_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          id?: string
          last_synced_at?: string | null
          property_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsc_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gsc_imports: {
        Row: {
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          id: string
          property_url: string | null
          source: string | null
          total_keywords: number | null
          total_pages: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          property_url?: string | null
          source?: string | null
          total_keywords?: number | null
          total_pages?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          property_url?: string | null
          source?: string | null
          total_keywords?: number | null
          total_pages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsc_imports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          clicks: number | null
          created_at: string | null
          ctr: number | null
          id: string
          import_id: string
          impressions: number | null
          keyword: string
          page_id: string
          position: number | null
          user_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          import_id: string
          impressions?: number | null
          keyword: string
          page_id: string
          position?: number | null
          user_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          import_id?: string
          impressions?: number | null
          keyword?: string
          page_id?: string
          position?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "gsc_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywords_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keywords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          category: string | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          estimated_potential: number | null
          id: string
          import_id: string
          impressions: number | null
          keyword_count: number | null
          position: number | null
          score: number | null
          sub_scores: Json | null
          url: string
          user_id: string
        }
        Insert: {
          category?: string | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          estimated_potential?: number | null
          id?: string
          import_id: string
          impressions?: number | null
          keyword_count?: number | null
          position?: number | null
          score?: number | null
          sub_scores?: Json | null
          url: string
          user_id: string
        }
        Update: {
          category?: string | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          estimated_potential?: number | null
          id?: string
          import_id?: string
          impressions?: number | null
          keyword_count?: number | null
          position?: number | null
          score?: number | null
          sub_scores?: Json | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "gsc_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
