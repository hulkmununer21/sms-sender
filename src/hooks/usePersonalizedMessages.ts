import { useState, useCallback } from "react";

export interface PersonalizedMessage {
  contactId: string;
  personalized: string;
  variables?: Record<string, string | null>;
  tokens?: number;
  cost?: number;
}

interface UsePersonalizedMessagesState {
  messages: PersonalizedMessage[];
  isActive: boolean;
  totalCost: number;
  totalTokens: number;
}

export const usePersonalizedMessages = () => {
  const [state, setState] = useState<UsePersonalizedMessagesState>({
    messages: [],
    isActive: false,
    totalCost: 0,
    totalTokens: 0,
  });

  const setMessages = useCallback((messages: PersonalizedMessage[]) => {
    const totalCost = messages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
    const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);

    setState({
      messages,
      isActive: messages.length > 0,
      totalCost,
      totalTokens,
    });
  }, []);

  const getMessageForContact = useCallback(
    (contactId: string): string | null => {
      const msg = state.messages.find((m) => m.contactId === contactId);
      return msg ? msg.personalized : null;
    },
    [state.messages]
  );

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isActive: false,
      totalCost: 0,
      totalTokens: 0,
    });
  }, []);

  return {
    ...state,
    setMessages,
    getMessageForContact,
    clearMessages,
  };
};
