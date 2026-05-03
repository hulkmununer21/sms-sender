# SMS Sender - Modern React + Vite + Supabase Architecture

A robust, production-ready SMS Sender web application built with modern technologies and security best practices.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                   │
│                   Hosted on Vercel/Netlify                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components (ContactList, CampaignForm, etc.)        │  │
│  │  ↓                                                    │  │
│  │  Context (AuthContext for session management)        │  │
│  │  ↓                                                    │  │
│  │  Hooks (useContacts, useSendSms, etc.)              │  │
│  │  ↓                                                    │  │
│  │  @supabase/supabase-js Client                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↕                                    │
└────────────┬──────────────────────────────────────────────┬──────┐
             │                                              │      │
    Supabase Auth              Supabase PostgreSQL      Edge      │
    (Email/Password)           Database (RLS)          Functions  │
                               - contacts              (Deno)     │
                               - campaigns             - send-sms │
                               - campaign_recipients            │
             │                                                   │
             └──────────────────────────────────────────────────┘
                                   ↓
                    SMS Gateway (Twilio, etc.)
```

## Key Security Features

- **Row Level Security (RLS)**: All database operations are restricted to authenticated users using `auth.uid()`
- **JWT Authentication**: Edge Functions validate JWT tokens from Authorization headers
- **API Key Protection**: SMS gateway API keys are stored in Supabase secrets, never exposed to the frontend
- **Direct Database Access**: The frontend uses the @supabase/supabase-js client with RLS policies, eliminating the need for a separate backend API

## Project Structure

```
sms-sender/
├── src/
│   ├── components/
│   │   └── ContactList.tsx           # Contact management component
│   ├── context/
│   │   └── AuthContext.tsx           # Auth state management
│   ├── hooks/
│   │   ├── useContacts.ts            # Contact CRUD operations
│   │   └── useSendSms.ts             # SMS sending functionality
│   ├── lib/
│   │   └── supabase.ts               # Supabase client initialization
│   ├── types/
│   │   └── database.ts               # TypeScript database types
│   └── App.tsx
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Database schema & RLS policies
│   └── functions/
│       └── send-sms/
│           └── index.ts              # Deno Edge Function
├── .env.example                      # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available at https://supabase.com)
- Vercel account (or any static hosting provider)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from the API settings

### 3. Deploy Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query to create tables and RLS policies

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# For development
SMS_GATEWAY_API_KEY=test_key_for_development
```

### 5. Setup Supabase Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase@latest
   ```

2. Link your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Set SMS gateway secret:
   ```bash
   supabase secrets set SMS_GATEWAY_API_KEY=your_actual_api_key
   ```

4. Deploy the Edge Function:
   ```bash
   supabase functions deploy send-sms
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## API Reference

### Components

#### `ContactList`

A complete contact management component with add/delete functionality.

```tsx
import { ContactList } from '@/components/ContactList';

export default function App() {
  return (
    <div>
      <ContactList />
    </div>
  );
}
```

### Hooks

#### `useContacts()`

Manage contacts with automatic RLS filtering.

```tsx
const { 
  contacts,      // Contact[]
  loading,       // boolean
  error,         // Error | null
  addContact,    // (contact: ContactInsert) => Promise<Contact>
  deleteContact, // (id: string) => Promise<void>
  refetch        // () => Promise<void>
} = useContacts();
```

#### `useSendSms()`

Send SMS through Edge Function with JWT validation.

```tsx
const {
  sendSms,  // (phoneNumbers: string[], message: string, campaignId?: string) => Promise<Result[]>
  loading,  // boolean
  error,    // Error | null
  results   // SendSmsResult[] | null
} = useSendSms();

// Usage
const results = await sendSms(
  ['+1234567890', '+0987654321'],
  'Hello! This is a test message.'
);
```

### Data Types

#### Contact

```typescript
interface Contact {
  id: string;
  user_id: string;
  phone_number: string;
  name?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}
```

#### Campaign

```typescript
interface Campaign {
  id: string;
  user_id: string;
  title: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string | null;
  sent_at?: string | null;
  contact_count: number;
  successful_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}
