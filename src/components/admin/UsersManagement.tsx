import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { User, Mail, MapPin, Calendar, Eye } from "lucide-react";
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
}

export const UsersManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('user_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-2">
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      <Badge
                        variant="outline"
                        className={user.user_type === 'creator' ? 'bg-purple-50' : 'bg-blue-50'}
                      >
                        {user.user_type}
                      </Badge>
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
