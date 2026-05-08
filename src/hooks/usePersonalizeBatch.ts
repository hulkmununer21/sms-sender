import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { extractPersonalizationVariables } from "../utils/templateEngine";
import type { PersonalizationVariables } from "../utils/templateEngine";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

interface PersonalizedMessage {
  contactId: string;
  personalized: string;
  variables: PersonalizationVariables;
  tokens?: number;
  cost?: number;
}

interface UsePersonalizeBatchReturn {
  personalizeWithAI: (template: string, contacts: Contact[]) => Promise<PersonalizedMessage[]>;
  loading: boolean;
  error: string | null;
  progress: { current: number; total: number };
  clearError: () => void;
}

export const usePersonalizeBatch = (): UsePersonalizeBatchReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const personalizeWithAI = async (
    template: string,
    contacts: Contact[]
  ): Promise<PersonalizedMessage[]> => {
    if (!user) {
      const err = "You must be logged in to use AI personalization";
      setError(err);
      throw new Error(err);
    }

    if (contacts.length === 0) {
      const err = "No contacts to personalize";
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: contacts.length });
    const personalizedMessages: PersonalizedMessage[] = [];

    try {
      // Get JWT token
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        throw new Error("Failed to get session");
      }

      const token = data.session.access_token;

      // Batch size for concurrent requests
      const batchSize = 8;
      let totalTokens = 0;

      // Process contacts in batches
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, Math.min(i + batchSize, contacts.length));

        // Build batch payload with extracted variables for each contact
        const batchPayload = batch.map((contact) => ({
          contactId: contact.id,
          contact: {
            id: contact.id,
            name: contact.name,
            phone_number: contact.phone_number,
            email: contact.email,
          },
          variables: extractPersonalizationVariables(contact),
        }));

        try {
          // Call the personalize-batch Edge Function on frontend
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personalize-batch`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                template,
                batch: batchPayload,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `Personalization failed: ${response.statusText}`
            );
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "Personalization failed");
          }

          // Collect personalized messages
          result.personalizations.forEach(
            (personalization: {
              contactId: string;
              personalized_message: string;
              variables: PersonalizationVariables;
              tokens?: number;
              cost?: number;
            }) => {
              personalizedMessages.push({
                contactId: personalization.contactId,
                personalized: personalization.personalized_message,
                variables: personalization.variables,
                tokens: personalization.tokens,
                cost: personalization.cost,
              });

              if (personalization.tokens) {
                totalTokens += personalization.tokens;
              }
            }
          );

          // Update progress
          setProgress({
            current: Math.min(i + batchSize, contacts.length),
            total: contacts.length,
          });
        } catch (batchError) {
          console.error(`Error processing batch at index ${i}:`, batchError);
          throw batchError;
        }
      }

      return personalizedMessages;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during personalization";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const clearError = () => setError(null);

  return {
    personalizeWithAI,
    loading,
    error,
    progress,
    clearError,
  };
};
