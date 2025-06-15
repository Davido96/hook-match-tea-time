
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, Sparkles } from 'lucide-react';

interface PremiumFeatureGateProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'basic' | 'pro' | 'vip') => void;
  feature: string;
  currentTier: string;
  requiredTier: 'basic' | 'pro' | 'vip';
}

const PremiumFeatureGate = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  feature, 
  currentTier, 
  requiredTier 
}: PremiumFeatureGateProps) => {
  const tierInfo = {
    basic: {
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-blue-500',
      price: '10 Keys/month',
      features: [
        'Unlimited swipes',
        'See who liked you',
        '5 super likes daily',
        'Rewind last swipe',
        'Advanced filters',
        'See all photos'
      ]
    },
    pro: {
      icon: <Star className="w-5 h-5" />,
      color: 'bg-purple-500',
      price: '20 Keys/month',
      features: [
        'Everything in Basic',
        'Unlimited super likes',
        'Priority visibility',
        'Read receipts',
        'Video calling',
        'Profile analytics',
        'Creator previews'
      ]
    },
    vip: {
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      price: '40 Keys/month',
      features: [
        'Everything in Pro',
        'Exclusive verified creators',
        'Personal matchmaking',
        'VIP badge',
        'Skip feature queue',
        'Direct creator messaging'
      ]
    }
  };

  const getRecommendedTiers = () => {
    const tiers = ['basic', 'pro', 'vip'] as const;
    const requiredIndex = tiers.indexOf(requiredTier);
    return tiers.slice(requiredIndex);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-hooks-coral" />
            Unlock {feature}
          </DialogTitle>
          <DialogDescription>
            This feature requires a premium subscription. Choose your plan to continue:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {getRecommendedTiers().map((tier) => {
            const info = tierInfo[tier];
            const isRequired = tier === requiredTier;
            
            return (
              <div 
                key={tier}
                className={`p-4 border rounded-lg transition-all ${
                  isRequired ? 'border-hooks-coral bg-hooks-coral/5' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full text-white ${info.color}`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize text-lg">
                        Hooks {tier}
                        {isRequired && (
                          <Badge variant="outline" className="ml-2 text-hooks-coral border-hooks-coral">
                            Required
                          </Badge>
                        )}
                      </h3>
                      <p className="text-gray-600">{info.price}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => onUpgrade(tier)}
                    variant={isRequired ? "default" : "outline"}
                    className={isRequired ? "bg-hooks-coral hover:bg-hooks-coral/90" : ""}
                  >
                    Upgrade Now
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {info.features.map((featureItem, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 bg-hooks-coral rounded-full" />
                      {featureItem}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-500">
            Cancel anytime • 30-day money back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFeatureGate;
