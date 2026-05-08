-- Create sms_gateway_settings table
CREATE TABLE IF NOT EXISTS sms_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_gateway VARCHAR(50) NOT NULL DEFAULT 'twilio', -- 'twilio' or 'infobip'
  
  -- Twilio credentials
  twilio_account_sid VARCHAR(255),
  twilio_auth_token VARCHAR(255),
  twilio_phone_number VARCHAR(20),
  
  -- Infobip credentials
  infobip_api_key VARCHAR(255),
  infobip_base_url VARCHAR(255),
  infobip_sender_id VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sms_gateway_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own settings
CREATE POLICY "Users can view their own SMS gateway settings" 
  ON sms_gateway_settings 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own SMS gateway settings" 
  ON sms_gateway_settings 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own SMS gateway settings" 
  ON sms_gateway_settings 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_sms_gateway_settings_user_id ON sms_gateway_settings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sms_gateway_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_sms_gateway_settings_timestamp ON sms_gateway_settings;
CREATE TRIGGER update_sms_gateway_settings_timestamp
  BEFORE UPDATE ON sms_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_gateway_settings_timestamp();

-- Add gateway column to message_logs for tracking which gateway sent each message
ALTER TABLE message_logs ADD COLUMN IF NOT EXISTS sms_gateway TEXT DEFAULT 'twilio';
