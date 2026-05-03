import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface SendSmsResult {
  phoneNumber: string;
  status: "sent" | "failed";
  errorMessage?: string;
}

interface UseSendSmsReturn {
  sendSms: (
    phoneNumbers: string[],
    message: string,
    campaignId?: string
  ) => Promise<SendSmsResult[]>;
  loading: boolean;
  error: Error | null;
  results: SendSmsResult[] | null;
}

export const useSendSms = (): UseSendSmsReturn => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<SendSmsResult[] | null>(null);

  const sendSms = async (
    phoneNumbers: string[],
    message: string,
    campaignId?: string
  ): Promise<SendSmsResult[]> => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error: callError } = await supabase.functions.invoke(
        "send-sms",
        {
          body: {
            phoneNumbers,
            message,
            campaignId,
          },
        }
      );

      if (callError) throw callError;

      if (!data.success) {
        throw new Error(data.error || "Failed to send SMS");
      }

      setResults(data.results);
      return data.results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendSms,
    loading,
    error,
    results,
  };
};
