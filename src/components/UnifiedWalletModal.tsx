import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Wallet, Plus, ArrowDown, DollarSign, Info } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import HookLogo from "@/components/HookLogo";

interface UnifiedWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "purchase" | "withdraw";
}

const UnifiedWalletModal = ({ isOpen, onClose, defaultTab = "purchase" }: UnifiedWalletModalProps) => {
  const { wallet, purchaseKeys, refetch: refetchWallet } = useWallet();
  const { 
    getPendingWithdrawals, 
    calculateWithdrawalFee, 
    calculateNetAmount, 
    convertKeysToNaira, 
    MINIMUM_WITHDRAWAL 
  } = useWithdrawals();
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

  const withdrawalQuickAmounts = [100, 500, 1000, 2500];
  const pendingWithdrawals = getPendingWithdrawals();
  
  // Calculate withdrawal details
  const withdrawalAmountNumber = parseInt(withdrawalAmount) || 0;
  const withdrawalFee = calculateWithdrawalFee(withdrawalAmountNumber);
  const netAmount = calculateNetAmount(withdrawalAmountNumber);
  const withdrawalAmountNaira = convertKeysToNaira(withdrawalAmountNumber);
  const netAmountNaira = convertKeysToNaira(netAmount);
  const feeAmountNaira = convertKeysToNaira(withdrawalFee);

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

    if (amount < MINIMUM_WITHDRAWAL) {
      setWithdrawalError(`Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL} Keys`);
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
        description: `Your withdrawal request for ${amount} Keys (₦${withdrawalAmountNaira.toLocaleString()}) has been submitted. You will receive ₦${netAmountNaira.toLocaleString()} after 10% fee within 24 hours.`
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
              <div className="flex justify-center items-center gap-2 text-2xl font-bold">
                {wallet?.keys_balance || 0}
                <HookLogo size="md" />
              </div>
              <div className="text-sm opacity-90">Available Balance</div>
              <div className="text-xs opacity-75">₦{convertKeysToNaira(wallet?.keys_balance || 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center items-center gap-2 text-2xl font-bold text-yellow-600">
                {pendingWithdrawals}
                <HookLogo size="md" />
              </div>
              <div className="text-sm text-yellow-700">Pending Withdrawals</div>
              <div className="text-xs text-yellow-600">₦{convertKeysToNaira(pendingWithdrawals).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center items-center gap-2 text-2xl font-bold text-gray-600">
                {MINIMUM_WITHDRAWAL}
                <HookLogo size="md" />
              </div>
              <div className="text-sm text-gray-700">Min. Withdrawal</div>
              <div className="text-xs text-gray-600">₦{convertKeysToNaira(MINIMUM_WITHDRAWAL).toLocaleString()}</div>
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
            {wallet && wallet.keys_balance < MINIMUM_WITHDRAWAL ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  You need at least {MINIMUM_WITHDRAWAL} Keys to request a withdrawal. Purchase more Keys to reach the minimum!
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleWithdrawal} className="space-y-4">
                {/* Withdrawal Fee Notice */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Withdrawal Fee:</strong> 10% fee applies to all withdrawals. You will receive your funds within 24 hours of request.
                  </AlertDescription>
                </Alert>

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
                        <div className="text-center">
                          <div>
                            {amount}
                            <HookLogo size="sm" className="inline" />
                          </div>
                          <div className="text-xs opacity-75">₦{convertKeysToNaira(amount).toLocaleString()}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="withdrawal-amount">Amount (Keys)*</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    placeholder={`Minimum ${MINIMUM_WITHDRAWAL} Keys`}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    min={MINIMUM_WITHDRAWAL}
                    max={wallet?.keys_balance || 0}
                    required
                    disabled={withdrawalLoading}
                  />
                  {withdrawalAmountNumber > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      ≈ ₦{withdrawalAmountNaira.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Fee Breakdown */}
                {withdrawalAmountNumber >= MINIMUM_WITHDRAWAL && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Withdrawal Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Withdrawal Amount:</span>
                          <span>{withdrawalAmountNumber} Keys (₦{withdrawalAmountNaira.toLocaleString()})</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Fee (10%):</span>
                          <span>-{withdrawalFee} Keys (₦{feeAmountNaira.toLocaleString()})</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-600 border-t pt-2">
                          <span>You'll Receive:</span>
                          <span>{netAmount} Keys (₦{netAmountNaira.toLocaleString()})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                  disabled={withdrawalLoading || !wallet || wallet.keys_balance < MINIMUM_WITHDRAWAL}
                  size="lg"
                >
                  {withdrawalLoading ? "Processing..." : "Request Withdrawal"}
                </Button>
              </form>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Minimum withdrawal: {MINIMUM_WITHDRAWAL} Keys (₦{convertKeysToNaira(MINIMUM_WITHDRAWAL).toLocaleString()})</p>
              <p>• Processing time: Within 24 hours</p>
              <p>• Withdrawal fee: 10% (deducted from withdrawal amount)</p>
              <p>• Keys will be deducted immediately upon request</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedWalletModal;
