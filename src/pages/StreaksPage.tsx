import { useState } from "react";
import { ArrowLeft, Calendar, Award, Target, TrendingUp, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useExperience } from "@/hooks/useExperience";
import { useAchievements } from "@/hooks/useAchievements";
import { useChallenges } from "@/hooks/useChallenges";
import { useDailyStats } from "@/hooks/useDailyStats";
import ExperienceBar from "@/components/ExperienceBar";
import AchievementCard from "@/components/AchievementCard";
import ChallengeCard from "@/components/ChallengeCard";
import NotificationSystem from "@/components/NotificationSystem";

const StreaksPage = () => {
  const navigate = useNavigate();
  const { activity, loading: activityLoading } = useActivityTracker();
  const { experience, loading: experienceLoading, getRankTitle } = useExperience();
  const { achievements, userAchievements, loading: achievementsLoading, getAchievementProgress, isAchievementCompleted } = useAchievements();
  const { challenges, userChallenges, loading: challengesLoading, getChallengeProgress, isChallengeCompleted, getActiveChallenges, getDaysUntilExpiry } = useChallenges();
  const { stats, loading: statsLoading } = useDailyStats();

  const loading = activityLoading || experienceLoading || achievementsLoading || challengesLoading || statsLoading;

  const activeChallenges = getActiveChallenges();
  const completedAchievements = userAchievements.filter(ua => ua.is_completed);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-600";
    if (streak >= 14) return "text-orange-600";
    if (streak >= 7) return "text-yellow-600";
    return "text-blue-600";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "👑";
    if (streak >= 14) return "⭐";
    if (streak >= 7) return "🔥";
    return "💫";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <NotificationSystem />
      
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-foreground">Streaks & Progress</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            {/* Streak Overview */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Daily Streak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getStreakColor(activity.currentStreak)}`}>
                      {activity.currentStreak}
                    </div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                  <div className="text-4xl">
                    {getStreakEmoji(activity.currentStreak)}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {activity.longestStreak}
                    </div>
                    <div className="text-sm text-muted-foreground">Best</div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {activity.totalDiscoveryDays} total active days
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Experience Bar */}
            {experience && (
              <ExperienceBar
                totalXp={experience.total_xp}
                currentLevel={experience.current_level}
                xpToNextLevel={experience.xp_to_next_level}
                rankTitle={getRankTitle(experience.current_level)}
                showDetailed={true}
              />
            )}

            {/* Daily Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.todaySwipes}</div>
                    <div className="text-xs text-muted-foreground">Swipes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.todayMatches}</div>
                    <div className="text-xs text-muted-foreground">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.todaySuperLikes}</div>
                    <div className="text-xs text-muted-foreground">Super Likes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Challenges and Achievements */}
            <Tabs defaultValue="challenges" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="challenges" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Challenges</h3>
                  <Badge variant="outline">{activeChallenges.length} active</Badge>
                </div>
                
                {activeChallenges.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No active challenges</p>
                      <p className="text-sm text-muted-foreground">New challenges will appear soon!</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      progress={getChallengeProgress(challenge.id)}
                      isCompleted={isChallengeCompleted(challenge.id)}
                      timeUntilExpiry={`${getDaysUntilExpiry(challenge)} days`}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Achievements</h3>
                  <Badge variant="outline">{completedAchievements.length} / {achievements.length} earned</Badge>
                </div>

                {achievements.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Award className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No achievements available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        progress={getAchievementProgress(achievement.id)}
                        isCompleted={isAchievementCompleted(achievement.id)}
                        showProgress={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default StreaksPage;