-- Create creator consent table for tracking consent agreements
CREATE TABLE public.creator_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kyc_consent BOOLEAN NOT NULL DEFAULT false,
  age_consent BOOLEAN NOT NULL DEFAULT false,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  final_agreement BOOLEAN NOT NULL DEFAULT false,
  consent_completed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  terms_version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_consent ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own consent records" 
ON public.creator_consent 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own consent records" 
ON public.creator_consent 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent records" 
ON public.creator_consent 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_creator_consent_updated_at
BEFORE UPDATE ON public.creator_consent
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();