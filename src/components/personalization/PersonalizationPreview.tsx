import React, { useState } from "react";
import {
  X,
  Check,
  Copy,
  Edit2,
  MessageCircle,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { PersonalizedMessage } from "../../hooks/usePersonalizedMessages";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

interface PersonalizationPreviewProps {
  messages: PersonalizedMessage[];
  allContacts: Contact[];
  onAccept: () => void;
  onReject: () => void;
  onCustomize?: (messages: PersonalizedMessage[]) => void;
  loading?: boolean;
  totalCost?: number;
  totalTokens?: number;
}

export const PersonalizationPreview: React.FC<PersonalizationPreviewProps> = ({
  messages,
  allContacts,
  onAccept,
  onReject,
  onCustomize,
  loading = false,
  totalCost = 0,
  totalTokens = 0,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const samplesToShow = showAll ? messages : messages.slice(0, 3);
  const hiddenCount = messages.length - samplesToShow.length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getContactName = (contactId: string): string => {
    return allContacts.find((c) => c.id === contactId)?.name || "Unknown";
  };

  const filteredMessages = samplesToShow.filter((msg) => {
    if (!searchTerm) return true;
    const contact = getContactName(msg.contactId);
    return (
      contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.personalized.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const avgLength = Math.round(
    messages.reduce((sum, msg) => sum + msg.personalized.length, 0) / messages.length
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header - Sticky */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Personalization Preview
            </h2>
            <button
              onClick={onReject}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1 transition disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600">Total Messages</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{messages.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600">Avg Length</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{avgLength}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600">Total Tokens</p>
              <p className="text-lg font-bold text-blue-900 mt-1">{totalTokens}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600">Estimated Cost</p>
              <p className="text-lg font-bold text-purple-900 mt-1">${(totalCost / 100).toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Scrollable Messages */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages match your search</p>
            </div>
          ) : (
            <>
              {filteredMessages.map((msg, index) => (
                <div
                  key={msg.contactId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedId(
                        expandedId === msg.contactId ? null : msg.contactId
                      )
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {`${index + 1}. ${getContactName(msg.contactId)}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {msg.personalized}
                      </p>
                      {msg.tokens && (
                        <p className="text-xs text-gray-500 mt-2">
                          {msg.tokens} tokens • ${(msg.cost ? msg.cost / 100 : 0).toFixed(4)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(msg.personalized, msg.contactId);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition rounded"
                        title="Copy"
                      >
                        {copiedId === msg.contactId ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      {expandedId === msg.contactId ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {expandedId === msg.contactId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Full Message</label>
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-900 leading-relaxed">
                            {msg.personalized}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-700">Variables Used</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.variables && Object.entries(msg.variables)
                            .filter(([, v]) => v !== undefined && v !== null)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 border border-gray-200"
                              >
                                <code className="font-mono text-xs font-medium">{key}</code>
                                <span>=</span>
                                <span className="font-medium">{String(value)}</span>
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600">Length</p>
                          <p className="text-sm font-semibold text-gray-900">{msg.personalized.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Tokens</p>
                          <p className="text-sm font-semibold text-gray-900">{msg.tokens || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Cost</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${(msg.cost ? msg.cost / 100 : 0).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Show More Button */}
              {!showAll && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                >
                  Show {hiddenCount} more messages
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-gray-50">
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Reject
          </button>
          {onCustomize && (
            <button
              onClick={() => onCustomize(messages)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium disabled:opacity-50"
            >
              <Edit2 className="h-4 w-4" />
              Customize
            </button>
          )}
          <button
            onClick={onAccept}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <Zap className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Accept & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationPreview;
