export interface Database {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string;
          phone_number: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          phone_number: string;
          name?: string | null;
          email?: string | null;
        };
        Update: {
          phone_number?: string;
          name?: string | null;
          email?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          status: "draft" | "scheduled" | "sent" | "failed";
          scheduled_at: string | null;
          sent_at: string | null;
          contact_count: number;
          successful_count: number;
          failed_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          message: string;
          status?: "draft" | "scheduled" | "sent" | "failed";
          scheduled_at?: string | null;
        };
        Update: {
          title?: string;
          message?: string;
          status?: "draft" | "scheduled" | "sent" | "failed";
          scheduled_at?: string | null;
          sent_at?: string | null;
          contact_count?: number;
          successful_count?: number;
          failed_count?: number;
        };
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          contact_id: string;
          status: "pending" | "sent" | "failed";
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          contact_id: string;
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
        };
        Update: {
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
        };
      };
      message_logs: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string;
          contact_id: string;
          recipient_name: string | null;
          phone_number: string;
          message_text: string;
          status: "pending" | "sent" | "delivered" | "failed";
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          provider_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          contact_id: string;
          recipient_name?: string | null;
          phone_number: string;
          message_text: string;
          status?: "pending" | "sent" | "delivered" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          provider_message_id?: string | null;
        };
        Update: {
          status?: "pending" | "sent" | "delivered" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          provider_message_id?: string | null;
        };
      };
      message_variations: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string;
          original_message: string;
          enhanced_message: string;
          enhancement_type: "personalize" | "tone" | "summarize" | "clarity" | "translate";
          enhancement_params: Record<string, string | number> | null;
          ai_model: string;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          total_tokens: number | null;
          cost_cents: number | null;
          status: "success" | "failed" | "rate_limited";
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          campaign_id: string;
          original_message: string;
          enhanced_message: string;
          enhancement_type: "personalize" | "tone" | "summarize" | "clarity" | "translate";
          enhancement_params?: Record<string, string | number> | null;
          ai_model?: string;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          cost_cents?: number | null;
          status?: "success" | "failed" | "rate_limited";
          error_message?: string | null;
        };
        Update: {
          enhanced_message?: string;
          status?: "success" | "failed" | "rate_limited";
          error_message?: string | null;
        };
      };
      ai_usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          enhancement_type: string;
          ai_model: string;
          total_tokens: number;
          cost_cents: number;
          status: "success" | "failed" | "rate_limited";
          created_at: string;
        };
        Insert: {
          enhancement_type: string;
          ai_model: string;
          total_tokens: number;
          cost_cents: number;
          status?: "success" | "failed" | "rate_limited";
        };
        Update: {
          status?: "success" | "failed" | "rate_limited";
        };
      };
      sms_gateway_settings: {
        Row: {
          id: string;
          user_id: string;
          active_gateway: "twilio" | "infobip";
          twilio_account_sid: string | null;
          twilio_auth_token: string | null;
          twilio_phone_number: string | null;
          infobip_api_key: string | null;
          infobip_base_url: string | null;
          infobip_sender_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          active_gateway: "twilio" | "infobip";
          twilio_account_sid?: string | null;
          twilio_auth_token?: string | null;
          twilio_phone_number?: string | null;
          infobip_api_key?: string | null;
          infobip_base_url?: string | null;
          infobip_sender_id?: string | null;
        };
        Update: {
          active_gateway?: "twilio" | "infobip";
          twilio_account_sid?: string | null;
          twilio_auth_token?: string | null;
          twilio_phone_number?: string | null;
          infobip_api_key?: string | null;
          infobip_base_url?: string | null;
          infobip_sender_id?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
