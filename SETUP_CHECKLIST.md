# SMS Sender - Setup Checklist

## Pre-Setup Requirements
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] GitHub account (optional, for version control)
- [ ] Supabase account created at https://supabase.com

## 1. Supabase Project Setup
- [ ] Create new Supabase project
- [ ] Copy project URL from settings
- [ ] Copy anonymous key (anon key) from API settings
- [ ] Save these credentials securely

## 2. Database Schema & RLS
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Create new query
- [ ] Copy contents of `supabase/migrations/001_initial_schema.sql`
- [ ] Run the query
- [ ] Verify tables created:
  - [ ] `contacts` table exists
  - [ ] `campaigns` table exists
  - [ ] `campaign_recipients` table exists
- [ ] Verify RLS policies enabled on all tables:
  - [ ] Row Level Security is ON for contacts
  - [ ] Row Level Security is ON for campaigns
  - [ ] Row Level Security is ON for campaign_recipients

## 3. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `VITE_SUPABASE_URL` with your project URL
- [ ] Update `VITE_SUPABASE_ANON_KEY` with your anonymous key
- [ ] Add `SMS_GATEWAY_API_KEY` (use test key for development)
- [ ] **NEVER commit `.env.local` to git**

## 4. Supabase CLI & Edge Functions
- [ ] Install Supabase CLI: `npm install -g supabase@latest`
- [ ] Verify installation: `supabase --version`
- [ ] Link project: `supabase link --project-ref your-project-ref`
- [ ] Set SMS gateway secret: `supabase secrets set SMS_GATEWAY_API_KEY=your_key`
- [ ] Deploy Edge Function: `supabase functions deploy send-sms`
- [ ] Verify function deployed in Supabase Dashboard → Functions

## 5. Local Development Setup
- [ ] Clone repository (or create new from template)
- [ ] Navigate to project directory: `cd sms-sender`
- [ ] Install dependencies: `npm install`
- [ ] Verify installation completes without errors

## 6. Authentication Setup (Optional but Recommended)
- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Enable Email authentication (should be default)
- [ ] Configure email templates if needed
- [ ] Set up redirect URLs:
  - [ ] Add `http://localhost:5173` for development
  - [ ] Add your production domain for deployed app

## 7. Development Testing
- [ ] Start dev server: `npm run dev`
- [ ] Browser opens to `http://localhost:5173`
- [ ] Create new account to test authentication
- [ ] Verify can log in successfully
- [ ] Test adding a contact:
  - [ ] Contact form appears
  - [ ] Can enter phone number, name, email
  - [ ] Contact appears in list after submission
- [ ] Test RLS (create second account):
  - [ ] Second account cannot see first account's contacts
  - [ ] First account cannot see second account's contacts
- [ ] Test deleting a contact
- [ ] Test sending SMS (mocked):
  - [ ] Can call send-sms function
  - [ ] Returns success response

## 8. Production Deployment Preparation
- [ ] Set up production database (or use same Supabase project)
- [ ] Test production environment variables
- [ ] Verify SMS gateway credentials
- [ ] Set up real SMS gateway provider (currently mocked):
  - [ ] Choose provider (Twilio, SendGrid, AWS SNS, etc.)
  - [ ] Get API credentials
  - [ ] Update `supabase/functions/send-sms/index.ts`
  - [ ] Update Edge Function: `supabase functions deploy send-sms --prod`
- [ ] Set up Vercel/Netlify account
- [ ] Connect GitHub repository to hosting platform
- [ ] Configure environment variables in hosting platform
- [ ] Deploy application
- [ ] Test in production environment

## 9. Post-Deployment
- [ ] Monitor Edge Function logs in Supabase Dashboard
- [ ] Set up error tracking (optional, e.g., Sentry)
- [ ] Monitor application performance
- [ ] Test SMS sending with real provider
- [ ] Set up email notifications for errors
- [ ] Document any custom configurations

## 10. Maintenance & Monitoring
- [ ] Set up regular database backups (Supabase handles this)
- [ ] Monitor RLS policy effectiveness
- [ ] Track API usage and rate limits
- [ ] Update dependencies monthly: `npm update`
- [ ] Review Supabase documentation for updates
- [ ] Monitor Edge Function performance
- [ ] Set up alerts for high error rates

## Security Audit Checklist
- [ ] `.env.local` is in `.gitignore` ✓
- [ ] No API keys in version control ❌ NOT ALLOWED
- [ ] Supabase secrets set correctly
- [ ] JWT validation in Edge Function
- [ ] RLS policies tested and working
- [ ] CORS headers configured correctly
- [ ] Rate limiting considered for Edge Function
- [ ] Input validation on all forms
- [ ] Phone number format validation
- [ ] Message length validation

## Troubleshooting Checklist
If you encounter issues, check:

### Connection Issues
- [ ] Supabase URL is correct
- [ ] Supabase anon key is correct
- [ ] Internet connection active
- [ ] Firewall not blocking requests

### Authentication Issues
- [ ] User account created in Supabase Auth
- [ ] Email verified (if enabled)
- [ ] Session token not expired
- [ ] JWT token valid in Edge Function

### Database Issues
- [ ] RLS policies enabled
- [ ] User record matches current user's auth.uid()
- [ ] Tables exist in database
- [ ] Indexes created for foreign keys

### Edge Function Issues
- [ ] Function deployed successfully
- [ ] Secrets set correctly
- [ ] JWT token in Authorization header
- [ ] Phone numbers in correct format
- [ ] SMS gateway credentials valid

### Build Issues
- [ ] Node.js version >= 18
- [ ] All dependencies installed: `npm install`
- [ ] No TypeScript errors: `npm run build`
- [ ] Environment variables exist

## Quick Command Reference
```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production

# Supabase
supabase link           # Link to project
supabase functions deploy send-sms  # Deploy Edge Function
supabase secrets set KEY=value      # Set secret
supabase secrets list   # View secrets

# Type checking
npm run lint            # Run linter
npx tsc --noEmit       # Check TypeScript types

# Production
npm run build           # Build production bundle
vercel deploy --prod    # Deploy to Vercel
```

## Success Indicators
You'll know everything is working correctly when:

1. ✅ Development server starts on `http://localhost:5173`
2. ✅ Can create a Supabase account and log in
3. ✅ Contact form appears and accepts input
4. ✅ New contacts automatically appear in the list
5. ✅ Can delete contacts successfully
6. ✅ Second user account can't see first user's contacts (RLS working)
7. ✅ Edge Function is deployed and shows in Supabase Dashboard
8. ✅ SMS sending function returns success response
9. ✅ Production build completes without errors
10. ✅ Application runs smoothly on hosting platform

## Next Steps After Setup
1. Integrate real SMS gateway provider
2. Add campaign scheduling functionality
3. Add analytics and reporting
4. Implement contact import/export
5. Add team collaboration features
6. Set up monitoring and alerting
7. Optimize database queries
8. Add automated testing

## Support Resources
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

---
Last Updated: 2024
For questions or issues, refer to the main README or IMPLEMENTATION_GUIDE.md
