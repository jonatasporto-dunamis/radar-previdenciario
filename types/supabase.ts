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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
            foreignKeyName: "external_tracking_deliveries_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
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
      lead_notes: {
        Row: {
          author_user_id: string;
          body: string;
          created_at: string;
          id: string;
          lead_id: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          author_user_id: string;
          body: string;
          created_at?: string;
          id?: string;
          lead_id: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          author_user_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          lead_id?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_notes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_status_history: {
        Row: {
          changed_by_user_id: string;
          created_at: string;
          from_status: string | null;
          id: string;
          lead_id: string;
          reason: string | null;
          tenant_id: string;
          to_status: string;
        };
        Insert: {
          changed_by_user_id: string;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          lead_id: string;
          reason?: string | null;
          tenant_id: string;
          to_status: string;
        };
        Update: {
          changed_by_user_id?: string;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          lead_id?: string;
          reason?: string | null;
          tenant_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_status_history_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lead_status_history_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          utm_term?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          {
            foreignKeyName: "notification_logs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      office_audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          tenant_id: string;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
          tenant_id: string;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "office_audit_logs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          {
            foreignKeyName: "quiz_answers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_results: {
        Row: {
          classification: string;
          created_at: string | null;
          data_completeness: string;
          ethical_disclaimer: string | null;
          id: string;
          lead_id: string | null;
          matched_rules: Json;
          missing_critical_answers: Json;
          potential_benefit: string | null;
          quiz_template_id: string | null;
          quiz_template_version: number | null;
          requires_human_review: boolean;
          score: number;
          session_id: string | null;
          summary: string | null;
          template_type: string | null;
          tenant_id: string;
          topic: string | null;
        };
        Insert: {
          classification: string;
          created_at?: string | null;
          data_completeness?: string;
          ethical_disclaimer?: string | null;
          id?: string;
          lead_id?: string | null;
          matched_rules?: Json;
          missing_critical_answers?: Json;
          potential_benefit?: string | null;
          quiz_template_id?: string | null;
          quiz_template_version?: number | null;
          requires_human_review?: boolean;
          score?: number;
          session_id?: string | null;
          summary?: string | null;
          template_type?: string | null;
          tenant_id: string;
          topic?: string | null;
        };
        Update: {
          classification?: string;
          created_at?: string | null;
          data_completeness?: string;
          ethical_disclaimer?: string | null;
          id?: string;
          lead_id?: string | null;
          matched_rules?: Json;
          missing_critical_answers?: Json;
          potential_benefit?: string | null;
          quiz_template_id?: string | null;
          quiz_template_version?: number | null;
          requires_human_review?: boolean;
          score?: number;
          session_id?: string | null;
          summary?: string | null;
          template_type?: string | null;
          tenant_id?: string;
          topic?: string | null;
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
            foreignKeyName: "quiz_results_quiz_template_id_fkey";
            columns: ["quiz_template_id"];
            isOneToOne: false;
            referencedRelation: "quiz_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: true;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_results_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
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
          quiz_template_id: string | null;
          quiz_template_version: number | null;
          started_at: string | null;
          status: string | null;
          template_type: string | null;
          tenant_id: string;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          quiz_template_id?: string | null;
          quiz_template_version?: number | null;
          started_at?: string | null;
          status?: string | null;
          template_type?: string | null;
          tenant_id: string;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string | null;
          quiz_template_id?: string | null;
          quiz_template_version?: number | null;
          started_at?: string | null;
          status?: string | null;
          template_type?: string | null;
          tenant_id?: string;
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
          {
            foreignKeyName: "quiz_sessions_quiz_template_id_fkey";
            columns: ["quiz_template_id"];
            isOneToOne: false;
            referencedRelation: "quiz_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_sessions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_template_questions: {
        Row: {
          allows_unknown: boolean;
          allows_withheld: boolean;
          conditions: Json;
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          is_required: boolean;
          is_sensitive: boolean;
          metadata: Json;
          options: Json;
          question_key: string;
          question_type: string;
          quiz_template_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          allows_unknown?: boolean;
          allows_withheld?: boolean;
          conditions?: Json;
          created_at?: string;
          description?: string | null;
          display_order: number;
          id?: string;
          is_required?: boolean;
          is_sensitive?: boolean;
          metadata?: Json;
          options?: Json;
          question_key: string;
          question_type: string;
          quiz_template_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          allows_unknown?: boolean;
          allows_withheld?: boolean;
          conditions?: Json;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          is_sensitive?: boolean;
          metadata?: Json;
          options?: Json;
          question_key?: string;
          question_type?: string;
          quiz_template_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_template_questions_quiz_template_id_fkey";
            columns: ["quiz_template_id"];
            isOneToOne: false;
            referencedRelation: "quiz_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_template_rules: {
        Row: {
          conditions: Json;
          created_at: string;
          effects: Json;
          id: string;
          priority: number;
          quiz_template_id: string;
          rule_key: string;
          rule_type: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          conditions?: Json;
          created_at?: string;
          effects?: Json;
          id?: string;
          priority?: number;
          quiz_template_id: string;
          rule_key: string;
          rule_type?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          conditions?: Json;
          created_at?: string;
          effects?: Json;
          id?: string;
          priority?: number;
          quiz_template_id?: string;
          rule_key?: string;
          rule_type?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_template_rules_quiz_template_id_fkey";
            columns: ["quiz_template_id"];
            isOneToOne: false;
            referencedRelation: "quiz_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_template_versions: {
        Row: {
          created_at: string;
          created_by_user_id: string | null;
          id: string;
          quiz_template_id: string;
          snapshot: Json;
          status: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          created_by_user_id?: string | null;
          id?: string;
          quiz_template_id: string;
          snapshot: Json;
          status?: string;
          version: number;
        };
        Update: {
          created_at?: string;
          created_by_user_id?: string | null;
          id?: string;
          quiz_template_id?: string;
          snapshot?: Json;
          status?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_template_versions_quiz_template_id_fkey";
            columns: ["quiz_template_id"];
            isOneToOne: false;
            referencedRelation: "quiz_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_templates: {
        Row: {
          audience: string | null;
          category: string;
          created_at: string;
          created_by_user_id: string | null;
          description: string;
          id: string;
          is_default: boolean;
          metadata: Json;
          name: string;
          ownership: string;
          slug: string;
          source: string;
          status: string;
          template_type: string;
          tenant_id: string | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          audience?: string | null;
          category?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          description: string;
          id?: string;
          is_default?: boolean;
          metadata?: Json;
          name: string;
          ownership?: string;
          slug: string;
          source: string;
          status?: string;
          template_type: string;
          tenant_id?: string | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          audience?: string | null;
          category?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          description?: string;
          id?: string;
          is_default?: boolean;
          metadata?: Json;
          name?: string;
          ownership?: string;
          slug?: string;
          source?: string;
          status?: string;
          template_type?: string;
          tenant_id?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_templates_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_domains: {
        Row: {
          created_at: string;
          hostname: string;
          id: string;
          is_primary: boolean;
          metadata: Json;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          hostname: string;
          id?: string;
          is_primary?: boolean;
          metadata?: Json;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          hostname?: string;
          id?: string;
          is_primary?: boolean;
          metadata?: Json;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          is_default: boolean;
          job_title: string | null;
          last_access_at: string | null;
          role: string;
          status: string;
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_default?: boolean;
          job_title?: string | null;
          last_access_at?: string | null;
          role?: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          is_default?: boolean;
          job_title?: string | null;
          last_access_at?: string | null;
          role?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_secrets: {
        Row: {
          created_at: string;
          encrypted_value: string;
          id: string;
          secret_key: string;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          encrypted_value: string;
          id?: string;
          secret_key: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          encrypted_value?: string;
          id?: string;
          secret_key?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_secrets_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_tracking_configs: {
        Row: {
          consent_required: boolean;
          created_at: string;
          enabled: boolean;
          event_config: Json;
          external_tracking_dry_run: boolean;
          ga4_enabled: boolean;
          ga4_measurement_id: string | null;
          gtm_container_id: string | null;
          gtm_enabled: boolean;
          id: string;
          meta_api_version: string;
          meta_enabled: boolean;
          meta_pixel_id: string | null;
          meta_test_mode: boolean;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          consent_required?: boolean;
          created_at?: string;
          enabled?: boolean;
          event_config?: Json;
          external_tracking_dry_run?: boolean;
          ga4_enabled?: boolean;
          ga4_measurement_id?: string | null;
          gtm_container_id?: string | null;
          gtm_enabled?: boolean;
          id?: string;
          meta_api_version?: string;
          meta_enabled?: boolean;
          meta_pixel_id?: string | null;
          meta_test_mode?: boolean;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          consent_required?: boolean;
          created_at?: string;
          enabled?: boolean;
          event_config?: Json;
          external_tracking_dry_run?: boolean;
          ga4_enabled?: boolean;
          ga4_measurement_id?: string | null;
          gtm_container_id?: string | null;
          gtm_enabled?: boolean;
          id?: string;
          meta_api_version?: string;
          meta_enabled?: boolean;
          meta_pixel_id?: string | null;
          meta_test_mode?: boolean;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_tracking_configs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: true;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          is_default: boolean;
          legal_name: string;
          locale: string;
          metadata: Json;
          name: string;
          slug: string;
          status: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_default?: boolean;
          legal_name: string;
          locale?: string;
          metadata?: Json;
          name: string;
          slug: string;
          status?: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_default?: boolean;
          legal_name?: string;
          locale?: string;
          metadata?: Json;
          name?: string;
          slug?: string;
          status?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          {
            foreignKeyName: "tracking_events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
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
