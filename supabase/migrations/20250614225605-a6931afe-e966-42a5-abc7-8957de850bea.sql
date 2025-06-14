
-- Create subscription_plans table for flexible subscription durations
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES profiles(user_id) NOT NULL,
  name text NOT NULL,
  duration_days integer NOT NULL,
  price_keys integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create withdrawals table for withdrawal requests
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  requested_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create earnings table to track all income sources
CREATE TABLE public.earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('subscription', 'tip', 'bonus')),
  source_id uuid,
  amount integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add subscription_plan_id to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN subscription_plan_id uuid REFERENCES subscription_plans(id);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans
CREATE POLICY "Users can view subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (true);

CREATE POLICY "Creators can manage their own subscription plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (auth.uid() = creator_id);

-- RLS policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" 
  ON public.withdrawals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests" 
  ON public.withdrawals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for earnings
CREATE POLICY "Users can view their own earnings" 
  ON public.earnings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert earnings records" 
  ON public.earnings 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_subscription_plans_creator_id ON public.subscription_plans(creator_id);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX idx_earnings_source_type ON public.earnings(source_type);

-- Insert default subscription plans for existing creators
INSERT INTO public.subscription_plans (creator_id, name, duration_days, price_keys)
SELECT 
  user_id,
  '1 Month Plan',
  30,
  COALESCE(subscription_fee, 1000)
FROM public.profiles 
WHERE user_type = 'creator' AND subscription_fee IS NOT NULL;
