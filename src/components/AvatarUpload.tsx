
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onAvatarUpdate?: (url: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const { uploadAvatar, updateProfile } = useProfile();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload avatar
      const { data: avatarUrl, error } = await uploadAvatar(file);
      
      if (error || !avatarUrl) {
        throw error || new Error('Upload failed');
      }

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });
      
      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });

      onAvatarUpdate?.(avatarUrl);
      
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const avatarSrc = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarSrc || ""} alt={userName} />
          <AvatarFallback className="bg-hooks-coral text-white text-xl">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={handleClick}
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
          className="text-sm"
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG up to 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
