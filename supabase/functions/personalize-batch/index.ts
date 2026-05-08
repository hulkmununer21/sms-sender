import { jwtDecode } from "https://esm.sh/jwt-decode@4";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

interface PersonalizationVariables {
  [key: string]: string | number | boolean | undefined;
}

interface BatchItem {
  contactId: string;
  contact: Contact;
  variables: PersonalizationVariables;
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

interface PersonalizationResponse {
  success: boolean;
  personalizations?: Array<{
    contactId: string;
    personalized_message: string;
    variables: PersonalizationVariables;
    tokens: number;
    cost: number;
  }>;
  total_tokens?: number;
  total_cost?: number;
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

// Replace template variables with actual values
function personalizeTemplate(
  template: string,
  variables: PersonalizationVariables
): string {
  let result = template;

  // Replace each variable in the template
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{${key}}}`, "gi");
      result = result.replace(regex, String(value));
    }
  });

  // Remove unreplaced variables
  result = result.replace(/{{[^}]+}}/g, "");

  return result;
}

// Call DeepSeek API for personalization
async function personalizeWithAI(
  template: string,
  batch: BatchItem[]
): Promise<{
  personalizations: Array<{
    contactId: string;
    personalized_message: string;
    variables: PersonalizationVariables;
    tokens: number;
    cost: number;
  }>;
  totalTokens: number;
  totalCost: number;
}> {
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const personalizations: Array<{
    contactId: string;
    personalized_message: string;
    variables: PersonalizationVariables;
    tokens: number;
    cost: number;
  }> = [];

  let totalTokens = 0;
  let totalCost = 0;

  // Build a single prompt for all contacts in the batch
  const contactsList = batch
    .map((item) => {
      const varStr = Object.entries(item.variables)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `Contact ID: ${item.contactId}, Data: {${varStr}}`;
    })
    .join("\n");

  const batchPrompt = `You are a message personalization expert. Given a template message and a list of contacts with their personal information, create a personalized version of the message for each contact.

Template Message:
"${template}"

Contacts:
${contactsList}

For each contact, replace the template variables with actual values and make it natural and engaging. Return the personalization in this JSON format:
{
  "personalizations": [
    {
      "contactId": "contact_id_here",
      "personalized_message": "personalized text here",
      "tokens": estimated_tokens_used
    }
  ]
}

Create natural, conversational messages that feel personalized to each contact. Keep each message to a reasonable length.`;

  try {
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
            content:
              "You are an expert at personalizing messages based on recipient information. Always maintain the core message while adding personal touches.",
          },
          {
            role: "user",
            content: batchPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const aiResponse = (await response.json()) as LightningAIResponse;

    if (!aiResponse.choices || aiResponse.choices.length === 0) {
      throw new Error("No response from DeepSeek");
    }

    const responseText = aiResponse.choices[0].message.content;

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Extract JSON from response (AI might add extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      throw new Error("Failed to parse personalization response from AI");
    }

    // Process each personalization
    parsedResponse.personalizations.forEach(
      (personalization: {
        contactId: string;
        personalized_message: string;
        tokens?: number;
      }) => {
        const batchItem = batch.find((item) => item.contactId === personalization.contactId);
        if (!batchItem) {
          console.warn(`Contact ${personalization.contactId} not found in batch`);
          return;
        }

        // Estimate tokens if not provided
        const estimatedTokens = personalization.tokens || 
          Math.ceil(personalization.personalized_message.length / 4);

        // Calculate cost (DeepSeek: $0.14 per 1M input, $0.28 per 1M output)
        const inputCost = (aiResponse.usage.prompt_tokens / 1000000) * 0.14;
        const outputCost = (estimatedTokens / 1000000) * 0.28;
        const cost = (inputCost + outputCost) * 100; // Convert to cents

        personalizations.push({
          contactId: personalization.contactId,
          personalized_message: personalization.personalized_message,
          variables: batchItem.variables,
          tokens: estimatedTokens,
          cost: cost,
        });

        totalTokens += estimatedTokens;
        totalCost += cost;
      }
    );

    return {
      personalizations,
      totalTokens: totalTokens + aiResponse.usage.prompt_tokens,
      totalCost,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`AI Personalization failed: ${errorMessage}`);
  }
}

// Calculate cost (DeepSeek pricing)
function calculateCost(promptTokens: number, completionTokens: number): number {
  // DeepSeek pricing: $0.14 per 1M input tokens, $0.28 per 1M output tokens
  const inputCost = (promptTokens / 1000000) * 0.14;
  const outputCost = (completionTokens / 1000000) * 0.28;
  return (inputCost + outputCost) * 100; // Convert to cents
}

// Main handler
async function handlePersonalizeBatch(
  req: Request
): Promise<PersonalizationResponse> {
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
  let body: { template: string; batch: BatchItem[] };
  try {
    body = await req.json();
  } catch (_error) {
    return {
      success: false,
      error: "Invalid request body",
    };
  }

  const { template, batch } = body;

  if (!template || !batch || batch.length === 0) {
    return {
      success: false,
      error: "Missing required fields: template, batch",
    };
  }

  if (template.length > 2000) {
    return {
      success: false,
      error: "Template too long (max 2000 characters)",
    };
  }

  if (batch.length > 50) {
    return {
      success: false,
      error: "Batch too large (max 50 contacts per request)",
    };
  }

  try {
    // Personalize with AI
    const result = await personalizeWithAI(template, batch);

    return {
      success: true,
      personalizations: result.personalizations,
      total_tokens: result.totalTokens,
      total_cost: result.totalCost,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Main Deno handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const result = await handlePersonalizeBatch(req);

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 400,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
