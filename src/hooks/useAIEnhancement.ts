import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export type EnhancementType = "personalize" | "tone" | "summarize" | "clarity" | "translate";

interface EnhancementParams {
  tone?: "casual" | "formal" | "friendly" | "urgent" | "professional";
  language?: string;
}

interface EnhancementResult {
  originalMessage: string;
  enhancedMessage: string;
  enhancementType: EnhancementType;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
}

interface UseAIEnhancementReturn {
  enhanceMessage: (
    message: string,
    enhancementType: EnhancementType,
    params?: EnhancementParams,
    campaignId?: string
  ) => Promise<EnhancementResult>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAIEnhancement = (): UseAIEnhancementReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceMessage = async (
    message: string,
    enhancementType: EnhancementType,
    params?: EnhancementParams,
    campaignId?: string
  ): Promise<EnhancementResult> => {
    if (!user) {
      const err = "You must be logged in to use AI enhancement";
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current session to get the JWT token
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        throw new Error("Failed to get session");
      }

      const token = data.session.access_token;

      // Call the enhance-message Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            enhancementType,
            enhancementParams: params || {},
            campaignId: campaignId || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enhance message");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to enhance message");
      }

      return {
        originalMessage: result.originalMessage,
        enhancedMessage: result.enhancedMessage,
        enhancementType,
        tokens: result.tokens,
        cost: result.cost,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while enhancing the message";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    enhanceMessage,
    loading,
    error,
    clearError,
  };
};
