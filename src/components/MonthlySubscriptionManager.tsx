
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Crown, Users, Coins, Wallet } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Subscription {
  id: string;
  creator_id: string;
  expires_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
    user_type: string;
  };
  subscription_plans: {
    name: string;
    duration_days: number;
    price_keys: number;
  };
}

const MonthlySubscriptionManager = () => {
  const { user } = useAuth();
  const { getUserSubscriptions } = useSubscriptions();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const data = await getUserSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const expireDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 3) return "destructive";
    if (daysRemaining <= 7) return "secondary";
    return "default";
  };

  const getTotalSpent = () => {
    return subscriptions.reduce((total, sub) => total + sub.subscription_plans.price_keys, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Subscriptions</h1>
        <p className="text-gray-600">Manage your creator subscriptions and Key spending</p>
      </div>

      {/* Summary Card */}
      {subscriptions.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-hooks-coral to-hooks-pink text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="w-5 h-5 mr-2" />
                  <span className="font-medium">Active Subscriptions</span>
                </div>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="w-5 h-5 mr-2" />
                  <span className="font-medium">Total Keys Spent</span>
                </div>
                <div className="text-2xl font-bold">{getTotalSpent()}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-medium">Avg. Value</span>
                </div>
                <div className="text-2xl font-bold">
                  {subscriptions.length > 0 ? Math.round(getTotalSpent() / subscriptions.length) : 0} Keys
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Subscriptions</h3>
            <p className="text-gray-500 mb-6">
              Subscribe to creators to access their exclusive content and support their work
            </p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-hooks-coral to-hooks-pink">
              <Users className="w-4 h-4 mr-2" />
              Discover Creators
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((subscription) => {
            const daysRemaining = getDaysRemaining(subscription.expires_at);
            const statusColor = getStatusColor(daysRemaining);
            const dailyValue = (subscription.subscription_plans.price_keys / subscription.subscription_plans.duration_days).toFixed(1);
            
            return (
              <Card key={subscription.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={subscription.profiles.avatar_url || ""} 
                        alt={subscription.profiles.name} 
                      />
                      <AvatarFallback className="bg-hooks-coral text-white">
                        {subscription.profiles.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subscription.profiles.name}</CardTitle>
                      <p className="text-sm text-gray-600">{subscription.subscription_plans.name}</p>
                    </div>
                    <Badge variant="outline" className="bg-hooks-coral text-white border-hooks-coral">
                      Creator
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Duration</span>
                      </div>
                      <span className="font-medium">{subscription.subscription_plans.duration_days} days</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Total Cost</span>
                      </div>
                      <span className="font-medium text-hooks-coral">
                        {subscription.subscription_plans.price_keys} Keys
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Days Remaining</p>
                        <Badge variant={statusColor} className="mt-1">
                          {daysRemaining} days
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Daily Value</p>
                        <p className="font-medium text-hooks-coral">{dailyValue} Keys/day</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/profile/${subscription.creator_id}`)}
                      className="flex-1"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  </div>

                  {daysRemaining <= 7 && (
                    <div className={`rounded-lg p-3 ${
                      daysRemaining <= 3 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm ${
                        daysRemaining <= 3 
                          ? 'text-red-800' 
                          : 'text-yellow-800'
                      }`}>
                        {daysRemaining <= 3 
                          ? "🚨 Your subscription expires soon! Renew to continue accessing exclusive content."
                          : "⏰ Your subscription expires in a week. Consider renewing soon."
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Subscription Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Longer subscriptions often offer better value per day</li>
          <li>• Renew before expiration to avoid losing access</li>
          <li>• Support your favorite creators consistently</li>
          <li>• Check your Keys balance regularly for renewals</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthlySubscriptionManager;
