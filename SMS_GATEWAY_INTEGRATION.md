# SMS Gateway Integration Examples

This document shows how to integrate real SMS providers with the send-sms Edge Function.

## Twilio Integration

### 1. Setup Twilio Account
- Sign up at https://www.twilio.com
- Get Account SID and Auth Token from Dashboard
- Buy a phone number
- Set secrets in Supabase:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Update Edge Function

Replace the `callSmsGateway` function in `supabase/functions/send-sms/index.ts`:

```typescript
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio credentials not configured");
  }

  const auth = btoa(`${accountSid}:${authToken}`);

  const results = await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: phoneNumber,
              From: fromNumber,
              Body: message,
            }).toString(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            phoneNumber,
            status: "sent" as const,
            messageId: data.sid,
          };
        } else {
          const error = await response.json();
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: error.message || "Failed to send SMS",
          };
        }
      } catch (error) {
        return {
          phoneNumber,
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}
```

### 3. Deploy

```bash
supabase functions deploy send-sms
```

---

## AWS SNS Integration

### 1. Setup AWS Account
- Create IAM user with SNS permissions
- Get Access Key ID and Secret Access Key
- Set secrets:

```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret
supabase secrets set AWS_REGION=us-east-1
```

### 2. Update Edge Function

```typescript
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
  const region = Deno.env.get("AWS_REGION") || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured");
  }

  // Note: This uses AWS SDK v2 via npm runtime
  // For production, use the official AWS SDK for Deno when available
  
  const results = await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      try {
        const params = {
          Message: message,
          PhoneNumber: phoneNumber,
        };

        const response = await fetch(
          `https://sns.${region}.amazonaws.com/`,
          {
            method: "POST",
            headers: {
              "Authorization": `AWS4-HMAC-SHA256 ...`, // AWS Signature V4
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(params).toString(),
          }
        );

        if (response.ok) {
          return {
            phoneNumber,
            status: "sent" as const,
          };
        } else {
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: "AWS SNS failed to send",
          };
        }
      } catch (error) {
        return {
          phoneNumber,
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}
```

---

## SendGrid Integration

### 1. Setup SendGrid
- Create account at https://sendgrid.com
- Generate API key
- Set secret:

```bash
supabase secrets set SENDGRID_API_KEY=your_api_key
```

### 2. Update Edge Function

```typescript
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");

  if (!apiKey) {
    throw new Error("SendGrid API key not configured");
  }

  const results = await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      try {
        const response = await fetch(
          "https://api.sendgrid.com/v3/sms/send",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: phoneNumber,
              from: "YourCompany", // SMS alphanumeric sender ID
              text: message,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            phoneNumber,
            status: "sent" as const,
          };
        } else {
          const error = await response.json();
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: error.errors?.[0]?.message || "SendGrid failed",
          };
        }
      } catch (error) {
        return {
          phoneNumber,
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}
```

---

## Vonage (formerly Nexmo) Integration

### 1. Setup Vonage
- Create account at https://www.vonage.com
- Get API Key and API Secret
- Set secrets:

```bash
supabase secrets set VONAGE_API_KEY=your_key
supabase secrets set VONAGE_API_SECRET=your_secret
supabase secrets set VONAGE_FROM_NUMBER=YourCompany
```

### 2. Update Edge Function

```typescript
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const apiKey = Deno.env.get("VONAGE_API_KEY");
  const apiSecret = Deno.env.get("VONAGE_API_SECRET");
  const fromNumber = Deno.env.get("VONAGE_FROM_NUMBER");

  if (!apiKey || !apiSecret || !fromNumber) {
    throw new Error("Vonage credentials not configured");
  }

  const results = await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      try {
        const params = new URLSearchParams({
          api_key: apiKey,
          api_secret: apiSecret,
          to: phoneNumber,
          from: fromNumber,
          text: message,
        });

        const response = await fetch(
          `https://rest.nexmo.com/sms/json?${params}`,
          {
            method: "POST",
          }
        );

        const data = await response.json();

        if (data.messages?.[0]?.status === "0") {
          return {
            phoneNumber,
            status: "sent" as const,
            messageId: data.messages[0].message_id,
          };
        } else {
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: data.messages?.[0]?.error_text || "Vonage failed",
          };
        }
      } catch (error) {
        return {
          phoneNumber,
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}
```

---

## HubSpot Integration (SMS via HubSpot)

### 1. Setup HubSpot
- Create HubSpot account
- Generate private app access token
- Set secret:

```bash
supabase secrets set HUBSPOT_ACCESS_TOKEN=your_token
```

### 2. Update Edge Function

```typescript
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const accessToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");

  if (!accessToken) {
    throw new Error("HubSpot access token not configured");
  }

  const results = await Promise.all(
    phoneNumbers.map(async (phoneNumber) => {
      try {
        const response = await fetch(
          "https://api.hubapi.com/crm/v3/objects/contacts",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: {
                phone: phoneNumber,
                hs_lead_status: "new",
              },
            }),
          }
        );

        if (response.ok) {
          return {
            phoneNumber,
            status: "sent" as const,
          };
        } else {
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: "HubSpot API error",
          };
        }
      } catch (error) {
        return {
          phoneNumber,
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return results;
}
```

---

## Best Practices for SMS Integration

### 1. Phone Number Validation
```typescript
function validatePhoneNumber(phoneNumber: string): boolean {
  // Remove non-digits
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Must be 10-15 digits (E.164 format)
  return digits.length >= 10 && digits.length <= 15;
}

// Usage
if (!validatePhoneNumber(phoneNumber)) {
  return {
    phoneNumber,
    status: "failed" as const,
    errorMessage: "Invalid phone number format",
  };
}
```

### 2. Message Length Validation
```typescript
function validateMessage(message: string): string | null {
  const maxLength = 1600; // Maximum SMS length
  
  if (message.length === 0) {
    return "Message cannot be empty";
  }
  
  if (message.length > maxLength) {
    return `Message too long (${message.length}/${maxLength})`;
  }
  
  return null;
}
```

### 3. Rate Limiting
```typescript
// Add to Edge Function to prevent abuse
const rateLimitKey = `sms_${userId}_${Math.floor(Date.now() / 60000)}`;
const count = await redis.get(rateLimitKey) || 0;

if (count > 100) { // 100 SMS per minute per user
  throw new Error("Rate limit exceeded");
}

await redis.incr(rateLimitKey);
```

### 4. Retry Logic
```typescript
async function sendWithRetry(
  phoneNumber: string,
  message: string,
  maxRetries = 3
): Promise<SendSmsResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendSMS(phoneNumber, message);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt} failed, retrying...`);
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  throw lastError;
}
```

