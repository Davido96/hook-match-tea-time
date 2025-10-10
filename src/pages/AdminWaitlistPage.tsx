import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { format } from "date-fns";
import AdminWaitlistDashboard from "@/components/AdminWaitlistDashboard";
import { AdminStats } from "@/components/admin/AdminStats";
import { WithdrawalsManagement } from "@/components/admin/WithdrawalsManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { RevenueCharts } from "@/components/admin/RevenueCharts";
import { TopEarnersTable } from "@/components/admin/TopEarnersTable";
import { EngagementMetrics } from "@/components/admin/EngagementMetrics";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";

const AdminWaitlistPage = () => {
  const { user, signOut } = useAuth();
  const { roles, isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/overview') return 'overview';
    if (path === '/admin/waitlist') return 'waitlist';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/withdrawals') return 'withdrawals';
    if (path === '/admin/content') return 'content';
    if (path === '/admin/emails') return 'emails';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Redirect /admin to /admin/overview
  useEffect(() => {
    if (location.pathname === '/admin') {
      navigate('/admin/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user?.email}</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {isAdmin ? 'Admin' : roles.join(', ') || 'User'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Admin Dashboard • {format(new Date(), 'PPP')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => navigate('/')} variant="outline" size="sm">
                  Home
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" onClick={() => navigate('/admin/overview')}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="waitlist" onClick={() => navigate('/admin/waitlist')}>
              Waitlist
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => navigate('/admin/users')}>
              Users
            </TabsTrigger>
            <TabsTrigger value="withdrawals" onClick={() => navigate('/admin/withdrawals')}>
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="content" onClick={() => navigate('/admin/content')}>
              Content
            </TabsTrigger>
            <TabsTrigger value="emails" onClick={() => navigate('/admin/emails')}>
              Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
              <p className="text-muted-foreground">Monitor key metrics and platform activity</p>
            </div>
            <AdminStats />
            <RevenueCharts />
            <TopEarnersTable />
            <EngagementMetrics />
          </TabsContent>

          <TabsContent value="waitlist">
            <AdminWaitlistDashboard />
          </TabsContent>

          <TabsContent value="users">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">User Management</h2>
              <p className="text-muted-foreground">View and manage all platform users</p>
            </div>
            <UsersManagement />
          </TabsContent>

          <TabsContent value="withdrawals">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Withdrawal Management</h2>
              <p className="text-muted-foreground">Process and review withdrawal requests</p>
            </div>
            <WithdrawalsManagement />
          </TabsContent>

          <TabsContent value="content">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Content Moderation</h2>
              <p className="text-muted-foreground">Review and moderate user-generated content</p>
            </div>
            <ContentModeration />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplatesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminWaitlistPage;