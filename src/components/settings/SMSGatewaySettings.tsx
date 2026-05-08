import React, { useEffect, useState } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ErrorAlert } from "../common/ErrorAlert";
import { supabase } from "../../lib/supabase";

export const SMSGatewaySettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeGateway, setActiveGateway] = useState<"twilio" | "infobip">("twilio");
  const [settings, setSettings] = useState({
    twilio: {
      accountSid: "",
      authToken: "",
      phoneNumber: "",
    },
    infobip: {
      apiKey: "",
      baseUrl: "",
      senderId: "",
    },
  });

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const { data, error: err } = await supabase
          .from("sms_gateway_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (err && err.code !== "PGRST116") {
          // PGRST116 = no rows returned
          throw err;
        }

        if (data) {
          setActiveGateway(data.active_gateway);
          setSettings({
            twilio: {
              accountSid: data.twilio_account_sid || "",
              authToken: data.twilio_auth_token || "",
              phoneNumber: data.twilio_phone_number || "",
            },
            infobip: {
              apiKey: data.infobip_api_key || "",
              baseUrl: data.infobip_base_url || "",
              senderId: data.infobip_sender_id || "",
            },
          });
        }
      } catch (err) {
        console.error("Error loading gateway settings:", err);
        setError("Failed to load gateway settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Validate that the active gateway has required fields
      if (activeGateway === "twilio") {
        if (
          !settings.twilio.accountSid ||
          !settings.twilio.authToken ||
          !settings.twilio.phoneNumber
        ) {
          throw new Error("Please fill in all Twilio fields");
        }
      } else if (activeGateway === "infobip") {
        if (
          !settings.infobip.apiKey ||
          !settings.infobip.baseUrl ||
          !settings.infobip.senderId
        ) {
          throw new Error("Please fill in all Infobip fields");
        }
      }

      const gatewayData = {
        user_id: user.id,
        active_gateway: activeGateway,
        twilio_account_sid: settings.twilio.accountSid,
        twilio_auth_token: settings.twilio.authToken,
        twilio_phone_number: settings.twilio.phoneNumber,
        infobip_api_key: settings.infobip.apiKey,
        infobip_base_url: settings.infobip.baseUrl,
        infobip_sender_id: settings.infobip.senderId,
      };

      // First try to update existing record
      const { data: existingData, error: selectError } = await supabase
        .from("sms_gateway_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let error: any = null;

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 = no rows, any other error is a problem
        throw selectError;
      }

      if (existingData?.id) {
        // Record exists, update it
        const { error: updateError } = await supabase
          .from("sms_gateway_settings")
          .update(gatewayData)
          .eq("user_id", user.id);
        error = updateError;
      } else {
        // Record doesn't exist, insert it
        const { error: insertError } = await supabase
          .from("sms_gateway_settings")
          .insert([gatewayData]);
        error = insertError;
      }

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="card-matrix-purple p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="h-5 w-5 text-matrix-neon-purple" />
        <h2 className="text-lg font-bold text-matrix-neon-purple matrix-text">&gt; SMS GATEWAY CONFIG</h2>
      </div>

      {error && (
        <ErrorAlert
          type="error"
          title="CONFIGURATION ERROR"
          message={error}
          onClose={() => setError(null)}
          dismissible
        />
      )}

      {saveSuccess && (
        <ErrorAlert
          type="success"
          title="CONFIG SAVED"
          onClose={() => setSaveSuccess(false)}
          dismissible
        />
      )}

      {/* Gateway Selection */}
      <div className="mb-8 p-4 bg-matrix-dark border-2 border-matrix-neon-cyan rounded-sm">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="radio"
            id="gateway-twilio"
            name="gateway"
            value="twilio"
            checked={activeGateway === "twilio"}
            onChange={(e) => setActiveGateway(e.target.value as "twilio" | "infobip")}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="gateway-twilio" className="flex-1 cursor-pointer">
            <span className="block text-sm font-bold text-matrix-neon-yellow font-mono">◈ TWILIO ◈</span>
            <span className="text-xs text-matrix-neon-green">
              {activeGateway === "twilio" && settings.twilio.accountSid ? "✓ CONFIGURED & ACTIVE" : activeGateway === "twilio" ? "⚠ SELECTED" : "○ INACTIVE"}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="gateway-infobip"
            name="gateway"
            value="infobip"
            checked={activeGateway === "infobip"}
            onChange={(e) => setActiveGateway(e.target.value as "twilio" | "infobip")}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="gateway-infobip" className="flex-1 cursor-pointer">
            <span className="block text-sm font-bold text-matrix-neon-pink font-mono">◈ INFOBIP ◈</span>
            <span className="text-xs text-matrix-neon-cyan">
              {activeGateway === "infobip" && settings.infobip.apiKey ? "✓ CONFIGURED & ACTIVE" : activeGateway === "infobip" ? "⚠ SELECTED" : "○ INACTIVE"}
            </span>
          </label>
        </div>
      </div>

      {/* Twilio Configuration */}
      <div className={`space-y-4 mb-6 p-4 border-l-4 rounded-sm transition-all ${
        activeGateway === "twilio"
          ? "border-matrix-neon-yellow bg-matrix-dark opacity-100"
          : "border-gray-600 bg-matrix-black opacity-50 cursor-not-allowed"
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold matrix-text ${
            activeGateway === "twilio" ? "text-matrix-neon-yellow" : "text-gray-500"
          }`}>◈ TWILIO CREDENTIALS ◈</h3>
          {activeGateway === "twilio" && (
            <span className="text-xs px-2 py-1 bg-matrix-neon-yellow text-matrix-black font-bold rounded">ACTIVE</span>
          )}
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "twilio" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ ACCOUNT_SID
          </label>
          <input
            type="text"
            value={settings.twilio.accountSid}
            onChange={(e) =>
              setSettings({
                ...settings,
                twilio: { ...settings.twilio, accountSid: e.target.value },
              })
            }
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="input-matrix"
            disabled={activeGateway !== "twilio"}
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "twilio" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ AUTH_TOKEN
          </label>
          <input
            type="password"
            value={settings.twilio.authToken}
            onChange={(e) =>
              setSettings({
                ...settings,
                twilio: { ...settings.twilio, authToken: e.target.value },
              })
            }
            placeholder="Enter your auth token"
            className="input-matrix"
            disabled={activeGateway !== "twilio"}
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "twilio" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ PHONE_NUMBER
          </label>
          <input
            type="tel"
            value={settings.twilio.phoneNumber}
            onChange={(e) =>
              setSettings({
                ...settings,
                twilio: { ...settings.twilio, phoneNumber: e.target.value },
              })
            }
            placeholder="+1234567890"
            className="input-matrix"
            disabled={activeGateway !== "twilio"}
          />
        </div>
      </div>

      {/* Infobip Configuration */}
      <div className={`space-y-4 mb-6 p-4 border-l-4 rounded-sm transition-all ${
        activeGateway === "infobip"
          ? "border-matrix-neon-pink bg-matrix-dark opacity-100"
          : "border-gray-600 bg-matrix-black opacity-50 cursor-not-allowed"
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold matrix-text ${
            activeGateway === "infobip" ? "text-matrix-neon-pink" : "text-gray-500"
          }`}>◈ INFOBIP CONFIG ◈</h3>
          {activeGateway === "infobip" && (
            <span className="text-xs px-2 py-1 bg-matrix-neon-pink text-matrix-black font-bold rounded">ACTIVE</span>
          )}
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "infobip" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ API_KEY
          </label>
          <input
            type="password"
            value={settings.infobip.apiKey}
            onChange={(e) =>
              setSettings({
                ...settings,
                infobip: { ...settings.infobip, apiKey: e.target.value },
              })
            }
            placeholder="Enter your API key"
            className="input-matrix"
            disabled={activeGateway !== "infobip"}
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "infobip" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ BASE_URL
          </label>
          <input
            type="text"
            value={settings.infobip.baseUrl}
            onChange={(e) =>
              setSettings({
                ...settings,
                infobip: { ...settings.infobip, baseUrl: e.target.value },
              })
            }
            placeholder="https://xxxx.infobip.com"
            className="input-matrix"
            disabled={activeGateway !== "infobip"}
          />
        </div>

        <div>
          <label className={`block text-sm font-bold mb-1 font-mono ${
            activeGateway === "infobip" ? "text-matrix-neon-green" : "text-gray-500"
          }`}>
            $ SENDER_ID
          </label>
          <input
            type="text"
            value={settings.infobip.senderId}
            onChange={(e) =>
              setSettings({
                ...settings,
                infobip: { ...settings.infobip, senderId: e.target.value },
              })
            }
            placeholder="YourSender"
            className="input-matrix"
            disabled={activeGateway !== "infobip"}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-matrix-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              TRANSMITTING...
            </>
          ) : (
            <>
              ◈ COMMIT CONFIG
            </>
          )}
        </button>
      </div>
    </div>
  );
};
