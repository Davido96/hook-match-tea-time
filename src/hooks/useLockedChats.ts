import { useState, useEffect } from 'react';

interface LockedChat {
  conversationId: string;
  pinHash: string;
  lockedAt: string;
}

const STORAGE_KEY = 'locked_chats';

export const useLockedChats = () => {
  const [lockedChats, setLockedChats] = useState<LockedChat[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLockedChats(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading locked chats:', error);
      }
    }
  }, []);

  const saveLockedChats = (chats: LockedChat[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    setLockedChats(chats);
  };

  const hashPin = (pin: string): string => {
    // Simple hash for demonstration - in production use a proper hashing library
    return btoa(pin);
  };

  const isLocked = (conversationId: string): boolean => {
    return lockedChats.some(chat => chat.conversationId === conversationId);
  };

  const lockChat = (conversationId: string, pin: string) => {
    if (isLocked(conversationId)) {
      return { success: false, error: 'Chat is already locked' };
    }

    const newLockedChat: LockedChat = {
      conversationId,
      pinHash: hashPin(pin),
      lockedAt: new Date().toISOString()
    };

    saveLockedChats([...lockedChats, newLockedChat]);
    return { success: true };
  };

  const unlockChat = (conversationId: string, pin: string) => {
    const chat = lockedChats.find(c => c.conversationId === conversationId);
    
    if (!chat) {
      return { success: false, error: 'Chat is not locked' };
    }

    if (chat.pinHash !== hashPin(pin)) {
      return { success: false, error: 'Incorrect PIN' };
    }

    saveLockedChats(lockedChats.filter(c => c.conversationId !== conversationId));
    return { success: true };
  };

  const verifyPin = (conversationId: string, pin: string): boolean => {
    const chat = lockedChats.find(c => c.conversationId === conversationId);
    if (!chat) return false;
    return chat.pinHash === hashPin(pin);
  };

  return {
    lockedChats,
    isLocked,
    lockChat,
    unlockChat,
    verifyPin
  };
};
