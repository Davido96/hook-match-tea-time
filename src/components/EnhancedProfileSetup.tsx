
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, X, Heart, Camera, MapPin, Users, Shield, User } from "lucide-react";
import { nigerianStates, getCitiesByState } from "@/data/nigerianLocations";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface EnhancedProfileSetupProps {
  onComplete: () => void;
}

const EnhancedProfileSetup = ({ onComplete }: EnhancedProfileSetupProps) => {
  const { createProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    age: 18,
    bio: "",
    avatar_url: "",
    user_type: undefined as 'creator' | 'consumer' | undefined,
    location_state: "",
    location_city: "",
    gender: undefined as 'male' | 'female' | 'non-binary' | undefined,
    gender_preference: undefined as 'male' | 'female' | 'both' | undefined,
    age_range_min: 18,
    age_range_max: 35,
    search_radius_km: 50,
    interests: [] as string[],
    subscription_fee: 0,
    services_offered: "",
    is_age_verified: false,
    verification_status: 'pending' as const
  });

  const sampleInterests = [
    "Photography", "Fashion", "Fitness", "Travel", "Music", "Art", "Dancing", 
    "Cooking", "Movies", "Gaming", "Nature", "Technology", "Reading", "Yoga",
    "Modeling", "Content Creation", "Social Media", "Beauty", "Lifestyle"
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: imageUrl, error } = await uploadAvatar(file);
      if (error) {
        toast({
          title: "Upload Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive"
        });
      } else if (imageUrl) {
        setProfile(prev => ({ ...prev, avatar_url: imageUrl }));
        toast({
          title: "Success",
          description: "Profile image uploaded successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong uploading the image.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = async () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save profile
      setIsLoading(true);
      try {
        const { error } = await createProfile({
          name: profile.name,
          age: profile.age,
          bio: profile.bio || "",
          avatar_url: profile.avatar_url,
          user_type: profile.user_type!,
          location_state: profile.location_state,
          location_city: profile.location_city,
          gender: profile.gender!,
          gender_preference: profile.gender_preference!,
          age_range_min: profile.age_range_min,
          age_range_max: profile.age_range_max,
          search_radius_km: profile.search_radius_km,
          interests: profile.interests,
          subscription_fee: profile.subscription_fee,
          services_offered: profile.services_offered,
          verification_status: 'pending',
          is_age_verified: profile.is_age_verified
        });

        if (error) {
          console.error('Profile creation error:', error);
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Your profile has been created successfully!",
          });
          onComplete();
        }
      } catch (error) {
        console.error('Profile creation error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.user_type;
      case 2:
        return profile.is_age_verified && profile.name && profile.age;
      case 3:
        return profile.bio;
      case 4:
        return profile.location_state && profile.location_city;
      case 5:
        return profile.gender && profile.gender_preference;
      case 6:
        return profile.user_type === 'consumer' || (profile.subscription_fee !== undefined && profile.services_offered);
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🪝</span>
            <h1 className="text-2xl font-bold text-gradient">Hooks</h1>
          </div>
          <CardTitle>Join the Premium Network</CardTitle>
          <div className="flex justify-center space-x-1 mt-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-hooks-coral' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Choose Your Experience</h3>
              <div className="space-y-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    profile.user_type === 'creator' ? 'border-hooks-coral bg-hooks-coral/10' : 'hover:border-hooks-coral/50'
                  }`}
                  onClick={() => setProfile({ ...profile, user_type: 'creator' })}
                >
                  <CardContent className="p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-hooks-coral" />
                    <h4 className="font-semibold">Content Creator</h4>
                    <p className="text-sm text-gray-600">Share exclusive content and earn ₦ from subscriptions</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    profile.user_type === 'consumer' ? 'border-hooks-coral bg-hooks-coral/10' : 'hover:border-hooks-coral/50'
                  }`}
                  onClick={() => setProfile({ ...profile, user_type: 'consumer' })}
                >
                  <CardContent className="p-4 text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-hooks-coral" />
                    <h4 className="font-semibold">Premium Member</h4>
                    <p className="text-sm text-gray-600">Connect with creators and exclusive content</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-hooks-coral" />
                <h3 className="text-lg font-semibold">Age Verification Required</h3>
                <p className="text-sm text-gray-600 mb-4">You must be 18+ to use Hooks</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Age</label>
                  <Input
                    type="number"
                    min="18"
                    max="100"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Age verification required</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setProfile({ ...profile, is_age_verified: true })}
                  >
                    {profile.is_age_verified ? "✓ Verified" : "Verify Age"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">About You & Profile Picture</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    placeholder="Tell people about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <div className="flex flex-col items-center space-y-4">
                    {profile.avatar_url ? (
                      <div className="relative">
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-hooks-coral"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                          onClick={() => setProfile({ ...profile, avatar_url: "" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-hooks-coral text-white rounded-lg hover:bg-hooks-coral/80 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-hooks-coral" />
                <h3 className="text-lg font-semibold">Location in Nigeria</h3>
                <p className="text-sm text-gray-600">Help us connect you with people nearby</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Select 
                    value={profile.location_state} 
                    onValueChange={(value) => setProfile({
                      ...profile, 
                      location_state: value, 
                      location_city: ""
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state.state} value={state.state}>
                          {state.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {profile.location_state && (
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <Select 
                      value={profile.location_city} 
                      onValueChange={(value) => setProfile({
                        ...profile, 
                        location_city: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCitiesByState(profile.location_state).map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-hooks-coral" />
                <h3 className="text-lg font-semibold">Dating Preferences</h3>
                <p className="text-sm text-gray-600">Tell us who you're looking to meet</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">I am</label>
                  <Select 
                    value={profile.gender} 
                    onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Looking for</label>
                  <Select 
                    value={profile.gender_preference} 
                    onValueChange={(value) => setProfile({ ...profile, gender_preference: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who are you interested in?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="both">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Range: {profile.age_range_min} - {profile.age_range_max}
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      placeholder="Min"
                      value={profile.age_range_min}
                      onChange={(e) => setProfile({
                        ...profile,
                        age_range_min: parseInt(e.target.value)
                      })}
                    />
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      placeholder="Max"
                      value={profile.age_range_max}
                      onChange={(e) => setProfile({
                        ...profile,
                        age_range_max: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search Radius: {profile.search_radius_km}km
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={profile.search_radius_km}
                    onChange={(e) => setProfile({ ...profile, search_radius_km: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              {profile.user_type === 'creator' ? (
                <>
                  <h3 className="text-lg font-semibold text-center">Creator Setup</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Subscription Fee (₦)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 5000"
                        value={profile.subscription_fee}
                        onChange={(e) => setProfile({ ...profile, subscription_fee: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Set your monthly subscription price in Nigerian Naira</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Services & Content Description</label>
                      <Textarea
                        placeholder="Describe what subscribers will get..."
                        value={profile.services_offered}
                        onChange={(e) => setProfile({ ...profile, services_offered: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-center">Your Interests</h3>
                  <p className="text-sm text-gray-600 text-center">Select interests to help us recommend creators</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={profile.interests.includes(interest) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          profile.interests.includes(interest)
                            ? 'bg-hooks-coral hover:bg-hooks-coral/80'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                        {profile.interests.includes(interest) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex-1 gradient-coral text-white"
            >
              {isLoading ? 'Saving...' : currentStep === 6 ? 'Join Hooks' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProfileSetup;
