
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
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

  const { requestWithdrawal, loading } = useWithdrawals();
  const { wallet } = useWallet();
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

    try {
      const { error: withdrawalError } = await requestWithdrawal({
        amount: withdrawalAmount,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        notes: notes.trim()
      });

      if (withdrawalError) {
        throw withdrawalError;
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
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to request withdrawal");
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
