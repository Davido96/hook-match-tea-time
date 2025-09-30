import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useChatPPV } from '@/hooks/useChatPPV';
import { toast } from 'sonner';

interface MediaAttachmentModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  onMediaSent: (mediaUrl: string, offerId: string) => void;
}

export const MediaAttachmentModal = ({ 
  open, 
  onClose, 
  conversationId,
  onMediaSent 
}: MediaAttachmentModalProps) => {
  const { uploadMedia, createOffer, loading } = useChatPPV();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isPPV, setIsPPV] = useState(true);
  const [price, setPrice] = useState('10');
  const [duration, setDuration] = useState('24');
  const [caption, setCaption] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (isPPV && (!price || parseInt(price) < 1)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      // Upload media
      const uploadResult = await uploadMedia(selectedFile, conversationId);
      if (uploadResult.error || !uploadResult.url) {
        toast.error(uploadResult.error || 'Failed to upload media');
        return;
      }

      // Create a temporary message ID (will be replaced with actual message ID)
      const tempMessageId = crypto.randomUUID();

      // Create PPV offer if enabled
      if (isPPV) {
        const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        const unlockHours = isPermanent ? undefined : parseInt(duration);
        
        const offerResult = await createOffer(
          conversationId,
          tempMessageId,
          uploadResult.url,
          mediaType,
          parseInt(price),
          unlockHours,
          caption || undefined
        );

        if (!offerResult.success || !offerResult.data) {
          toast.error('Failed to create PPV offer');
          return;
        }

        onMediaSent(uploadResult.url, offerResult.data.id);
      } else {
        // Send as regular media message
        onMediaSent(uploadResult.url, '');
      }

      // Reset form
      setSelectedFile(null);
      setPreview('');
      setPrice('10');
      setDuration('24');
      setCaption('');
      setIsPermanent(false);
      onClose();
    } catch (error) {
      console.error('Error sending media:', error);
      toast.error('Failed to send media');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Media</DialogTitle>
          <DialogDescription>
            Upload an image or video to send in chat
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                id="media-upload"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Images or videos up to 50MB
                </p>
              </label>
            </div>
          ) : (
            <div className="relative">
              {selectedFile.type.startsWith('image/') ? (
                <img src={preview} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
              ) : (
                <video src={preview} className="w-full rounded-lg max-h-64" controls />
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Caption */}
          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="mt-1"
            />
          </div>

          {/* PPV Settings */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Pay-Per-View</Label>
                <p className="text-xs text-muted-foreground">
                  Charge Keys to unlock this content
                </p>
              </div>
              <Switch checked={isPPV} onCheckedChange={setIsPPV} />
            </div>

            {isPPV && (
              <>
                <div>
                  <Label htmlFor="price">Price (Keys)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permanent Access</Label>
                    <p className="text-xs text-muted-foreground">
                      Content never expires
                    </p>
                  </div>
                  <Switch checked={isPermanent} onCheckedChange={setIsPermanent} />
                </div>

                {!isPermanent && (
                  <div>
                    <Label htmlFor="duration">Access Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Content will be locked after this period
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedFile || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
