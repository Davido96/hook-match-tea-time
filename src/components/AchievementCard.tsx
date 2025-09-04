import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  isCompleted: boolean;
  showProgress?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  isCompleted,
  showProgress = true
}) => {
  const progressPercentage = (progress / achievement.requirement_value) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-50 to-gray-100';
      case 'rare':
        return 'from-blue-50 to-blue-100';
      case 'epic':
        return 'from-purple-50 to-purple-100';
      case 'legendary':
        return 'from-yellow-50 to-yellow-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      isCompleted 
        ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} ring-2 ring-offset-2 ${getRarityColor(achievement.rarity).split(' ')[2].replace('border-', 'ring-')}`
        : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Achievement Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
            isCompleted 
              ? getRarityColor(achievement.rarity) + ' ring-2 ring-offset-2'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {isCompleted ? achievement.icon : <Lock className="w-5 h-5" />}
          </div>

          {/* Achievement Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <Badge variant="secondary" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </Badge>
            </div>

            <p className={`text-xs mb-3 ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            {showProgress && !isCompleted && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{progress} / {achievement.requirement_value}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
              </div>
            )}

            {/* Rewards */}
            <div className="flex items-center space-x-3 text-xs">
              {achievement.xp_reward > 0 && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Star className="w-3 h-3" />
                  <span>{achievement.xp_reward} XP</span>
                </div>
              )}
              {achievement.keys_reward > 0 && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Trophy className="w-3 h-3" />
                  <span>{achievement.keys_reward} Keys</span>
                </div>
              )}
            </div>

            {/* Completion Status */}
            {isCompleted && (
              <Badge variant="secondary" className="mt-2 text-xs bg-green-100 text-green-700">
                ✅ Completed!
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;