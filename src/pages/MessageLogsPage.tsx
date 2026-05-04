import React, { useState } from "react";
import { Search, Download, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

interface MessageLog {
  id: string;
  campaignName: string;
  recipient: string;
  phone: string;
  message: string;
  status: "sent" | "pending" | "failed" | "delivered";
  timestamp: string;
  deliveredAt?: string;
}

// Mock data for demonstration
const mockMessages: MessageLog[] = [
  {
    id: "1",
    campaignName: "Summer Sale",
    recipient: "John Doe",
    phone: "+1234567890",
    message: "Get 50% off this summer! Use code SUMMER50",
    status: "delivered",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: "2",
    campaignName: "Newsletter",
    recipient: "Jane Smith",
    phone: "+1987654321",
    message: "New product launch: Check out our latest collection",
    status: "sent",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "3",
    campaignName: "Reminder",
    recipient: "Bob Johnson",
    phone: "+1555666777",
    message: "Your appointment is tomorrow at 2 PM",
    status: "failed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "4",
    campaignName: "Verification",
    recipient: "Alice Williams",
    phone: "+1444888999",
    message: "Your verification code is: 123456",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading] = useState(false);

  const filteredMessages = mockMessages.filter((msg) => {
    const matchesSearch =
      msg.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.phone.includes(searchTerm) ||
      msg.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ["Campaign", "Recipient", "Phone", "Message", "Status", "Timestamp", "Delivered At"],
      ...filteredMessages.map((m) => [
        m.campaignName,
        m.recipient,
        m.phone,
        m.message,
        m.status,
        new Date(m.timestamp).toLocaleString(),
        m.deliveredAt ? new Date(m.deliveredAt).toLocaleString() : "-",
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
          <p className="text-gray-600 mt-2">{filteredMessages.length} messages</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, campaign, or message..."
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
            All
          </button>
          {Object.entries(statusIcons).map(([status, { label }]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Table */}
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : filteredMessages.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => {
                  const statusInfo = statusIcons[message.status];
                  const Icon = statusInfo.icon;
                  return (
                    <tr key={message.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {message.campaignName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{message.recipient}</p>
                          <p className="text-xs text-gray-500">{message.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {message.message}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full ${statusInfo.color}`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(message.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
            {searchTerm ? "Try adjusting your filters" : "Messages will appear here when campaigns are sent"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageLogsPage;
