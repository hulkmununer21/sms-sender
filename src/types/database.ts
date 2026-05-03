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
    };
  };
}
