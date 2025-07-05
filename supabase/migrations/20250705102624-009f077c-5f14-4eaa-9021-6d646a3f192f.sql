-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'waitlisted');

-- Create enum for verification status  
CREATE TYPE public.verification_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');

-- Create enum for creator categories/niches
CREATE TYPE public.creator_category AS ENUM ('lifestyle', 'fitness', 'beauty', 'fashion', 'food', 'travel', 'tech', 'gaming', 'music', 'art', 'education', 'business', 'comedy', 'other');

-- Create creator waitlist table
CREATE TABLE public.creator_waitlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    location_city TEXT,
    location_state TEXT,
    
    -- Social media handles
    twitter_handle TEXT,
    instagram_handle TEXT,
    tiktok_handle TEXT,
    other_social TEXT,
    
    -- Professional info
    creator_category creator_category NOT NULL,
    current_followers INTEGER DEFAULT 0,
    content_description TEXT,
    why_join TEXT,
    content_strategy TEXT,
    expected_monthly_revenue INTEGER,
    
    -- Media uploads
    profile_photo_url TEXT,
    portfolio_urls TEXT[], -- Array of portfolio URLs
    
    -- Application metadata
    application_status application_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin notes and scoring
    admin_notes TEXT,
    application_score INTEGER, -- 1-100 scoring system
    priority_level INTEGER DEFAULT 1, -- 1-5 for batch processing
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create verification submissions table
CREATE TABLE public.verification_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    waitlist_id UUID REFERENCES public.creator_waitlist(id) ON DELETE CASCADE,
    user_id UUID, -- Will be set after user is approved and creates account
    
    -- Identity verification
    government_id_url TEXT,
    selfie_url TEXT,
    
    -- Social media verification
    social_verification_posts TEXT[], -- URLs to verification posts
    
    -- Content portfolio
    sample_content_urls TEXT[],
    video_introduction_url TEXT,
    
    -- Verification status
    verification_status verification_status DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create application reviews table for admin workflow
CREATE TABLE public.application_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    waitlist_id UUID REFERENCES public.creator_waitlist(id) ON DELETE CASCADE,
    reviewer_user_id UUID, -- Admin who reviewed
    
    -- Review details
    review_status application_status NOT NULL,
    review_score INTEGER, -- 1-100
    review_notes TEXT,
    
    -- Scoring breakdown
    content_quality_score INTEGER, -- 1-25
    audience_engagement_score INTEGER, -- 1-25
    professional_presentation_score INTEGER, -- 1-25
    platform_fit_score INTEGER, -- 1-25
    
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for waitlist documents
INSERT INTO storage.buckets (id, name, public) VALUES ('waitlist-documents', 'waitlist-documents', false);

-- Create policies for creator waitlist
ALTER TABLE public.creator_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own waitlist applications
CREATE POLICY "Users can create waitlist applications" 
ON public.creator_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own applications (by email for now)
CREATE POLICY "Users can view their own applications" 
ON public.creator_waitlist 
FOR SELECT 
USING (true); -- We'll make this more restrictive later

-- Allow admins to manage all applications (we'll implement admin role later)
CREATE POLICY "System can manage waitlist applications" 
ON public.creator_waitlist 
FOR ALL 
USING (true);

-- Verification submissions policies
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their verification submissions" 
ON public.verification_submissions 
FOR ALL 
USING (true);

-- Application reviews policies
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage application reviews" 
ON public.application_reviews 
FOR ALL 
USING (true);

-- Storage policies for waitlist documents
CREATE POLICY "Users can upload waitlist documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'waitlist-documents');

CREATE POLICY "Users can view their own waitlist documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'waitlist-documents');

CREATE POLICY "Users can update their own waitlist documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'waitlist-documents');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_creator_waitlist_updated_at
    BEFORE UPDATE ON public.creator_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verification_submissions_updated_at
    BEFORE UPDATE ON public.verification_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check waitlist application status
CREATE OR REPLACE FUNCTION public.get_waitlist_status(applicant_email TEXT)
RETURNS TABLE(
    application_status application_status,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    application_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cw.application_status,
        cw.submitted_at,
        cw.reviewed_at,
        cw.admin_notes,
        cw.application_score
    FROM public.creator_waitlist cw
    WHERE cw.email = applicant_email;
END;
$$;