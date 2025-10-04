import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEngagementMetrics } from "@/hooks/useEngagementMetrics";
import { Users, Activity, Heart, MessageCircle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const EngagementMetrics = () => {
  const { metrics, loading } = useEngagementMetrics(30);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Active Users */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Active Users (30d)</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.active_users.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              of {metrics.total_users.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.engagement_rate}%</p>
            <Progress value={metrics.engagement_rate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Total Matches */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Matches (30d)</p>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.total_matches.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              New connections made
            </p>
          </CardContent>
        </Card>

        {/* Content Engagement */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Posts/User</p>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.avg_posts_per_user}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.total_posts.toLocaleString()} total posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Engagement Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Platform Activity (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Likes</p>
              <p className="text-2xl font-bold">{metrics.total_likes.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Comments</p>
              <p className="text-2xl font-bold">{metrics.total_comments.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
              <p className="text-2xl font-bold">{metrics.total_posts.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
