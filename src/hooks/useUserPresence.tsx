
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null;
  statusText: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>({});

  const updatePresence = async (isOnline: boolean = true) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_presence', {
        user_uuid: user.id,
        online_status: isOnline
      });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const getUserStatus = async (userId: string): Promise<UserStatus> => {
    try {
      const { data, error } = await supabase.rpc('get_user_status', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error getting user status:', error);
        return { isOnline: false, lastSeen: null, statusText: 'Offline' };
      }

      if (data && data.length > 0) {
        const statusData = data[0];
        return {
          isOnline: statusData.is_online,
          lastSeen: statusData.last_seen,
          statusText: statusData.status_text
        };
      }

      return { isOnline: false, lastSeen: null, statusText: 'Offline' };
    } catch (error) {
      console.error('Error getting user status:', error);
      return { isOnline: false, lastSeen: null, statusText: 'Offline' };
    }
  };

  const subscribeToPresenceUpdates = () => {
    const channel = supabase
      .channel('user-presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        async (payload) => {
          console.log('Presence update received:', payload);
          // Type guard to check if payload.new exists and has user_id
          if (payload.new && typeof payload.new === 'object' && 'user_id' in payload.new) {
            const userId = payload.new.user_id as string;
            const status = await getUserStatus(userId);
            setUserStatuses(prev => ({
              ...prev,
              [userId]: status
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Set up heartbeat to keep presence updated
  useEffect(() => {
    if (!user) return;

    // Initial presence update
    updatePresence(true);

    // Set up heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      updatePresence(true);
    }, 30000);

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up beforeunload handler
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Subscribe to presence updates
    const unsubscribe = subscribeToPresenceUpdates();

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unsubscribe();
      // Set offline on cleanup
      updatePresence(false);
    };
  }, [user]);

  return {
    updatePresence,
    getUserStatus,
    userStatuses,
    setUserStatuses
  };
};
