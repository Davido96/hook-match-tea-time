import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WaitlistApplication {
  email: string;
  fullName: string;
  phoneNumber?: string;
  locationCity?: string;
  locationState?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  otherSocial?: string;
  creatorCategory: string;
  currentFollowers: number;
  contentDescription?: string;
  whyJoin?: string;
  contentStrategy?: string;
  expectedMonthlyRevenue?: number;
  profilePhotoUrl?: string;
  portfolioUrls?: string[];
}

interface WaitlistStatus {
  application_status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  application_score?: number;
}

export const useCreatorWaitlist = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const submitApplication = async (application: WaitlistApplication) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('creator_waitlist')
        .insert({
          email: application.email,
          full_name: application.fullName,
          phone_number: application.phoneNumber,
          location_city: application.locationCity,
          location_state: application.locationState,
          twitter_handle: application.twitterHandle,
          instagram_handle: application.instagramHandle,
          tiktok_handle: application.tiktokHandle,
          other_social: application.otherSocial,
          creator_category: application.creatorCategory as any,
          current_followers: application.currentFollowers,
          content_description: application.contentDescription,
          why_join: application.whyJoin,
          content_strategy: application.contentStrategy,
          expected_monthly_revenue: application.expectedMonthlyRevenue,
          profile_photo_url: application.profilePhotoUrl,
          portfolio_urls: application.portfolioUrls,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Application Submitted! 🎉",
        description: "We'll review your application and get back to you within 3-5 business days.",
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Waitlist submission error:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Already Applied",
          description: "You've already submitted an application with this email address.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Please try again later.",
          variant: "destructive"
        });
      }
      
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (email: string): Promise<WaitlistStatus | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_waitlist_status', { applicant_email: email });

      if (error) throw error;
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('waitlist-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('waitlist-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    submitApplication,
    checkStatus,
    uploadFile,
    loading,
    uploading
  };
};