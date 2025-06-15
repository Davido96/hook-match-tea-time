
-- Enable pgcrypto extension for hashing, if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add columns to the profiles table to store the PIN hash and update timestamp
ALTER TABLE public.profiles
ADD COLUMN withdrawal_pin_hash TEXT,
ADD COLUMN pin_last_updated_at TIMESTAMPTZ;

-- Create a function to set or update a user's withdrawal PIN
CREATE OR REPLACE FUNCTION public.set_withdrawal_pin(pin TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF char_length(pin) != 4 OR pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'PIN must be 4 digits.';
  END IF;

  UPDATE public.profiles
  SET 
    withdrawal_pin_hash = crypt(pin, gen_salt('bf')),
    pin_last_updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Create a function to verify a user's withdrawal PIN
CREATE OR REPLACE FUNCTION public.verify_withdrawal_pin(pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT withdrawal_pin_hash INTO stored_hash
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF stored_hash IS NULL THEN
    RETURN FALSE; -- No PIN has been set
  END IF;

  RETURN stored_hash = crypt(pin, stored_hash);
END;
$$;
