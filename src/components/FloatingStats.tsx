
import { TrendingUp, Users, Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";

const FloatingStats = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: Users,
      value: "25K+",
      label: "Active Users",
      position: "top-20 left-10",
      delay: "delay-100"
    },
    {
      icon: Heart,
      value: "1M+",
      label: "Connections Made",
      position: "top-32 right-16",
      delay: "delay-300"
    },
    {
      icon: TrendingUp,
      value: "₦50M+",
      label: "Creator Earnings",
      position: "bottom-40 left-20",
      delay: "delay-500"
    },
    {
      icon: Star,
      value: "4.9★",
      label: "User Rating",
      position: "bottom-20 right-12",
      delay: "delay-700"
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`absolute ${stat.position} z-0 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } ${stat.delay} hidden lg:block`}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-2 group-hover:scale-110 transition-transform">
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm">{stat.value}</div>
                <div className="text-xs text-white/80">{stat.label}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FloatingStats;
