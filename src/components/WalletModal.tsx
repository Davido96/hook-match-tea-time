
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Wallet, Plus } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { wallet, purchaseKeys } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await purchaseKeys(amount);
      
      if (success) {
        toast({
          title: "Keys Purchased!",
          description: `Successfully added ${amount} Keys to your wallet.`,
        });
        onClose();
      } else {
        toast({
          title: "Purchase Failed",
          description: "Failed to purchase Keys. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const keyPackages = [
    { amount: 1, price: 1000, popular: false },
    { amount: 5, price: 4500, popular: true, savings: 500 },
    { amount: 10, price: 8000, popular: false, savings: 2000 },
    { amount: 25, price: 18000, popular: false, savings: 7000 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-hooks-coral" />
              <span>Purchase Keys</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-hooks-coral to-hooks-pink text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{wallet?.keys_balance || 0} 🪝</div>
            <div className="text-sm opacity-90">Current Keys Balance</div>
          </div>

          {/* Key Packages */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Choose a Package</h3>
            {keyPackages.map((pkg) => (
              <Card 
                key={pkg.amount}
                className={`cursor-pointer transition-all hover:border-hooks-coral ${
                  amount === pkg.amount ? 'border-hooks-coral bg-hooks-coral/10' : ''
                } ${pkg.popular ? 'ring-2 ring-hooks-coral' : ''}`}
                onClick={() => setAmount(pkg.amount)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{pkg.amount} Keys</div>
                      <div className="text-sm text-gray-600">₦{pkg.price.toLocaleString()}</div>
                      {pkg.savings && (
                        <div className="text-xs text-green-600">Save ₦{pkg.savings.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="text-right">
                      {pkg.popular && (
                        <div className="bg-hooks-coral text-white text-xs px-2 py-1 rounded-full mb-1">
                          Most Popular
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        ₦{(pkg.price / pkg.amount).toLocaleString()}/key
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Custom Amount</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              placeholder="Enter number of keys"
            />
          </div>

          {/* Purchase Button */}
          <Button 
            onClick={handlePurchase}
            disabled={isLoading || amount < 1}
            className="w-full gradient-coral text-white"
          >
            {isLoading ? 'Processing...' : `Purchase ${amount} Keys for ₦${(amount * 1000).toLocaleString()}`}
          </Button>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>🔒 Secure payment powered by Nigerian banks</p>
            <p>Keys can be used to tip creators and unlock premium features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletModal;
