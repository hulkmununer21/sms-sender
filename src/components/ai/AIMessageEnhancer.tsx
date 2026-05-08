import React, { useState } from "react";
import { Wand2, X, Check, AlertCircle, Loader } from "lucide-react";
import { useAIEnhancement, type EnhancementType } from "../../hooks/useAIEnhancement";

interface AIMessageEnhancerProps {
  message: string;
  onMessageUpdate: (message: string) => void;
  campaignId?: string;
}

interface EnhancementPreview {
  originalMessage: string;
  enhancedMessage: string;
  cost?: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export const AIMessageEnhancer: React.FC<AIMessageEnhancerProps> = ({
  message,
  onMessageUpdate,
  campaignId,
}) => {
  const { enhanceMessage, loading, error, clearError } = useAIEnhancement();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>("casual");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");
  const [preview, setPreview] = useState<EnhancementPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const toneOptions = ["casual", "formal", "friendly", "urgent", "professional"];
  const languageOptions = [
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "pt", name: "Portuguese" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
  ];

  const handleEnhance = async (enhancementType: EnhancementType) => {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreview(null);

    try {
      let params = {};
      if (enhancementType === "tone") {
        params = { tone: selectedTone };
      } else if (enhancementType === "translate") {
        params = { language: selectedLanguage };
      }

      const result = await enhanceMessage(
        message,
        enhancementType,
        params,
        campaignId
      );

      setPreview({
        originalMessage: result.originalMessage,
        enhancedMessage: result.enhancedMessage,
        cost: result.cost,
        tokens: result.tokens,
      });
      setShowPreview(true);
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Failed to enhance message"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAccept = () => {
    if (preview?.enhancedMessage) {
      onMessageUpdate(preview.enhancedMessage);
      setShowPreview(false);
      setPreview(null);
    }
  };

  const handleReject = () => {
    setShowPreview(false);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Enhancement Options */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-5 w-5 text-blue-600" />
          <label className="text-sm font-semibold text-gray-900">
            AI Enhancement Options
          </label>
        </div>

        {/* Personalization */}
        <button
          onClick={() => handleEnhance("personalize")}
          disabled={loading || previewLoading || !message.trim()}
          className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Personalize</p>
              <p className="text-xs text-gray-500">Add human touches</p>
            </div>
            {previewLoading && (
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>
        </button>

        {/* Tone Adjustment */}
        <div className="space-y-2">
          <button
            onClick={() => handleEnhance("tone")}
            disabled={loading || previewLoading || !message.trim()}
            className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Adjust Tone</p>
                <p className="text-xs text-gray-500">
                  Current: <span className="capitalize font-semibold">{selectedTone}</span>
                </p>
              </div>
              {previewLoading && (
                <Loader className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </div>
          </button>
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {toneOptions.map((tone) => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Summarize */}
        <button
          onClick={() => handleEnhance("summarize")}
          disabled={loading || previewLoading || !message.trim()}
          className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Summarize</p>
              <p className="text-xs text-gray-500">Condense to SMS length</p>
            </div>
            {previewLoading && (
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>
        </button>

        {/* Clarity */}
        <button
          onClick={() => handleEnhance("clarity")}
          disabled={loading || previewLoading || !message.trim()}
          className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Clarity</p>
              <p className="text-xs text-gray-500">Simplify and improve readability</p>
            </div>
            {previewLoading && (
              <Loader className="h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>
        </button>

        {/* Translation */}
        <div className="space-y-2">
          <button
            onClick={() => handleEnhance("translate")}
            disabled={loading || previewLoading || !message.trim()}
            className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Translate</p>
                <p className="text-xs text-gray-500">
                  To:{" "}
                  <span className="font-semibold">
                    {languageOptions.find((l) => l.code === selectedLanguage)?.name}
                  </span>
                </p>
              </div>
              {previewLoading && (
                <Loader className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </div>
          </button>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Message Enhancement Preview
                </h2>
                <button
                  onClick={handleReject}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {previewError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{previewError}</p>
                </div>
              )}

              {/* Original Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Message
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {preview.originalMessage}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {preview.originalMessage.length} characters
                  </p>
                </div>
              </div>

              {/* Enhanced Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enhanced Message
                </label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 leading-relaxed font-medium">
                    {preview.enhancedMessage}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    {preview.enhancedMessage.length} characters
                  </p>
                </div>
              </div>

              {/* Stats */}
              {preview.tokens && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Prompt Tokens</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {preview.tokens.prompt}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Output Tokens</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {preview.tokens.completion}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${(preview.cost ? preview.cost / 100 : 0).toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMessageEnhancer;
