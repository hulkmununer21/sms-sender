import React, { useState } from "react";
import { Plus, Edit2, Trash2, Eye, Send, ArrowRight, Sparkles, Loader, AlertCircle, Zap, CheckCircle, MessageSquare } from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import { useContacts } from "../hooks/useContacts";
import { usePersonalizedMessages } from "../hooks/usePersonalizedMessages";
import type { PersonalizedMessage } from "../hooks/usePersonalizedMessages";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { AIMessageEnhancer } from "../components/ai/AIMessageEnhancer";
import { personalizeMessagesSimple } from "../utils/templateEngine";
import { usePersonalizeBatch } from "../hooks/usePersonalizeBatch";
import PersonalizationVariableAnalyzer from "../components/personalization/PersonalizationVariableAnalyzer";
import PersonalizationPreview from "../components/personalization/PersonalizationPreview";

export const CampaignsPage: React.FC = () => {
  const { campaigns, loading, error, createCampaign, deleteCampaign } = useCampaigns();
  const { contacts } = useContacts();
  const personalizedMessages = usePersonalizedMessages();
  const { personalizeWithAI, loading: aiLoading, error: aiError, progress } = usePersonalizeBatch();
  
  const [showBuilder, setShowBuilder] = useState(false);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [step, setStep] = useState(1);
  const [personalizationMode, setPersonalizationMode] = useState<"simple" | "ai" | "preview" | null>(null);
  const [tempPersonalizedMessages, setTempPersonalizedMessages] = useState<PersonalizedMessage[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

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
      // If personalized messages exist, mark campaign as personalized
      // Otherwise use the template message for all contacts
      const campaignData = {
        title: campaignName,
        message,
        status: "draft" as const,
        scheduled_at: null,
      };

      await createCampaign(campaignData);
      
      // Reset form
      setCampaignName("");
      setMessage("");
      setSelectedContacts([]);
      personalizedMessages.clearMessages();
      setStep(1);
      setShowBuilder(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create campaign");
    }
  };

  const handlePersonalizationComplete = (messages: PersonalizedMessage[]) => {
    personalizedMessages.setMessages(messages);
    setPersonalizationMode(null);
    setTempPersonalizedMessages([]);
    setStep(3); // Back to message step
  };

  const handleSimplePersonalize = () => {
    const selectedContactsData = contacts.filter((c) => selectedContacts.includes(c.id));
    const messages = personalizeMessagesSimple(message, selectedContactsData);
    setTempPersonalizedMessages(messages as PersonalizedMessage[]);
    setPersonalizationMode("preview");
  };

  const handleAIPersonalize = async () => {
    try {
      const selectedContactsData = contacts.filter((c) => selectedContacts.includes(c.id));
      const messages = await personalizeWithAI(message, selectedContactsData);
      setTempPersonalizedMessages(messages as PersonalizedMessage[]);
      setPersonalizationMode("preview");
    } catch (err) {
      console.error("Personalization error:", err);
    }
  };

  const handleViewCampaign = (campaign: typeof campaigns[0]) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleEditCampaign = (campaign: typeof campaigns[0]) => {
    // Load campaign data into builder for editing
    setCampaignName(campaign.title);
    setMessage(campaign.message || "");
    setStep(1);
    setShowBuilder(true);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Campaign Builder</h2>
              <p className="text-sm text-gray-600 mt-1">
                {personalizationMode ? `Personalization${personalizationMode === "preview" ? " Preview" : ""}` : `Step ${step} of 3`}
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-6 space-y-4">
              {step === 1 && !personalizationMode && (
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

              {step === 2 && !personalizationMode && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Select Contacts</label>
                      {contacts.length > 0 && (
                        <button
                          onClick={handleSelectAll}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                        >
                          {selectedContacts.length === contacts.length ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
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

              {step === 3 && !personalizationMode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your SMS message template here. Use {{variable}} for personalization like {{first_name}}, {{area_code}}, {{email_domain}}"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{message.length} characters</span>
                      <span>{Math.ceil(message.length / 160)} SMS message{Math.ceil(message.length / 160) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* AI Message Enhancement */}
                  <AIMessageEnhancer
                    message={message}
                    onMessageUpdate={setMessage}
                  />

                  {/* Personalization Options */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Personalize Messages</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {personalizedMessages.isActive 
                            ? `✓ ${personalizedMessages.messages.length} personalized messages ready` 
                            : "Create unique messages for each recipient using AI or template variables"}
                        </p>
                      </div>
                      <button
                        onClick={() => setPersonalizationMode("simple")}
                        disabled={selectedContacts.length === 0}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <Sparkles className="h-4 w-4" />
                        {personalizedMessages.isActive ? "Update" : "Personalize"}
                      </button>
                    </div>
                    {personalizedMessages.isActive && personalizedMessages.totalCost > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        Total cost: ${personalizedMessages.totalCost.toFixed(4)} • {personalizedMessages.totalTokens} tokens
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personalization Mode - Choose Method */}
              {personalizationMode === "simple" && (
                <div className="space-y-4">
                  <PersonalizationVariableAnalyzer
                    template={message}
                    contacts={contacts.filter((c) => selectedContacts.includes(c.id))}
                    selectedContactIds={selectedContacts}
                  />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Personalization Methods</h3>

                    <button
                      onClick={handleSimplePersonalize}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group text-left"
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-6 w-6 text-blue-600 mt-0.5 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">Phase 1: Simple Variables</h4>
                          <p className="text-sm text-gray-600 mt-1">Fast and free. Replace variables like {`{{first_name}}, {{area_code}}`} with actual values.</p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>Zero API cost • Instant • All {selectedContacts.length} recipients</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPersonalizationMode("ai")}
                      className="w-full p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:border-purple-500 hover:bg-purple-100 transition group text-left"
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-6 w-6 text-purple-600 mt-0.5 group-hover:scale-110 transition flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">Phase 2: AI Personalization</h4>
                          <p className="text-sm text-gray-600 mt-1">Generate unique, natural messages for each recipient using AI.</p>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-700">
                            <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span>~$0.00005 per recipient • 2-3 sec for {selectedContacts.length} • High quality</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Personalization Setup */}
              {personalizationMode === "ai" && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Personalization Setup</h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">
                        This will generate natural, personalized messages for each recipient based on their information.
                      </p>

                      {aiError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700">{aiError}</p>
                        </div>
                      )}

                      {aiLoading && progress.total > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Processing batch...</span>
                            <span className="font-medium text-blue-600">
                              {progress.current} / {progress.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{
                                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 text-center">Estimated cost: ${(selectedContacts.length * 0.00005).toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personalization Preview */}
              {personalizationMode === "preview" && tempPersonalizedMessages.length > 0 && (
                <PersonalizationPreview
                  messages={tempPersonalizedMessages}
                  allContacts={contacts}
                  onAccept={() => handlePersonalizationComplete(tempPersonalizedMessages)}
                  onReject={() => {
                    setTempPersonalizedMessages([]);
                    setPersonalizationMode("simple");
                  }}
                  loading={false}
                  totalCost={tempPersonalizedMessages.reduce((sum, msg) => sum + (msg.cost || 0), 0)}
                  totalTokens={tempPersonalizedMessages.reduce((sum, msg) => sum + (msg.tokens || 0), 0)}
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-gray-50">
              <button
                onClick={() => {
                  if (personalizationMode) {
                    setPersonalizationMode(personalizationMode === "preview" ? "simple" : null);
                  } else if (step > 1) {
                    setStep(step - 1);
                  } else {
                    setShowBuilder(false);
                  }
                }}
                className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                {personalizationMode && personalizationMode !== "preview" ? "Cancel" : step > 1 ? "Back" : "Cancel"}
              </button>
              <div className="flex-1" />
              
              {personalizationMode === "ai" ? (
                <button
                  onClick={handleAIPersonalize}
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Personalizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Start AI Personalization
                    </>
                  )}
                </button>
              ) : personalizationMode ? null : step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
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
                <button
                  onClick={() => handleViewCampaign(campaign)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  onClick={() => handleEditCampaign(campaign)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
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

      {/* Campaign Details Modal */}
      {showCampaignDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-up">
            {/* Header - Sticky */}
            <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">{selectedCampaign.title}</h2>
                <button
                  onClick={() => setShowCampaignDetails(false)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1 transition"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedCampaign.status === "scheduled"
                    ? "bg-green-100 text-green-700"
                    : selectedCampaign.status === "sent"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedCampaign.message}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Created</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedCampaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedCampaign.scheduled_at && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">Scheduled</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(selectedCampaign.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-gray-50">
              <button
                onClick={() => setShowCampaignDetails(false)}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCampaignDetails(false);
                  handleEditCampaign(selectedCampaign);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
