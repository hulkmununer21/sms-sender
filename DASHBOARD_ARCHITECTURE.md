# SMS Sender Admin Dashboard - Architecture & Planning

## 🎯 Vision
Transform the app from a basic contact manager into a **professional-grade SMS campaign management platform** with:
- Intuitive admin dashboard
- Advanced contact management
- Campaign creation & scheduling
- Real-time analytics
- Team collaboration ready
- Mobile responsive

---

## 📐 Architecture Overview

### Layout Structure
```
┌────────────────────────────────────────────────────────────┐
│  Top Navigation Bar (Logo, User Menu, Notifications)       │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │         Main Content Area                  │
│  Navigation│      (Page-specific)                       │
│            │                                             │
│  - Dashboard         │  - Responsive Grid Layout        │
│  - Contacts          │  - Cards & Charts                │
│  - Campaigns         │  - Tables & Forms               │
│  - Analytics         │  - Real-time Updates            │
│  - Settings          │                                  │
│            │                                             │
└────────────┴─────────────────────────────────────────────┘
```

---

## 📁 Proposed File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx          # Main dashboard wrapper
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── TopNavBar.tsx           # Top navigation
│   │   └── UserMenu.tsx            # User dropdown menu
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx           # Main dashboard page
│   │   ├── StatsCard.tsx           # Stat display cards
│   │   ├── RecentActivity.tsx      # Activity feed
│   │   └── QuickActions.tsx        # Quick action buttons
│   │
│   ├── contacts/
│   │   ├── ContactList.tsx         # Enhanced contact table
│   │   ├── ContactForm.tsx         # Create/Edit form
│   │   ├── ContactImport.tsx       # CSV/Excel import
│   │   ├── ContactGroups.tsx       # Group management
│   │   └── ContactSearch.tsx       # Search & filter
│   │
│   ├── campaigns/
│   │   ├── CampaignList.tsx        # Campaign table
│   │   ├── CampaignCreate.tsx      # Create wizard
│   │   ├── CampaignSchedule.tsx    # Scheduling UI
│   │   ├── CampaignResults.tsx     # Results/analytics
│   │   └── TemplateManager.tsx     # Message templates
│   │
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx  # Analytics overview
│   │   ├── Charts.tsx              # Chart components
│   │   ├── DeliveryReport.tsx      # Delivery analytics
│   │   └── PerformanceMetrics.tsx  # Performance data
│   │
│   ├── settings/
│   │   ├── SettingsPage.tsx        # Settings wrapper
│   │   ├── AccountSettings.tsx     # Account/Profile
│   │   ├── NotificationSettings.tsx# Notification prefs
│   │   ├── IntegrationSettings.tsx # SMS gateway config
│   │   └── TeamSettings.tsx        # User management
│   │
│   └── common/
│       ├── Modal.tsx               # Reusable modal
│       ├── Loading.tsx             # Loading spinner
│       ├── Pagination.tsx          # Pagination
│       └── EmptyState.tsx          # Empty state UI
│
├── hooks/
│   ├── useContacts.ts              # [EXISTING] Contact CRUD
│   ├── useCampaigns.ts             # Campaign management
│   ├── useAnalytics.ts             # Analytics data
│   ├── usePagination.ts            # Pagination logic
│   └── useSearch.ts                # Search/filter logic
│
├── pages/
│   ├── DashboardPage.tsx           # Dashboard route
│   ├── ContactsPage.tsx            # Contacts route
│   ├── CampaignsPage.tsx           # Campaigns route
│   ├── AnalyticsPage.tsx           # Analytics route
│   ├── SettingsPage.tsx            # Settings route
│   └── NotFoundPage.tsx            # 404 page
│
├── types/
│   ├── database.ts                 # [EXISTING]
│   ├── campaign.ts                 # Campaign types
│   ├── analytics.ts                # Analytics types
│   └── ui.ts                       # UI component types
│
├── utils/
│   ├── formatting.ts               # Date, number formatting
│   ├── validation.ts               # Form validation
│   ├── csv.ts                      # CSV import/export
│   └── dateRange.ts                # Date range utilities
│
├── App.tsx                         # Updated router
├── App.css                         # Global styles
└── main.tsx                        # [EXISTING]
```

---

## 🔄 User Flow

### 1. Authentication → Dashboard
```
Landing Page
    ↓
Auth Form (Login/Signup)
    ↓
Authenticated → Redirect to Dashboard
    ↓
