
import { useNavigate } from "react-router-dom";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";

const ExclusiveContentPageWrapper = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app", { replace: true });
  };

  return (
    <ExclusiveContentPage onBack={handleBack} />
  );
};

export default ExclusiveContentPageWrapper;
