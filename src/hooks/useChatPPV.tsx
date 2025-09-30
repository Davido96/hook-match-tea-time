import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChatMediaOffer {
  id: string;
  message_id: string;
  conversation_id: string;
  seller_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
  price_keys: number;
  unlock_duration_hours?: number;
  caption?: string;
  is_active: boolean;
  created_at: string;
}

export interface ChatMediaPurchase {
  id: string;
  offer_id: string;
  buyer_id: string;
  price_paid: number;
  purchased_at: string;
  expires_at?: string;
}

export const useChatPPV = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createOffer = async (
    conversationId: string,
    messageId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
    priceKeys: number,
    unlockDurationHours?: number,
    caption?: string,
    thumbnailUrl?: string
  ) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_media_offers' as any)
        .insert({
          conversation_id: conversationId,
          message_id: messageId,
          seller_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          price_keys: priceKeys,
          unlock_duration_hours: unlockDurationHours,
          caption: caption,
          thumbnail_url: thumbnailUrl,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as any };
    } catch (error) {
      console.error('Error creating PPV offer:', error);
      return { success: false, error: 'Failed to create offer' };
    } finally {
      setLoading(false);
    }
  };

  const purchaseMedia = async (offerId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase content');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('purchase_chat_media' as any, {
        offer_uuid: offerId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; expires_at?: string };
      
      if (result.success) {
        toast.success(result.message || 'Content unlocked successfully!');
        return { success: true, data: result };
      } else {
        toast.error(result.error || 'Purchase failed');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Error purchasing media:', error);
      toast.error(error.message || 'Failed to purchase content');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (offerId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_chat_media_access' as any, {
        user_uuid: user.id,
        offer_uuid: offerId
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  const uploadMedia = async (file: File, conversationId: string): Promise<{ url?: string; error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${conversationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      return { url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading media:', error);
      return { error: error.message || 'Failed to upload media' };
    } finally {
      setLoading(false);
    }
  };

  const getOffersByConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_media_offers' as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: (data || []) as unknown as ChatMediaOffer[] };
    } catch (error) {
      console.error('Error fetching offers:', error);
      return { success: false, data: [] };
    }
  };

  return {
    loading,
    createOffer,
    purchaseMedia,
    checkAccess,
    uploadMedia,
    getOffersByConversation
  };
};
