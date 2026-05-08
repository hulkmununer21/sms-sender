import React, { useState } from "react";
import { Plus, Search, Trash2, Mail, Download, FileUp, Zap, ListPlus } from "lucide-react";
import { useContacts } from "../hooks/useContacts";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { ValidatedPhoneInput } from "../components/common/ValidatedPhoneInput";
import { ContactImporter } from "../components/contacts/ContactImporter";
import { NumberGenerator } from "../components/contacts/NumberGenerator";
import { BulkPhoneInput } from "../components/contacts/BulkPhoneInput";

type TabType = "list" | "add" | "import" | "generate" | "bulk";

export const ContactsPage: React.FC = () => {
  const { contacts, loading, error, addContact, deleteContact } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phoneValid, setPhoneValid] = useState(false);

  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      contact.phone_number.includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) {
      setSubmitError("Please enter a valid phone number");
      return;
    }
    setSubmitError(null);
    try {
      await addContact({ phone_number: formData.phone, name: formData.name, email: formData.email });
      setFormData({ name: "", phone: "", email: "" });
      setActiveTab("list");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add contact");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
      } catch (err) {
        console.error("Failed to delete contact:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => window.location.href = "data:text/csv;charset=utf-8," + encodeURIComponent([
            ["Name", "Phone", "Email"],
            ...contacts.map((c) => [c.name || "", c.phone_number, c.email || ""]),
          ]
            .map((row) => row.map((cell) => `"${cell}"`).join(","))
            .join("\n"))}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Errors */}
      {error && (
        <ErrorAlert
          type="error"
          title="Error loading contacts"
          message={error.message}
          dismissible={false}
        />
      )}
      {submitError && (
        <ErrorAlert
          type="error"
          title="Failed to add contact"
          message={submitError}
          onClose={() => setSubmitError(null)}
        />
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "list"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Contacts List
            </div>
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "add"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </div>
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "import"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileUp className="h-4 w-4" />
              Import CSV
            </div>
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "generate"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              Generate Numbers
            </div>
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`flex-1 px-4 py-3 font-medium transition ${
              activeTab === "bulk"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ListPlus className="h-4 w-4" />
              Bulk Add
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Contacts List Tab */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : filteredContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Added</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{contact.name || "Unnamed"}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{contact.phone_number}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{contact.email || "-"}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="text-red-600 hover:text-red-700 transition p-1"
                              title="Delete contact"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No contacts found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm ? "Try adjusting your search" : "Add your first contact to get started"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add Contact Tab */}
          {activeTab === "add" && (
            <form onSubmit={handleAddContact} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <ValidatedPhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({...formData, phone: value})}
                  onValidChange={setPhoneValid}
                  placeholder="+1 (123) 456-7890"
                  showFormattedPreview
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={!phoneValid}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
              >
                Add Contact
              </button>
            </form>
          )}

          {/* Import CSV Tab */}
          {activeTab === "import" && <ContactImporter />}

          {/* Generate Numbers Tab */}
          {activeTab === "generate" && <NumberGenerator />}

          {/* Bulk Add Tab */}
          {activeTab === "bulk" && <BulkPhoneInput />}
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
