import { useState, useEffect } from 'react';
import { Lock, Unlock, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChatPPV, ChatMediaOffer } from '@/hooks/useChatPPV';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PPVMessageCardProps {
  offer: ChatMediaOffer;
  onPurchaseComplete?: () => void;
}

export const PPVMessageCard = ({ offer, onPurchaseComplete }: PPVMessageCardProps) => {
  const { user } = useAuth();
  const { purchaseMedia, checkAccess, loading } = useChatPPV();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  const isOwner = user?.id === offer.seller_id;

  useEffect(() => {
    const checkUserAccess = async () => {
      if (isOwner) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      setChecking(true);
      const access = await checkAccess(offer.id);
      setHasAccess(access);
      setChecking(false);
    };

    checkUserAccess();
  }, [offer.id, isOwner, checkAccess]);

  const handlePurchase = async () => {
    const result = await purchaseMedia(offer.id);
    if (result.success) {
      setHasAccess(true);
      onPurchaseComplete?.();
    }
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return 'Permanent access';
    if (hours < 24) return `${hours}h access`;
    const days = Math.floor(hours / 24);
    return `${days}d access`;
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {hasAccess ? (
              <Unlock className="w-5 h-5 text-green-500" />
            ) : (
              <Lock className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {offer.media_type === 'image' ? '📷 Exclusive Photo' : '🎥 Exclusive Video'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(offer.unlock_duration_hours)}</span>
              </div>
            </div>
          </div>
          
          <Badge variant={hasAccess ? "default" : "secondary"} className="font-bold">
            {offer.price_keys} Keys
          </Badge>
        </div>

        {/* Caption */}
        {offer.caption && (
          <p className="text-sm text-foreground/80 italic">"{offer.caption}"</p>
        )}

        {/* Media Preview */}
        <div className="relative rounded-lg overflow-hidden bg-black/5">
          {hasAccess ? (
            <>
              {offer.media_type === 'image' ? (
                <img
                  src={offer.media_url}
                  alt="Exclusive content"
                  className={cn(
                    "w-full cursor-pointer transition-transform hover:scale-105",
                    showFullImage ? "max-h-none" : "max-h-64 object-cover"
                  )}
                  onClick={() => setShowFullImage(!showFullImage)}
                />
              ) : (
                <video
                  src={offer.media_url}
                  controls
                  className="w-full max-h-96"
                  poster={offer.thumbnail_url}
                />
              )}
            </>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 backdrop-blur-2xl bg-black/40 flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <Lock className="w-12 h-12 text-white mx-auto" />
                  <p className="text-white font-semibold">Locked Content</p>
                  <p className="text-white/80 text-sm">Purchase to unlock</p>
                </div>
              </div>
              {offer.thumbnail_url ? (
                <img
                  src={offer.thumbnail_url}
                  alt="Blurred preview"
                  className="w-full h-64 object-cover blur-2xl"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isOwner && !hasAccess && (
          <Button
            onClick={handlePurchase}
            disabled={loading || checking}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock for {offer.price_keys} Keys
              </>
            )}
          </Button>
        )}

        {isOwner && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>You created this content</span>
          </div>
        )}

        {!isOwner && hasAccess && !checking && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Unlock className="w-4 h-4" />
            <span>You own this content</span>
          </div>
        )}
      </div>
    </Card>
  );
};
