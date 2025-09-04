import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Trophy, Target, Calendar } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'event';
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  expires_at: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  progress: number;
  isCompleted: boolean;
  timeUntilExpiry: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  progress,
  isCompleted,
  timeUntilExpiry
}) => {
  const progressPercentage = (progress / challenge.requirement_value) * 100;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Target className="w-4 h-4" />;
      case 'weekly':
        return <Calendar className="w-4 h-4" />;
      case 'monthly':
        return <Trophy className="w-4 h-4" />;
      case 'event':
        return <Star className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'weekly':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'monthly':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'event':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'daily':
        return 'from-green-50 to-emerald-50';
      case 'weekly':
        return 'from-blue-50 to-indigo-50';
      case 'monthly':
        return 'from-purple-50 to-violet-50';
      case 'event':
        return 'from-yellow-50 to-orange-50';
      default:
        return 'from-gray-50 to-slate-50';
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${
      isCompleted 
        ? `bg-gradient-to-br ${getTypeGradient(challenge.challenge_type)} ring-2 ring-green-400 ring-offset-2`
        : `bg-gradient-to-br ${getTypeGradient(challenge.challenge_type)}`
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(challenge.challenge_type)}`}>
              {getTypeIcon(challenge.challenge_type)}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">
                {challenge.name}
              </h3>
              <Badge variant="secondary" className={`text-xs ${getTypeColor(challenge.challenge_type)}`}>
                {challenge.challenge_type}
              </Badge>
            </div>
          </div>
          {!isCompleted && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{timeUntilExpiry}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-3">
          {challenge.description}
        </p>

        {/* Progress */}
        {!isCompleted && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress} / {challenge.requirement_value}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            {challenge.xp_reward > 0 && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Star className="w-3 h-3" />
                <span>{challenge.xp_reward} XP</span>
              </div>
            )}
            {challenge.keys_reward > 0 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Trophy className="w-3 h-3" />
                <span>{challenge.keys_reward} Keys</span>
              </div>
            )}
          </div>

          {/* Completion Status */}
          {isCompleted && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              ✅ Completed!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;