import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, Play, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import HookLogo from "@/components/HookLogo";

interface PayPerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    creator_id: string;
    media_url: string;
    media_type: string;
    caption?: string;
    ppv_price?: number;
    ppv_unlock_duration?: number;
    profiles: {
      name: string;
      avatar_url?: string;
    };
  };
  onPurchaseSuccess: () => void;
}

const PayPerViewModal = ({ isOpen, onClose, post, onPurchaseSuccess }: PayPerViewModalProps) => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;

    setPurchasing(true);
    try {
      const { data, error } = await supabase.rpc('purchase_ppv_content', {
        post_uuid: post.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        toast({
          title: "Purchase Failed",
          description: result.error || "Something went wrong",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Content Unlocked! 🎉",
        description: "You now have access to this exclusive content",
      });

      // Refresh wallet balance
      await refetchWallet();
      
      // Call success callback
      onPurchaseSuccess();
      onClose();

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchasing(false);
    }
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return "Permanent access";
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  const hasEnoughBalance = wallet && post.ppv_price ? wallet.keys_balance >= post.ppv_price : false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-hooks-coral" />
              Unlock Content
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Creator Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-hooks-coral flex items-center justify-center text-white font-semibold">
              {post.profiles.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                post.profiles.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold">{post.profiles.name}</p>
              <p className="text-sm text-gray-600">Creator</p>
            </div>
          </div>

          {/* Content Preview */}
          <div className="relative">
            {post.media_type === 'video' ? (
              <div className="relative">
                <video
                  src={post.media_url}
                  className="w-full h-48 object-cover rounded-lg"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Play className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Preview - Full video after purchase</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={post.media_url}
                  alt="Content preview"
                  className="w-full h-48 object-cover rounded-lg filter blur-sm"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Lock className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Preview - Full image after purchase</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-sm text-gray-700">{post.caption}</p>
          )}

          {/* Pricing Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Price:</span>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-hooks-coral">{post.ppv_price || 0}</span>
                <HookLogo size="sm" />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Access Duration:
              </span>
              <span className="font-medium">{formatDuration(post.ppv_unlock_duration)}</span>
            </div>
          </div>

          {/* Balance Check */}
          <div className="flex items-center justify-between text-sm">
            <span>Your balance:</span>
            <div className="flex items-center gap-1">
              <span className={hasEnoughBalance ? "text-green-600" : "text-red-600"}>
                {wallet?.keys_balance || 0}
              </span>
              <HookLogo size="sm" />
            </div>
          </div>

          {!hasEnoughBalance && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-red-700 text-sm">
                Insufficient balance. You need {(post.ppv_price || 0) - (wallet?.keys_balance || 0)} more Keys.
              </p>
            </div>
          )}

          {/* Purchase Button */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={purchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchasing || !hasEnoughBalance}
              className="flex-1 gradient-coral text-white"
            >
              {purchasing ? 'Purchasing...' : `Unlock for ${post.ppv_price || 0} Keys`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPerViewModal;