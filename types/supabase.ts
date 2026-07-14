export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      external_tracking_deliveries: {
        Row: {
          attempt: number;
          channel: string;
          created_at: string;
          event_id: string;
          event_name: string;
          failed_at: string | null;
          id: string;
          last_error: string | null;
          lead_id: string | null;
          processing_started_at: string | null;
          provider: string;
          provider_event_id: string | null;
          queued_at: string | null;
          request_payload_hash: string | null;
          result_id: string | null;
          sent_at: string | null;
          session_id: string | null;
          status: string;
          test_event: boolean;
          tracking_event_id: string | null;
          updated_at: string;
        };
        Insert: {
          attempt?: number;
          channel: string;
          created_at?: string;
          event_id: string;
          event_name: string;
          failed_at?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id?: string | null;
          processing_started_at?: string | null;
          provider: string;
          provider_event_id?: string | null;
          queued_at?: string | null;
          request_payload_hash?: string | null;
          result_id?: string | null;
          sent_at?: string | null;
          session_id?: string | null;
          status?: string;
          test_event?: boolean;
          tracking_event_id?: string | null;
          updated_at?: string;
        };
        Update: {
          attempt?: number;
          channel?: string;
          created_at?: string;
          event_id?: string;
          event_name?: string;
          failed_at?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id?: string | null;
          processing_started_at?: string | null;
          provider?: string;
          provider_event_id?: string | null;
          queued_at?: string | null;
          request_payload_hash?: string | null;
          result_id?: string | null;
          sent_at?: string | null;
          session_id?: string | null;
          status?: string;
          test_event?: boolean;
          tracking_event_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "external_tracking_deliveries_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_tracking_deliveries_result_id_fkey";
            columns: ["result_id"];
            isOneToOne: false;
            referencedRelation: "quiz_results";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_tracking_deliveries_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "external_tracking_deliveries_tracking_event_id_fkey";
            columns: ["tracking_event_id"];
            isOneToOne: false;
            referencedRelation: "tracking_events";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          ad_id: string | null;
          adset_id: string | null;
          campaign_id: string | null;
          created_at: string | null;
          email: string;
          fbclid: string | null;
          full_name: string;
          gclid: string | null;
          id: string;
          ip_address: string | null;
          landing_page: string | null;
          phone: string;
          placement: string | null;
          referrer: string | null;
          site_source_name: string | null;
          status: string | null;
          updated_at: string | null;
          user_agent: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          utm_term: string | null;
        };
        Insert: {
          ad_id?: string | null;
          adset_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          email: string;
          fbclid?: string | null;
          full_name: string;
          gclid?: string | null;
          id?: string;
          ip_address?: string | null;
          landing_page?: string | null;
          phone: string;
          placement?: string | null;
          referrer?: string | null;
          site_source_name?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Update: {
          ad_id?: string | null;
          adset_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          email?: string;
          fbclid?: string | null;
          full_name?: string;
          gclid?: string | null;
          id?: string;
          ip_address?: string | null;
          landing_page?: string | null;
          phone?: string;
          placement?: string | null;
          referrer?: string | null;
          site_source_name?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          attempt: number;
          created_at: string | null;
          error_message: string | null;
          failed_at: string | null;
          id: string;
          last_error: string | null;
          lead_id: string | null;
          notification_type: string;
          payload_hash: string | null;
          priority: string;
          processing_started_at: string | null;
          provider: string;
          queued_at: string | null;
          recipient: string;
          result_id: string | null;
          sent_at: string | null;
          status: string;
        };
        Insert: {
          attempt?: number;
          created_at?: string | null;
          error_message?: string | null;
          failed_at?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id?: string | null;
          notification_type: string;
          payload_hash?: string | null;
          priority?: string;
          processing_started_at?: string | null;
          provider?: string;
          queued_at?: string | null;
          recipient: string;
          result_id?: string | null;
          sent_at?: string | null;
          status?: string;
        };
        Update: {
          attempt?: number;
          created_at?: string | null;
          error_message?: string | null;
          failed_at?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id?: string | null;
          notification_type?: string;
          payload_hash?: string | null;
          priority?: string;
          processing_started_at?: string | null;
          provider?: string;
          queued_at?: string | null;
          recipient?: string;
          result_id?: string | null;
          sent_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_logs_result_id_fkey";
            columns: ["result_id"];
            isOneToOne: false;
            referencedRelation: "quiz_results";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_answers: {
        Row: {
          answer_label: string;
          answer_value: string;
          benefit_context: string | null;
          created_at: string | null;
          id: string;
          lead_id: string | null;
          question_id: string;
          question_label: string;
          session_id: string | null;
        };
        Insert: {
          answer_label: string;
          answer_value: string;
          benefit_context?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          question_id: string;
          question_label: string;
          session_id?: string | null;
        };
        Update: {
          answer_label?: string;
          answer_value?: string;
          benefit_context?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          question_id?: string;
          question_label?: string;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_answers_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_answers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_results: {
        Row: {
          classification: string;
          created_at: string | null;
          ethical_disclaimer: string | null;
          id: string;
          lead_id: string | null;
          potential_benefit: string | null;
          score: number;
          session_id: string | null;
          summary: string | null;
        };
        Insert: {
          classification: string;
          created_at?: string | null;
          ethical_disclaimer?: string | null;
          id?: string;
          lead_id?: string | null;
          potential_benefit?: string | null;
          score?: number;
          session_id?: string | null;
          summary?: string | null;
        };
        Update: {
          classification?: string;
          created_at?: string | null;
          ethical_disclaimer?: string | null;
          id?: string;
          lead_id?: string | null;
          potential_benefit?: string | null;
          score?: number;
          session_id?: string | null;
          summary?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_results_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          id: string;
          lead_id: string | null;
          started_at: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          started_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          started_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      tracking_events: {
        Row: {
          ad_id: string | null;
          adset_id: string | null;
          campaign_id: string | null;
          created_at: string | null;
          event_name: string;
          event_payload: Json | null;
          fbclid: string | null;
          gclid: string | null;
          id: string;
          ip_address: string | null;
          landing_page: string | null;
          lead_id: string | null;
          placement: string | null;
          referrer: string | null;
          session_id: string | null;
          site_source_name: string | null;
          user_agent: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          utm_term: string | null;
        };
        Insert: {
          ad_id?: string | null;
          adset_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          event_name: string;
          event_payload?: Json | null;
          fbclid?: string | null;
          gclid?: string | null;
          id?: string;
          ip_address?: string | null;
          landing_page?: string | null;
          lead_id?: string | null;
          placement?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          site_source_name?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Update: {
          ad_id?: string | null;
          adset_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          event_name?: string;
          event_payload?: Json | null;
          fbclid?: string | null;
          gclid?: string | null;
          id?: string;
          ip_address?: string | null;
          landing_page?: string | null;
          lead_id?: string | null;
          placement?: string | null;
          referrer?: string | null;
          session_id?: string | null;
          site_source_name?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_events_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracking_events_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
