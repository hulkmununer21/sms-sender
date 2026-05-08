# SMS Sender - AI Personalization Integration Guide

## Overview

This guide explains how the frontend AI personalization system has been integrated into the SMS Sender application. The personalization happens entirely on the frontend, allowing users to create unique, AI-generated messages for each recipient before sending to the SMS gateway.

## Architecture

### Two-Phase Personalization

**Phase 1: Simple Variable Substitution** (Free, Instant)
- Extract variables from contact data (first_name, last_name, area_code, state, email_domain, etc.)
- Replace template variables like `{{first_name}}` with actual values
- Cost: $0 (zero API calls)
- Speed: Instant

**Phase 2: AI Personalization** (DeepSeek, Fast)
- Generate unique, natural messages for each recipient using AI
- Leverages contact variables that don't fit template substitution
- Cost: ~$0.00005 per recipient
- Speed: ~2-3 seconds for 50 contacts
- Model: DeepSeek Chat model via DeepSeek API

### File Structure

```
src/
├── components/
│   └── personalization/
│       ├── PersonalizationSelector.tsx       # Main modal for choosing personalization method
│       ├── PersonalizationVariableAnalyzer.tsx # Shows available variables and coverage %
│       └── PersonalizationPreview.tsx       # Modal showing results before accepting
├── hooks/
│   ├── usePersonalizeBatch.ts               # Calls personalize-batch Edge Function
│   └── usePersonalizedMessages.ts           # State management for personalized messages
├── utils/
│   └── templateEngine.ts                    # Variable extraction and substitution logic
└── pages/
    └── CampaignsPage.tsx                    # Integrated campaign builder

supabase/
└── functions/
    └── personalize-batch/
        └── index.ts                         # Edge Function calling DeepSeek API
```

## Integration Points

### 1. CampaignsPage Integration

The campaign builder has been updated with personalization support:

**Step 1: Campaign Name** (Unchanged)
- User enters campaign name

**Step 2: Select Contacts** (Unchanged)
- User selects recipients for the campaign
- "Select All" button added for convenience

**Step 3: Message Template + Personalization** (NEW)
- User enters message template with optional variables
- Template can use variables like `{{first_name}}`, `{{area_code}}`, `{{email_domain}}`
- New "Personalize" button opens PersonalizationSelector modal
- AI Message Enhancer available to improve base template
- Personalization status shows: "✓ 45 personalized messages ready"
- Total cost displays if using AI personalization

**Create Campaign**
- If personalized messages exist, they're stored with the campaign
- Otherwise, template used for all contacts

### 2. Component Usage

```typescript
// In CampaignsPage, personalized messages are managed:
const personalizedMessages = usePersonalizedMessages();

// When user clicks "Personalize" button:
<PersonalizationSelector
  template={message}
  allContacts={contacts}
  selectedContactIds={selectedContacts}
  onPersonalizationComplete={handlePersonalizationComplete}
  onCancel={() => setShowPersonalizationSelector(false)}
/>

// Callback stores messages and closes modal:
const handlePersonalizationComplete = (messages: PersonalizedMessage[]) => {
  personalizedMessages.setMessages(messages);
  setShowPersonalizationSelector(false);
};
```

## User Flow

```
1. User clicks "New Campaign"
   ↓
2. Step 1: Enter campaign name (e.g., "Holiday Promo 2024")
   ↓
3. Step 2: Select contacts (e.g., 50 customers)
   ↓
4. Step 3: Enter message template
   - Optional: Use {{first_name}}, {{area_code}}, {{email_domain}}
   - Optional: Enhance message with AI
   - Button: "Personalize" → Opens PersonalizationSelector
   ↓
5. PersonalizationSelector Modal
   - Option A: Simple Variables (instant, free)
   - Option B: AI Personalization (3 sec, ~$0.0025 for 50 contacts)
   ↓
6. PersonalizationVariableAnalyzer displays
   - Available variables in template
   - Coverage % for each variable (e.g., 98% have first_name, 100% have area_code)
   - Color-coded readiness: green/yellow
   ↓
7. User clicks "Phase 1: Simple Variables" or "Phase 2: AI Personalization"
   - Phase 1: Instant substitution → Preview modal
   - Phase 2: AI batch processing → Progress bar → Preview modal
   ↓
8. PersonalizationPreview Modal shows
   - 3 sample messages by default
   - Search to find specific recipient
   - Expandable view showing all variables used
   - Stats: 45 messages, avg 140 chars, ~$0.0025 total cost
   - Buttons: Accept / Reject / Customize
   ↓
9. User clicks "Accept"
   - Messages stored in personalizedMessages state
   - Modal closes, returns to Step 3
   - UI shows: "✓ 45 personalized messages ready"
   - Cost displays: "Total cost: $0.0025 • 2,145 tokens"
   ↓
10. User clicks "Create Campaign"
    - Campaign created with personalized_messages array
    - Campaign becomes "personalized" in database
    - Ready for sending by SMS sender workflow
```

