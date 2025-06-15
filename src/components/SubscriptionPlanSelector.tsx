
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { Clock, Crown, Zap, Wallet } from "lucide-react";

interface SubscriptionPlanSelectorProps {
  creatorId: string;
  onSubscriptionComplete?: () => void;
}

const SubscriptionPlanSelector = ({ creatorId, onSubscriptionComplete }: SubscriptionPlanSelectorProps) => {
  const { fetchCreatorPlans } = useSubscriptionPlans();
  const { subscribeToCreator, loading: subscriptionLoading } = useSubscriptions();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [creatorId]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const creatorPlans = await fetchCreatorPlans(creatorId);
      setPlans(creatorPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string, planName: string, price: number) => {
    if (!wallet || wallet.keys_balance < price) {
      toast({
        title: "Insufficient Keys Balance",
        description: `You need ${price} Keys but only have ${wallet?.keys_balance || 0} Keys. Purchase more Keys to subscribe.`,
        variant: "destructive"
      });
      return;
    }

    try {
      await subscribeToCreator(creatorId, planId);
      toast({
        title: "Subscription Successful! 🎉",
        description: `You've successfully subscribed to ${planName} for ${price} Keys`,
      });
      onSubscriptionComplete?.();
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to creator",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (days: number) => {
    if (days === 7) return "1 Week";
    if (days === 30) return "1 Month";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";
    if (days === 365) return "1 Year";
    return `${days} Days`;
  };

  const getPlanIcon = (days: number) => {
    if (days <= 7) return <Zap className="w-5 h-5" />;
    if (days <= 90) return <Clock className="w-5 h-5" />;
    return <Crown className="w-5 h-5" />;
  };

  const getPlanColor = (days: number) => {
    if (days <= 7) return "bg-yellow-500";
    if (days <= 90) return "bg-blue-500";
    return "bg-purple-500";
  };

  const getValueMessage = (days: number, price: number) => {
    const dailyRate = (price / days).toFixed(1);
    return `Only ${dailyRate} Keys per day`;
  };

  if (loading) {
    return <div className="text-center py-4">Loading subscription plans...</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <Crown className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Subscription Plans Available</h3>
        <p className="text-gray-500">This creator hasn't set up any subscription plans yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Choose Your Subscription Plan</h3>
        <p className="text-gray-600">Support this creator and unlock exclusive content</p>
      </div>
      
      {/* Wallet Balance Display */}
      <Card className="bg-gradient-to-r from-hooks-coral to-hooks-pink text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span className="font-medium">Your Keys Balance</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{wallet?.keys_balance || 0}</div>
              <div className="text-sm opacity-90">Keys Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {plans.map((plan) => {
          const canAfford = wallet && wallet.keys_balance >= plan.price_keys;
          const isPopular = plan.duration_days === 30; // Mark monthly plans as popular
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-lg ${
                !canAfford ? 'opacity-60' : ''
              } ${isPopular ? 'ring-2 ring-hooks-coral' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-hooks-coral text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full text-white ${getPlanColor(plan.duration_days)}`}>
                      {getPlanIcon(plan.duration_days)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="text-base">
                        {formatDuration(plan.duration_days)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-hooks-coral">
                      {plan.price_keys}
                    </div>
                    <div className="text-sm text-gray-600">Keys</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {getValueMessage(plan.duration_days, plan.price_keys)}
                  </div>
                  
                  {canAfford ? (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ You have enough Keys for this plan
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 font-medium">
                      ⚠️ Need {plan.price_keys - (wallet?.keys_balance || 0)} more Keys
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => handleSubscribe(plan.id, plan.name, plan.price_keys)}
                  disabled={!canAfford || subscriptionLoading}
                  className={`w-full text-lg py-6 ${
                    canAfford 
                      ? 'bg-gradient-to-r from-hooks-coral to-hooks-pink hover:from-hooks-pink hover:to-hooks-coral' 
                      : 'bg-gray-300'
                  }`}
                  size="lg"
                >
                  {subscriptionLoading ? (
                    "Processing..."
                  ) : canAfford ? (
                    <>
                      Subscribe for {plan.price_keys} Keys
                      <Crown className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Insufficient Keys Balance"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">🔐 What You Get</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Exclusive content and posts</li>
          <li>• Direct messaging with the creator</li>
          <li>• Priority support and interaction</li>
          <li>• Access to subscriber-only content</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;
