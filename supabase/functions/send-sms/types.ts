export interface SendSmsRequest {
  phoneNumbers: string[];
  message: string;
  campaignId?: string;
}

export interface SMSGatewayResult {
  phoneNumber: string;
  status: "sent" | "failed";
  provider: "twilio" | "infobip";
  providerId?: string;
  errorMessage?: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  results: SMSGatewayResult[];
  error?: string;
}

export interface GatewaySettings {
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
