import { useState } from "react";
import { MoreVertical, Edit, Trash2, Flag, Lock, Eye, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PostOptionsMenuProps {
  postId: string;
  creatorId: string;
  isPublic: boolean;
  isPPV?: boolean;
  ppvPrice?: number;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

const PostOptionsMenu = ({
  postId,
  creatorId,
  isPublic,
  isPPV,
  ppvPrice,
  onPostUpdated,
  onPostDeleted,
}: PostOptionsMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.id === creatorId;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit states
  const [visibility, setVisibility] = useState<string>(
    isPPV ? "ppv" : isPublic ? "public" : "subscribers"
  );
  const [newPpvPrice, setNewPpvPrice] = useState(ppvPrice || 10);

  // Report states
  const [reportType, setReportType] = useState<string>("inappropriate_content");
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const handleUpdateVisibility = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        is_public: visibility === "public",
        is_ppv: visibility === "ppv",
        ppv_price: visibility === "ppv" ? newPpvPrice : null,
      };

      const { error } = await supabase
        .from("exclusive_posts")
        .update(updateData)
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post updated",
        description: "Your post visibility has been updated.",
      });
      setShowEditModal(false);
      onPostUpdated?.();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("exclusive_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been deleted.",
      });
      setShowDeleteModal(false);
      onPostDeleted?.();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the report.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: user?.id,
        reported_user_id: creatorId,
        post_id: postId,
        report_type: reportType,
        reason: reportReason,
        description: reportDescription,
      });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We will review it shortly.",
      });
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-background border">
          {isOwner ? (
            <>
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Visibility
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteModal(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setShowReportModal(true)}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Visibility Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Post Visibility</DialogTitle>
            <DialogDescription>
              Change who can see this post.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-green-500" />
                      Public - Everyone can see
                    </div>
                  </SelectItem>
                  <SelectItem value="subscribers">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-blue-500" />
                      Subscribers Only
                    </div>
                  </SelectItem>
                  <SelectItem value="ppv">
                    <div className="flex items-center">
                      <Lock className="mr-2 h-4 w-4 text-purple-500" />
                      Pay-Per-View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === "ppv" && (
              <div className="space-y-2">
                <Label>Price (Keys)</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={newPpvPrice}
                  onChange={(e) => setNewPpvPrice(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVisibility} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Help us understand the issue with this content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="scam">Scam or Fraud</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input
                placeholder="Brief reason for reporting"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Details (Optional)</Label>
              <Textarea
                placeholder="Provide more context about the issue..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReport} disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostOptionsMenu;
