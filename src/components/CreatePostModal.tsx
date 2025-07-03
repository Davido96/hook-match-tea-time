
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Image, Video, FileX, Lock, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal = ({ isOpen, onClose, onPostCreated }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState("");
  const [ppvDuration, setPpvDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const acceptedTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.mov', '.avi', '.mkv']
  };

  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const handleFileSelect = (file: File) => {
    if (file.size > maxFileSize) {
      alert('File size must be less than 100MB');
      return;
    }

    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isValidType) {
      alert('Only image and video files are allowed');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('exclusive-content')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('exclusive-content')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const mediaUrl = await uploadFile(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      const { error } = await supabase
        .from('exclusive_posts')
        .insert({
          creator_id: user!.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption.trim() || null,
          is_public: isPublic && !isPPV, // PPV content cannot be public
          is_ppv: isPPV,
          ppv_price: isPPV ? parseInt(ppvPrice) : null,
          ppv_unlock_duration: isPPV && ppvDuration ? parseInt(ppvDuration) : null
        });

      if (error) throw error;

      onPostCreated();
      setSelectedFile(null);
      setCaption("");
      setIsPublic(false);
      setIsPPV(false);
      setPpvPrice("");
      setPpvDuration("");
      setUploadProgress(0);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Exclusive Post</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            <div>
              <Label>Upload Media</Label>
              {!selectedFile ? (
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-hooks-coral bg-hooks-coral/5' 
                      : 'border-gray-300 hover:border-hooks-coral'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Images and videos up to 100MB
                  </p>
                </div>
              ) : (
                <div className="mt-2 border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {selectedFile.type.startsWith('image/') ? (
                        <Image className="w-8 h-8 text-hooks-coral" />
                      ) : selectedFile.type.startsWith('video/') ? (
                        <Video className="w-8 h-8 text-hooks-coral" />
                      ) : (
                        <FileX className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-hooks-coral h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Preview */}
                  {selectedFile && selectedFile.type.startsWith('image/') && (
                    <div className="mt-3">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {selectedFile && selectedFile.type.startsWith('video/') && (
                    <div className="mt-3">
                      <video
                        src={URL.createObjectURL(selectedFile)}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>

            {/* Content Type Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-public"
                  checked={isPublic && !isPPV}
                  onCheckedChange={(checked) => {
                    setIsPublic(checked);
                    if (checked) setIsPPV(false);
                  }}
                  disabled={isPPV}
                />
                <Label htmlFor="is-public">
                  Make this post public (visible to everyone)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-ppv"
                  checked={isPPV}
                  onCheckedChange={(checked) => {
                    setIsPPV(checked);
                    if (checked) setIsPublic(false);
                  }}
                />
                <Label htmlFor="is-ppv" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Pay-per-view content
                </Label>
              </div>

              {isPPV && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <Label htmlFor="ppv-price" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price (Keys)
                    </Label>
                    <Input
                      id="ppv-price"
                      type="number"
                      placeholder="e.g., 10"
                      value={ppvPrice}
                      onChange={(e) => setPpvPrice(e.target.value)}
                      min="1"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ppv-duration">Access Duration</Label>
                    <Select value={ppvDuration} onValueChange={setPpvDuration}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Permanent access</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                        <SelectItem value="720">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedFile}
                className="flex-1 gradient-coral text-white"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostModal;
