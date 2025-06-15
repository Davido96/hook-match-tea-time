
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Wallet, Plus, ArrowDown, DollarSign } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "purchase" | "withdraw";
}

const UnifiedWalletModal = ({ isOpen, onClose, defaultTab = "purchase" }: UnifiedWalletModalProps) => {
  const { wallet, purchaseKeys, refetch: refetchWallet } = useWallet();
  const { getPendingWithdrawals } = useWithdrawals();
  const { user } = useAuth();
  const { toast } = useToast();

  // Purchase Keys State
  const [purchaseAmount, setPurchaseAmount] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Withdrawal State
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  const keyPackages = [
    { amount: 1, price: 1000, popular: false },
    { amount: 5, price: 4500, popular: true, savings: 500 },
    { amount: 10, price: 8000, popular: false, savings: 2000 },
    { amount: 25, price: 18000, popular: false, savings: 7000 },
  ];

  const withdrawalQuickAmounts = [1000, 2500, 5000, 10000];
  const pendingWithdrawals = getPendingWithdrawals();

  const handlePurchase = async () => {
    setPurchaseLoading(true);
    try {
      const { success } = await purchaseKeys(purchaseAmount);
      
      if (success) {
        toast({
          title: "Keys Purchased!",
          description: `Successfully added ${purchaseAmount} Keys to your wallet.`,
        });
        setPurchaseAmount(1);
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
      setPurchaseLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);

    const amount = parseInt(withdrawalAmount);

    if (!amount || amount <= 0) {
      setWithdrawalError("Please enter a valid amount");
      return;
    }

    if (amount < 1000) {
      setWithdrawalError("Minimum withdrawal amount is 1000 Keys");
      return;
    }

    if (!wallet || amount > wallet.keys_balance) {
      setWithdrawalError("Insufficient balance");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setWithdrawalError("Please fill in all required fields");
      return;
    }

    if (!user) {
      setWithdrawalError("User not authenticated");
      return;
    }

    setWithdrawalLoading(true);
    try {
      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: amount,
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_name: accountName.trim(),
          notes: notes.trim() || null,
          status: 'pending'
        })
        .select()
        .single();

      if (withdrawalError) {
        throw withdrawalError;
      }

      // Update wallet balance
      const newBalance = wallet.keys_balance - amount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) {
        throw walletError;
      }

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully. It will be processed within 1-3 business days."
      });

      // Reset form
      setWithdrawalAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setNotes("");
      
      // Refresh wallet
      await refetchWallet();
      onClose();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setWithdrawalError(err.message || "Failed to request withdrawal");
    } finally {
      setWithdrawalLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-hooks-coral" />
            Wallet Management
          </DialogTitle>
        </DialogHeader>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-hooks-coral to-hooks-pink text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{wallet?.keys_balance || 0} 🪝</div>
              <div className="text-sm opacity-90">Available Balance</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingWithdrawals}</div>
              <div className="text-sm text-yellow-700">Pending Withdrawals</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">1000</div>
              <div className="text-sm text-gray-700">Min. Withdrawal</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Buy Keys
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4" />
              Withdraw Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-6 mt-6">
            {/* Key Packages */}
            <div className="space-y-3">
              <h3 className="font-semibold">Choose a Package</h3>
              {keyPackages.map((pkg) => (
                <Card 
                  key={pkg.amount}
                  className={`cursor-pointer transition-all hover:border-hooks-coral ${
                    purchaseAmount === pkg.amount ? 'border-hooks-coral bg-hooks-coral/10' : ''
                  } ${pkg.popular ? 'ring-2 ring-hooks-coral' : ''}`}
                  onClick={() => setPurchaseAmount(pkg.amount)}
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
              <Label htmlFor="custom-purchase">Custom Amount</Label>
              <Input
                id="custom-purchase"
                type="number"
                min="1"
                max="100"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 1)}
                placeholder="Enter number of keys"
                disabled={purchaseLoading}
              />
            </div>

            {/* Purchase Button */}
            <Button 
              onClick={handlePurchase}
              disabled={purchaseLoading || purchaseAmount < 1}
              className="w-full gradient-coral text-white"
              size="lg"
            >
              {purchaseLoading ? 'Processing...' : `Purchase ${purchaseAmount} Keys for ₦${(purchaseAmount * 1000).toLocaleString()}`}
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6 mt-6">
            {wallet && wallet.keys_balance < 1000 ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  You need at least 1000 Keys to request a withdrawal. Purchase more Keys to reach the minimum!
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleWithdrawal} className="space-y-4">
                {/* Quick Amounts */}
                <div className="space-y-2">
                  <Label>Quick Amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {withdrawalQuickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={withdrawalAmount === amount.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWithdrawalAmount(amount.toString())}
                        disabled={withdrawalLoading || (wallet && wallet.keys_balance < amount)}
                        className={withdrawalAmount === amount.toString() ? "bg-hooks-coral hover:bg-hooks-coral/80" : ""}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdrawal-amount">Amount (Keys)*</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    placeholder="Minimum 1000 Keys"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min="1000"
                    max={wallet?.keys_balance || 0}
                    required
                    disabled={withdrawalLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="bank-name">Bank Name*</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., First Bank Nigeria"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    disabled={withdrawalLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="account-number">Account Number*</Label>
                  <Input
                    id="account-number"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    required
                    disabled={withdrawalLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="account-name">Account Name*</Label>
                  <Input
                    id="account-name"
                    placeholder="Full name as on bank account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    disabled={withdrawalLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="withdrawal-notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="withdrawal-notes"
                    placeholder="Any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    disabled={withdrawalLoading}
                  />
                </div>

                {withdrawalError && (
                  <Alert variant="destructive">
                    <AlertDescription>{withdrawalError}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={withdrawalLoading || !wallet || wallet.keys_balance < 1000}
                  size="lg"
                >
                  {withdrawalLoading ? "Processing..." : "Request Withdrawal"}
                </Button>
              </form>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Minimum withdrawal: 1000 Keys</p>
              <p>• Processing time: 1-3 business days</p>
              <p>• Withdrawal fees may apply</p>
              <p>• Keys will be deducted immediately upon request</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedWalletModal;
