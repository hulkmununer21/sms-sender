import React, { useState } from "react";
import { Lock, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { SMSGatewaySettings } from "../components/settings/SMSGatewaySettings";
import { supabase } from "../lib/supabase";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChangePassword = async () => {
    setPasswordError(null);

    // Validation
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) {
        throw error;
      }

      setPasswordSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordModal(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="matrix-title text-4xl">◈ SETTINGS ◈</h1>
        <p className="text-matrix-neon-cyan mt-2 text-sm font-mono">&gt; ACCOUNT & SECURITY CONTROL</p>
      </div>

      {/* Success Message */}
      {passwordSuccess && (
        <ErrorAlert
          type="success"
          title="Password updated successfully"
          onClose={() => setPasswordSuccess(false)}
          dismissible
        />
      )}

      {/* Account Settings */}
      <div className="card-matrix-cyan p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-matrix-neon-cyan" />
          <h2 className="text-lg font-bold text-matrix-neon-cyan matrix-text">&gt; ACCOUNT</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-matrix-neon-green mb-1">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 bg-matrix-dark border-2 border-matrix-neon-green text-matrix-neon-cyan rounded-sm opacity-60"
            />
            <p className="text-xs text-matrix-neon-cyan mt-1 font-mono">&gt; SYSTEM IDENTIFIER</p>
          </div>

          <div className="pt-4 border-t-2 border-matrix-neon-cyan">
            <h3 className="font-bold text-matrix-neon-cyan matrix-text mb-4">&gt; CREDENTIALS</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-matrix-neon-green font-mono">$ STATUS</p>
                <p className="text-sm font-bold text-matrix-neon-yellow mt-1">ACTIVE ◈ VERIFIED</p>
              </div>
              <div>
                <p className="text-sm text-matrix-neon-cyan font-mono">$ MEMBER_SINCE</p>
                <p className="text-sm font-bold text-matrix-neon-green mt-1">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "UNKNOWN"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card-matrix p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-matrix-neon-green" />
          <h2 className="text-lg font-bold text-matrix-neon-green matrix-text">&gt; SECURITY</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-matrix-black border-l-4 border-matrix-neon-yellow">
            <p className="text-sm font-bold text-matrix-neon-yellow">◈ CHANGE PASSWORD</p>
            <p className="text-sm text-matrix-neon-cyan mt-1 font-mono">&gt; RESET SECURITY TOKEN</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-matrix-primary mt-3"
            >
              ◈ INITIATE
            </button>
          </div>
        </div>
      </div>

      {/* SMS Gateway Settings */}
      <SMSGatewaySettings />

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="card-matrix-cyan p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-matrix-neon-cyan mb-4 matrix-text">&gt; RESET SECURITY TOKEN</h2>

            {passwordError && (
              <ErrorAlert
                type="error"
                title="ERROR"
                message={passwordError}
                onClose={() => setPasswordError(null)}
                dismissible
              />
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-matrix-neon-green mb-1 font-mono">
                  $ NEW_PASSWORD
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({ ...passwords, new: e.target.value })
                  }
                  placeholder="Enter new password"
                  className="input-matrix"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-matrix-neon-green mb-1 font-mono">
                  $ CONFIRM_PASSWORD
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="input-matrix"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({ current: "", new: "", confirm: "" });
                  setPasswordError(null);
                }}
                className="btn-matrix-secondary flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="btn-matrix-primary flex-1 flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  "◈ CONFIRM"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
