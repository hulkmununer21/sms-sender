import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/database";
import { useAuth } from "../context/AuthContext";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsertType = Database["public"]["Tables"]["contacts"]["Insert"];

interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: Error | null;
  addContact: (
    contact: ContactInsertType
  ) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useContacts = (): UseContactsReturn => {
  const { user, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContacts = async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false }) as unknown as Promise<any>);

      if (fetchError) throw fetchError;
      setContacts(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchContacts();
    }
  }, [user, authLoading]);

  const addContact = async (
    contact: ContactInsertType
  ): Promise<Contact | null> => {
    try {
      setError(null);

      const { data, error: insertError } = await (supabase
        .from("contacts")
        .insert([contact as any])
        .select()
        .single() as unknown as Promise<any>);

      if (insertError) throw insertError;

      if (data) {
        setContacts((prev) => [data, ...prev]);
      }

      return data || null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error adding contact:", error);
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error deleting contact:", error);
      throw error;
    }
  };

  const refetch = async () => {
    await fetchContacts();
  };

  return {
    contacts,
    loading: loading || authLoading,
    error,
    addContact,
    deleteContact,
    refetch,
  };
};
