# API Reference - SMS Sender

Complete reference for all components, hooks, types, and utilities available in the SMS Sender application.

## 📦 Context API

### AuthContext

Manages authentication state and provides auth-related methods.

**Provider Component**
```typescript
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

**useAuth Hook**
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { 
    user,        // User | null
    session,     // Session | null
    loading,     // boolean - true during auth initialization
    error,       // Error | null
    signUp,      // (email: string, password: string) => Promise<void>
    signIn,      // (email: string, password: string) => Promise<void>
    signOut      // () => Promise<void>
  } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <LoginForm />;
  
  return <Dashboard />;
}
```

**Example Usage**
```typescript
const { user, signIn, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    await signIn(email, password);
    // User is now logged in, session updated automatically
  } catch (err) {
    console.error('Login failed:', err.message);
  }
};
```

---

## 🎣 Custom Hooks

### useContacts

Manages contact data with automatic database sync and RLS filtering.

```typescript
import { useContacts } from '@/hooks/useContacts';

const {
  contacts,       // Contact[]
  loading,        // boolean
  error,          // Error | null
  addContact,     // (contact: ContactInsert) => Promise<Contact | null>
  deleteContact,  // (id: string) => Promise<void>
  refetch         // () => Promise<void>
} = useContacts();
```

**Type Definitions**
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

