
-- Fix subscription_plans RLS policy to allow all authenticated users to view active plans
DROP POLICY IF EXISTS "Authenticated users can view subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Creators can manage their own subscription plans" ON public.subscription_plans;

CREATE POLICY "All authenticated users can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Recreate the creators policy with proper permissions
CREATE POLICY "Creators can manage their own subscription plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (auth.uid() IS NOT NULL AND auth.uid() = creator_id);
