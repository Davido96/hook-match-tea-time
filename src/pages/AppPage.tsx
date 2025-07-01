
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DiscoverPage from "@/components/DiscoverPage";

type ViewType = 'discover' | 'exclusive' | 'messages' | 'incoming-likes';

const AppPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleMatchAdded = (match: any) => {
    setMatches(prev => [...prev, match]);
  };

  const handleViewChange = (view: ViewType) => {
    switch (view) {
      case 'messages':
        navigate("/app/messages");
        break;
      case 'exclusive':
        navigate("/app/exclusive");
        break;
      case 'incoming-likes':
        navigate("/app/likes");
        break;
      case 'discover':
      default:
        // Stay on current page
        break;
    }
  };

  const handleNavigateToMessages = () => {
    navigate("/app/messages");
  };

  return (
    <DiscoverPage 
      currentView="discover"
      setCurrentView={handleViewChange}
      matches={matches}
      onMatchAdded={handleMatchAdded}
    />
  );
};

export default AppPage;
