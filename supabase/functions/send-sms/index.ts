import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtDecode } from "https://esm.sh/jwt-decode@4";

interface SendSmsRequest {
  phoneNumbers: string[];
  message: string;
  campaignId?: string;
}

interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  results: {
    phoneNumber: string;
    status: "sent" | "failed";
    errorMessage?: string;
  }[];
  error?: string;
}

// Decode JWT token
function decodeToken(token: string): { sub?: string; [key: string]: unknown } {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Mock SMS gateway call
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResponse["results"]> {
  const apiKey = Deno.env.get("SMS_GATEWAY_API_KEY");

  if (!apiKey) {
    throw new Error("SMS_GATEWAY_API_KEY not configured");
  }

  // Mock implementation - in production, replace with actual SMS gateway API call
  // Example: Twilio, AWS SNS, SendGrid, or any other SMS provider
  const results = phoneNumbers.map((phoneNumber) => {
    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        phoneNumber,
        status: "sent" as const,
      };
    } else {
      return {
        phoneNumber,
        status: "failed" as const,
        errorMessage: "Invalid phone number format",
      };
    }
  });

  return results;
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

    // Call SMS gateway
    const results = await callSmsGateway(phoneNumbers, message);

    // If campaignId provided, optionally update campaign status in database
    if (campaignId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseServiceKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
