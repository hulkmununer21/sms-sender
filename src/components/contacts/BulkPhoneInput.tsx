import React, { useState, useCallback } from "react";
import { Trash2, CheckCircle, AlertCircle, Upload, Copy, Check, Loader, X } from "lucide-react";
import { validatePhoneNumber, formatToE164 } from "../../utils/phoneUtils";
import { useContacts } from "../../hooks/useContacts";
import { useAuth } from "../../context/AuthContext";
import { ErrorAlert } from "../common/ErrorAlert";

interface ParsedPhoneNumber {
  id: string;
  originalInput: string;
  formattedPhone: string | null;
  isValid: boolean;
  error?: string;
  saveStatus?: "pending" | "saving" | "success" | "failed";
  saveError?: string;
}

export const BulkPhoneInput: React.FC = () => {
  const { addContact, refetch } = useContacts();
  const { user } = useAuth();
  const [bulkInput, setBulkInput] = useState("");
  const [parsedNumbers, setParsedNumbers] = useState<ParsedPhoneNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Parse bulk input - supports various formats
  const handleParse = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // Split by multiple delimiters: newlines, commas, semicolons
      const lines = bulkInput
        .split(/[\n,;]/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setError("Please paste at least one phone number");
        setLoading(false);
        return;
      }

      const parsed: ParsedPhoneNumber[] = lines.map((line, index) => {
        const isValid = validatePhoneNumber(line, "US");
        const formattedPhone = isValid ? formatToE164(line, "US") : null;

        return {
          id: `${Date.now()}-${index}`,
          originalInput: line,
          formattedPhone,
          isValid,
          error: !isValid ? "Invalid US phone number format" : undefined,
          saveStatus: "pending",
        };
      });

      setParsedNumbers(parsed);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error parsing phone numbers");
      setParsedNumbers([]);
    } finally {
      setLoading(false);
    }
  }, [bulkInput]);

  const handleAddAll = async () => {
    if (!user) {
      setError("You must be logged in to add contacts");
      return;
    }

    const validNumbers = parsedNumbers.filter((n) => n.isValid && n.formattedPhone);

    if (validNumbers.length === 0) {
      setError("No valid phone numbers to add");
      return;
    }

    setSaving(true);
    setError(null);
    let savedCount = 0;
    let failedCount = 0;

    // Update all numbers to saving state
    setParsedNumbers((prev) =>
      prev.map((p) => (p.isValid ? { ...p, saveStatus: "saving" as const } : p))
    );

    try {
      for (const phone of validNumbers) {
        try {
          console.log(`Attempting to save phone: ${phone.formattedPhone} for user: ${user.id}`);
          
          const result = await addContact({
            phone_number: phone.formattedPhone!,
            name: null,
            email: null,
          });
          
          console.log(`Successfully saved: ${phone.formattedPhone}`, result);
          
          // Update this specific number's status to success
          setParsedNumbers((prev) =>
            prev.map((p) =>
              p.id === phone.id
                ? { ...p, saveStatus: "success" as const }
                : p
            )
          );
          
          savedCount++;
        } catch (err) {
          console.error(`Error saving contact ${phone.formattedPhone}:`, err);
          
          // Update this specific number's status to failed
          setParsedNumbers((prev) =>
            prev.map((p) =>
              p.id === phone.id
                ? {
                    ...p,
                    saveStatus: "failed" as const,
                    saveError: err instanceof Error ? err.message : "Unknown error",
                  }
                : p
            )
          );
          
          failedCount++;
        }
      }

      if (savedCount > 0) {
        setSuccessMessage(
          `Successfully added ${savedCount} contact${savedCount !== 1 ? "s" : ""}${
            failedCount > 0 ? `. ${failedCount} failed.` : ""
          }`
        );

        // Refresh contacts list
        try {
          await refetch();
        } catch (err) {
          console.error("Error refreshing contacts:", err);
        }

        // Reset form after 2 seconds
        setTimeout(() => {
          setBulkInput("");
          setParsedNumbers([]);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError("Failed to add any contacts. Check the errors for details.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding contacts");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveNumber = (id: string) => {
    setParsedNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(number);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const validCount = parsedNumbers.filter((n) => n.isValid).length;
  const invalidCount = parsedNumbers.filter((n) => !n.isValid).length;
  const successCount = parsedNumbers.filter((n) => n.saveStatus === "success").length;


  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = parsedNumbers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(parsedNumbers.length / itemsPerPage);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Bulk Add Phone Numbers</h2>
        <p className="text-sm md:text-base text-gray-600">
          Paste multiple US phone numbers (separated by newlines, commas, or semicolons)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Success Alert */}
      {successMessage && (
        <ErrorAlert
          type="success"
          title="Success!"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste Phone Numbers
          </label>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={`Paste phone numbers here:\n+1 (555) 123-4567\n555-123-4568\n+1 555 123 4569\n\nor use commas/semicolons`}
            rows={6}
            className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs md:text-sm"
          />
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Formats: +1(555)123-4567 • 555-123-4567 • (555) 123-4567 • 555 123 4567
          </p>
        </div>

        <button
          onClick={handleParse}
          disabled={bulkInput.trim().length === 0 || loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm md:text-base"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Parsing...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Parse Phone Numbers</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {parsedNumbers.length > 0 && !loading && (
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-blue-600">{parsedNumbers.length}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Total</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-3 md:p-4">
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-green-600">{validCount}</p>
                <p className="text-xs md:text-sm text-green-700 mt-1">Valid</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-3 md:p-4">
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-red-600">{invalidCount}</p>
                <p className="text-xs md:text-sm text-red-700 mt-1">Invalid</p>
              </div>
            </div>
            {saving && (
              <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-200 p-3 md:p-4">
                <div className="text-center">
                  <p className="text-lg md:text-2xl font-bold text-purple-600">{successCount}</p>
                  <p className="text-xs md:text-sm text-purple-700 mt-1">Saved</p>
                </div>
              </div>
            )}
          </div>

          {/* Phone Numbers List - Responsive Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/4">Input</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/3">Formatted</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/4">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((phone) => (
                    <tr key={phone.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900 truncate">
                        {phone.originalInput}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {phone.formattedPhone ? (
                          <span className="text-green-600 font-medium">{phone.formattedPhone}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {phone.saveStatus === "success" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Saved
                          </span>
                        ) : phone.saveStatus === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        ) : phone.saveStatus === "saving" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                            <Loader className="h-3 w-3 animate-spin" />
                            Saving
                          </span>
                        ) : phone.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {phone.isValid && phone.saveStatus !== "saving" && (
                            <button
                              onClick={() => handleCopyNumber(phone.formattedPhone!)}
                              className="p-1 text-gray-600 hover:text-gray-900 transition"
                              title="Copy"
                            >
                              {copiedId === phone.formattedPhone ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {phone.saveStatus !== "saving" && (
                            <button
                              onClick={() => handleRemoveNumber(phone.id)}
                              className="p-1 text-red-600 hover:text-red-700 transition"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-2 p-4">
              {currentData.map((phone) => (
                <div
                  key={phone.id}
                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-mono truncate">
                        Input: {phone.originalInput}
                      </p>
                      {phone.formattedPhone && (
                        <p className="text-sm font-mono text-green-600 font-medium mt-1">
                          {phone.formattedPhone}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      {phone.isValid && phone.saveStatus !== "saving" && (
                        <button
                          onClick={() => handleCopyNumber(phone.formattedPhone!)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Copy"
                        >
                          {copiedId === phone.formattedPhone ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {phone.saveStatus !== "saving" && (
                        <button
                          onClick={() => handleRemoveNumber(phone.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    {phone.saveStatus === "success" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Saved
                      </span>
                    ) : phone.saveStatus === "failed" ? (
                      <div className="flex-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </span>
                        {phone.saveError && (
                          <p className="text-xs text-red-600 mt-1">{phone.saveError}</p>
                        )}
                      </div>
                    ) : phone.saveStatus === "saving" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        <Loader className="h-3 w-3 animate-spin" />
                        Saving
                      </span>
                    ) : phone.isValid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        <AlertCircle className="h-3 w-3" />
                        Invalid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => {
                setError(null);
                setBulkInput("");
                setParsedNumbers([]);
                setSuccessMessage(null);
              }}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition font-medium text-sm md:text-base"
            >
              Clear
            </button>
            {validCount > 0 && (
              <button
                onClick={handleAddAll}
                disabled={saving}
                className="flex-1 md:flex-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Add {validCount} Contact{validCount !== 1 ? "s" : ""}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {parsedNumbers.length === 0 && bulkInput.trim().length > 0 && !loading && (
        <div className="text-center py-8 md:py-12 bg-gray-50 rounded-lg border border-gray-200">
          <AlertCircle className="h-8 md:h-12 w-8 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-600">Click "Parse Phone Numbers" to validate</p>
        </div>
      )}
    </div>
  );
};

export default BulkPhoneInput;