Dashboard (Overview, Stats, Recent Activity)
```

### 2. Dashboard Navigation
```
Dashboard (Home)
    ├── → Contacts (View, Create, Edit, Delete, Import)
    ├── → Campaigns (Create, View, Schedule, Send, History)
    ├── → Analytics (Reports, Performance, Delivery Status)
    ├── → Settings (Account, Notifications, Integrations)
    └── → Help & Support
```

---

## 📊 Key Features by Page

### 1. **Dashboard Overview**
- [ ] Welcome message with user name
- [ ] Quick stats (Total Contacts, Active Campaigns, Messages Sent)
- [ ] Recent activity feed
- [ ] Quick action buttons (New Campaign, Add Contact, Send Message)
- [ ] Performance chart (Messages sent per day - last 7 days)
- [ ] Upcoming scheduled campaigns
- [ ] Top performing campaigns list

### 2. **Contacts Management**
- [ ] Table view with sorting & filtering
  - Phone number, Name, Email, Tags, Date Added, Status
  - Search by phone/name/email
  - Filter by tags/groups
- [ ] Bulk actions (Select multiple, Delete, Add to group, Export)
- [ ] Create/Edit contact modal
- [ ] Contact groups/lists management
- [ ] Import contacts (CSV/Excel)
  - Drag & drop upload
  - Column mapping
  - Duplicate detection
- [ ] Export contacts (CSV)
- [ ] Pagination (25, 50, 100 per page)

### 3. **Campaigns Management**
- [ ] Campaign list with status badges
  - Draft, Scheduled, Sent, Failed
  - Sortable columns (Date, Status, Delivery Rate)
- [ ] Create Campaign Wizard (4 steps)
  - Step 1: Basic Info (Title, Description)
  - Step 2: Message (Text, Preview, Character Count)
  - Step 3: Recipients (Select contacts/groups, Preview)
  - Step 4: Schedule (Immediate or Schedule for later)
- [ ] Campaign editor (Edit drafts)
- [ ] Send immediately option
- [ ] Schedule with date/time picker
- [ ] Campaign results page
  - Total sent, Delivery rate
  - Sent, Failed counts
  - Delivery status per contact
  - Export results
- [ ] Message templates (Save, Reuse, Edit)
- [ ] Delete campaign confirmation

### 4. **Analytics & Reports**
- [ ] Overview metrics
  - Total contacts
  - Messages sent (this month, all time)
  - Average delivery rate
  - Success rate
- [ ] Charts & visualizations
  - Messages sent per day (line chart)
  - Campaign performance (bar chart)
  - Delivery status breakdown (pie chart)
  - Delivery rate trend
- [ ] Date range picker (Today, Last 7 days, Last 30 days, Custom)
- [ ] Export reports (PDF, Excel)
- [ ] Delivery report
  - Per-campaign breakdown
  - Per-contact status
  - Error reasons (if failed)

### 5. **Settings**
- [ ] Account Settings
  - Profile picture upload
  - Name, Email, Phone
  - Password change
  - Account deletion option
- [ ] Notification Preferences
  - Campaign completion notification
  - Daily digest
  - Error alerts
- [ ] SMS Gateway Settings
  - Current provider selection
  - API key management (partially hidden)
  - Test SMS button
- [ ] Team Management (Future)
  - Invite team members
  - Role assignment
  - Activity log

---

## 🗄️ Database Schema Updates

### New Tables Needed
```sql
-- Message Templates
CREATE TABLE message_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, title)
);

-- Contact Groups
CREATE TABLE contact_groups (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Contact Group Members
CREATE TABLE contact_group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES contact_groups,
  contact_id UUID REFERENCES contacts,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, contact_id)
);

-- Campaign Recipient Details
ALTER TABLE campaign_recipients ADD COLUMN:
  - delivery_time TIMESTAMP
  - error_code VARCHAR(10)
  - retry_count INT DEFAULT 0

-- Analytics Events (Optional - for Real-time tracking)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type VARCHAR(100),
  campaign_id UUID,
  contact_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI/UX Considerations

