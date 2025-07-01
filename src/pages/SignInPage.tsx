
import { useNavigate } from "react-router-dom";
import AuthPage from "@/components/AuthPage";

const SignInPage = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/app", { replace: true });
  };

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <AuthPage 
      initialMode="signin"
      onAuthSuccess={handleAuthSuccess}
      onBack={handleBack}
    />
  );
};

export default SignInPage;
