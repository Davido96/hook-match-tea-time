import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePostAccess = (postId: string) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseInfo, setPurchaseInfo] = useState<{
    expires_at?: string;
    price_paid?: number;
  } | null>(null);

  const checkAccess = async () => {
    if (!user || !postId) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Check access using the database function
      const { data, error } = await supabase.rpc('has_post_access', {
        user_uuid: user.id,
        post_uuid: postId
      });

      if (error) throw error;

      setHasAccess(data as boolean);

      // If user has access, get purchase details for PPV content
      if (data) {
        const { data: purchase } = await supabase
          .from('post_purchases')
          .select('expires_at, price_paid')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .maybeSingle();

        setPurchaseInfo(purchase);
      }

    } catch (error) {
      console.error('Error checking post access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user, postId]);

  const refetch = () => {
    checkAccess();
  };

  return {
    hasAccess,
    loading,
    purchaseInfo,
    refetch
  };
};