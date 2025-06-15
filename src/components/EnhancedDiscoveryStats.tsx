
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Trophy, TrendingUp } from "lucide-react";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useDailyStats } from "@/hooks/useDailyStats";

interface EnhancedDiscoveryStatsProps {
  onSwipe?: () => void;
  onSuperLike?: () => void;
}

const EnhancedDiscoveryStats = ({ onSwipe, onSuperLike }: EnhancedDiscoveryStatsProps) => {
  const { activity, loading: activityLoading, updateStreak } = useActivityTracker();
  const { stats, loading: statsLoading, incrementSwipes, incrementSuperLikes } = useDailyStats();

  // Update streak when component mounts or user becomes active
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  // Handle external swipe events
  useEffect(() => {
    if (onSwipe) {
      const handleSwipe = async () => {
        await incrementSwipes();
        await updateStreak();
      };
      // Store the handler to call it when needed
      (window as any).handleDiscoverySwipe = handleSwipe;
    }
  }, [onSwipe, incrementSwipes, updateStreak]);

  // Handle external super like events
  useEffect(() => {
    if (onSuperLike) {
      const handleSuperLike = async () => {
        await incrementSuperLikes();
        await updateStreak();
      };
      // Store the handler to call it when needed
      (window as any).handleDiscoverySuperLike = handleSuperLike;
    }
  }, [onSuperLike, incrementSuperLikes, updateStreak]);

  if (activityLoading || statsLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dailyGoalProgress = Math.min((stats.todaySwipes / 20) * 100, 100);
  const isStreakActive = activity.currentStreak > 0;
  const isGoalReached = stats.todaySwipes >= 20;

  const getStreakMessage = () => {
    if (activity.currentStreak === 0) return "Start your discovery journey!";
    if (activity.currentStreak === 1) return "Great start! Keep it going 🎯";
    if (activity.currentStreak < 7) return `${activity.currentStreak} days strong! 💪`;
    if (activity.currentStreak < 30) return `Amazing streak! ${activity.currentStreak} days 🔥`;
    return `Legendary! ${activity.currentStreak} day streak! 🏆`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Daily Streak */}
        <Card className={`transition-all duration-300 ${isStreakActive ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-red-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className={`w-6 h-6 ${isStreakActive ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {activity.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
            {activity.currentStreak > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs bg-orange-100 text-orange-700">
                🔥 On fire!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Daily Goal */}
        <Card className={`transition-all duration-300 ${isGoalReached ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-50 to-emerald-50' : ''}`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className={`w-6 h-6 ${isGoalReached ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.todaySwipes}/20
            </div>
            <div className="text-sm text-gray-600">Daily Goal</div>
            <Progress value={dailyGoalProgress} className="h-2 mt-2" />
            {isGoalReached && (
              <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700">
                ✅ Complete!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Best Streak */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {activity.longestStreak}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
            <Badge variant="secondary" className="mt-1 text-xs bg-yellow-100 text-yellow-700">
              🏆 Record
            </Badge>
          </CardContent>
        </Card>

        {/* Total Days */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {activity.totalDiscoveryDays}
            </div>
            <div className="text-sm text-gray-600">Total Days</div>
            <Badge variant="secondary" className="mt-1 text-xs bg-blue-100 text-blue-700">
              📈 Journey
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4 text-center">
          <p className="text-lg font-medium text-purple-800 mb-2">
            {getStreakMessage()}
          </p>
          <div className="flex justify-center space-x-4 text-sm text-purple-600">
            <span>Super Likes: {stats.todaySuperLikes}</span>
            <span>•</span>
            <span>Swipes Today: {stats.todaySwipes}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDiscoveryStats;