```

## Security Considerations

### Database Security

All database tables have RLS enabled:
- **SELECT**: Users can only view their own records
- **INSERT**: Users can only insert records with their `user_id`
- **UPDATE**: Users can only modify their own records
- **DELETE**: Users can only delete their own records

### Edge Function Security

The `send-sms` Edge Function:
1. Validates JWT tokens from the Authorization header
2. Extracts `user_id` from the JWT `sub` claim
3. Verifies API keys through Supabase secrets (never exposed to frontend)
4. Returns results asynchronously without blocking the response

### API Key Management

Never commit API keys to version control:
1. Add `.env.local` to `.gitignore`
2. Use `.env.example` as a template
3. Store secrets in Supabase via the CLI: `supabase secrets set KEY=value`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous (public) key |
| `SMS_GATEWAY_API_KEY` | Yes | Your SMS gateway provider API key |

**Note**: Only `VITE_*` variables are exposed to the frontend. Server-side secrets use Supabase's secret management.

## Integrating Real SMS Gateway

The current `send-sms` Edge Function mocks the SMS gateway. To integrate a real provider:

### Example: Twilio Integration

```typescript
// In supabase/functions/send-sms/index.ts
async function callSmsGateway(
  phoneNumbers: string[],
  message: string
): Promise<SendSmsResult[]> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

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
              From: fromNumber!,
              Body: message,
            }).toString(),
          }
        );

        if (response.ok) {
          return { phoneNumber, status: "sent" as const };
        } else {
          const error = await response.json();
          return {
            phoneNumber,
            status: "failed" as const,
            errorMessage: error.message,
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

Then set the secrets:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
supabase functions deploy send-sms
```

## Development Workflow

### Creating New Components

1. Create component in `src/components/`
2. Import and use in your pages
3. Leverage existing hooks for database operations

### Adding New Database Tables

1. Create migration in `supabase/migrations/`
2. Add TypeScript types to `src/types/database.ts`
3. Add RLS policies to your migration
4. Create hooks in `src/hooks/` for CRUD operations

### Testing RLS Policies

Test that users can only access their own data:

```typescript
// This should succeed
const { data } = await supabase
  .from('contacts')
  .select('*');
// Returns only current user's contacts

// This should fail (RLS prevents it)
const { error } = await supabase
  .from('contacts')
  .select('*')
  .eq('user_id', 'different-user-id');
// Error: row level security violation
```

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy automatically on push to main branch

```bash
npm run build
vercel deploy --prod
```

### Deploy to Netlify

1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify Build & Deploy settings

## Monitoring & Logging

Monitor your Edge Functions in Supabase Dashboard:

1. Go to Functions section
2. Click on `send-sms`
3. View recent invocations and logs
4. Monitor performance and error rates

## Troubleshooting

### "Invalid token" errors on send-sms

- Verify Authorization header is being sent: `Authorization: Bearer <JWT_TOKEN>`
- Check that the user is authenticated
- Verify JWT token hasn't expired

### RLS policy violations

- Check that the current user is authenticated
- Verify user_id matches in the record
- Test RLS policies in Supabase SQL Editor

### Edge Function deployment fails

- Ensure Supabase CLI is installed: `npm install -g supabase@latest`
- Check project is linked: `supabase projects list`
- Verify secrets are set: `supabase secrets list`

### Contact not appearing after insert

- Check browser DevTools for errors
- Verify RLS policies are enabled
- Ensure `INSERT` policy includes `WITH CHECK (auth.uid() = user_id)`

## Performance Optimization

### Database Indexes

The schema includes indexes on commonly queried fields:
- `user_id` on contacts and campaigns
- `campaign_id` on campaign_recipients

### Pagination (Future Enhancement)

```typescript
// Add pagination to useContacts hook
const [page, setPage] = useState(1);
const pageSize = 25;

const { data } = await supabase
  .from('contacts')
  .select('*')
  .order('created_at', { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check Supabase Documentation: https://supabase.com/docs
- Review React Best Practices: https://react.dev
- Check Vite Guide: https://vitejs.dev

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
