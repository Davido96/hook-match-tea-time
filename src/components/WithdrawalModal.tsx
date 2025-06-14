
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

  const { wallet, refetch: refetchWallet } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

    setLoading(true);
    try {
      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
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

      // Update wallet balance (put withdrawal amount on hold)
      const newBalance = wallet.keys_balance - withdrawalAmount;
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
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setNotes("");
      
      // Refresh wallet
      await refetchWallet();
      onClose();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.message || "Failed to request withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Processing..." : "Request Withdrawal"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500">
            <p>• Minimum withdrawal: 1000 Keys</p>
            <p>• Processing time: 1-3 business days</p>
            <p>• Withdrawal fees may apply</p>
            <p>• Keys will be deducted immediately upon request</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
