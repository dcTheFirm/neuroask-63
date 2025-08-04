export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      dashboard_analytics: {
        Row: {
          average_score: number | null
          created_at: string
          current_streak: number
          hours_practiced: number
          id: string
          last_session_date: string | null
          member_since: string | null
          total_sessions: number
          updated_at: string
          user_id: string
          week_start_date: string
          weekly_completed: number
          weekly_goal: number
        }
        Insert: {
          average_score?: number | null
          created_at?: string
          current_streak?: number
          hours_practiced?: number
          id?: string
          last_session_date?: string | null
          member_since?: string | null
          total_sessions?: number
          updated_at?: string
          user_id: string
          week_start_date?: string
          weekly_completed?: number
          weekly_goal?: number
        }
        Update: {
          average_score?: number | null
          created_at?: string
          current_streak?: number
          hours_practiced?: number
          id?: string
          last_session_date?: string | null
          member_since?: string | null
          total_sessions?: number
          updated_at?: string
          user_id?: string
          week_start_date?: string
          weekly_completed?: number
          weekly_goal?: number
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          analysis_data: Json | null
          completed_at: string | null
          configuration_id: string | null
          created_at: string
          detailed_feedback: string | null
          duration_seconds: number | null
          feedback_summary: string | null
          id: string
          overall_score: number | null
          questions_answered: number | null
          questions_data: Json | null
          recommendations: string[] | null
          session_type: string
          skill_breakdown: Json | null
          started_at: string
          status: string | null
          strengths: string[] | null
          total_questions: number | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          analysis_data?: Json | null
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
          detailed_feedback?: string | null
          duration_seconds?: number | null
          feedback_summary?: string | null
          id?: string
          overall_score?: number | null
          questions_answered?: number | null
          questions_data?: Json | null
          recommendations?: string[] | null
          session_type: string
          skill_breakdown?: Json | null
          started_at?: string
          status?: string | null
          strengths?: string[] | null
          total_questions?: number | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          analysis_data?: Json | null
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
          detailed_feedback?: string | null
          duration_seconds?: number | null
          feedback_summary?: string | null
          id?: string
          overall_score?: number | null
          questions_answered?: number | null
          questions_data?: Json | null
          recommendations?: string[] | null
          session_type?: string
          skill_breakdown?: Json | null
          started_at?: string
          status?: string | null
          strengths?: string[] | null
          total_questions?: number | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      text_interviews: {
        Row: {
          ai_feedback: string | null
          answered_at: string | null
          created_at: string
          id: string
          question_number: number
          question_text: string
          score: number | null
          session_id: string
          time_taken_seconds: number | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          question_number: number
          question_text: string
          score?: number | null
          session_id: string
          time_taken_seconds?: number | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          answered_at?: string | null
          created_at?: string
          id?: string
          question_number?: number
          question_text?: string
          score?: number | null
          session_id?: string
          time_taken_seconds?: number | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "text_interviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      User_accounts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          location: string | null
          preferred_industries: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          preferred_industries?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          preferred_industries?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_type: string | null
          created_at: string
          duration_minutes: number | null
          email: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          interview_type: string | null
          is_default: boolean | null
          job_role: string | null
          location: string | null
          name: string
          preferred_industries: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_type?: string | null
          created_at?: string
          duration_minutes?: number | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          interview_type?: string | null
          is_default?: boolean | null
          job_role?: string | null
          location?: string | null
          name: string
          preferred_industries?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_type?: string | null
          created_at?: string
          duration_minutes?: number | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          interview_type?: string | null
          is_default?: boolean | null
          job_role?: string | null
          location?: string | null
          name?: string
          preferred_industries?: string[] | null
          updated_at?: string
          user_id?: string
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
