
import { useNavigate } from "react-router-dom";
import AuthPage from "@/components/AuthPage";

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate("/profile-setup", { replace: true });
  };

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <AuthPage 
      initialMode="signup"
      onSignupSuccess={handleSignupSuccess}
      onBack={handleBack}
    />
  );
};

export default SignUpPage;
