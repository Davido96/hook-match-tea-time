
import { useNavigate } from "react-router-dom";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";

const ProfileSetupPage = () => {
  const navigate = useNavigate();

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
    />
  );
};

export default ProfileSetupPage;
