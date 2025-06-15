
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  conversation_id: string;
  match_id: string;
  other_user_id: string;
  other_name: string;
  other_avatar_url: string;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
  is_online: boolean;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching conversations for user:', user.id);

      // Use the corrected RPC function
      const { data, error: rpcError } = await supabase.rpc(
        'get_user_matches' as any,
        { user_uuid: user.id }
      );

      if (rpcError) {
        console.error('Error fetching conversations:', rpcError);
        setError('Failed to load conversations');
        return;
      }

      // Handle the response properly - show ALL matches that have conversations
      const rawData = Array.isArray(data) ? data : [];
      const transformedConversations: Conversation[] = rawData
        .filter((row: any) => row.conversation_id) // Only include matches with conversations
        .map((row: any) => ({
          conversation_id: row.conversation_id,
          match_id: row.match_id,
          other_user_id: row.other_user_id,
          other_name: row.other_name || 'Unknown User',
          other_avatar_url: row.other_avatar_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
          last_message_content: row.last_message_content || 'New match! Start chatting!',
          last_message_at: row.last_message_at || row.match_created_at,
          unread_count: row.unread_count || 0,
          is_online: row.other_last_active ? 
            (new Date().getTime() - new Date(row.other_last_active).getTime()) < 5 * 60 * 1000 : false
        }));

      console.log('Transformed conversations:', transformedConversations);
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (conversationId: string) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase.rpc(
        'mark_messages_as_read' as any,
        {
          conversation_id_param: conversationId,
          user_id_param: user.id
        }
      );

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Update local state to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  useEffect(() => {
    if (user !== undefined) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (!user) return;

    let debounceTimer: NodeJS.Timeout;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('Message update detected, refreshing conversations');
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchConversations();
          }, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          console.log('Match update detected, refreshing conversations');
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchConversations();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    markAsRead
  };
};
