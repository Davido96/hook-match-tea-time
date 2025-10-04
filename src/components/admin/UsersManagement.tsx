import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { User, Mail, MapPin, Calendar, Eye, Circle } from "lucide-react";
import ProfileViewModal from "@/components/ProfileViewModal";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  user_type: string;
  location_city: string;
  location_state: string;
  bio?: string;
  avatar_url?: string;
  verification_status: string;
  created_at: string;
  user_presence?: {
    user_id: string;
    is_online: boolean;
    last_seen: string;
    status: string;
  } | null;
}

export const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter, onlineFilter]);

  // Real-time subscription for user presence updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-user-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, onlineFilter]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('user_type', filter);
      }

      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // Fetch presence data separately
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen, status');

      if (presenceError) throw presenceError;

      // Merge presence data with profiles
      const presenceMap = new Map(
        (presenceData || []).map(p => [p.user_id, p])
      );

      let enrichedData = (profilesData || []).map(profile => ({
        ...profile,
        user_presence: presenceMap.get(profile.user_id) || null
      }));

      // Filter by online status if toggle is enabled
      if (onlineFilter) {
        enrichedData = enrichedData.filter(user => 
          user.user_presence && user.user_presence.is_online === true
        );
      }

      setUsers(enrichedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLastSeenText = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 5) return 'Online now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = users.filter(u => u.user_presence?.is_online).length;

  const handleViewProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setSelectedProfile(data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id="online-filter"
                  checked={onlineFilter}
                  onCheckedChange={setOnlineFilter}
                />
                <Label htmlFor="online-filter" className="cursor-pointer flex items-center gap-2">
                  Show Online Only
                  {onlineFilter && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {onlineCount} online
                    </Badge>
                  )}
                </Label>
              </div>
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="creator">Creators</SelectItem>
                  <SelectItem value="consumer">Fans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {user.user_presence?.is_online && (
                        <Circle className="w-3 h-3 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={user.user_type === 'creator' ? 'bg-purple-50' : 'bg-blue-50'}
                        >
                          {user.user_type}
                        </Badge>
                        {user.user_presence?.is_online && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Online
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{user.location_city}, {user.location_state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {user.user_presence?.last_seen && (
                      <div className="flex items-center gap-2 text-xs">
                        <Circle className={`w-2 h-2 ${user.user_presence.is_online ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                        <span>{getLastSeenText(user.user_presence.last_seen)}</span>
                      </div>
                    )}
                    {user.bio && (
                      <p className="line-clamp-2 text-xs">{user.bio}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleViewProfile(user.user_id)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <ProfileViewModal
          profile={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
        />
      )}
    </>
  );
};
