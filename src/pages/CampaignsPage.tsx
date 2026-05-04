import React, { useState } from "react";
import { Plus, Edit2, Trash2, Eye, Send, ArrowRight } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import { useContacts } from "../hooks/useContacts";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorAlert } from "../components/common/ErrorAlert";

export const CampaignsPage: React.FC = () => {
  const { campaigns, loading, error, createCampaign, deleteCampaign } = useCampaigns();
  const { contacts } = useContacts();
  const [showBuilder, setShowBuilder] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 160);

  const handleCreateCampaign = async () => {
    setSubmitError(null);
    if (!campaignName.trim()) {
      setSubmitError("Campaign name is required");
      return;
    }
    if (selectedContacts.length === 0) {
      setSubmitError("Please select at least one contact");
      return;
    }
    if (!message.trim()) {
      setSubmitError("Message is required");
      return;
    }

    try {
      await createCampaign({
        title: campaignName,
        message,
        status: "draft",
        scheduled_at: null,
      });
      // Reset form
      setCampaignName("");
      setMessage("");
      setSelectedContacts([]);
      setStep(1);
      setShowBuilder(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        console.error("Failed to delete campaign:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">{campaigns.length} total campaigns</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="h-5 w-5" />
          New Campaign
        </button>
      </div>

      {/* Errors */}
      {error && (
        <ErrorAlert
          type="error"
          title="Error loading campaigns"
          message={error}
          dismissible={false}
        />
      )}
      {submitError && (
        <ErrorAlert
          type="error"
          title="Validation Error"
          message={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      {/* Campaign Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Campaign Builder</h2>
              <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g., Summer Promotion"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Contacts</label>
                    <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <label key={contact.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContacts([...selectedContacts, contact.id]);
                                } else {
                                  setSelectedContacts(
                                    selectedContacts.filter((id) => id !== contact.id)
                                  );
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{contact.name || "Unnamed"}</p>
                              <p className="text-xs text-gray-500">{contact.phone_number}</p>
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 py-4">No contacts available</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""} selected
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your SMS message here..."
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{messageLength} characters</span>
                      <span>{smsCount} SMS message{smsCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                  } else {
                    setShowBuilder(false);
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                {step > 1 ? "Back" : "Cancel"}
              </button>
              <div className="flex-1" />
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <Send className="h-4 w-4" />
                  Create Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                      campaign.status === "scheduled"
                        ? "bg-green-100 text-green-700"
                        : campaign.status === "sent"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {campaign.message?.substring(0, 60)}...
              </p>

              <div className="text-xs text-gray-500 mb-4">
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No campaigns yet</p>
          <p className="text-gray-500 text-sm mt-1">Create your first campaign to get started</p>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
