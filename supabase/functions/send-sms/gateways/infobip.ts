import { SMSGatewayResult } from "../types.ts";

export interface InfobipConfig {
  apiKey: string;
  baseUrl: string;
  senderId: string;
}

export async function sendViaInfobip(
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
        "Authorization": `App ${config.apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
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
          errorMessage: data.requestError?.serviceException?.text || "Infobip API error",
        });
      });
    }
  } catch (error) {
    phoneNumbers.forEach((phoneNumber) => {
      results.push({
        phoneNumber,
        status: "failed",
        provider: "infobip",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    });
  }

  return results;
}
