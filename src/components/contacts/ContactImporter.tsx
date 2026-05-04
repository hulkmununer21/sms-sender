import React, { useState } from "react";
import Papa from "papaparse";
import { Upload, AlertCircle, CheckCircle, Loader, Download, X } from "lucide-react";
import { useContacts } from "../../hooks/useContacts";
import { formatToE164, validatePhoneNumber } from "../../utils/phoneUtils";
import { ErrorAlert } from "../common/ErrorAlert";

interface ParsedContact {
  name: string;
  phone: string;
  email: string;
  isValid: boolean;
  formattedPhone: string | null;
  error?: string;
}

export const ContactImporter: React.FC = () => {
  const { addContact } = useContacts();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParsedData([]);
    setPreview(false);
  };

  const handleParse = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results: any) => {
        try {
          if (!results.data || results.data.length === 0) {
            setError("CSV file is empty");
            setLoading(false);
            return;
          }

          // Get headers from first row
          const headers = results.data[0];
          const nameIndex = headers.findIndex((h: string) =>
            h.toLowerCase().includes("name")
          );
          const phoneIndex = headers.findIndex((h: string) =>
            h.toLowerCase().includes("phone")
          );
          const emailIndex = headers.findIndex((h: string) =>
            h.toLowerCase().includes("email")
          );

          if (phoneIndex === -1) {
            setError("CSV must contain a 'phone' column");
            setLoading(false);
            return;
          }

          // Parse data rows (skip header)
          const data: ParsedContact[] = results.data.slice(1).map((row: any[]) => {
            const phone = row[phoneIndex]?.toString().trim() || "";
            const isValid = validatePhoneNumber(phone);
            const formattedPhone = isValid ? formatToE164(phone) : null;

            return {
              name: nameIndex !== -1 ? (row[nameIndex]?.toString().trim() || "Unnamed") : "Unnamed",
              phone,
              email: emailIndex !== -1 ? (row[emailIndex]?.toString().trim() || "") : "",
              isValid,
              formattedPhone,
              error: !isValid ? "Invalid phone number" : undefined,
            };
          });

          setParsedData(data);
          setPreview(true);
          setCurrentPage(1);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error parsing CSV file"
          );
        } finally {
          setLoading(false);
        }
      },
      error: (error: any) => {
        setError(`CSV parsing error: ${error.message}`);
        setLoading(false);
      },
    });
  };

  const handleSaveToDatabase = async () => {
    const validContacts = parsedData.filter((c) => c.isValid && c.formattedPhone);

    if (validContacts.length === 0) {
      setError("No valid contacts to save");
      return;
    }

    setSaving(true);
    setError(null);
    let savedCount = 0;
    let failedCount = 0;

    try {
      for (const contact of validContacts) {
        try {
          await addContact({
            phone_number: contact.formattedPhone!,
            name: contact.name || null,
            email: contact.email || null,
          });
          savedCount++;
        } catch (err) {
          console.error("Error saving contact:", err);
          failedCount++;
        }
      }

      setSuccessMessage(
        `Successfully imported ${savedCount} contact${savedCount !== 1 ? "s" : ""}${
          failedCount > 0 ? `. ${failedCount} failed.` : ""
        }`
      );

      // Reset after success
      setTimeout(() => {
        setFile(null);
        setParsedData([]);
        setPreview(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error saving contacts"
      );
    } finally {
      setSaving(false);
    }
  };

  const validCount = parsedData.filter((c) => c.isValid).length;
  const invalidCount = parsedData.filter((c) => !c.isValid).length;

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = parsedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(parsedData.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import Contacts from CSV</h2>
        <p className="text-gray-600 mt-1">
          Upload a CSV file with columns: Name, Phone, Email
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          type="error"
          title="Import Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Success Alert */}
      {successMessage && (
        <ErrorAlert
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {!preview ? (
        // File Upload Section
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Upload Input */}
            <div className="w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>

            {/* Selected File */}
            {file && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">{file.name}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Parse Button */}
            <button
              onClick={handleParse}
              disabled={!file || loading}
              className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Parse CSV
                </>
              )}
            </button>

            {/* Template Download */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>Need a template? </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const csv =
                    "Name,Phone,Email\nJohn Doe,+1 (555) 123-4567,john@example.com\nJane Smith,5551234567,jane@example.com";
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "contacts_template.csv";
                  a.click();
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Download template CSV
              </a>
            </div>
          </div>
        </div>
      ) : (
        // Preview Section
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{parsedData.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Records</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-6 w-6" />
                  {validCount}
                </p>
                <p className="text-sm text-green-700 mt-1">Valid</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle className="h-6 w-6" />
                  {invalidCount}
                </p>
                <p className="text-sm text-red-700 mt-1">Invalid</p>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Formatted</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((contact, index) => (
                    <tr key={startIndex + index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{contact.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{contact.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{contact.email || "-"}</td>
                      <td className="px-4 py-3">
                        {contact.isValid ? (
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
                      <td className="px-4 py-3 font-mono text-sm">
                        {contact.formattedPhone ? (
                          <span className="text-green-600">{contact.formattedPhone}</span>
                        ) : (
                          <span className="text-red-600">{contact.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPreview(false);
                setParsedData([]);
                setFile(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDatabase}
              disabled={validCount === 0 || saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Save {validCount} Valid Contact{validCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactImporter;
