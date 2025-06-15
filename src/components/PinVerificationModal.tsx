
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PinVerificationModal = ({ isOpen, onClose, onVerify, loading, error }: PinVerificationModalProps) => {
  const [pin, setPin] = useState('');

  const handleSubmit = () => {
    onVerify(pin);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Withdrawal PIN</DialogTitle>
          <DialogDescription>
            For your security, please enter your 4-digit withdrawal PIN to proceed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={pin} onChange={(value) => setPin(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || pin.length < 4}>
            {loading ? 'Verifying...' : 'Verify & Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationModal;
