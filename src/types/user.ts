
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  user_type: 'creator' | 'consumer';
  location: {
    state: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  gender: 'male' | 'female' | 'non-binary';
  gender_preference: 'male' | 'female' | 'both';
  age_range_preference: {
    min: number;
    max: number;
  };
  search_radius_km: number;
  interests: string[];
  photos: string[];
  // Creator specific fields
  subscription_fee?: number;
  services_offered?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_age_verified: boolean;
}

export interface NigerianLocation {
  state: string;
  cities: string[];
}