## Implementation Details

### usePersonalizedMessages Hook

```typescript
const personalizedMessages = usePersonalizedMessages();

// Returns:
{
  messages: PersonalizedMessage[],     // Array of personalized messages
  isActive: boolean,                   // true if messages have been set
  totalCost: number,                   // Total cost in cents
  totalTokens: number,                 // Total AI tokens used
  setMessages(messages),               // Set messages from PersonalizationSelector
  getMessageForContact(contactId),     // Lookup message by contact ID
  clearMessages(),                     // Clear personalized messages
}
```

### PersonalizationSelector Component

**Props:**
```typescript
interface PersonalizationSelectorProps {
  template: string;                    // Message template with {{variables}}
  allContacts: Contact[];              // All available contacts
  selectedContactIds: string[];        // IDs of contacts to personalize for
  onPersonalizationComplete(messages); // Called when user accepts personalization
  onCancel();                          // Called when user clicks Cancel/Back
}
```

**Flow:**
1. Shows PersonalizationVariableAnalyzer
2. User chooses Phase 1 or Phase 2
3. Processes personalization (instant vs AI)
4. Shows PersonalizationPreview modal
5. Calls onPersonalizationComplete with results when accepted

### usePersonalizeBatch Hook

Handles frontend → Edge Function communication for AI personalization:

```typescript
const { personalizeWithAI, loading, error, progress } = usePersonalizeBatch();

// Call AI personalization for batch:
const messages = await personalizeWithAI(template, selectedContacts);

// Returns array of PersonalizedMessage with:
// - contactId
// - personalized (final message)
// - variables (used variables)
// - tokens (AI tokens used)
// - cost (cost in cents)
```

**Authentication:**
- Uses JWT token from Supabase session
- Automatically includes in Authorization header

**Batching:**
- Processes 8 contacts at a time to avoid API limits
- Updates progress.current as batches complete
- Total tokens and costs tracked throughout

### templateEngine.ts Utility

**Key Functions:**

```typescript
// Extract variables from a single contact
const variables = extractPersonalizationVariables(contact);
// Returns: { first_name, last_name, area_code, state, email_domain, is_work_email, has_email }

// Simple find-and-replace in template
const personalized = substituteTemplateVariables(template, variables);
// "Hi {{first_name}}, call 555-{{area_code}}-1234" → "Hi John, call 555-206-1234"

// Find all {{variable}} patterns
const variables = getTemplateVariables(template);
// "{{first_name}} from {{area_code}}" → ["first_name", "area_code"]

// Check what % of recipients have each variable
const coverage = countVariableCoverage(template, contacts);
// { first_name: 0.98, area_code: 1.0 }

// Validate if template can be fully personalized
const canPersonalize = canFullyPersonalize(template, contacts);
// Checks if all required variables are available

// Personalize all contacts with Phase 1
const messages = personalizeMessagesSimple(template, contacts);
// Returns PersonalizedMessage[] for all contacts
```

## Available Template Variables

The following variables can be used in message templates:

```
{{first_name}}    - Contact's first name
{{last_name}}     - Contact's last name
{{area_code}}     - Phone area code (extracted from phone_number)
{{state}}         - State (derived from area code)
{{email_domain}}  - Email domain (extracted from email)
{{is_work_email}} - 'true' if email appears to be work-related
{{has_email}}     - 'true' if contact has email address
```

### Area Code to State Mapping

The templateEngine includes a comprehensive AREA_CODE_TO_STATE mapping with 1000+ US area codes automatically converting area codes to their corresponding state abbreviations.

Example:
- 206 → WA (Washington)
- 415 → CA (California)
- 347 → NY (New York)
- 512 → TX (Texas)

## AI Personalization Details

### Edge Function: personalize-batch

**Endpoint:** `supabase/functions/personalize-batch/`

