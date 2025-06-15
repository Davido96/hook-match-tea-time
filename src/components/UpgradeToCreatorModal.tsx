
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Zap, TrendingUp, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import HookLogo from "./HookLogo";

interface UpgradeToCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

interface UpgradeResponse {
  success: boolean;
  error?: string;
  message?: string;
  new_balance?: number;
}

const UpgradeToCreatorModal = ({ isOpen, onClose, onUpgradeSuccess }: UpgradeToCreatorModalProps) => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { refetch: refetchProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upgradeCost = 1;
  const hasEnoughKeys = wallet && wallet.keys_balance >= upgradeCost;

  const handleUpgrade = async () => {
    if (!user) {
      setError("You must be logged in to upgrade");
      return;
    }

    if (!hasEnoughKeys) {
      setError("You need at least 1 Key to upgrade to Creator status");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting creator upgrade for user:', user.id);
      
      const { data, error: upgradeError } = await supabase
        .rpc('upgrade_to_creator', { user_uuid: user.id });

      if (upgradeError) {
        console.error('Upgrade RPC error:', upgradeError);
        throw new Error(upgradeError.message);
      }

      console.log('Upgrade result:', data);

      const upgradeResult = data as UpgradeResponse;

      if (!upgradeResult.success) {
        throw new Error(upgradeResult.error || 'Upgrade failed');
      }

      // Refresh wallet and profile data
      await Promise.all([
        refetchWallet(),
        refetchProfile()
      ]);

      toast({
        title: "Upgrade Successful! 🎉",
        description: upgradeResult.message || "You are now a Creator! You can start creating and sharing content.",
      });

      onUpgradeSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upgrade failed:', err);
      setError(err.message || 'An error occurred during upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Upgrade to Creator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cost Display */}
          <div className="text-center bg-gradient-to-r from-hooks-coral/10 to-hooks-pink/10 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold">1</span>
              <HookLogo size="sm" />
              <span className="text-sm text-gray-600">Key</span>
            </div>
            <p className="text-sm text-gray-600">One-time upgrade cost</p>
          </div>

          {/* Current Balance */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Your current balance:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-semibold">{wallet?.keys_balance || 0}</span>
              <HookLogo size="sm" />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Creator Benefits:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-hooks-coral" />
                <span className="text-sm">Create and share exclusive content</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-hooks-coral" />
                <span className="text-sm">Earn Keys from tips and subscriptions</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-hooks-coral" />
                <span className="text-sm">Build your personal brand</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-hooks-coral" />
                <span className="text-sm">Access to premium creator features</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Insufficient Balance Warning */}
          {!hasEnoughKeys && (
            <Alert>
              <AlertDescription>
                You need {upgradeCost - (wallet?.keys_balance || 0)} more Key to upgrade. 
                You can purchase Keys in your wallet.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={loading || !hasEnoughKeys}
              className="flex-1 gradient-coral text-white"
            >
              {loading ? 'Upgrading...' : 'Upgrade Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeToCreatorModal;
