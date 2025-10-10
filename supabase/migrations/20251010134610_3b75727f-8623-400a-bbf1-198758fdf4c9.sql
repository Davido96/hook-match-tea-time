-- Create email logs table to track all sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email queue table for scheduled/delayed emails
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_logs
CREATE POLICY "Users can view their own email logs"
  ON public.email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on email_queue
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_queue
CREATE POLICY "Users can view their own queued emails"
  ON public.email_queue
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage email queue"
  ON public.email_queue
  FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON public.email_queue(scheduled_for);

-- Function to send welcome email when profile is created
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  welcome_subject TEXT;
  welcome_type TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Set email type and subject based on user type
  IF NEW.user_type = 'creator' THEN
    welcome_type := 'creator_welcome';
    welcome_subject := '🎉 Welcome to Hooks - Start Creating!';
  ELSE
    welcome_type := 'fan_welcome';
    welcome_subject := '🎉 Welcome to Hooks - Discover Amazing Creators!';
  END IF;
  
  -- Log the welcome email
  INSERT INTO public.email_logs (
    user_id,
    email_type,
    recipient_email,
    subject,
    status,
    metadata
  ) VALUES (
    NEW.user_id,
    welcome_type,
    user_email,
    welcome_subject,
    'queued',
    jsonb_build_object(
      'user_type', NEW.user_type,
      'name', NEW.name,
      'trigger', 'profile_created'
    )
  );
  
  RETURN NEW;
END;
$$;

-- Function to queue profile completion reminder
CREATE OR REPLACE FUNCTION public.queue_profile_completion_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Only queue reminder if profile is incomplete
  IF NEW.bio IS NULL OR NEW.avatar_url IS NULL OR array_length(NEW.interests, 1) IS NULL THEN
    INSERT INTO public.email_queue (
      user_id,
      email_type,
      recipient_email,
      subject,
      html_content,
      scheduled_for,
      status
    ) VALUES (
      NEW.user_id,
      'profile_incomplete_reminder',
      user_email,
      '👋 Complete Your Hooks Profile',
      '<p>Complete your profile to get the best experience on Hooks!</p>',
      now() + INTERVAL '24 hours',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for welcome email on profile creation
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();

-- Create trigger for profile completion reminder
DROP TRIGGER IF EXISTS on_profile_created_queue_reminder ON public.profiles;
CREATE TRIGGER on_profile_created_queue_reminder
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_profile_completion_reminder();

-- Function to process email queue (can be called by a cron job or edge function)
CREATE OR REPLACE FUNCTION public.process_email_queue()
RETURNS TABLE(processed_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  queue_record RECORD;
  processed INTEGER := 0;
BEGIN
  -- Get pending emails that are ready to send
  FOR queue_record IN
    SELECT * FROM public.email_queue
    WHERE status = 'pending'
    AND scheduled_for <= now()
    AND retry_count < 3
    ORDER BY scheduled_for ASC
    LIMIT 100
  LOOP
    -- Log that email is being sent
    INSERT INTO public.email_logs (
      user_id,
      email_type,
      recipient_email,
      subject,
      status,
      metadata
    ) VALUES (
      queue_record.user_id,
      queue_record.email_type,
      queue_record.recipient_email,
      queue_record.subject,
      'sent',
      jsonb_build_object('from_queue', true, 'queue_id', queue_record.id)
    );
    
    -- Mark as sent in queue
    UPDATE public.email_queue
    SET 
      status = 'sent',
      sent_at = now(),
      updated_at = now()
    WHERE id = queue_record.id;
    
    processed := processed + 1;
  END LOOP;
  
  RETURN QUERY SELECT processed;
END;
$$;