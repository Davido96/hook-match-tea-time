import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useDailyStats } from "@/hooks/useDailyStats";
import { useAchievements } from "@/hooks/useAchievements";
import { useExperience } from "@/hooks/useExperience";
import { useChallenges } from "@/hooks/useChallenges";
import ExperienceBar from "./ExperienceBar";
import AchievementCard from "./AchievementCard";
import ChallengeCard from "./ChallengeCard";
import { Trophy, Target, Star, Gift } from "lucide-react";
import NotificationSystem from "./NotificationSystem";
import { useNotifications } from '@/hooks/useNotifications';

interface GamifiedDiscoveryStatsProps {
  onSwipe?: () => void;
  onSuperLike?: () => void;
}

const GamifiedDiscoveryStats: React.FC<GamifiedDiscoveryStatsProps> = ({ 
  onSwipe, 
  onSuperLike 
}) => {
  const { activity, loading: activityLoading, updateStreak } = useActivityTracker();
  const { stats, loading: statsLoading } = useDailyStats();
  const { achievements, userAchievements, getAchievementProgress, isAchievementCompleted, loading: achievementsLoading } = useAchievements();
  const { experience, getRankTitle, loading: experienceLoading } = useExperience();
  const { challenges, getChallengeProgress, isChallengeCompleted, getActiveChallenges, getDaysUntilExpiry, loading: challengesLoading } = useChallenges();

  // Update streak and check achievements when component mounts
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  if (activityLoading || statsLoading || achievementsLoading || experienceLoading || challengesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeChallenges = getActiveChallenges().slice(0, 3); // Show top 3 active challenges
  const recentAchievements = achievements.slice(0, 6); // Show first 6 achievements

  return (
    <>
      <NotificationSystem />
      <div className="space-y-6">
        {/* Experience Bar */}
        {experience && (
          <ExperienceBar
            totalXp={experience.total_xp}
            currentLevel={experience.current_level}
            xpToNextLevel={experience.xp_to_next_level}
            rankTitle={getRankTitle(experience.current_level)}
          />
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Daily Streak */}
          <Card className={`transition-all duration-300 ${
            activity.currentStreak > 0 
              ? 'ring-2 ring-orange-400 bg-gradient-to-br from-orange-50 to-red-50' 
              : ''
          }`}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {activity.currentStreak}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
              {activity.currentStreak > 0 && (
                <Badge variant="secondary" className="text-xs mt-1 bg-orange-100 text-orange-700">
                  🔥 On fire!
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Current Level */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {experience?.current_level || 1}
              </div>
              <div className="text-xs text-gray-600">Level</div>
              <Badge variant="secondary" className="text-xs mt-1 bg-indigo-100 text-indigo-700">
                <Star className="w-3 h-3 mr-1" />
                {experience ? getRankTitle(experience.current_level) : 'Newcomer'}
              </Badge>
            </CardContent>
          </Card>

          {/* Today's Swipes */}
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.todaySwipes}
              </div>
              <div className="text-xs text-gray-600">Today's Swipes</div>
              <div className="text-xs text-gray-500 mt-1">
                Goal: 20
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {userAchievements.filter(ua => ua.is_completed).length}
              </div>
              <div className="text-xs text-gray-600">Achievements</div>
              <Badge variant="secondary" className="text-xs mt-1 bg-yellow-100 text-yellow-700">
                <Trophy className="w-3 h-3 mr-1" />
                Earned
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Challenges</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span>Active Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeChallenges.length > 0 ? (
                  activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      progress={getChallengeProgress(challenge.id)}
                      isCompleted={isChallengeCompleted(challenge.id)}
                      timeUntilExpiry={`${getDaysUntilExpiry(challenge)} days`}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No active challenges at the moment</p>
                    <p className="text-xs">Check back soon for new challenges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {recentAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      progress={getAchievementProgress(achievement.id)}
                      isCompleted={isAchievementCompleted(achievement.id)}
                    />
                  ))}
                </div>
                {achievements.length > 6 && (
                  <Button variant="outline" className="w-full mt-4">
                    View All Achievements
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default GamifiedDiscoveryStats;