### 5. Logging & Monitoring
```typescript
// Log all SMS sent for audit trail
await supabase
  .from('sms_logs')
  .insert({
    user_id: userId,
    phone_number: phoneNumber,
    message: message,
    status: result.status,
    error_message: result.errorMessage,
    sent_at: new Date().toISOString(),
    provider: 'twilio', // or other provider
  });
```

---

## Testing SMS Integration Locally

### Mock SMS Gateway for Development
```typescript
// Development environment
if (Deno.env.get("ENVIRONMENT") === "development") {
  // Return mock success response
  return phoneNumbers.map(phone => ({
    phoneNumber: phone,
    status: "sent" as const,
  }));
}

// Production environment
// Call real SMS gateway
```

### Using Twilio's Test Credentials
```bash
# During development, use Twilio's test credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_test_token
TWILIO_PHONE_NUMBER=+15005550006  # Test number
```

Test phone numbers:
- `+15005550006` - Always succeeds
- `+15005550001` - Always fails with "21211" error

---

## Migration Guide: Switching Providers

If you need to switch from one SMS provider to another:

1. **Keep old provider working**
   ```typescript
   const legacyProvider = Deno.env.get("LEGACY_SMS_PROVIDER");
   if (legacyProvider === "twilio") {
     // Use old Twilio code
   } else {
     // Use new provider
   }
   ```

2. **Gradually migrate traffic**
   ```typescript
   const migrationPercentage = 25; // 25% to new provider
   if (Math.random() * 100 < migrationPercentage) {
     return await sendViaNewProvider();
   } else {
     return await sendViaLegacyProvider();
   }
   ```

3. **Monitor both providers**
   - Track success rates
   - Compare delivery times
   - Monitor costs
   - Check error rates

4. **Complete migration**
   - Once new provider is stable
   - Switch all traffic over
   - Keep old provider as fallback
   - Remove old code after 30 days

---

## Troubleshooting

### Common Issues

**"Invalid phone number"**
- Format: +1 must be international format
- Verify with Twilio's built-in validation
- Check for spaces or special characters

**"Authentication failed"**
- Verify API credentials
- Check secrets are set: `supabase secrets list`
- Confirm tokens/keys haven't expired

**"Rate limiting"**
- Check provider's rate limits
- Implement exponential backoff
- Consider queuing service

**"Message delivery failed"**
- Verify recipient phone number validity
- Check message content (some providers ban certain words)
- Try with test number first

---

## Cost Comparison

| Provider | Cost | Notes |
|----------|------|-------|
| Twilio | $0.0075/SMS (US) | Industry standard, reliable |
| SendGrid | $0.0040/SMS | Affordable option |
| AWS SNS | $0.00645/SMS | Pay-per-usage |
| Vonage | $0.05-0.15 | Higher-volume discounts |
| HubSpot | Platform included | If using HubSpot CRM |

---

## Resources

- [Twilio SMS API Docs](https://www.twilio.com/docs/sms)
- [SendGrid SMS Docs](https://docs.sendgrid.com/for-developers/sending-email-v3-api-quick-start)
- [AWS SNS Docs](https://docs.aws.amazon.com/sns/)
- [Vonage SMS Docs](https://developer.vonage.com/en/messaging/sms/overview)

---

**Next Steps**: Choose your provider, set up secrets, and update the `callSmsGateway` function!
