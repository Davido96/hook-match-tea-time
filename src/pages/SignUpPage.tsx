
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatorSignupFlow from "@/components/CreatorSignupFlow";

const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignupComplete = (userType: 'creator' | 'consumer') => {
    // Navigate to profile setup with the selected user type
    navigate("/profile-setup", { 
      replace: true,
      state: { userType }
    });
  };

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <CreatorSignupFlow 
      onComplete={handleSignupComplete}
      onBack={handleBack}
    />
  );
};

export default SignUpPage;
