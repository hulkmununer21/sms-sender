# User Authentication & Data Segregation Guide

## Overview
Your SMS Sender application uses **Supabase Authentication** with a **login-only** model (no self-signup). All user data and activities are completely isolated and segregated at the database level using Row Level Security (RLS) policies.

## Authentication Architecture

### Login Flow
```
User (Email + Password)
        ↓
    Supabase Auth
        ↓
auth.users table (managed by Supabase)
        ↓
JWT Token + Session Created
        ↓
Access to user's own data only (via RLS)
```

### Key Components
- **AuthContext.tsx** - React context for authentication state management
- **AuthForm.tsx** - Login form (email + password only, no signup)
- **ProtectedRoute.tsx** - Route wrapper ensuring only authenticated users access dashboard

## User Management (Admin)

### Creating New Users
Since signup is disabled, users must be created by administrators in one of two ways:

#### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" button
3. Enter email and password
4. User receives confirmation email
5. User can now log in with provided credentials

#### Option 2: Programmatic (Edge Function)
Create an admin-only Edge Function to manage user creation:
```typescript
// supabase/functions/admin/create-user/index.ts
import { createClient } from '@supabase/supabase-js'

export default async (req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Admin key
  )

  const { email, password } = await req.json()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  return new Response(JSON.stringify({ data, error }))
}
```

## Data Segregation Strategy

### Architecture
```
┌─────────────────────────────────────┐
│ Supabase (Database & Auth)          │
├─────────────────────────────────────┤
│ auth.users (Managed by Supabase)    │
│ - id (UUID)                         │
│ - email                             │
│ - password (hashed)                 │
│ - metadata                          │
└─────────────────────────────────────┘
        ↓ (Foreign Keys)
┌─────────────────────────────────────┐
│ Public Schema (User Data)           │
├─────────────────────────────────────┤
│ users_metadata                      │
│ - id → auth.users(id)               │
│ - full_name, phone, company, etc    │
│ - api_quota tracking                │
│ - RLS Policy: users see only own    │
├─────────────────────────────────────┤
│ contacts (RLS enforced)             │
│ - user_id → auth.users(id)          │
│ - Each user sees only own contacts  │
├─────────────────────────────────────┤
│ campaigns (RLS enforced)            │
│ - user_id → auth.users(id)          │
│ - Each user sees only own campaigns │
├─────────────────────────────────────┤
│ campaign_recipients (RLS enforced)  │
│ - Only accessible via campaign ownership
└─────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

#### contacts Table
```sql
-- User can only see their own contacts
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

#### campaigns Table
```sql
-- User can only see their own campaigns
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

#### campaign_recipients Table
```sql
-- User can only access if they own the campaign
SELECT: campaign_id IN (SELECT id FROM campaigns WHERE user_id = auth.uid())
INSERT: Same check
UPDATE: Same check
DELETE: Same check
```

#### users_metadata Table
```sql
-- User can only see/update their own metadata
SELECT: auth.uid() = id
UPDATE: auth.uid() = id
```

### How Segregation Works

**Query Example:**
```typescript
// Frontend code - gets only user's contacts
const { data } = await supabase
  .from('contacts')
  .select('*')

// Under the hood:
// 1. Supabase extracts JWT token from request
// 2. Gets user_id from JWT (auth.uid())
// 3. Automatically adds WHERE clause: auth.uid() = user_id
// 4. Returns only matching rows

