
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  onAvatarUpdate?: (url: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userName, onAvatarUpdate }: AvatarUploadProps) => {
  const { profile, uploadAvatar, updateProfile } = useProfile();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check if profile exists
    if (!profile) {
      setError("Profile must be created before uploading avatar");
      toast({
        title: "Profile Required",
        description: "Please complete your profile setup first",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
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

      console.log('Starting avatar upload process...');

      // Upload avatar
      const { data: avatarUrl, error: uploadError } = await uploadAvatar(file);
      
      if (uploadError || !avatarUrl) {
        throw uploadError || new Error('Upload failed - no URL returned');
      }

      console.log('Avatar uploaded successfully, updating profile...');

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });

      onAvatarUpdate?.(avatarUrl);
      setError(null);
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      const errorMessage = error?.message || "Failed to upload avatar. Please try again.";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
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
    if (!profile) {
      toast({
        title: "Profile Required",
        description: "Please complete your profile setup first",
        variant: "destructive"
      });
      return;
    }
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
          disabled={uploading || !profile}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={uploading || !profile}
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
        {!profile && (
          <p className="text-xs text-red-500 mt-1">
            Complete profile setup to upload photo
          </p>
        )}
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
