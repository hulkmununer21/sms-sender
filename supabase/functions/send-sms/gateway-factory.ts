import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendViaTwilio } from "./gateways/twilio.ts";
import { sendViaInfobip } from "./gateways/infobip.ts";
import { GatewaySettings, SMSGatewayResult } from "./types.ts";

export async function getGatewaySettings(
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

export async function sendSmsWithGateway(
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
