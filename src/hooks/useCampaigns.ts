import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Database } from "../types/database";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];

interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
}

export const useCampaigns = () => {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any;

      if (err) throw err;
      setCampaigns(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create campaign
  const createCampaign = useCallback(
    async (campaign: CampaignInsert) => {
      if (!user) {
        throw new Error("You must be logged in to create a campaign");
      }

      setError(null);
      try {
        const { data, error: err } = await supabase
          .from("campaigns")
          .insert([{ ...campaign, user_id: user.id }])
          .select()
          .single() as any;

        if (err) throw err;
        setCampaigns((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create campaign";
        setError(message);
        throw err;
      }
    },
    [user]
  );

  // Update campaign
  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single() as any;

      if (err) throw err;
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      );
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update campaign";
      setError(message);
      throw err;
    }
  }, []);

  // Delete campaign
  const deleteCampaign = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error: err } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete campaign";
      setError(message);
      throw err;
    }
  }, []);

  // Get campaign stats
  const getStats = useCallback((): CampaignStats => {
    return {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "scheduled").length,
      completed: campaigns.filter((c) => c.status === "sent").length,
      failed: campaigns.filter((c) => c.status === "failed").length,
    };
  }, [campaigns]);

  useEffect(() => {
    if (!authLoading) {
      fetchCampaigns();
    }
  }, [user, authLoading, fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getStats,
  };
};

export default useCampaigns;
