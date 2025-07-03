-- Add pay-per-view columns to exclusive_posts table
ALTER TABLE public.exclusive_posts 
ADD COLUMN is_ppv boolean DEFAULT false,
ADD COLUMN ppv_price integer DEFAULT NULL,
ADD COLUMN ppv_unlock_duration integer DEFAULT NULL; -- in hours, null = permanent

-- Create post_purchases table to track PPV purchases
CREATE TABLE public.post_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid NOT NULL REFERENCES public.exclusive_posts(id) ON DELETE CASCADE,
  price_paid integer NOT NULL,
  purchased_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT NULL, -- null = permanent access
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on post_purchases
ALTER TABLE public.post_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_purchases
CREATE POLICY "Users can view their own purchases"
ON public.post_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON public.post_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to check if user has purchased access to a post
CREATE OR REPLACE FUNCTION public.has_post_access(user_uuid uuid, post_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_record record;
  purchase_record record;
BEGIN
  -- Get post details
  SELECT * INTO post_record FROM public.exclusive_posts WHERE id = post_uuid;
  
  -- If post doesn't exist, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If user is the creator, they have access
  IF post_record.creator_id = user_uuid THEN
    RETURN true;
  END IF;
  
  -- If post is public, anyone has access
  IF post_record.is_public = true THEN
    RETURN true;
  END IF;
  
  -- If post is not PPV, check subscription
  IF post_record.is_ppv = false THEN
    RETURN EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriber_id = user_uuid 
        AND creator_id = post_record.creator_id
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > now())
    );
  END IF;
  
  -- If post is PPV, check if user has purchased it
  SELECT * INTO purchase_record 
  FROM public.post_purchases 
  WHERE user_id = user_uuid AND post_id = post_uuid;
  
  -- If no purchase found, no access
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If purchase has expiration, check if it's still valid
  IF purchase_record.expires_at IS NOT NULL AND purchase_record.expires_at <= now() THEN
    RETURN false;
  END IF;
  
  -- Access granted
  RETURN true;
END;
$$;

-- Function to purchase PPV content
CREATE OR REPLACE FUNCTION public.purchase_ppv_content(post_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  post_record record;
  user_wallet record;
  expires_time timestamp with time zone;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get post details
  SELECT * INTO post_record FROM public.exclusive_posts WHERE id = post_uuid;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Post not found');
  END IF;
  
  -- Check if post is PPV
  IF post_record.is_ppv = false THEN
    RETURN json_build_object('success', false, 'error', 'Post is not pay-per-view');
  END IF;
  
  -- Check if user already has access
  IF public.has_post_access(auth.uid(), post_uuid) THEN
    RETURN json_build_object('success', false, 'error', 'You already have access to this content');
  END IF;
  
  -- Get user wallet
  SELECT * INTO user_wallet FROM public.wallets WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  -- Check if user has enough balance
  IF user_wallet.keys_balance < post_record.ppv_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Calculate expiration time
  IF post_record.ppv_unlock_duration IS NOT NULL THEN
    expires_time := now() + (post_record.ppv_unlock_duration || ' hours')::interval;
  ELSE
    expires_time := NULL; -- Permanent access
  END IF;
  
  -- Deduct from buyer's wallet
  UPDATE public.wallets
  SET keys_balance = keys_balance - post_record.ppv_price,
      updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Add to creator's wallet
  UPDATE public.wallets
  SET keys_balance = keys_balance + post_record.ppv_price,
      updated_at = now()
  WHERE user_id = post_record.creator_id;
  
  -- Create purchase record
  INSERT INTO public.post_purchases (user_id, post_id, price_paid, expires_at)
  VALUES (auth.uid(), post_uuid, post_record.ppv_price, expires_time);
  
  -- Create earnings record for creator
  INSERT INTO public.earnings (user_id, source_type, amount, description, source_id)
  VALUES (post_record.creator_id, 'ppv', post_record.ppv_price, 'Pay-per-view content purchase', post_uuid);
  
  -- Create notification for creator
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    post_record.creator_id,
    'ppv_purchase',
    'Content Purchased! 💰',
    'Someone purchased your pay-per-view content',
    jsonb_build_object(
      'post_id', post_uuid,
      'buyer_id', auth.uid(),
      'amount', post_record.ppv_price
    )
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Content purchased successfully',
    'expires_at', expires_time
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Purchase failed: ' || SQLERRM);
END;
$$;