import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ConsentData {
  kycConsent: boolean;
  ageConsent: boolean;
  privacyConsent: boolean;
  finalAgreement: boolean;
}

interface ConsentRecord extends ConsentData {
  id: string;
  userId: string;
  consentCompletedAt?: string;
  termsVersion: string;
  createdAt: string;
  updatedAt: string;
}

export const useCreatorConsent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);

  useEffect(() => {
    if (user) {
      fetchConsentRecord();
    }
  }, [user]);

  const fetchConsentRecord = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('creator_consent')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching consent record:', error);
        return;
      }

      if (data) {
        setConsentRecord({
          id: data.id,
          userId: data.user_id,
          kycConsent: data.kyc_consent,
          ageConsent: data.age_consent,
          privacyConsent: data.privacy_consent,
          finalAgreement: data.final_agreement,
          consentCompletedAt: data.consent_completed_at,
          termsVersion: data.terms_version,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      }
    } catch (error) {
      console.error('Error fetching consent record:', error);
    }
  };

  const createOrUpdateConsent = async (consentData: ConsentData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return { success: false };
    }

    setLoading(true);
    try {
      const isComplete = Object.values(consentData).every(Boolean);
      const consentCompletedAt = isComplete ? new Date().toISOString() : null;

      // Get user's IP and user agent for compliance
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      const userAgent = navigator.userAgent;

      const insertData = {
        user_id: user.id,
        kyc_consent: consentData.kycConsent,
        age_consent: consentData.ageConsent,
        privacy_consent: consentData.privacyConsent,
        final_agreement: consentData.finalAgreement,
        consent_completed_at: consentCompletedAt,
        ip_address: ipData?.ip || null,
        user_agent: userAgent,
        terms_version: '1.0'
      };

      let result;

      if (consentRecord) {
        // Update existing record
        result = await supabase
          .from('creator_consent')
          .update(insertData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new record
        result = await supabase
          .from('creator_consent')
          .insert(insertData)
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving consent:', result.error);
        toast({
          title: "Error",
          description: "Failed to save consent data",
          variant: "destructive"
        });
        return { success: false };
      }

      // Update local state
      const newRecord: ConsentRecord = {
        id: result.data.id,
        userId: result.data.user_id,
        kycConsent: result.data.kyc_consent,
        ageConsent: result.data.age_consent,
        privacyConsent: result.data.privacy_consent,
        finalAgreement: result.data.final_agreement,
        consentCompletedAt: result.data.consent_completed_at,
        termsVersion: result.data.terms_version,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at,
      };

      setConsentRecord(newRecord);

      if (isComplete) {
        toast({
          title: "Consent Completed",
          description: "Your creator verification agreement has been recorded.",
        });
      }

      return { success: true, data: newRecord };
    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: "Error",
        description: "Failed to save consent data",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const isConsentComplete = () => {
    if (!consentRecord) return false;
    return consentRecord.kycConsent && 
           consentRecord.ageConsent && 
           consentRecord.privacyConsent && 
           consentRecord.finalAgreement;
  };

  return {
    consentRecord,
    loading,
    createOrUpdateConsent,
    isConsentComplete,
    refetch: fetchConsentRecord
  };
};