
-- Create a function to handle the atomic creator upgrade transaction
CREATE OR REPLACE FUNCTION public.upgrade_to_creator(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance integer;
  user_profile record;
  upgrade_cost integer := 2;
BEGIN
  -- Check if user exists and get current profile
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  -- Check if user is already a creator
  IF user_profile.user_type = 'creator' THEN
    RETURN json_build_object('success', false, 'error', 'User is already a creator');
  END IF;
  
  -- Get current wallet balance
  SELECT keys_balance INTO current_balance
  FROM public.wallets
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  -- Check if user has enough balance
  IF current_balance < upgrade_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance. You need 2 Keys to upgrade.');
  END IF;
  
  -- Deduct keys from wallet
  UPDATE public.wallets
  SET 
    keys_balance = keys_balance - upgrade_cost,
    updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Update user type to creator
  UPDATE public.profiles
  SET 
    user_type = 'creator',
    updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Record the transaction in earnings (as a negative entry for tracking)
  INSERT INTO public.earnings (user_id, source_type, amount, description)
  VALUES (user_uuid, 'bonus', -upgrade_cost, 'Upgrade to Creator status');
  
  RETURN json_build_object(
    'success', true, 
    'new_balance', current_balance - upgrade_cost,
    'message', 'Successfully upgraded to Creator status!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'An error occurred during upgrade: ' || SQLERRM);
END;
$$;
