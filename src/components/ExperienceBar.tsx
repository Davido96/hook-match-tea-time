import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Zap } from 'lucide-react';

interface ExperienceBarProps {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  rankTitle: string;
  showDetailed?: boolean;
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({
  totalXp,
  currentLevel,
  xpToNextLevel,
  rankTitle,
  showDetailed = false
}) => {
  const xpForCurrentLevel = currentLevel * 100;
  const currentXpInLevel = totalXp - ((currentLevel - 1) * 100);
  const progressPercentage = (currentXpInLevel / xpForCurrentLevel) * 100;

  const getLevelColor = (level: number) => {
    if (level <= 5) return 'from-gray-400 to-gray-600';
    if (level <= 10) return 'from-green-400 to-green-600';
    if (level <= 20) return 'from-blue-400 to-blue-600';
    if (level <= 35) return 'from-purple-400 to-purple-600';
    if (level <= 50) return 'from-pink-400 to-pink-600';
    if (level <= 75) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600 shadow-lg shadow-red-400/25';
  };

  const getRankIcon = (level: number) => {
    if (level <= 5) return <Star className="w-4 h-4" />;
    if (level <= 20) return <TrendingUp className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {currentLevel}
            </div>
            <div>
              <div className="font-semibold text-gray-900">Level {currentLevel}</div>
              <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                {getRankIcon(currentLevel)}
                <span className="ml-1">{rankTitle}</span>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {totalXp.toLocaleString()} XP
            </div>
            <div className="text-xs text-gray-500">
              {xpToNextLevel} to next level
            </div>
          </div>
        </div>

        {/* Experience Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Level {currentLevel}</span>
            <span>Level {currentLevel + 1}</span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(progressPercentage, 100)} 
              className="h-3 bg-gray-200"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white mix-blend-difference">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{currentXpInLevel} XP</span>
            <span>{xpForCurrentLevel} XP</span>
          </div>
        </div>

        {showDetailed && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Discovery</div>
              <div className="font-semibold text-blue-600">Lvl 1</div>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Matching</div>
              <div className="font-semibold text-pink-600">Lvl 1</div>
            </div>
            <div className="bg-white/50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Social</div>
              <div className="font-semibold text-green-600">Lvl 1</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceBar;