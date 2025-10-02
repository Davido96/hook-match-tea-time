import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserCheck, DollarSign, FileText } from "lucide-react";

export const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalCreators: 0,
    totalFans: 0,
    pendingWithdrawals: 0,
    totalPosts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get online users
      const { count: onlineUsers } = await supabase
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      // Get creators and fans
      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'creator');

      const { count: totalFans } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'consumer');

      // Get pending withdrawals
      const { count: pendingWithdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total posts
      const { count: totalPosts } = await supabase
        .from('exclusive_posts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        onlineUsers: onlineUsers || 0,
        totalCreators: totalCreators || 0,
        totalFans: totalFans || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        totalPosts: totalPosts || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-green-600" />
            <div className="text-sm text-muted-foreground">Online Now</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.onlineUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <div className="text-sm text-muted-foreground">Creators</div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalCreators}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-muted-foreground">Fans</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalFans}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-muted-foreground">Pending Withdrawals</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingWithdrawals}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-pink-600" />
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </div>
          <div className="text-2xl font-bold text-pink-600">{stats.totalPosts}</div>
        </CardContent>
      </Card>
    </div>
  );
};
