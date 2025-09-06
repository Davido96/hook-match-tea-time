import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import AchievementNotification from './AchievementNotification';

const NotificationSystem: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [displayedNotifications, setDisplayedNotifications] = useState<string[]>([]);

  // Filter for gamification-related notifications
  const gamificationNotifications = notifications.filter(n => 
    ['achievement_unlocked', 'level_up', 'challenge_completed'].includes(n.type) &&
    !n.is_read &&
    !displayedNotifications.includes(n.id)
  ).slice(0, 3); // Only show up to 3 at a time

  const handleDismiss = async (notificationId: string) => {
    await markAsRead(notificationId);
    setDisplayedNotifications(prev => [...prev, notificationId]);
  };

  // Auto-clear displayed notifications list periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedNotifications([]);
    }, 30000); // Reset every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="space-y-3 p-4 pointer-events-auto">
        {gamificationNotifications.map((notification) => (
          <AchievementNotification
            key={notification.id}
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem;