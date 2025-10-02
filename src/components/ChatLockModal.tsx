import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface ChatLockModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'lock' | 'unlock';
  conversationName: string;
  onLock?: (pin: string) => void;
  onUnlock?: (pin: string) => void;
}

export const ChatLockModal = ({ 
  open, 
  onClose, 
  mode, 
  conversationName,
  onLock,
  onUnlock 
}: ChatLockModalProps) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = () => {
    if (mode === 'lock') {
      if (!pin || pin.length !== 4) {
        toast.error('PIN must be 4 digits');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        toast.error('PIN must contain only numbers');
        return;
      }

      if (pin !== confirmPin) {
        toast.error('PINs do not match');
        return;
      }

      onLock?.(pin);
      setPin('');
      setConfirmPin('');
      onClose();
    } else {
      if (!pin) {
        toast.error('Please enter your PIN');
        return;
      }

      onUnlock?.(pin);
      setPin('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'lock' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            {mode === 'lock' ? 'Lock Chat' : 'Unlock Chat'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'lock' 
              ? `Set a 4-digit PIN to lock "${conversationName}"`
              : `Enter your PIN to unlock "${conversationName}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="pin">
              {mode === 'lock' ? 'Create PIN' : 'Enter PIN'}
            </Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyPress={handleKeyPress}
              placeholder="****"
              className="text-center text-2xl tracking-widest mt-2"
            />
          </div>

          {mode === 'lock' && (
            <div>
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                onKeyPress={handleKeyPress}
                placeholder="****"
                className="text-center text-2xl tracking-widest mt-2"
              />
            </div>
          )}

          {mode === 'lock' && (
            <p className="text-sm text-muted-foreground">
              Remember this PIN! You'll need it to unlock this conversation later.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            {mode === 'lock' ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Lock Chat
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Chat
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
