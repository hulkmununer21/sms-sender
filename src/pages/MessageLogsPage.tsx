import React, { useState } from "react";
import { Search, Download, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { useMessageLogs } from "../hooks/useMessageLogs";

const statusIcons: Record<string, { icon: React.FC<any>; color: string; label: string }> = {
  sent: {
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-50",
    label: "Sent",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
    label: "Delivered",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600 bg-red-50",
    label: "Failed",
  },
};

export const MessageLogsPage: React.FC = () => {
  const { messageLogs, loading, error } = useMessageLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMessages = messageLogs.filter((msg) => {
    const matchesSearch =
      (msg.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      msg.phone_number.includes(searchTerm) ||
      msg.message_text.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      pending: messageLogs.filter((m) => m.status === "pending").length,
      sent: messageLogs.filter((m) => m.status === "sent").length,
      delivered: messageLogs.filter((m) => m.status === "delivered").length,
      failed: messageLogs.filter((m) => m.status === "failed").length,
    };
  };

  const stats = getStatusStats();

  const handleExport = () => {
    const csv = [
      ["Recipient", "Phone", "Message", "Status", "Sent At", "Delivered At"],
      ...filteredMessages.map((m) => [
        m.recipient_name || "Unknown",
        m.phone_number,
        m.message_text,
        m.status,
        m.sent_at ? new Date(m.sent_at).toLocaleString() : "-",
        m.delivered_at ? new Date(m.delivered_at).toLocaleString() : "-",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Logs</h1>
          <p className="text-gray-600 mt-2">{messageLogs.length} total messages</p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredMessages.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition font-medium"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          type="error"
          title="Error loading message logs"
          message={error.message}
          dismissible={false}
        />
      )}

      {/* Status Stats */}
      {!loading && messageLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.sent}</p>
              <p className="text-sm text-gray-600 mt-1">Sent</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-600 mt-1">Delivered</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by recipient name, phone, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({messageLogs.length})
          </button>
          {Object.entries(statusIcons).map(([status, { label }]) => {
            const count = messageLogs.filter((m) => m.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredMessages.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sent At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Delivered At
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => {
                  const statusInfo = statusIcons[message.status];
                  const Icon = statusInfo.icon;
                  return (
                    <tr
                      key={message.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {message.recipient_name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {message.phone_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {message.message_text}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div
                          className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full ${statusInfo.color}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {message.sent_at
                          ? new Date(message.sent_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {message.delivered_at
                          ? new Date(message.delivered_at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No messages found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm
              ? "Try adjusting your filters"
              : "Messages will appear here when campaigns are sent"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageLogsPage;
