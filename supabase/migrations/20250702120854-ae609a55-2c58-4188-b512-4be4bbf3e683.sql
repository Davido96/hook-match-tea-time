
-- Create referral codes table
CREATE TABLE public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create referrals table to track invitations
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  reward_amount integer DEFAULT 0,
  referee_reward_amount integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  rewarded_at timestamp with time zone
);

-- Add referral tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN referred_by uuid REFERENCES auth.users(id),
ADD COLUMN total_referrals integer DEFAULT 0,
ADD COLUMN successful_referrals integer DEFAULT 0,
ADD COLUMN referral_earnings integer DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes" 
ON public.referral_codes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" 
ON public.referral_codes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
ON public.referral_codes FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they are part of" 
ON public.referrals FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can create referrals" 
ON public.referrals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update referrals" 
ON public.referrals FOR UPDATE 
USING (true);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code text;
  final_code text;
  counter integer := 0;
BEGIN
  -- Create base code from name
  base_code := 'HOOK-' || UPPER(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Limit base code length
  IF LENGTH(base_code) > 15 THEN
    base_code := LEFT(base_code, 15);
  END IF;
  
  final_code := base_code;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::text;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Function to process referral signup
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_user_id uuid;
  referrer_user_type text;
  referee_user_type text;
  referrer_reward integer := 0;
  referee_reward integer := 0;
BEGIN
  -- Skip if no referral code in metadata
  IF NEW.raw_user_meta_data->>'referral_code' IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find referrer
  SELECT user_id INTO referrer_user_id
  FROM public.referral_codes
  WHERE code = NEW.raw_user_meta_data->>'referral_code'
  AND is_active = true;
  
  -- Skip if referral code not found
  IF referrer_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get user types
  SELECT user_type INTO referrer_user_type
  FROM public.profiles
  WHERE user_id = referrer_user_id;
  
  SELECT user_type INTO referee_user_type
  FROM public.profiles
  WHERE user_id = NEW.id;
  
  -- Calculate rewards based on user types
  IF referrer_user_type = 'creator' THEN
    IF referee_user_type = 'creator' THEN
      referrer_reward := 150;
      referee_reward := 75;
    ELSE
      referrer_reward := 75;
      referee_reward := 25;
    END IF;
  ELSE -- referrer is consumer
    IF referee_user_type = 'creator' THEN
      referrer_reward := 100;
      referee_reward := 50;
    ELSE
      referrer_reward := 50;
      referee_reward := 50;
    END IF;
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (
    referrer_id, 
    referee_id, 
    referral_code, 
    status, 
    reward_amount, 
    referee_reward_amount,
    completed_at
  ) VALUES (
    referrer_user_id, 
    NEW.id, 
    NEW.raw_user_meta_data->>'referral_code',
    'completed',
    referrer_reward,
    referee_reward,
    now()
  );
  
  -- Update profiles with referral info
  UPDATE public.profiles 
  SET referred_by = referrer_user_id
  WHERE user_id = NEW.id;
  
  UPDATE public.profiles 
  SET 
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1,
    referral_earnings = referral_earnings + referrer_reward
  WHERE user_id = referrer_user_id;
  
  -- Add rewards to wallets
  UPDATE public.wallets 
  SET keys_balance = keys_balance + referrer_reward
  WHERE user_id = referrer_user_id;
  
  UPDATE public.wallets 
  SET keys_balance = keys_balance + referee_reward
  WHERE user_id = NEW.id;
  
  -- Create earnings records
  INSERT INTO public.earnings (user_id, source_type, amount, description)
  VALUES 
    (referrer_user_id, 'referral', referrer_reward, 'Referral bonus for inviting new user'),
    (NEW.id, 'referral', referee_reward, 'Welcome bonus from referral');
  
  -- Create notifications
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES 
    (referrer_user_id, 'referral_reward', 'Referral Reward! 🎉', 
     format('You earned %s Keys for referring a new user!', referrer_reward)),
    (NEW.id, 'welcome_bonus', 'Welcome Bonus! 🎁', 
     format('You received %s Keys as a welcome bonus!', referee_reward));
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral processing
CREATE TRIGGER on_referral_signup
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.process_referral_signup();

-- Function to create referral code for existing users
CREATE OR REPLACE FUNCTION public.ensure_referral_code(user_uuid uuid, user_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_code text;
  new_code text;
BEGIN
  -- Check if user already has a referral code
  SELECT code INTO existing_code
  FROM public.referral_codes
  WHERE user_id = user_uuid AND is_active = true;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := public.generate_referral_code(user_name);
  
  -- Insert new referral code
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (user_uuid, new_code);
  
  RETURN new_code;
END;
$$;
