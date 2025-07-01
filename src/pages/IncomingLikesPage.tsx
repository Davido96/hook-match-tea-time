
import { useNavigate } from "react-router-dom";
import IncomingLikesPage from "@/components/IncomingLikesPage";

const IncomingLikesPageWrapper = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app", { replace: true });
  };

  const handleNavigateToMessages = () => {
    navigate("/app/messages");
  };

  return (
    <IncomingLikesPage 
      onBack={handleBack}
      onNavigateToMessages={handleNavigateToMessages}
    />
  );
};

export default IncomingLikesPageWrapper;
