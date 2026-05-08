import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { jwtDecode } from "https://esm.sh/jwt-decode@4";

interface EnhanceMessageRequest {
  message: string;
  enhancementType: "personalize" | "tone" | "summarize" | "clarity" | "translate";
  enhancementParams?: Record<string, string | number>;
  campaignId?: string;
}

interface LightningAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface EnhanceMessageResponse {
  success: boolean;
  enhancedMessage?: string;
  originalMessage?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  error?: string;
}

// Helper to add CORS headers to response
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

// Decode JWT token
function decodeToken(token: string): { sub?: string; [key: string]: unknown } {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Get enhancement system prompt based on type
function getSystemPrompt(enhancementType: string, params?: Record<string, string | number>): string {
  const prompts: Record<string, string> = {
    personalize: "You are a professional message writer. Personalize SMS messages by adding human touches while keeping them concise and impactful. Keep the message under 160 characters.",
    tone: `You are a message editor. Adjust the tone of SMS messages to be ${params?.tone || "casual"} while maintaining the core message. Keep it under 160 characters.`,
    summarize: "You are a message summarizer. Condense the given message into an SMS-friendly version (max 160 characters) without losing the main point.",
    clarity: "You are a clarity expert. Rewrite the message to be clearer and more understandable for a general audience. Remove jargon and simplify language. Keep it under 160 characters.",
    translate: `You are a professional translator. Translate the message to ${params?.language || "Spanish"}. Keep it under 160 characters.`,
  };

  return prompts[enhancementType] || prompts.personalize;
}

// Call DeepSeek API
async function callDeepSeekAI(
  message: string,
  enhancementType: string,
  params?: Record<string, string | number>
): Promise<LightningAIResponse> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const systemPrompt = getSystemPrompt(enhancementType, params);

  const userPrompt = `${
    enhancementType === "personalize"
      ? "Enhance this message to be more personalized:"
      : enhancementType === "tone"
        ? `Adjust to ${params?.tone || "casual"} tone:`
        : enhancementType === "summarize"
          ? "Summarize to SMS length:"
          : enhancementType === "clarity"
            ? "Make clearer:"
            : enhancementType === "translate"
              ? `Translate to ${params?.language || "Spanish"}:`
              : "Enhance this message:"
  }\n\n"${message}"`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  return response.json() as Promise<LightningAIResponse>;
}

// Calculate cost (DeepSeek pricing)
// DeepSeek: $0.14 per 1M input tokens, $0.28 per 1M output tokens
function calculateCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1000000) * 0.14;
  const outputCost = (completionTokens / 1000000) * 0.28;
  return (inputCost + outputCost) * 100; // Convert to cents
}

// Main handler
async function handleEnhanceMessage(
  req: Request,
  supabaseClient: ReturnType<typeof createClient>
): Promise<EnhanceMessageResponse> {
  // Verify authentication
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      success: false,
      error: "Unauthorized: Missing Authorization header",
    };
  }

  const token = authHeader.replace("Bearer ", "");
  let userId: string;

  try {
    const decoded = decodeToken(token);
    userId = decoded.sub as string;
  } catch (_error) {
    return {
      success: false,
      error: "Unauthorized: Invalid token",
    };
  }

  // Parse request body
  let body: EnhanceMessageRequest;
  try {
    body = await req.json();
  } catch (_error) {
    return {
      success: false,
      error: "Invalid request body",
    };
  }

  const { message, enhancementType, enhancementParams, campaignId } = body;

  if (!message || !enhancementType) {
    return {
      success: false,
      error: "Missing required fields: message, enhancementType",
    };
  }

  if (message.length > 1000) {
    return {
      success: false,
      error: "Message too long (max 1000 characters)",
    };
  }

  try {
    // Call DeepSeek API
    const aiResponse = await callDeepSeekAI(message, enhancementType, enhancementParams);

    if (
      !aiResponse.choices ||
      aiResponse.choices.length === 0 ||
      !aiResponse.choices[0].message
    ) {
      throw new Error("Invalid response from Lightning.ai");
    }

    const enhancedMessage = aiResponse.choices[0].message.content.trim();
    const tokens = aiResponse.usage;
    const costCents = calculateCost(tokens.prompt_tokens, tokens.completion_tokens);

    // Store enhancement record in database
    if (campaignId) {
      const { error: dbError } = await supabaseClient.from("message_variations").insert({
        user_id: userId,
        campaign_id: campaignId,
        original_message: message,
        enhanced_message: enhancedMessage,
        enhancement_type: enhancementType,
        enhancement_params: enhancementParams || {},
        ai_model: "deepseek-chat",
        prompt_tokens: tokens.prompt_tokens,
        completion_tokens: tokens.completion_tokens,
        total_tokens: tokens.total_tokens,
        cost_cents: costCents,
        status: "success",
      });

      if (dbError) {
        console.error("Database error:", dbError);
      }
    }

    // Also track usage
    await supabaseClient.from("ai_usage_tracking").insert({
      user_id: userId,
      enhancement_type: enhancementType,
      ai_model: "deepseek-chat",
      total_tokens: tokens.total_tokens,
      cost_cents: costCents,
      status: "success",
    });

    return {
      success: true,
      originalMessage: message,
      enhancedMessage,
      tokens: {
        prompt: tokens.prompt_tokens,
        completion: tokens.completion_tokens,
        total: tokens.total_tokens,
      },
      cost: costCents,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failed enhancement attempt
    if (campaignId) {
      await supabaseClient.from("message_variations").insert({
        user_id: userId,
        campaign_id: campaignId,
        original_message: message,
        enhanced_message: "",
        enhancement_type: enhancementType,
        enhancement_params: enhancementParams || {},
        ai_model: "deepseek-chat",
        status: "failed",
        error_message: errorMessage,
      });
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Main Deno handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders(),
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: corsHeaders(),
      }
    );
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server configuration error: Missing Supabase credentials",
      }),
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }

  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  const result = await handleEnhanceMessage(req, supabaseClient);

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 400,
    headers: corsHeaders(),
  });
});
