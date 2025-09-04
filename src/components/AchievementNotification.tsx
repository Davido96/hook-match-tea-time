import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, X, Star, Gift, Zap } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface AchievementNotificationProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: {
      achievement_name?: string;
      xp_reward?: number;
      keys_reward?: number;
      rarity?: string;
      new_level?: number;
    };
    created_at: string;
  };
  onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notification,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 200);
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-green-400 to-green-600';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'achievement_unlocked':
        return <Trophy className="w-6 h-6" />;
      case 'level_up':
        return <Zap className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ${
      isVisible && !isAnimating 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <Card className="w-80 bg-white border-2 border-yellow-400 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Achievement Icon */}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
              getRarityColor(notification.data?.rarity)
            } flex items-center justify-center text-white shadow-lg`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 text-sm">
                  {notification.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-gray-600 mb-3">
                {notification.message}
              </p>

              {/* Rewards */}
              <div className="flex items-center space-x-3">
                {notification.data?.xp_reward && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    {notification.data.xp_reward} XP
                  </Badge>
                )}
                {notification.data?.keys_reward && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    {notification.data.keys_reward} Keys
                  </Badge>
                )}
                {notification.data?.new_level && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Level {notification.data.new_level}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Sparkle Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementNotification;