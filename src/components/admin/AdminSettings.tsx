import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Shield, Ban, Users, UserX, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface BlockedUser {
  user_id: string;
  name: string;
  avatar_url: string | null;
  user_type: string;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
}

export const AdminSettings = () => {
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, user_type, is_blocked, blocked_at, blocked_reason")
        .eq("is_blocked", true)
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blocked users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: false,
          blocked_at: null,
          blocked_reason: null,
          blocked_by: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      // Notify user they've been unblocked
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "account_unblocked",
        title: "Account Restored",
        message: "Your account has been restored. You can now access all platform features.",
      });

      toast({
        title: "User unblocked",
        description: "The user can now access the platform.",
      });
      fetchBlockedUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive",
      });
    }
  };

  const filteredBlockedUsers = blockedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="blocked-users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blocked-users" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            Blocked Users
          </TabsTrigger>
          <TabsTrigger value="platform-settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Platform Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blocked-users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-destructive" />
                    Blocked Users
                  </CardTitle>
                  <CardDescription>
                    Users who have been blocked from the platform
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search blocked users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline" size="icon" onClick={fetchBlockedUsers}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredBlockedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No blocked users</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBlockedUsers.map((user) => (
                    <Card key={user.user_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.name}</p>
                                <Badge variant="outline">{user.user_type}</Badge>
                                <Badge variant="destructive">Blocked</Badge>
                              </div>
                              {user.blocked_at && (
                                <p className="text-xs text-muted-foreground">
                                  Blocked on {format(new Date(user.blocked_at), "PPp")}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(user.user_id)}
                          >
                            Unblock
                          </Button>
                        </div>
                        {user.blocked_reason && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="text-muted-foreground">Reason: </span>
                            {user.blocked_reason}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform-settings" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>
                  Configure automatic content moderation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-flag reported content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically flag content that receives multiple reports
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require content approval</Label>
                    <p className="text-sm text-muted-foreground">
                      New creators must have content approved before publishing
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Configure user account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable creator verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require video verification for creator accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-suspend on policy violation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically suspend accounts after confirmed violations
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure admin notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email alerts for new reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email when new reports are submitted
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily summary digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily summary of platform activity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