interface ContactInsert {
  phone_number: string;
  name?: string | null;
  email?: string | null;
}
```

**Example: Display Contacts**
```typescript
function MyContacts() {
  const { contacts, loading, error } = useContacts();

  if (loading) return <div>Loading contacts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {contacts.map(contact => (
        <li key={contact.id}>
          {contact.name} - {contact.phone_number}
        </li>
      ))}
    </ul>
  );
}
```

**Example: Add Contact**
```typescript
function AddContactForm() {
  const { addContact, error } = useContacts();
  const [formData, setFormData] = useState({
    phone_number: '',
    name: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newContact = await addContact(formData);
      console.log('Contact added:', newContact);
      setFormData({ phone_number: '', name: '', email: '' });
    } catch (err) {
      console.error('Failed to add contact:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        placeholder="Phone number"
        value={formData.phone_number}
        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <button type="submit">Add Contact</button>
    </form>
  );
}
```

**Example: Delete Contact**
```typescript
async function deleteContactHandler(contactId: string) {
  try {
    await deleteContact(contactId);
    console.log('Contact deleted');
  } catch (err) {
    console.error('Failed to delete:', err.message);
  }
}
```

---

### useSendSms

Sends SMS messages through the edge function with JWT authentication.

```typescript
import { useSendSms } from '@/hooks/useSendSms';

const {
  sendSms,   // (phoneNumbers: string[], message: string, campaignId?: string) => Promise<SendSmsResult[]>
  loading,   // boolean
  error,     // Error | null
  results    // SendSmsResult[] | null
} = useSendSms();
```

**Type Definitions**
```typescript
interface SendSmsResult {
  phoneNumber: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  messageId?: string;
}
```

**Example: Send SMS**
```typescript
function SendCampaign() {
  const { sendSms, loading, results, error } = useSendSms();

  const handleSend = async () => {
    const phoneNumbers = ['+1234567890', '+0987654321'];
    const message = 'Hello! Special offer inside...';

    try {
      const results = await sendSms(phoneNumbers, message);
      console.log('Results:', results);
      // results = [
      //   { phoneNumber: '+1234567890', status: 'sent' },
      //   { phoneNumber: '+0987654321', status: 'sent' }
      // ]
    } catch (err) {
      console.error('Send failed:', err.message);
    }
  };

  return (
    <div>
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send SMS'}
      </button>
      {results && (
        <ul>
          {results.map(r => (
            <li key={r.phoneNumber}>
              {r.phoneNumber}: {r.status}
              {r.errorMessage && ` - ${r.errorMessage}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🧩 Components

### ContactList

Complete contact management component with forms and table display.

```typescript
import { ContactList } from '@/components/ContactList';

export default function App() {
  return <ContactList />;
}
```

**Features:**
- Add new contacts with phone number, name, email
- Display all user's contacts in a table
- Delete contacts with confirmation
- Loading and error states
- Form validation
- Success feedback messages
- Responsive design

**Props:** None (uses `useContacts` hook internally)

**Example Integration**
```typescript
function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Please log in</div>;

  return (
    <div className="p-8">
      <h1>Welcome {user.email}</h1>
      <ContactList />
    </div>
  );
}
```

---

### AuthForm

Complete authentication form with login and signup.

```typescript
import { AuthForm } from '@/components/AuthForm';

export default function App() {
  return <AuthForm />;
}
```

**Features:**
- Toggle between Sign In and Sign Up
- Email and password input
- Form validation
- Error messages
- Loading states
- Success feedback
- Responsive design

**Example Integration**
```typescript
function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return (
    <>
      {user ? <Dashboard /> : <AuthForm />}
    </>
  );
}
```

---

## 📊 Types

### Contact Types

```typescript
// From database.ts
interface Contact {
  id: string;                  // UUID
  user_id: string;            // UUID of owner
  phone_number: string;       // E.164 format
  name?: string | null;       // Optional display name
  email?: string | null;      // Optional email
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}

interface ContactInsert {
  phone_number: string;       // Required
  name?: string | null;
  email?: string | null;
}

interface ContactUpdate {
  phone_number?: string;
  name?: string | null;
  email?: string | null;
}
```

### Campaign Types

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

interface CampaignInsert {
  title: string;
  message: string;
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string | null;
}

interface CampaignUpdate {
  title?: string;
  message?: string;
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string | null;
  sent_at?: string | null;
  contact_count?: number;
  successful_count?: number;
  failed_count?: number;
}
```

### Auth Types

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface User {
  id: string;                // UUID from Supabase
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  identities?: unknown[];
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}
```

---

## 🔧 Utility Functions

### Supabase Client

```typescript
import { supabase } from '@/lib/supabase';

// Direct database queries (with RLS applied)
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .order('created_at', { ascending: false });

// Authentication methods
const { user, session, error } = await supabase.auth.getSession();
await supabase.auth.signOut();

// Real-time subscriptions
const subscription = supabase
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'contacts' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();

// Edge Function invocation
const { data, error } = await supabase.functions.invoke('send-sms', {
  body: {
    phoneNumbers: ['+1234567890'],
    message: 'Hello!'
  }
});
```

---

## 🚀 Common Patterns

### Protected Route Component

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

// Usage
<Routes>
  <Route path="/login" element={<AuthForm />} />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Loading Skeleton

```typescript
function ContactSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

// Usage
{loading ? <ContactSkeleton /> : <ContactList />}
```

### Form with Validation

```typescript
function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addContact } = useContacts();

  const validate = (data: ContactInsert): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(data.phone_number)) {
      newErrors.phone_number = 'Invalid phone format (E.164)';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (data: ContactInsert) => {
    if (!validate(data)) return;
    
    try {
      await addContact(data);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed' });
    }
  };

  // ... render form with error display
}
```

---

## 🔐 Security Functions

### Verify JWT Token

```typescript
import { jwtDecode } from 'jwt-decode';

function verifyToken(token: string): { sub?: string; [key: string]: unknown } {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Usage in Edge Function
const token = authHeader.slice(7); // Remove "Bearer " prefix
const { sub: userId } = verifyToken(token);
```

### Check User Permissions

```typescript
async function canAccessContact(userId: string, contactId: string): Promise<boolean> {
  const { data } = await supabase
    .from('contacts')
    .select('id')
    .eq('id', contactId)
    .eq('user_id', userId)
    .single();

  return !!data;
}
```

---

## 📝 Example: Complete Component

```typescript
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useContacts } from '@/hooks/useContacts';
import { AlertCircle, Loader } from 'lucide-react';

export function MyContactsPage() {
  const { user } = useAuth();
  const { contacts, loading, error, addContact } = useContacts();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addContact({ 
        phone_number: phone, 
        email 
      });
      setPhone('');
      setEmail('');
    } catch (err) {
      console.error('Failed to add:', err);
    }
  };

  return (
    <div className="p-8">
      <h1>My Contacts ({user?.email})</h1>

      <form onSubmit={handleAdd} className="mb-8">
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="h-5 w-5 inline" />
          {error.message}
        </div>
      )}

      {loading ? (
        <Loader className="animate-spin" />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Phone</th>
              <th>Email</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td>{contact.phone_number}</td>
                <td>{contact.email}</td>
                <td>{new Date(contact.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 📚 Further Reading

- [Supabase JS Docs](https://supabase.com/docs/reference/javascript)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: May 2026 | Version 1.0.0
