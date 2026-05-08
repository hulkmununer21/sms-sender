import React, { useState } from "react";
import {
  Loader,
  AlertCircle,
  Zap,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { personalizeMessagesSimple } from "../../utils/templateEngine";
import { usePersonalizeBatch } from "../../hooks/usePersonalizeBatch";
import PersonalizationVariableAnalyzer from "./PersonalizationVariableAnalyzer";
import PersonalizationPreview from "./PersonalizationPreview";
import type { PersonalizedMessage } from "../../hooks/usePersonalizedMessages";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}


interface PersonalizationSelectorProps {
  template: string;
  allContacts: Contact[];
  selectedContactIds: string[];
  onPersonalizationComplete: (messages: PersonalizedMessage[]) => void;
  onCancel: () => void;
}

type PersonalizationMode = "simple" | "ai" | null;

export const PersonalizationSelector: React.FC<PersonalizationSelectorProps> = ({
  template,
  allContacts,
  selectedContactIds,
  onPersonalizationComplete,
  onCancel,
}) => {
  const selectedContacts = allContacts.filter((c) =>
    selectedContactIds.includes(c.id)
  );
  const [mode, setMode] = useState<PersonalizationMode>(null);
  const [personalizedMessages, setPersonalizedMessages] = useState<
    PersonalizedMessage[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);
  const { personalizeWithAI, loading: aiLoading, error: aiError, progress } =
    usePersonalizeBatch();

  const totalCost = personalizedMessages.reduce(
    (sum, msg) => sum + (msg.cost || 0),
    0
  );
  const totalTokens = personalizedMessages.reduce(
    (sum, msg) => sum + (msg.tokens || 0),
    0
  );

  const handleSimplePersonalize = () => {
    const messages = personalizeMessagesSimple(template, selectedContacts);
    setPersonalizedMessages(messages as PersonalizedMessage[]);
    setShowPreview(true);
  };

  const handleAIPersonalize = async () => {
    try {
      const messages = await personalizeWithAI(template, selectedContacts);
      setPersonalizedMessages(messages as PersonalizedMessage[]);
      setShowPreview(true);
    } catch (error) {
      // Error is already handled by the hook and stored in aiError state
      console.error("Personalization error:", error);
    }
  };

  const handleAcceptPersonalization = () => {
    onPersonalizationComplete(personalizedMessages);
    setShowPreview(false);
  };

  const handleRejectPersonalization = () => {
    setShowPreview(false);
    setPersonalizedMessages([]);
    setMode(null);
  };

  if (showPreview && personalizedMessages.length > 0) {
    return (
      <PersonalizationPreview
        messages={personalizedMessages}
        allContacts={allContacts}
        onAccept={handleAcceptPersonalization}
        onReject={handleRejectPersonalization}
        loading={false}
        totalCost={totalCost}
        totalTokens={totalTokens}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header - Sticky */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Choose Personalization Method</h2>
          <p className="text-sm text-gray-600 mt-1">Select a personalization method for {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
          {/* Variable Analysis */}
          <PersonalizationVariableAnalyzer
            template={template}
            contacts={selectedContacts}
            selectedContactIds={selectedContactIds}
          />

          {mode === null ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Personalization Methods</h3>

              {/* Phase 1: Simple Template */}
              <button
                onClick={() => {
                  setMode("simple");
                  handleSimplePersonalize();
                }}
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

              {/* Phase 2: AI Personalization */}
              <button
                onClick={() => setMode("ai")}
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
          ) : mode === "ai" ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Personalization Setup</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">This will generate natural, personalized messages for each recipient based on their information.</p>

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
          ) : null}
        </div>

        {/* Footer - Sticky */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3 flex-shrink-0 bg-gray-50">
          {mode === null ? (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode(null)}
                disabled={aiLoading}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleAIPersonalize}
                disabled={aiLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSelector;
