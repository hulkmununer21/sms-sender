import React, { useState } from "react";
import { Save, Bell, Lock, User, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "../components/common/ErrorAlert";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsAlerts: true,
      campaignUpdates: true,
    },
    account: {
      autoSave: true,
      timezone: "UTC",
      language: "English",
    },
  });

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <ErrorAlert
          type="success"
          title="Settings saved successfully"
          onClose={() => setSaveSuccess(false)}
          dismissible
        />
      )}

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Your email address is used for account identification</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-sm font-medium text-gray-900 mt-1">Active</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              id: "emailNotifications",
              label: "Email Notifications",
              description: "Receive email updates about your campaigns",
            },
            {
              id: "smsAlerts",
              label: "SMS Alerts",
              description: "Get SMS alerts for campaign failures and important events",
            },
            {
              id: "campaignUpdates",
              label: "Campaign Updates",
              description: "Notifications when campaigns complete or have issues",
            },
          ].map((notification) => (
            <label key={notification.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={
                  (settings.notifications as any)[notification.id] || false
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...(settings.notifications as any),
                      [notification.id]: e.target.checked,
                    },
                  })
                }
                className="mt-1 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">{notification.label}</p>
                <p className="text-sm text-gray-600">{notification.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSaveSettings()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Save className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Application</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.account.timezone}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  account: {
                    ...settings.account,
                    timezone: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>UTC</option>
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.account.language}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  account: {
                    ...settings.account,
                    language: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.account.autoSave}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  account: {
                    ...settings.account,
                    autoSave: e.target.checked,
                  },
                })
              }
              className="rounded"
            />
            <div>
              <p className="font-medium text-gray-900">Auto-save Changes</p>
              <p className="text-sm text-gray-600">Automatically save changes as you make them</p>
            </div>
          </label>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleSaveSettings()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Change Password</p>
            <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure</p>
            <button className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
