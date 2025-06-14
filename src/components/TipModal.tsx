
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Heart } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId: string;
}

const TipModal = ({ isOpen, onClose, recipientName, recipientId }: TipModalProps) => {
  const { wallet, sendTip } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendTip = async () => {
    if (!wallet || wallet.keys_balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough Keys to send this tip.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await sendTip(recipientId, amount, message);
      
      if (success) {
        toast({
          title: "Tip Sent Successfully! 🪝",
          description: `Successfully sent ${amount} Keys to ${recipientName}`,
        });
        
        // Reset form
        setAmount(1);
        setMessage("");
        onClose();
      } else {
        toast({
          title: "Failed to Send Tip",
          description: error || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Tip error:', error);
      toast({
        title: "Error",
        description: "Failed to send tip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [1, 5, 10, 25];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span className="text-xl">🪝</span>
              <span>Send Keys Tip</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recipient Info */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-hooks-coral flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-semibold text-lg">Sending tip to {recipientName}</h3>
            <p className="text-sm text-gray-600">Your current balance: {wallet?.keys_balance || 0} Keys</p>
          </div>

          {/* Quick Amount Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Quick Amounts</label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant={amount === quickAmount ? "default" : "outline"}
                  size="sm"
                  className={amount === quickAmount ? "bg-hooks-coral hover:bg-hooks-coral/80" : ""}
                  onClick={() => setAmount(quickAmount)}
                  disabled={isLoading}
                >
                  {quickAmount} 🪝
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Custom Amount</label>
            <Input
              type="number"
              min="1"
              max={wallet?.keys_balance || 0}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
              placeholder="Enter amount"
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Message (Optional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-hooks-coral font-bold">{amount} Keys (₦{(amount * 1000).toLocaleString()})</span>
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSendTip}
            disabled={isLoading || amount < 1 || (wallet && wallet.keys_balance < amount)}
            className="w-full gradient-coral text-white"
          >
            <Heart className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : `Send ${amount} Keys`}
          </Button>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            <p>Tips are sent instantly and cannot be reversed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TipModal;
