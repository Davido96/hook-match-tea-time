
-- Fix RLS policies for the follows table to ensure proper authentication validation
DROP POLICY IF EXISTS "Users can create follows where they are the follower" ON public.follows;
DROP POLICY IF EXISTS "Users can view follows they are part of" ON public.follows;
DROP POLICY IF EXISTS "Users can delete follows where they are the follower" ON public.follows;

-- Create improved RLS policies for follows table
CREATE POLICY "Authenticated users can view follows they are part of" 
  ON public.follows 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND (auth.uid() = follower_id OR auth.uid() = following_id));

CREATE POLICY "Authenticated users can create follows where they are the follower" 
  ON public.follows 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Authenticated users can delete follows where they are the follower" 
  ON public.follows 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL AND auth.uid() = follower_id);

-- Fix RLS policies for subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;

CREATE POLICY "Authenticated users can view subscriptions they are part of" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND (auth.uid() = subscriber_id OR auth.uid() = creator_id));

CREATE POLICY "Authenticated users can create subscriptions where they are the subscriber" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = subscriber_id AND subscriber_id != creator_id);

CREATE POLICY "Authenticated users can update subscriptions where they are the subscriber" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL AND auth.uid() = subscriber_id);

-- Ensure subscription_plans can be viewed by all authenticated users
DROP POLICY IF EXISTS "Users can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Authenticated users can view subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Ensure earnings table has proper RLS policies
DROP POLICY IF EXISTS "Users can view their own earnings" ON public.earnings;
DROP POLICY IF EXISTS "System can insert earnings records" ON public.earnings;

CREATE POLICY "Users can view their own earnings" 
  ON public.earnings 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert earnings records" 
  ON public.earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
