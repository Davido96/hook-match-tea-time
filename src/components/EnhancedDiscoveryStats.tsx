
import { useEffect } from "react";
import GamifiedDiscoveryStats from "./GamifiedDiscoveryStats";

interface EnhancedDiscoveryStatsProps {
  onSwipe?: () => void;
  onSuperLike?: () => void;
}

const EnhancedDiscoveryStats = ({ onSwipe, onSuperLike }: EnhancedDiscoveryStatsProps) => {
  return <GamifiedDiscoveryStats onSwipe={onSwipe} onSuperLike={onSuperLike} />;
};

export default EnhancedDiscoveryStats;
