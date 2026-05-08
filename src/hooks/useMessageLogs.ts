import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type MessageLog = Database["public"]["Tables"]["message_logs"]["Row"];

interface UseMessageLogsReturn {
  messageLogs: MessageLog[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMessageLogs = (): UseMessageLogsReturn => {
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessageLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("message_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setMessageLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch message logs"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessageLogs();
  }, [fetchMessageLogs]);

  return {
    messageLogs,
    loading,
    error,
    refetch: fetchMessageLogs,
  };
};

export default useMessageLogs;