### Color Scheme
- Primary: Blue (#0066FF)
- Success: Green (#00AA44)
- Warning: Orange (#FF9900)
- Error: Red (#FF0000)
- Background: Light Gray (#F5F5F5)
- Text: Dark (#333333)

### Components to Build
1. Responsive Sidebar (Collapsible on mobile)
2. Data Tables (Sortable, Filterable, Paginated)
3. Charts (Line, Bar, Pie using Recharts or Chart.js)
4. Multi-step Forms/Wizards
5. Modal Dialogs
6. Toast Notifications
7. Loading States
8. Empty States
9. Breadcrumbs

### Icons
- Use Lucide React (already included)
  - Dashboard → LayoutDashboard
  - Contacts → Users
  - Campaigns → Send
  - Analytics → BarChart
  - Settings → Settings
  - Logout → LogOut

---

## 🚀 Implementation Phases

### Phase 1: Core Dashboard Structure (Week 1)
- [ ] Layout components (Sidebar, TopNav, MainLayout)
- [ ] Routing with React Router
- [ ] Protected routes
- [ ] Dashboard overview page

### Phase 2: Contact Management (Week 2)
- [ ] Enhanced contact table
- [ ] Create/Edit contact form
- [ ] Contact groups
- [ ] Basic import (CSV)

### Phase 3: Campaign Management (Week 3)
- [ ] Campaign CRUD (Create, Read, Update, Delete)
- [ ] Campaign wizard (4 steps)
- [ ] Schedule functionality
- [ ] Campaign results page

### Phase 4: Analytics (Week 4)
- [ ] Add charts library (Recharts)
- [ ] Analytics dashboard
- [ ] Reports & exports

### Phase 5: Polish & Deploy (Week 5)
- [ ] Settings pages
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance optimization
- [ ] Deploy to Vercel

---

## 🛠️ Technology Stack

**Already Have:**
- React 18 + TypeScript
- Supabase (Auth + DB + Edge Functions)
- Tailwind CSS
- Lucide React (Icons)
- Vite

**Need to Add:**
- React Router v6 (for multi-page routing)
- Recharts or Chart.js (for analytics charts)
- React Hook Form (for complex forms)
- Zod or Yup (for form validation)
- React Query or SWR (for data fetching)
- date-fns (for date utilities)
- papaparse (for CSV parsing)

---

## 🔒 Security & Permissions

### RLS Policies (Database Level)
- All queries automatically filtered by user_id
- Users can only see/modify their own data
- No cross-user data access

### Frontend Validation
- Check authentication before showing dashboard
- Validate form inputs
- Sanitize user input

### API Security
- JWT validation on Edge Functions
- Rate limiting on API calls
- Error messages don't leak sensitive info

---

## 📱 Mobile Considerations

- Responsive grid layout
- Collapsible sidebar on mobile
- Touch-friendly buttons
- Mobile-optimized forms
- Horizontal scroll for tables if needed

---

## 🔍 Search & Filtering

- Global search (contacts, campaigns)
- Advanced filters
  - Filter by date range
  - Filter by status
  - Filter by tags/groups
- Real-time search (debounced)
- Filter persistence (in URL params)

---

## 📈 Success Metrics

✅ Dashboard loads in < 2 seconds
✅ All CRUD operations < 1 second
✅ No console errors or warnings
✅ Mobile responsive (all breakpoints)
✅ Accessibility score > 90
✅ All features tested
✅ Ready for production

---

## ⚠️ Potential Challenges

1. **Type Safety**: Complex nested types with Supabase
   - Solution: Use explicit type casting where needed

2. **Performance**: Large contact/campaign lists
   - Solution: Implement pagination, virtualization

3. **Real-time Updates**: Analytics not updating in real-time
   - Solution: Implement polling or Supabase realtime subscriptions

4. **Mobile UX**: Dashboard on small screens
   - Solution: Responsive design, mobile-first approach

5. **State Management**: Complex app state
   - Solution: React hooks + Context API (keep it simple)

---

## 📋 Next Steps

1. ✅ Decide if this plan looks good
2. ⏭️ Add React Router for routing
3. ⏭️ Build layout components
4. ⏭️ Add new hooks for campaigns, analytics
5. ⏭️ Build dashboard pages one by one
6. ⏭️ Add charts/visualizations
7. ⏭️ Deploy and test

---

## Questions to Confirm

1. Should we add user roles/permissions (Admin, User)?
2. Do you want real-time analytics or periodic updates?
3. Should campaigns support scheduling?
4. Do you need team/collaboration features?
5. Should we implement contact segmentation/groups?
6. Do you need bulk SMS sending with templates?
7. Should we track delivery status in real-time?
8. Do you need export functionality (PDF/Excel)?

