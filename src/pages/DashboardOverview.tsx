import React from "react";
import {
  Users,
  SendHorizontal,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAnalytics } from "../hooks/useAnalytics";
import { StatsCard } from "../components/common/StatsCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const DashboardOverview: React.FC = () => {
  const { metrics, loading, error } = useAnalytics();

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your SMS campaign overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contacts"
          value={metrics.totalContacts}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Total Campaigns"
          value={metrics.totalCampaigns}
          icon={SendHorizontal}
          trend={{ value: 5, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Messages Sent"
          value={metrics.totalMessagesSent.toLocaleString()}
          icon={MessageSquare}
          trend={{ value: 18, isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: false }}
          color="orange"
        />
      </div>

      {/* Active Campaigns */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Activity className="h-5 w-5 text-blue-600" />
        <div>
          <p className="font-medium text-blue-900">Active Campaigns</p>
          <p className="text-sm text-blue-700">
            {metrics.activeCampaigns} campaign{metrics.activeCampaigns !== 1 ? "s" : ""} running
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Day */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages Sent (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.messagesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Active", value: metrics.activeCampaigns },
                { name: "Completed", value: Math.max(0, metrics.totalCampaigns - metrics.activeCampaigns) },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h2>
          <div className="space-y-3">
            {metrics.recentContacts.length > 0 ? (
              metrics.recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{contact.name || "Unnamed"}</p>
                    <p className="text-sm text-gray-500">{contact.phone_number}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No contacts yet</p>
            )}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaigns</h2>
          <div className="space-y-3">
            {metrics.topCampaigns.length > 0 ? (
              metrics.topCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.title}</p>
                    <p className="text-sm text-gray-500">{campaign.message?.substring(0, 30)}...</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      campaign.status === "scheduled"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No campaigns yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
