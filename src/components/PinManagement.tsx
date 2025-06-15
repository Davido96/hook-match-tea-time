
import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePin } from '@/hooks/usePin';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PinManagement = () => {
  const { profile, refetch } = useProfile();
  const { setPin, loading } = usePin();
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetPin = async () => {
    setError(null);
    if (pin.length !== 4) {
      setError('PIN must be 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    const { success } = await setPin(pin);
    if (success) {
      setPinValue('');
      setConfirmPin('');
      await refetch();
    }
  };

  const hasPin = !!profile?.withdrawal_pin_hash;

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="font-semibold">Withdrawal PIN</h3>
      <p className="text-sm text-gray-500">
        {hasPin
          ? 'You have a withdrawal PIN set up. To change it, enter a new PIN below.'
          : 'Set up a 4-digit PIN for an extra layer of security on your withdrawals.'}
      </p>

      <div className="space-y-2">
        <Label htmlFor="pin">New PIN</Label>
        <InputOTP maxLength={4} value={pin} onChange={setPinValue} id="pin">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-pin">Confirm New PIN</Label>
        <InputOTP maxLength={4} value={confirmPin} onChange={setConfirmPin} id="confirm-pin">
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

      <Button onClick={handleSetPin} disabled={loading || pin.length < 4 || confirmPin.length < 4}>
        {loading ? 'Saving...' : hasPin ? 'Change PIN' : 'Set PIN'}
      </Button>
    </div>
  );
};

export default PinManagement;