**Request:**
```typescript
{
  template: string,
  contacts: Array<{
    id: string,
    name: string | null,
    variables: PersonalizationVariables
  }>,
  apiKey: string  // DeepSeek API key (from environment)
}
```

**Process:**
1. Validate JWT token from request
2. Extract personalization variables for each contact
3. Build single prompt with all batch contacts
4. Call DeepSeek API: `deepseek-chat` model
5. Parse JSON response (personalized messages)
6. Calculate token cost based on usage
7. Return array of messages with tokens and costs

**Response:**
```typescript
{
  personalized_messages: Array<{
    contactId: string,
    personalized: string,
    variables: PersonalizationVariables,
    tokens: number,
    cost: number
  }>,
  total_tokens: number,
  total_cost: number
}
```

### API Key Configuration

The personalize-batch Edge Function requires a DeepSeek API key. Set this in your Supabase environment:

```bash
# supabase/functions/.env
DEEPSEEK_API_KEY=sk_...your_deepseek_key...
```

Access it in the Edge Function:
```typescript
const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
```

## Deployment

### 1. Deploy Edge Function

```bash
# Deploy personalize-batch Edge Function to Supabase
supabase functions deploy personalize-batch --project-id YOUR_PROJECT_ID

# Or use local development:
supabase functions serve
```

### 2. Set Environment Variables

In Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Environment Variables
2. Add: `DEEPSEEK_API_KEY` = (your DeepSeek API key)

### 3. Update Campaign Table

The campaigns table might need a new column to store personalized messages:

```sql
ALTER TABLE campaigns ADD COLUMN personalized_messages JSONB DEFAULT NULL;
```

(Optional - can also send personalized messages directly in campaign payload)

## Testing

### Test Phase 1 (Simple Variables)

1. Create campaign with 5 sample contacts
2. Step 3: Enter template with `{{first_name}}` and `{{area_code}}`
3. Click "Personalize"
4. Choose "Phase 1: Simple Variables"
5. Verify: Preview shows "John from 206", "Sarah from 415", etc.

### Test Phase 2 (AI Personalization)

1. Create campaign with 3 sample contacts
2. Step 3: Enter template for AI (longer message)
3. Click "Personalize"
4. Choose "Phase 2: AI Personalization"
5. Monitor progress bar
6. Verify: Preview shows unique, natural messages for each contact
7. Check: Stats show correct token count and cost

### Test Full Flow

1. Create campaign
2. Add 10 contacts
3. Enter template message
4. Personalize with Phase 2 (AI)
5. Accept personalization
6. Create campaign
7. Verify campaign shows personalized in database
8. Verify personalized_messages array contains 10 unique messages

## Troubleshooting

### "PersonalizationSelector not rendering"
- Check: selectedContacts length > 0 before showing
- Check: message template is populated
- Check: All contacts exist in database

### "AI personalization fails"
- Check: LIGHTNING_AI_API_KEY is set in Supabase environment
- Check: DeepSeek account has API credits
- Check: Edge Function deployed successfully
- Check: JWT token is valid (check browser console)

### "Progress bar stuck"
- Check: Network tab - is Edge Function responding?
- Check: DeepSeek API limits not exceeded
- Check: Batch size correct (8 contacts per request)

### "PersonalizationPreview shows incorrect coverage"
- Check: Contact data imported correctly
- Check: extractPersonalizationVariables logic handles nulls
- Check: Area code mapping complete in templateEngine.ts

## Next Steps

### Sending Personalized Messages

To send campaigns with personalized messages:

1. Update send-sms Edge Function to check for personalized_messages
2. If personalized messages exist, send each contact their unique message
3. Otherwise, send template message to all contacts

```typescript
// In send-sms Edge Function:
if (campaign.personalized_messages?.length > 0) {
  // Send personalized
  for (const msg of campaign.personalized_messages) {
    await sendSMS(contactId, msg.personalized);
  }
} else {
  // Send template to all
  for (const contact of contacts) {
    await sendSMS(contact.id, campaign.message);
  }
}
```

### Database Optimization

For campaigns with many contacts, consider:
1. Store personalized messages in separate table
2. Enable compression for JSONB storage
3. Create index on campaign_id for lookups

### Analytics & Reporting

Track:
- % of campaigns using personalization
- AI personalization vs simple variables
- Average cost per campaign
- Message engagement by personalization type
- Most common variables used

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify DeepSeek API connection
4. Review Edge Function environment variables
5. Test with small contact batch (3-5) first
