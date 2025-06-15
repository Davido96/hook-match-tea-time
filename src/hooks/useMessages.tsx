
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  sender_id: string;
}

export const useMessages = (matchUserId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!user || !matchUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching messages for match:', { user: user.id, match: matchUserId });
      setLoading(true);
      setError(null);

      // First find the match between current user and selected match
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${matchUserId}),and(user1_id.eq.${matchUserId},user2_id.eq.${user.id})`)
        .eq('is_active', true)
        .single();

      if (matchError || !matchData) {
        console.log('No match found between users');
        setMessages([]);
        return;
      }

      console.log('Found match:', matchData.id);

      // Find the conversation for this match
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('id')
        .eq('match_id', matchData.id)
        .single();

      if (conversationError || !conversationData) {
        console.log('No conversation found for match');
        setMessages([]);
        return;
      }

      console.log('Found conversation:', conversationData.id);
      setConversationId(conversationData.id);

      // Fetch messages for this conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationData.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setError('Failed to load messages');
        return;
      }

      console.log('Fetched messages:', messagesData);

      // Transform messages to match interface
      const transformedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender_id === user.id ? 'me' : 'them',
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_id: msg.sender_id
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) {
      console.log('Cannot send message: missing requirements', { user: !!user, conversationId, content });
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
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }

      console.log('Message sent successfully:', data);
      
      // Add the new message to local state immediately for better UX
      const newMessage: Message = {
        id: data.id,
        text: data.content,
        sender: 'me',
        time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender_id: data.sender_id
      };

      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, matchUserId]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel('messages-changes')
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
              text: newMessage.content,
              sender: 'them',
              time: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender_id: newMessage.sender_id
            };
            
            setMessages(prev => [...prev, transformedMessage]);
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
    refetch: fetchMessages
  };
};
