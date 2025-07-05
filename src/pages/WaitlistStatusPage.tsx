import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import WaitlistStatusChecker from "@/components/WaitlistStatusChecker";

const WaitlistStatusPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Application Status</h1>
          <p className="text-muted-foreground">
            Check the status of your creator waitlist application
          </p>
        </div>

        <WaitlistStatusChecker />
      </div>
    </div>
  );
};

export default WaitlistStatusPage;