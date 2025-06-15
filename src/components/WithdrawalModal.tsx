import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Wallet } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { usePin } from "@/hooks/usePin";
import PinVerificationModal from "./PinVerificationModal";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal = ({ isOpen, onClose }: WithdrawalModalProps) => {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New states for PIN verification flow
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [withdrawalData, setWithdrawalData] = useState<any>(null);

  const { wallet, refetch: refetchWallet } = useWallet();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { verifyPin, loading: pinLoading } = usePin();

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPinError(null);

    if (!profile) {
      setError("Profile is still loading. Please try again in a moment.");
      return;
    }

    if (!profile.withdrawal_pin_hash) {
      setError("Please set up a withdrawal PIN in your profile settings before making a withdrawal.");
      return;
    }

    const withdrawalAmount = parseInt(amount);

    if (!withdrawalAmount || withdrawalAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (withdrawalAmount < 1000) {
      setError("Minimum withdrawal amount is 1000 Keys");
      return;
    }

    if (!wallet || withdrawalAmount > wallet.keys_balance) {
      setError("Insufficient balance");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!user) {
      setError("User not authenticated");
      return;
    }

    // Store data and open PIN modal
    setWithdrawalData({
      user_id: user.id,
      amount: withdrawalAmount,
      bank_name: bankName.trim(),
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
      notes: notes.trim() || null,
      status: 'pending'
    });
    setIsPinModalOpen(true);
  };
  
  const handlePinVerifyAndWithdraw = async (pin: string) => {
    setPinError(null);
    const isPinValid = await verifyPin(pin);

    if (!isPinValid) {
      setPinError("Invalid PIN. Please try again.");
      return;
    }

    if (!withdrawalData) {
      setPinError("An error occurred. Please close this and try again.");
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert(withdrawalData)
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;
      
      // Update wallet balance
      const newBalance = wallet!.keys_balance - withdrawalData.amount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user!.id);

      if (walletError) throw walletError;

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully."
      });

      // Reset form
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setNotes("");
      
      await refetchWallet();
      setIsPinModalOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || "Failed to request withdrawal");
      setIsPinModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Request Withdrawal
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {wallet && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  Available Balance: {wallet.keys_balance} Keys
                </div>
              </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (Keys)*</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Minimum 1000 Keys"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1000"
                  max={wallet?.keys_balance || 0}
                  required
                  disabled={loading || pinLoading}
                />
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name*</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., First Bank Nigeria"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  disabled={loading || pinLoading}
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number*</Label>
                <Input
                  id="accountNumber"
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  maxLength={10}
                  required
                  disabled={loading || pinLoading}
                />
              </div>

              <div>
                <Label htmlFor="accountName">Account Name*</Label>
                <Input
                  id="accountName"
                  placeholder="Full name as on bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  disabled={loading || pinLoading}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  disabled={loading || pinLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading || pinLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || pinLoading}>
                  {loading ? "Processing..." : "Request Withdrawal"}
                </Button>
              </div>
            </form>

            <div className="text-xs text-gray-500">
              <p>• Minimum withdrawal: 1000 Keys</p>
              <p>• Processing time: 1-3 business days</p>
              <p>• A 4-digit PIN is required for withdrawals.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPinError(null);
        }}
        onVerify={handlePinVerifyAndWithdraw}
        loading={loading || pinLoading}
        error={pinError}
      />
    </>
  );
};

export default WithdrawalModal;
