import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  Instagram, 
  Twitter, 
  Users, 
  MapPin,
  DollarSign,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface WaitlistApplication {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  location_city?: string;
  location_state?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  tiktok_handle?: string;
  creator_category: string;
  current_followers: number;
  content_description?: string;
  why_join?: string;
  content_strategy?: string;
  expected_monthly_revenue?: number;
  profile_photo_url?: string;
  portfolio_urls?: string[];
  application_status: string;
  application_score?: number;
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

const AdminWaitlistDashboard = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<WaitlistApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<WaitlistApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewStatus, setReviewStatus] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from('creator_waitlist')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('application_status', filter as any);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string, score?: number, notes?: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        application_status: status,
        reviewed_at: new Date().toISOString(),
      };

      if (score) updateData.application_score = score;
      if (notes) updateData.admin_notes = notes;
      if (status === 'approved') updateData.approved_at = new Date().toISOString();

      const { error } = await supabase
        .from('creator_waitlist')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Also create a review record
      await supabase
        .from('application_reviews')
        .insert({
          waitlist_id: id,
          review_status: status as any,
          review_score: score,
          review_notes: notes,
        });

      toast({
        title: "Updated Successfully",
        description: `Application ${status}`,
      });

      fetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update application",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReview = () => {
    if (selectedApplication && reviewStatus) {
      updateApplicationStatus(
        selectedApplication.id,
        reviewStatus,
        reviewScore || undefined,
        reviewNotes || undefined
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'waitlisted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'waitlisted': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.application_status] = (acc[app.application_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hooks-coral mx-auto mb-2"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Creator Waitlist Dashboard</h1>
        <p className="text-muted-foreground">Review and manage creator applications</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{applications.length}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.under_review || 0}</div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved || 0}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected || 0}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Applications</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedApplication?.id === app.id ? 'border-hooks-coral bg-coral-50' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedApplication(app)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{app.full_name}</h3>
                      <Badge className={getStatusColor(app.application_status)}>
                        {getStatusIcon(app.application_status)}
                        <span className="ml-1">{app.application_status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(app.submitted_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {app.current_followers} followers
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.location_city}, {app.location_state}
                        </span>
                        <span className="capitalize">{app.creator_category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details */}
        <div>
          {selectedApplication ? (
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedApplication.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
                      {selectedApplication.phone_number && (
                        <p className="text-sm text-muted-foreground">{selectedApplication.phone_number}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Location</h4>
                      <p className="text-sm">{selectedApplication.location_city}, {selectedApplication.location_state}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Social Media</h4>
                      <div className="space-y-1 text-sm">
                        {selectedApplication.instagram_handle && (
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4" />
                            @{selectedApplication.instagram_handle}
                          </div>
                        )}
                        {selectedApplication.twitter_handle && (
                          <div className="flex items-center gap-2">
                            <Twitter className="w-4 h-4" />
                            @{selectedApplication.twitter_handle}
                          </div>
                        )}
                        {selectedApplication.tiktok_handle && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            @{selectedApplication.tiktok_handle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">Creator Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Category:</span> {selectedApplication.creator_category}</p>
                        <p><span className="font-medium">Followers:</span> {selectedApplication.current_followers.toLocaleString()}</p>
                        {selectedApplication.expected_monthly_revenue && (
                          <p><span className="font-medium">Revenue Goal:</span> ₦{selectedApplication.expected_monthly_revenue.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {selectedApplication.content_description && (
                      <div>
                        <h4 className="font-medium mb-1">Content Description</h4>
                        <p className="text-sm">{selectedApplication.content_description}</p>
                      </div>
                    )}

                    {selectedApplication.why_join && (
                      <div>
                        <h4 className="font-medium mb-1">Why Join Hook?</h4>
                        <p className="text-sm">{selectedApplication.why_join}</p>
                      </div>
                    )}

                    {selectedApplication.content_strategy && (
                      <div>
                        <h4 className="font-medium mb-1">Content Strategy</h4>
                        <p className="text-sm">{selectedApplication.content_strategy}</p>
                      </div>
                    )}

                    {selectedApplication.profile_photo_url && (
                      <div>
                        <h4 className="font-medium mb-1">Profile Photo</h4>
                        <img
                          src={selectedApplication.profile_photo_url}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                    )}

                    {selectedApplication.admin_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-1">Admin Notes</h4>
                        <p className="text-sm">{selectedApplication.admin_notes}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="review" className="space-y-4">
                    <div>
                      <Label htmlFor="reviewStatus">Review Decision</Label>
                      <Select value={reviewStatus} onValueChange={setReviewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="waitlisted">Waitlist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reviewScore">Score (1-100)</Label>
                      <Input
                        id="reviewScore"
                        type="number"
                        min="1"
                        max="100"
                        value={reviewScore || ''}
                        onChange={(e) => setReviewScore(parseInt(e.target.value) || 0)}
                        placeholder="Enter score"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reviewNotes">Review Notes</Label>
                      <Textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add your review notes..."
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleReview}
                      disabled={!reviewStatus || updating}
                      className="w-full"
                    >
                      {updating ? 'Updating...' : 'Submit Review'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Select an application to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWaitlistDashboard;