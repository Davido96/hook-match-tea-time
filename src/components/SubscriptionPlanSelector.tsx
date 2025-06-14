
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { Clock, Crown, Zap } from "lucide-react";

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
        title: "Insufficient Balance",
        description: "You don't have enough Keys to subscribe to this plan",
        variant: "destructive"
      });
      return;
    }

    try {
      await subscribeToCreator(creatorId, planId);
      toast({
        title: "Subscription Successful",
        description: `You've successfully subscribed to ${planName}`,
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

  if (loading) {
    return <div className="text-center py-4">Loading subscription plans...</div>;
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No subscription plans available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Your Subscription Plan</h3>
      
      {wallet && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Available Balance: <span className="font-medium">{wallet.keys_balance} Keys</span>
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {plans.map((plan) => {
          const canAfford = wallet && wallet.keys_balance >= plan.price_keys;
          
          return (
            <Card key={plan.id} className={`relative ${!canAfford ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full text-white ${getPlanColor(plan.duration_days)}`}>
                      {getPlanIcon(plan.duration_days)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{formatDuration(plan.duration_days)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {plan.price_keys} Keys
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button
                  onClick={() => handleSubscribe(plan.id, plan.name, plan.price_keys)}
                  disabled={!canAfford || subscriptionLoading}
                  className="w-full"
                  variant={canAfford ? "default" : "outline"}
                >
                  {subscriptionLoading ? "Processing..." : canAfford ? "Subscribe Now" : "Insufficient Balance"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlanSelector;
