
import { useNavigate, useLocation } from "react-router-dom";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user type from navigation state
  const userType = location.state?.userType || null;

  const handleComplete = () => {
    navigate("/app", { replace: true });
  };

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <EnhancedProfileSetup 
      onComplete={handleComplete}
      onBack={handleBack}
      initialUserType={userType}
    />
  );
};

export default ProfileSetupPage;
