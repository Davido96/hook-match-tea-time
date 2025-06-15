
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Clock, Crown } from 'lucide-react';

interface SwipeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  swipesUsed: number;
  swipesLimit: number;
  resetTime: string;
}

const SwipeLimitModal = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  swipesUsed, 
  swipesLimit,
  resetTime 
}: SwipeLimitModalProps) => {
  const progressPercentage = (swipesUsed / swipesLimit) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-center">Daily Swipe Limit Reached</DialogTitle>
          <DialogDescription className="text-center">
            You've used all {swipesLimit} of your daily swipes. Come back tomorrow or upgrade for unlimited swipes!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Swipes</span>
              <span>{swipesUsed}/{swipesLimit}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Resets at {resetTime}
            </span>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-hooks-coral hover:bg-hooks-coral/90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade for Unlimited Swipes
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Come Back Tomorrow
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Hooks Basic starts at just 10 Keys/month
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwipeLimitModal;
