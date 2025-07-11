
// Sample users for matching
export const sampleUsers = [
  {
    id: 1,
    name: "Amara Beauty",
    age: 24,
    bio: "Fashion model and lifestyle content creator passionate about beauty and photography",
    image: "/placeholder.svg",
    interests: ["Fashion", "Beauty", "Photography", "Travel"],
    distance: "2 km away",
    isVerified: true,
    subscriptionFee: 5000,
    location: "Lagos, Nigeria",
    gender: "female" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 1250,
    last_active: "2024-01-15T10:00:00Z",
    follower_count: 2340
  },
  {
    id: 2,
    name: "David Engineer",
    age: 29,
    bio: "Software engineer who loves coding, tech meetups, and exploring new places in Abuja",
    image: "/placeholder.svg",
    interests: ["Technology", "Coding", "Travel", "Music"],
    distance: "3 km away",
    isVerified: false,
    location: "Abuja, Nigeria",
    gender: "male" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-15T09:15:00Z",
    follower_count: 45
  },
  {
    id: 3,
    name: "Kemi Fitness",
    age: 26,
    bio: "Fitness coach and wellness enthusiast helping people live their best lives",
    image: "/placeholder.svg",
    interests: ["Fitness", "Health", "Motivation", "Nutrition"],
    distance: "5 km away",
    isVerified: true,
    subscriptionFee: 3000,
    location: "Abuja, Nigeria",
    gender: "female" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 850,
    last_active: "2024-01-15T08:30:00Z",
    follower_count: 1890
  },
  {
    id: 4,
    name: "Sarah Marketing",
    age: 27,
    bio: "Digital marketer and coffee enthusiast. Love exploring Lagos food scene and meeting new people",
    image: "/placeholder.svg",
    interests: ["Marketing", "Food", "Travel", "Books"],
    distance: "1.5 km away",
    isVerified: false,
    location: "Lagos, Nigeria",
    gender: "female" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-15T11:20:00Z",
    follower_count: 78
  },
  {
    id: 5,
    name: "Tunde Creative",
    age: 28,
    bio: "Digital artist and content creator specializing in African art and culture",
    image: "/placeholder.svg",
    interests: ["Art", "Design", "Culture", "Music"],
    distance: "3 km away",
    isVerified: true,
    subscriptionFee: 4000,
    location: "Ibadan, Nigeria",
    gender: "male" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 650,
    last_active: "2024-01-14T22:15:00Z",
    follower_count: 1200
  },
  {
    id: 6,
    name: "Grace Student",
    age: 22,
    bio: "University student studying business. Love dancing, movies, and hanging out with friends",
    image: "/placeholder.svg",
    interests: ["Dancing", "Movies", "Music", "Fashion"],
    distance: "4 km away",
    isVerified: false,
    location: "Ibadan, Nigeria",
    gender: "female" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-15T13:45:00Z",
    follower_count: 23
  },
  {
    id: 7,
    name: "Adunni Style",
    age: 22,
    bio: "Fashion enthusiast and style blogger showcasing African fashion trends",
    image: "/placeholder.svg",
    interests: ["Fashion", "Style", "Photography", "Modeling"],
    distance: "1 km away",
    isVerified: true,
    subscriptionFee: 2500,
    location: "Lagos, Nigeria",
    gender: "female" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 980,
    last_active: "2024-01-15T12:45:00Z",
    follower_count: 1654
  },
  {
    id: 8,
    name: "Michael Doctor",
    age: 31,
    bio: "Medical doctor passionate about healthcare and helping others. Enjoy reading and playing chess",
    image: "/placeholder.svg",
    interests: ["Healthcare", "Reading", "Chess", "Travel"],
    distance: "6 km away",
    isVerified: false,
    location: "Lagos, Nigeria",
    gender: "male" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-15T07:30:00Z",
    follower_count: 156
  },
  {
    id: 9,
    name: "Ola Tech",
    age: 30,
    bio: "Tech entrepreneur and gadget reviewer sharing the latest in Nigerian tech",
    image: "/placeholder.svg",
    interests: ["Technology", "Innovation", "Business", "Reviews"],
    distance: "7 km away",
    isVerified: true,
    subscriptionFee: 6000,
    location: "Abuja, Nigeria",
    gender: "male" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 2100,
    last_active: "2024-01-15T09:20:00Z",
    follower_count: 3200
  },
  {
    id: 10,
    name: "Blessing Teacher",
    age: 25,
    bio: "Primary school teacher who loves kids, education, and making a difference in young lives",
    image: "/placeholder.svg",
    interests: ["Education", "Children", "Reading", "Art"],
    distance: "2.5 km away",
    isVerified: false,
    location: "Abuja, Nigeria",
    gender: "female" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-15T14:10:00Z",
    follower_count: 67
  },
  {
    id: 11,
    name: "Chioma Chef",
    age: 26,
    bio: "Professional chef and food content creator sharing delicious Nigerian recipes",
    image: "/placeholder.svg",
    interests: ["Cooking", "Food", "Culture", "Travel"],
    distance: "3.5 km away",
    isVerified: true,
    subscriptionFee: 3500,
    location: "Lagos, Nigeria",
    gender: "female" as const,
    user_type: "creator" as const,
    verification_status: "verified" as const,
    subscriber_count: 1450,
    last_active: "2024-01-15T16:00:00Z",
    follower_count: 2100
  },
  {
    id: 12,
    name: "James Banker",
    age: 33,
    bio: "Investment banker with a passion for finance, fitness, and good conversations",
    image: "/placeholder.svg",
    interests: ["Finance", "Fitness", "Business", "Sports"],
    distance: "8 km away",
    isVerified: false,
    location: "Lagos, Nigeria",
    gender: "male" as const,
    user_type: "consumer" as const,
    verification_status: "pending" as const,
    last_active: "2024-01-14T20:30:00Z",
    follower_count: 234
  }
];
