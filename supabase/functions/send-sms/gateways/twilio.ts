import { SMSGatewayResult } from "../types.ts";

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export async function sendViaTwilio(
  config: TwilioConfig,
  phoneNumbers: string[],
  message: string
): Promise<SMSGatewayResult[]> {
  const results: SMSGatewayResult[] = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + config.accountSid + "/Messages.json", {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(config.accountSid + ":" + config.authToken),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: config.phoneNumber,
          To: phoneNumber,
          Body: message,
        }).toString(),
      });

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
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
