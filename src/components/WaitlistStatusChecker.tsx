import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreatorWaitlist } from "@/hooks/useCreatorWaitlist";
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Hourglass } from "lucide-react";
import { format } from "date-fns";

const WaitlistStatusChecker = () => {
  const { checkStatus } = useCreatorWaitlist();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const result = await checkStatus(email);
      setStatus(result);
      setSearched(true);
    } catch (error) {
      console.error("Status check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review':
        return <Hourglass className="w-5 h-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'waitlisted':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (applicationStatus: string) => {
    switch (applicationStatus) {
      case 'pending':
        return "Your application is in our queue and will be reviewed soon.";
      case 'under_review':
        return "Our team is currently reviewing your application.";
      case 'approved':
        return "Congratulations! Your application has been approved. Check your email for next steps.";
      case 'rejected':
        return "Unfortunately, your application was not approved at this time. You can reapply in 30 days.";
      case 'waitlisted':
        return "You've been added to our priority waitlist. We'll notify you when spots become available.";
      default:
        return "Unknown status.";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Check Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            />
          </div>
          
          <Button 
            onClick={handleCheck}
            disabled={!email || loading}
            className="w-full"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>

          {searched && (
            <div className="mt-6">
              {status ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    {getStatusIcon(status.application_status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Application Status</span>
                        <Badge className={getStatusColor(status.application_status)}>
                          {status.application_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getStatusMessage(status.application_status)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{format(new Date(status.submitted_at), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {status.reviewed_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviewed:</span>
                        <span>{format(new Date(status.reviewed_at), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    
                    {status.application_score && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">{status.application_score}/100</span>
                      </div>
                    )}
                  </div>

                  {status.admin_notes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{status.admin_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    No application found with this email address.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure you're using the same email you submitted your application with.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistStatusChecker;