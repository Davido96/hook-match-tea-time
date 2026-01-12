import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Flag, Eye, CheckCircle, XCircle, Ban, MessageSquare, Image, User, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  post_id: string | null;
  report_type: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter_profile?: {
    name: string;
    avatar_url: string | null;
  };
  reported_profile?: {
    name: string;
    avatar_url: string | null;
    user_type: string;
    is_blocked: boolean;
  };
  post?: {
    media_url: string;
    media_type: string;
    caption: string | null;
  };
}

export const ReportsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related profiles and posts
      const enrichedReports = await Promise.all(
        (data || []).map(async (report) => {
          const [reporterRes, reportedRes, postRes] = await Promise.all([
            supabase.from("profiles").select("name, avatar_url").eq("user_id", report.reporter_id).single(),
            supabase.from("profiles").select("name, avatar_url, user_type, is_blocked").eq("user_id", report.reported_user_id).single(),
            report.post_id 
              ? supabase.from("exclusive_posts").select("media_url, media_type, caption").eq("id", report.post_id).single()
              : Promise.resolve({ data: null }),
          ]);

          return {
            ...report,
            reporter_profile: reporterRes.data,
            reported_profile: reportedRes.data,
            post: postRes.data,
          };
        })
      );

      setReports(enrichedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("user_reports")
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Report updated",
        description: `Report has been marked as ${newStatus}.`,
      });
      setShowDetailsModal(false);
      setAdminNotes("");
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedReport || !blockReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for blocking.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: blockReason,
          blocked_by: user?.id,
        })
        .eq("user_id", selectedReport.reported_user_id);

      if (error) throw error;

      // Also update the report status
      await supabase
        .from("user_reports")
        .update({
          status: "resolved",
          admin_notes: `User blocked. Reason: ${blockReason}`,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      // Send notification to blocked user
      await supabase.from("notifications").insert({
        user_id: selectedReport.reported_user_id,
        type: "account_blocked",
        title: "Account Blocked",
        message: `Your account has been blocked due to policy violations. Reason: ${blockReason}`,
      });

      toast({
        title: "User blocked",
        description: "The user has been blocked from the platform.",
      });
      setShowBlockModal(false);
      setBlockReason("");
      fetchReports();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Failed to block user.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: false,
          blocked_at: null,
          blocked_reason: null,
          blocked_by: null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "User unblocked",
        description: "The user can now access the platform.",
      });
      fetchReports();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: "Failed to unblock user.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "reviewing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getReportTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      inappropriate_content: "bg-red-100 text-red-800",
      harassment: "bg-orange-100 text-orange-800",
      spam: "bg-purple-100 text-purple-800",
      scam: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant="outline" className={colors[type] || colors.other}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                User Reports
              </CardTitle>
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} pending</Badge>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(report.status)}
                          {getReportTypeBadge(report.report_type)}
                          {report.post_id && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Image className="h-3 w-3" />
                              Post Report
                            </Badge>
                          )}
                          {!report.post_id && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User Report
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Reported by:</p>
                            <p className="font-medium">{report.reporter_profile?.name || "Unknown"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reported user:</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{report.reported_profile?.name || "Unknown"}</p>
                              {report.reported_profile?.is_blocked && (
                                <Badge variant="destructive" className="text-xs">Blocked</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm">
                          <span className="text-muted-foreground">Reason: </span>
                          {report.reason}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.created_at), "PPp")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setAdminNotes(report.admin_notes || "");
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!report.reported_profile?.is_blocked && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowBlockModal(true);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Block
                          </Button>
                        )}
                        {report.reported_profile?.is_blocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(report.reported_user_id)}
                            disabled={actionLoading}
                          >
                            Unblock
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="mt-1">{getReportTypeBadge(selectedReport.report_type)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Reporter</Label>
                  <p className="font-medium">{selectedReport.reporter_profile?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reported User</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{selectedReport.reported_profile?.name}</p>
                    <Badge variant="outline">{selectedReport.reported_profile?.user_type}</Badge>
                    {selectedReport.reported_profile?.is_blocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="p-2 bg-muted rounded">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <Label className="text-muted-foreground">Additional Details</Label>
                  <p className="p-2 bg-muted rounded">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.post && (
                <div>
                  <Label className="text-muted-foreground">Reported Content</Label>
                  <div className="mt-2 p-2 border rounded">
                    {selectedReport.post.media_type === "video" ? (
                      <video
                        src={selectedReport.post.media_url}
                        className="max-h-48 rounded"
                        controls
                      />
                    ) : (
                      <img
                        src={selectedReport.post.media_url}
                        alt="Reported content"
                        className="max-h-48 rounded object-cover"
                      />
                    )}
                    {selectedReport.post.caption && (
                      <p className="mt-2 text-sm">{selectedReport.post.caption}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus(selectedReport!.id, "dismissed")}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus(selectedReport!.id, "reviewing")}
              disabled={actionLoading}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Mark Reviewing
            </Button>
            <Button
              onClick={() => handleUpdateStatus(selectedReport!.id, "resolved")}
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Modal */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Block User
            </DialogTitle>
            <DialogDescription>
              This will prevent the user from accessing the platform. They will be notified of the action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedReport && (
              <div className="p-3 bg-muted rounded">
                <p className="font-medium">{selectedReport.reported_profile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.reported_profile?.user_type}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for Blocking *</Label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Explain why this user is being blocked..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockUser}
              disabled={actionLoading || !blockReason.trim()}
            >
              {actionLoading ? "Blocking..." : "Block User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
