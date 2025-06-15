
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'them';
  time: string;
  sender_id: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  message_type?: string;
}

export const useEnhancedMessages = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching messages for conversation:', conversationId);
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setError('Failed to load messages');
        return;
      }

      console.log('Fetched messages:', messagesData);

      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender_id === user.id ? 'me' : 'them',
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_id: msg.sender_id,
        status: (msg as any).status || 'sent', // Type assertion for status field
        created_at: msg.created_at,
        message_type: msg.message_type
      }));

      setMessages(transformedMessages);

      // Mark messages as read when fetched
      if (transformedMessages.length > 0) {
        await supabase.rpc(
          'mark_messages_as_read' as any,
          {
            conversation_id_param: conversationId,
            user_id_param: user.id
          }
        );
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user, conversationId]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) {
      console.log('Cannot send message: missing requirements');
      return false;
    }

    try {
      console.log('Sending message:', { conversationId, content });

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      console.log('Message sent successfully:', data);
      
      // Add the new message to local state immediately
      const newMessage: Message = {
        id: data.id,
        content: data.content,
        sender: 'me',
        time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_id: data.sender_id,
        status: 'sent',
        created_at: data.created_at,
        message_type: data.message_type
      };

      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  };

  const updateTypingStatus = useCallback(async (typing: boolean) => {
    if (!user || !conversationId) return;

    setIsTyping(typing);
    
    // Here you could implement typing indicators using Supabase realtime presence
    // For now, we'll just update local state
  }, [user, conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as any;
          
          // Only add if it's not from the current user (to avoid duplicates)
          if (newMessage.sender_id !== user?.id) {
            const transformedMessage: Message = {
              id: newMessage.id,
              content: newMessage.content,
              sender: 'them',
              time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender_id: newMessage.sender_id,
              status: newMessage.status || 'delivered',
              created_at: newMessage.created_at,
              message_type: newMessage.message_type
            };
            
            setMessages(prev => [...prev, transformedMessage]);
            
            // Auto-mark as read after a short delay
            setTimeout(() => {
              supabase.rpc(
                'mark_messages_as_read' as any,
                {
                  conversation_id_param: conversationId,
                  user_id_param: user?.id
                }
              );
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    isTyping,
    updateTypingStatus,
    refetch: fetchMessages
  };
};
