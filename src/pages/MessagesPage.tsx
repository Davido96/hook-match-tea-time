
import { useNavigate } from "react-router-dom";
import EnhancedChatInterface from "@/components/EnhancedChatInterface";

const MessagesPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app", { replace: true });
  };

  return (
    <EnhancedChatInterface onBack={handleBack} />
  );
};

export default MessagesPage;
