
-- Create a secure function to handle wallet creation for tip recipients
CREATE OR REPLACE FUNCTION public.create_or_update_recipient_wallet(
  recipient_user_id UUID,
  tip_amount INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update the recipient's wallet
  INSERT INTO public.wallets (user_id, keys_balance)
  VALUES (recipient_user_id, tip_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    keys_balance = wallets.keys_balance + tip_amount,
    updated_at = now();
END;
$$;

-- Update the RLS policy for wallets to allow authenticated users to create wallets
DROP POLICY IF EXISTS "Users can manage their own wallets" ON public.wallets;

-- Create separate policies for better control
CREATE POLICY "Users can view their own wallets" 
  ON public.wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets" 
  ON public.wallets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" 
  ON public.wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_or_update_recipient_wallet(UUID, INTEGER) TO authenticated;
