import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Mail, Home } from "lucide-react";

const WaitlistSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Thank you for applying to join the Hook Creator Waitlist! 
                We've received your application and will review it carefully.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900">Review Timeline</p>
                    <p className="text-xs text-blue-700">3-5 business days</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-purple-900">Email Updates</p>
                    <p className="text-xs text-purple-700">We'll notify you of any status changes</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Our team reviews your application and content</li>
                  <li>• We verify your social media presence</li>
                  <li>• You'll receive an email with our decision</li>
                  <li>• If approved, you'll get early access to Hook</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/waitlist-status')}
                variant="outline" 
                className="w-full"
              >
                Check Application Status
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Questions? Reach out to us at{" "}
                <a href="mailto:creators@hook.app" className="text-hooks-coral hover:underline">
                  creators@hook.app
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaitlistSuccessPage;