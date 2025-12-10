import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, StopCircle, RotateCcw, Check, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VideoVerificationProps {
  onVideoUploaded: (videoUrl: string) => void;
  existingVideoUrl?: string;
}

const VideoVerification = ({ onVideoUploaded, existingVideoUrl }: VideoVerificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(existingVideoUrl || null);
  const [countdown, setCountdown] = useState(10);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedVideoUrl && !existingVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Unable to access camera. Please allow camera permissions and try again.");
      toast({
        title: "Camera Access Required",
        description: "Please allow camera and microphone access to record your verification video.",
        variant: "destructive"
      });
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    setCountdown(10);
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsCameraReady(false);
      
      // Upload the video
      await uploadVideo(blob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVideo = async (blob: Blob) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a video.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileName = `verification-videos/${user.id}/${Date.now()}.webm`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'video/webm',
          upsert: true
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      onVideoUploaded(publicUrl);
      
      toast({
        title: "Video Uploaded",
        description: "Your verification video has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Video upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retakeVideo = () => {
    if (recordedVideoUrl && !existingVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Video Verification
        </h3>
        <p className="text-sm text-muted-foreground">
          Record a 10-second video of yourself for identity verification.
          Look at the camera and say "I confirm I am who I claim to be on Hooks."
        </p>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          {recordedVideoUrl ? (
            <video
              src={recordedVideoUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover mirror"
              playsInline
              muted
            />
          )}
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Recording: {countdown}s
            </div>
          )}
          
          {/* Uploading indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Uploading...
              </div>
            </div>
          )}
          
          {/* Camera not ready placeholder */}
          {!isCameraReady && !recordedVideoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {cameraError && (
          <p className="text-destructive text-sm mt-2 text-center">{cameraError}</p>
        )}
      </Card>

      <div className="flex justify-center gap-3">
        {!isCameraReady && !recordedVideoUrl && (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="w-4 h-4" />
            Start Camera
          </Button>
        )}
        
        {isCameraReady && !isRecording && !recordedVideoUrl && (
          <Button onClick={startRecording} variant="destructive" className="gap-2">
            <Video className="w-4 h-4" />
            Start Recording (10s)
          </Button>
        )}
        
        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <StopCircle className="w-4 h-4" />
            Stop Recording
          </Button>
        )}
        
        {recordedVideoUrl && !isUploading && (
          <>
            <Button onClick={retakeVideo} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button disabled className="gap-2 bg-green-600 hover:bg-green-700">
              <Check className="w-4 h-4" />
              Video Saved
            </Button>
          </>
        )}
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Video must be exactly 10 seconds</p>
        <p>• Face should be clearly visible</p>
        <p>• Good lighting is recommended</p>
      </div>
      
      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

export default VideoVerification;
