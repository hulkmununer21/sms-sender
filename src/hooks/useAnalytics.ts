import { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export interface DashboardMetrics {
  totalContacts: number;
  totalCampaigns: number;
  totalMessagesSent: number;
  successRate: number;
  recentContacts: Contact[];
  topCampaigns: Campaign[];
  activeCampaigns: number;
  messagesByDay: Array<{ date: string; count: number }>;
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch contacts count
      const { count: contactsCount } = (await supabase
        .from("contacts")
        .select("*", { count: "exact" })) as any;

      // Fetch campaigns count
      const { count: campaignsCount } = (await supabase
        .from("campaigns")
        .select("*", { count: "exact" })) as any;

      // Fetch recent contacts
      const { data: recentContacts } = (await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)) as any;

      // Fetch top campaigns
      const { data: topCampaigns } = (await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)) as any;

      // Fetch active campaigns
      const { count: activeCampaignsCount } = (await supabase
        .from("campaigns")
        .select("*", { count: "exact" })
        .eq("status", "active")) as any;

      // Mock data for messages sent (would come from message logs table)
      const totalMessagesSent = (campaignsCount || 0) * 10; // Mock calculation

      setMetrics({
        totalContacts: contactsCount || 0,
        totalCampaigns: campaignsCount || 0,
        totalMessagesSent,
        successRate: Math.floor(Math.random() * 30) + 70, // Mock: 70-100%
        recentContacts: recentContacts || [],
        topCampaigns: topCampaigns || [],
        activeCampaigns: activeCampaignsCount || 0,
        messagesByDay: generateMockChartData(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics: fetchMetrics,
  };
};

// Mock data generator for chart
function generateMockChartData() {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 100) + 20,
    });
  }
  return data;
}

export default useAnalytics;
