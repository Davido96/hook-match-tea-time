
import { useState } from "react";
import { Heart, Eye, Star } from "lucide-react";

const CreatorShowcase = () => {
  const [hoveredCreator, setHoveredCreator] = useState<number | null>(null);

  const creators = [
    {
      id: 1,
      name: "Amara K.",
      specialty: "Lifestyle & Fashion",
      earnings: "₦350K/month",
      followers: "12.5K",
      image: "photo-1494790108755-2616b169a1d8", // Professional woman
      verified: true
    },
    {
      id: 2,
      name: "Zara M.",
      specialty: "Fitness & Wellness",
      earnings: "₦280K/month",
      followers: "8.9K",
      image: "photo-1531746020798-e6953c6e8e04", // Fitness model
      verified: true
    },
    {
      id: 3,
      name: "Funmi O.",
      specialty: "Beauty & Style",
      earnings: "₦420K/month",
      followers: "18.2K",
      image: "photo-1488426862026-3ee34a734b8d", // Beauty portrait
      verified: true
    },
    {
      id: 4,
      name: "Kemi A.",
      specialty: "Art & Photography",
      earnings: "₦190K/month",
      followers: "6.1K",
      image: "photo-1506863530036-1efeddceb993", // Artist
      verified: true
    }
  ];

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-white text-center mb-12 font-playfair">
        Featured Creators
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="creator-card group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-500 hover:scale-105"
            onMouseEnter={() => setHoveredCreator(creator.id)}
            onMouseLeave={() => setHoveredCreator(null)}
          >
            {/* Creator Image */}
            <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
              <img
                src={`https://images.unsplash.com/${creator.image}?auto=format&fit=crop&w=400&q=80`}
                alt={creator.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              {/* Creator Info - Always visible */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{creator.name}</h3>
                  {creator.verified && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
                <p className="text-white/90 text-sm mb-2">{creator.specialty}</p>
                
                {/* Stats that appear on hover */}
                <div className={`transition-all duration-300 ${
                  hoveredCreator === creator.id 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}>
                  <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{creator.followers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{creator.earnings}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div className="bg-gradient-to-r from-hooks-coral to-hooks-pink h-1 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
              
              {/* Hover Button */}
              <div className={`absolute top-4 right-4 transition-all duration-300 ${
                hoveredCreator === creator.id 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75'
              }`}>
                <button className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs hover:bg-white/30 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-white/80 text-sm">
          Join <span className="text-yellow-300 font-semibold">2,500+</span> creators earning on Hooks
        </p>
      </div>
    </div>
  );
};

export default CreatorShowcase;
