-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users_metadata table to track user info (optional, for future use)
CREATE TABLE IF NOT EXISTS public.users_metadata (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  api_quota_monthly INTEGER DEFAULT 10000,
  api_quota_remaining INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users_metadata
ALTER TABLE public.users_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_metadata
CREATE POLICY "Users can view their own metadata"
ON public.users_metadata
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own metadata"
ON public.users_metadata
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, phone_number)
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sent, failed
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  contact_count INTEGER DEFAULT 0,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_recipients table to track which contacts were sent to
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON public.campaign_recipients(contact_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table
-- Allow users to SELECT only their own contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT contacts for themselves
CREATE POLICY "Users can insert their own contacts"
ON public.contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own contacts
CREATE POLICY "Users can update their own contacts"
ON public.contacts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own contacts
CREATE POLICY "Users can delete their own contacts"
ON public.contacts
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for campaigns table
-- Allow users to SELECT only their own campaigns
CREATE POLICY "Users can view their own campaigns"
ON public.campaigns
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT campaigns for themselves
CREATE POLICY "Users can insert their own campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own campaigns
CREATE POLICY "Users can update their own campaigns"
ON public.campaigns
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own campaigns
CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for campaign_recipients table
-- Users can only access campaign_recipients if they own the campaign
CREATE POLICY "Users can view their campaign recipients"
ON public.campaign_recipients
FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE user_id = auth.uid()
  )
);

-- Users can insert campaign_recipients only for their campaigns
CREATE POLICY "Users can insert campaign recipients for their campaigns"
ON public.campaign_recipients
FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE user_id = auth.uid()
  )
);

-- Users can update campaign_recipients only for their campaigns
CREATE POLICY "Users can update their campaign recipients"
ON public.campaign_recipients
FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE user_id = auth.uid()
  )
);

-- Users can delete campaign_recipients only for their campaigns
CREATE POLICY "Users can delete their campaign recipients"
ON public.campaign_recipients
FOR DELETE
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns 
    WHERE user_id = auth.uid()
  )
);

-- Create message_logs table for tracking SMS delivery
CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  provider_message_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for message_logs
CREATE INDEX IF NOT EXISTS idx_message_logs_user_id ON public.message_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_campaign_id ON public.message_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_contact_id ON public.message_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON public.message_logs(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at ON public.message_logs(created_at DESC);

-- Enable RLS on message_logs
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_logs table
-- Allow users to SELECT only their own message logs
CREATE POLICY "Users can view their own message logs"
ON public.message_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT message logs for themselves
CREATE POLICY "Users can insert message logs"
ON public.message_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own message logs
CREATE POLICY "Users can update their own message logs"
ON public.message_logs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own message logs
CREATE POLICY "Users can delete their own message logs"
ON public.message_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create message_variations table for AI enhancements
CREATE TABLE IF NOT EXISTS public.message_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  original_message TEXT NOT NULL,
  enhanced_message TEXT NOT NULL,
  enhancement_type VARCHAR(50) NOT NULL, -- personalize, tone, summarize, clarity, translate
  enhancement_params JSONB, -- Store params like tone='casual', language='es'
  ai_model VARCHAR(50) DEFAULT 'gpt-5-nano',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_cents DECIMAL(10, 4),
  status VARCHAR(50) DEFAULT 'success', -- success, failed, rate_limited
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for message_variations
CREATE INDEX IF NOT EXISTS idx_message_variations_user_id ON public.message_variations(user_id);
CREATE INDEX IF NOT EXISTS idx_message_variations_campaign_id ON public.message_variations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_variations_enhancement_type ON public.message_variations(enhancement_type);
CREATE INDEX IF NOT EXISTS idx_message_variations_created_at ON public.message_variations(created_at DESC);

-- Enable RLS on message_variations
ALTER TABLE public.message_variations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_variations table
-- Allow users to SELECT only their own variations
CREATE POLICY "Users can view their own message variations"
ON public.message_variations
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to INSERT variations for their campaigns
CREATE POLICY "Users can insert message variations"
ON public.message_variations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE only their own variations
CREATE POLICY "Users can update their own message variations"
ON public.message_variations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE only their own variations
CREATE POLICY "Users can delete their own message variations"
ON public.message_variations
FOR DELETE
USING (auth.uid() = user_id);

-- Create ai_usage_tracking table for analytics and cost tracking
CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enhancement_type VARCHAR(50) NOT NULL,
  ai_model VARCHAR(50) NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_cents DECIMAL(10, 4) NOT NULL,
  status VARCHAR(50) DEFAULT 'success', -- success, failed, rate_limited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ai_usage_tracking
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON public.ai_usage_tracking(created_at DESC);

-- Enable RLS on ai_usage_tracking
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_usage_tracking
CREATE POLICY "Users can view their own usage"
ON public.ai_usage_tracking
FOR SELECT
USING (auth.uid() = user_id);