// Result: User A only sees User A's contacts
//         User B only sees User B's contacts
//         No cross-contamination possible
```

### Database-Level Enforcement

✅ **Impossible to bypass** because:
1. RLS policies are enforced at the PostgreSQL level
2. No query can return data not matching the RLS condition
3. Even direct SQL queries via API are filtered
4. Service role key (admin access) is server-only, never exposed to frontend

## Authentication Context API

### useAuth Hook
```typescript
const { 
  user,              // Current user object (email, id)
  session,           // Active session token
  loading,           // Auth is loading
  error,             // Auth errors
  signIn,            // (email, password) => Promise<void>
  signOut            // () => Promise<void>
} = useAuth()
```

### Protected Routes
```typescript
<Route
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// If user not authenticated:
// - Shows loading spinner
// - Redirects to /auth login page
```

## Security Features

### Implemented ✅
- Multi-layer authentication (frontend + backend)
- RLS at database row level
- JWT token validation on Edge Functions
- User isolation at query level
- Password hashing (Supabase managed)
- HTTPS enforcement (Vercel)

### Sessions
- Supabase manages session tokens
- Auto-refresh on expiration
- Stored in secure httpOnly cookies
- Automatically included in all API requests

### User Metadata Table
Extended `users_metadata` table helps track:
- User profile info (full_name, company, phone)
- Preferences (timezone, language)
- Resource quotas (API limits, monthly message limits)
- Activity tracking for compliance

## Removing a User

### Via Supabase Dashboard
1. Go to Authentication → Users
2. Select user
3. Click "Delete" button
4. All linked data (contacts, campaigns) deleted via CASCADE

### Via Edge Function (Admin Only)
```typescript
const { error } = await supabase.auth.admin.deleteUser(userId)
```

## Audit Trail

### What Gets Logged (via `created_at`, `updated_at`)
- When each contact was added
- When campaigns were created/modified
- When messages were sent
- All timestamps are user-isolated

### For Future: Message Logs Table
```sql
CREATE TABLE message_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,      -- Always filtered by this
  campaign_id UUID,
  status VARCHAR(50),
  created_at TIMESTAMP,       -- When sent
  delivered_at TIMESTAMP,     -- When delivered
  -- RLS: users see only their own logs
)
```

## Testing Data Isolation

### Test Flow
```bash
# 1. Create User A
#    Email: alice@example.com
#    Password: secure123

# 2. Create User B
#    Email: bob@example.com
#    Password: secure456

# 3. User A adds contact "Phone 1"
#    Result: In A's contacts table

# 4. User B logs in and queries contacts
#    Result: Empty list (Phone 1 not visible)

# 5. User B adds contact "Phone 2"
#    User A logs in and queries contacts
#    Result: Still only Phone 1 (Phone 2 not visible)
```

## Best Practices

✅ **Do**
- Always use `useAuth()` hook to check authentication
- Wrap protected pages with `ProtectedRoute`
- Use RLS policies (already in place)
- Store sensitive data in users_metadata

❌ **Don't**
- Return `auth.users` directly to frontend (already restricted)
- Create users via signup endpoint (disabled)
- Hard-code user_id in queries (use auth.uid() instead)
- Expose service_role_key to frontend

## Common Issues & Solutions

### "User not found" on login
- Verify email exists in Supabase auth.users
- Check password is correct
- Ensure user is created via dashboard/admin function

### "Permission denied" error on query
- RLS policy is working correctly
- User is trying to access another user's data
- Check user_id matches auth.uid()

### Session expires unexpectedly
- Normal after 1 hour (configurable in Supabase)
- Supabase auto-refreshes token
- Clear browser cache if issues persist

## Future Enhancements

### Multi-User Teams
Add `teams` table and join users via `team_members`:
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255)
);

-- All user's data visible to team members
-- RLS: WHERE team_id IN (SELECT team_id FROM team_members)
```

### Role-Based Access
Add admin/viewer roles per user:
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50), -- 'admin', 'editor', 'viewer'
  -- RLS checks role before allowing modifications
)
```

### Activity Logging
Create audit table for compliance:
```sql
CREATE TABLE audit_logs (
  id UUID,
  user_id UUID,
  action VARCHAR(255),
  timestamp TIMESTAMP
)
```

## Additional Resources

- [Supabase Auth Docs](https://supabase.io/docs/guides/auth)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
