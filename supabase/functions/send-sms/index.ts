import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtDecode } from "https://esm.sh/jwt-decode@4";

// ============================================================================
// TYPES
// ============================================================================
interface SendSmsRequest {
  phoneNumbers: string[];
  message: string;
  campaignId?: string;
}

interface SMSGatewayResult {
  phoneNumber: string;
  status: "sent" | "failed";
  provider: "twilio" | "infobip";
  providerId?: string;
  errorMessage?: string;
}

interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  results: SMSGatewayResult[];
  error?: string;
}

interface GatewaySettings {
  activeGateway: "twilio" | "infobip";
  twilio?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  infobip?: {
    apiKey: string;
    baseUrl: string;
    senderId: string;
  };
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

interface InfobipConfig {
  apiKey: string;
  baseUrl: string;
  senderId: string;
}

// ============================================================================
// GATEWAY IMPLEMENTATIONS
// ============================================================================

// Twilio Gateway
async function sendViaTwilio(
  config: TwilioConfig,
  phoneNumbers: string[],
  message: string
): Promise<SMSGatewayResult[]> {
  const results: SMSGatewayResult[] = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      const response = await fetch(
        "https://api.twilio.com/2010-04-01/Accounts/" +
          config.accountSid +
          "/Messages.json",
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + btoa(config.accountSid + ":" + config.authToken),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: config.phoneNumber,
            To: phoneNumber,
            Body: message,
          }).toString(),
        }
      );

      const data = await response.json();

      if (response.ok && data.sid) {
        results.push({
          phoneNumber,
          status: "sent",
          providerId: data.sid,
          provider: "twilio",
        });
      } else {
        results.push({
          phoneNumber,
          status: "failed",
          provider: "twilio",
          errorMessage: data.message || "Failed to send SMS",
        });
      }
    } catch (error) {
      results.push({
        phoneNumber,
        status: "failed",
        provider: "twilio",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// Infobip Gateway
async function sendViaInfobip(
  config: InfobipConfig,
  phoneNumbers: string[],
  message: string
): Promise<SMSGatewayResult[]> {
  const results: SMSGatewayResult[] = [];

  try {
    const payload = {
      messages: phoneNumbers.map((phoneNumber) => ({
        destinations: [
          {
            messageId: `msg-${Date.now()}-${Math.random()}`,
            to: phoneNumber,
          },
        ],
        from: config.senderId,
        text: message,
      })),
    };

    const response = await fetch(`${config.baseUrl}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        Authorization: `App ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.messages) {
      for (const msg of data.messages) {
        const phoneNumber = msg.destinations?.[0]?.to;
        if (phoneNumber) {
          if (msg.status?.groupId === 1) {
            // Status group 1 = PENDING
            results.push({
              phoneNumber,
              status: "sent",
              providerId: msg.messageId,
              provider: "infobip",
            });
          } else {
            results.push({
              phoneNumber,
              status: "failed",
              provider: "infobip",
              errorMessage: msg.status?.description || "Failed to send SMS",
            });
          }
        }
      }
    } else {
      // All numbers failed
      phoneNumbers.forEach((phoneNumber) => {
        results.push({
          phoneNumber,
          status: "failed",
          provider: "infobip",
          errorMessage:
            data.requestError?.serviceException?.text || "Infobip API error",
        });
      });
    }
  } catch (error) {
    phoneNumbers.forEach((phoneNumber) => {
      results.push({
        phoneNumber,
        status: "failed",
        provider: "infobip",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  return results;
}

// ============================================================================
// GATEWAY FACTORY
// ============================================================================

async function getGatewaySettings(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<GatewaySettings | null> {
  const { data, error } = await supabase
    .from("sms_gateway_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching gateway settings:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  const settings: GatewaySettings = {
    activeGateway: data.active_gateway,
  };

  if (data.active_gateway === "twilio") {
    settings.twilio = {
      accountSid: data.twilio_account_sid,
      authToken: data.twilio_auth_token,
      phoneNumber: data.twilio_phone_number,
    };
  } else if (data.active_gateway === "infobip") {
    settings.infobip = {
      apiKey: data.infobip_api_key,
      baseUrl: data.infobip_base_url,
      senderId: data.infobip_sender_id,
    };
  }

  return settings;
}

async function sendSmsWithGateway(
  settings: GatewaySettings,
  phoneNumbers: string[],
  message: string
): Promise<SMSGatewayResult[]> {
  if (settings.activeGateway === "twilio" && settings.twilio) {
    return sendViaTwilio(settings.twilio, phoneNumbers, message);
  } else if (settings.activeGateway === "infobip" && settings.infobip) {
    return sendViaInfobip(settings.infobip, phoneNumbers, message);
  } else {
    throw new Error(`Unsupported gateway: ${settings.activeGateway}`);
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

// Decode JWT token
function decodeToken(token: string): { sub?: string; [key: string]: unknown } {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract and validate JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid Authorization header",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decoded = decodeToken(token);
    const userId = decoded.sub;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid token: missing user ID" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: SendSmsRequest = await req.json();
    const { phoneNumbers, message, campaignId } = body;

    // Validate input
    if (
      !Array.isArray(phoneNumbers) ||
      phoneNumbers.length === 0 ||
      !message ||
      typeof message !== "string"
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid request: phoneNumbers (array) and message (string) are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (message.length > 1600) {
      return new Response(
        JSON.stringify({
          error: "Message too long (max 1600 characters)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get gateway settings for the user
    const gatewaySettings = await getGatewaySettings(supabase, userId);

    if (!gatewaySettings) {
      return new Response(
        JSON.stringify({
          error: "SMS gateway not configured for your account",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send SMS via the selected gateway
    const rawResults = await sendSmsWithGateway(
      gatewaySettings,
      phoneNumbers,
      message
    );

    // Transform results to response format
    const results = rawResults.map((r) => ({
      phoneNumber: r.phoneNumber,
      status: r.status,
      errorMessage: r.errorMessage,
      provider: r.provider,
    }));

    // If campaignId provided, update campaign status in database
    if (campaignId) {
      try {
        const successCount = results.filter(
          (r) => r.status === "sent"
        ).length;
        const failedCount = results.filter(
          (r) => r.status === "failed"
        ).length;

        // Update campaign record
        await supabase
          .from("campaigns")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            successful_count: successCount,
            failed_count: failedCount,
          })
          .eq("id", campaignId)
          .eq("user_id", userId);
      } catch (error) {
        console.error("Error updating campaign:", error);
        // Don't fail the request if campaign update fails
      }
    }

    // Return response
    const response: SendSmsResponse = {
      success: results.some((r) => r.status === "sent"),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      results,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in send-sms function:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        results: [],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
