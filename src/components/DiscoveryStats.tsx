
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Trophy, Zap } from "lucide-react";

interface DiscoveryStatsProps {
  todaySwipes: number;
  todayMatches: number;
  streakDays: number;
  totalMatches: number;
}

const DiscoveryStats = ({ todaySwipes, todayMatches, streakDays, totalMatches }: DiscoveryStatsProps) => {
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    if (streakDays > 0) {
      setShowStreak(true);
    }
  }, [streakDays]);

  const getStreakMessage = () => {
    if (streakDays === 0) return "Start your discovery streak!";
    if (streakDays === 1) return "Great start! Keep going!";
    if (streakDays < 7) return "Building momentum!";
    if (streakDays < 30) return "You're on fire! 🔥";
    return "Discovery master! 🏆";
  };

  const getDailyGoalProgress = () => {
    const dailyGoal = 20; // Target swipes per day
    return Math.min((todaySwipes / dailyGoal) * 100, 100);
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Daily Streak */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5" />
            <div>
              <div className="text-lg font-bold">{streakDays}</div>
              <div className="text-xs opacity-90">Day streak</div>
            </div>
          </div>
          {showStreak && (
            <div className="text-xs mt-1 opacity-90">{getStreakMessage()}</div>
          )}
        </CardContent>
      </Card>

      {/* Today's Matches */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <div>
              <div className="text-lg font-bold">{todayMatches}</div>
              <div className="text-xs opacity-90">Today's matches</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal Progress */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <div className="flex-1">
              <div className="text-lg font-bold">{todaySwipes}/20</div>
              <div className="text-xs opacity-90">Daily goal</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                <div 
                  className="bg-white rounded-full h-1 transition-all duration-300"
                  style={{ width: `${getDailyGoalProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Matches */}
      <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <div>
              <div className="text-lg font-bold">{totalMatches}</div>
              <div className="text-xs opacity-90">Total matches</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscoveryStats;
