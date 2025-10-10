-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, name)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default templates
INSERT INTO public.email_templates (category, name, subject, html_content, variables, is_active) VALUES
-- Onboarding Sequence
('onboarding', 'welcome_fan', '🎉 Welcome to Hooks - Your Dating Journey Starts Here!', 
'<h1>Welcome {{name}}!</h1><p>We''re thrilled to have you join Hooks, where meaningful connections happen.</p><p>Get started by completing your profile and discovering amazing people!</p>', 
'["name"]'::jsonb, false),

('onboarding', 'welcome_creator', '🎉 Welcome to Hooks - Start Creating and Earning!', 
'<h1>Welcome {{name}}!</h1><p>Congratulations on becoming a creator on Hooks! You''re now part of an exclusive community.</p><p>Set up your profile and start sharing exclusive content with your fans.</p>', 
'["name"]'::jsonb, false),

('onboarding', 'profile_incomplete_reminder', '👋 Complete Your Hooks Profile', 
'<h1>Hi {{name}}!</h1><p>We noticed your profile is incomplete. Complete your profile to get the best matches and experience on Hooks!</p><ul><li>Add a profile photo</li><li>Write a bio</li><li>Add your interests</li></ul>', 
'["name"]'::jsonb, false),

-- Engagement & Activity
('engagement', 'new_match', '💕 You Have a New Match!', 
'<h1>Congratulations {{name}}!</h1><p>You matched with {{match_name}}! Start chatting now and get to know each other.</p>', 
'["name", "match_name"]'::jsonb, false),

('engagement', 'incoming_like', '😍 Someone Liked You!', 
'<h1>Hey {{name}}!</h1><p>You have {{count}} new like(s)! Check them out and see if there''s a connection.</p>', 
'["name", "count"]'::jsonb, false),

-- Monetization
('monetization', 'tip_received', '🪝 You Received a Tip!', 
'<h1>Great news {{name}}!</h1><p>{{sender_name}} just sent you {{amount}} Keys! {{#if message}}They said: "{{message}}"{{/if}}</p>', 
'["name", "sender_name", "amount", "message"]'::jsonb, false),

('monetization', 'subscription_received', '💰 New Subscriber!', 
'<h1>Awesome {{name}}!</h1><p>{{subscriber_name}} just subscribed to your content for {{amount}} Keys!</p>', 
'["name", "subscriber_name", "amount"]'::jsonb, false),

-- Withdrawal
('withdrawal', 'withdrawal_requested', '💳 Withdrawal Request Received', 
'<h1>Hi {{name}}</h1><p>We received your withdrawal request for {{amount}} Keys (₦{{naira_amount}}).</p><p>Bank: {{bank_name}}<br>Account: {{account_number}}</p><p>Your request is being processed and will be completed within 1-3 business days.</p>', 
'["name", "amount", "naira_amount", "bank_name", "account_number"]'::jsonb, false),

('withdrawal', 'withdrawal_completed', '✅ Withdrawal Completed', 
'<h1>Hi {{name}}</h1><p>Your withdrawal of ₦{{naira_amount}} has been completed successfully!</p><p>The funds should appear in your bank account shortly.</p>', 
'["name", "naira_amount"]'::jsonb, false),

-- Referral
('referral', 'referral_reward', '🎁 Referral Reward Earned!', 
'<h1>Congrats {{name}}!</h1><p>Your friend {{referee_name}} just signed up using your referral code!</p><p>You earned {{amount}} Keys as a reward. Keep sharing!</p>', 
'["name", "referee_name", "amount"]'::jsonb, false),

-- Retention
('retention', 'inactive_user', '💔 We Miss You on Hooks!', 
'<h1>Hey {{name}}</h1><p>It''s been a while since we last saw you. Come back to see who''s been checking out your profile!</p><p>You have {{pending_likes}} people waiting to connect with you.</p>', 
'["name", "pending_likes"]'::jsonb, false),

-- Administrative
('admin', 'account_suspended', '⚠️ Account Suspended', 
'<h1>Account Notice</h1><p>Your Hooks account has been temporarily suspended due to: {{reason}}</p><p>If you believe this is a mistake, please contact support.</p>', 
'["reason"]'::jsonb, false);