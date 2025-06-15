import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, User, MapPin, Heart, Briefcase, LogOut } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EnhancedProfileSetupProps {
  onComplete: () => void;
  onBack?: () => void;
  initialUserType?: 'creator' | 'consumer' | null;
}

const EnhancedProfileSetup = ({ onComplete, onBack, initialUserType }: EnhancedProfileSetupProps) => {
  // If we have an initial user type, start at step 2, otherwise start at step 1
  const [step, setStep] = useState(initialUserType ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  
  // Form data with initial user type if provided
  const [formData, setFormData] = useState({
    userType: initialUserType || '',
    name: '',
    age: '',
    bio: '',
    gender: '',
    genderPreference: '',
    locationState: '',
    locationCity: '',
    interests: [] as string[],
    subscriptionFee: '',
    servicesOffered: ''
  });

  const { createProfile, uploadAvatarDuringSetup } = useProfile();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const totalSteps = formData.userType === 'creator' ? 4 : 3; // Reduced by 1 since we skip user type selection

  // Available interests for selection
  const availableInterests = [
    "Travel", "Photography", "Music", "Fitness", "Cooking", "Reading",
    "Art", "Dancing", "Hiking", "Movies", "Coffee", "Wine", "Gaming",
    "Yoga", "Running", "Dogs", "Cats", "Nature", "Fashion", "Technology",
    "Sports", "Books", "Food", "Adventure", "Beach", "Mountains", "Pets",
    "Comedy", "Meditation", "Business", "Learning", "Socializing"
  ];

  // Nigerian states - simplified list
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
    "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
    "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);

      // Upload avatar immediately during setup
      try {
        console.log('Uploading avatar during setup...');
        const { data: avatarUrl, error: uploadError } = await uploadAvatarDuringSetup(file);
        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          setError("Failed to upload avatar: " + uploadError.message);
        } else if (avatarUrl) {
          setUploadedAvatarUrl(avatarUrl);
          console.log('Avatar uploaded successfully during setup:', avatarUrl);
          toast({
            title: "Avatar Uploaded",
            description: "Your profile picture has been uploaded successfully.",
          });
        }
      } catch (error) {
        console.error('Avatar upload failed:', error);
        setError("Failed to upload avatar. Please try again.");
      }
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    setError(null);
    
    // Updated validation logic for the new step flow
    if (step === 1 && !formData.userType) {
      setError("Please select your user type");
      return;
    }
    
    if ((initialUserType && step === 2) || (!initialUserType && step === 2)) {
      if (!formData.name.trim() || !formData.age || parseInt(formData.age) < 18) {
        setError("Please provide valid name and age (18+)");
        return;
      }
    }

    const locationStep = initialUserType ? 3 : 4;
    if (step === locationStep) {
      if (!formData.gender || !formData.genderPreference || !formData.locationState || !formData.locationCity.trim()) {
        setError("Please fill in all location and preference fields");
        return;
      }
    }

    const creatorSettingsStep = initialUserType ? 4 : 5;
    if (step === creatorSettingsStep && formData.userType === 'creator') {
      if (!formData.subscriptionFee || parseInt(formData.subscriptionFee) < 100) {
        setError("Subscription fee must be at least 100 Keys");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1 && onBack) {
      onBack();
    } else if (step === 2 && initialUserType && onBack) {
      // If we started at step 2 due to initial user type, go back to auth
      onBack();
    } else {
      setStep(step - 1);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the uploaded avatar URL or empty string
      const avatarUrl = uploadedAvatarUrl || '';

      // Create profile
      const profileData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        bio: formData.bio.trim(),
        user_type: formData.userType as 'creator' | 'consumer',
        location_state: formData.locationState,
        location_city: formData.locationCity.trim(),
        gender: formData.gender as 'male' | 'female' | 'non-binary',
        gender_preference: formData.genderPreference as 'male' | 'female' | 'both',
        age_range_min: 18,
        age_range_max: 35,
        search_radius_km: 50,
        interests: formData.interests,
        avatar_url: avatarUrl,
        subscription_fee: formData.userType === 'creator' ? parseInt(formData.subscriptionFee) : 0,
        services_offered: formData.userType === 'creator' ? formData.servicesOffered.trim() : '',
        verification_status: 'pending' as const,
        is_age_verified: false
      };

      const { error: createError } = await createProfile(profileData);
      
      if (createError) {
        throw createError;
      }

      toast({
        title: "Profile Created!",
        description: "Your profile has been set up successfully.",
      });

      onComplete();
    } catch (err: any) {
      console.error('Profile creation error:', err);
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          {/* Always show back button and sign out option */}
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🪝</span>
            <h1 className="text-2xl font-bold text-gradient">Hooks</h1>
          </div>
          
          {/* Updated title to be less confusing */}
          <CardTitle>
            {initialUserType ? (
              <>
                Welcome! Set up your profile
                <p className="text-sm text-gray-600 mt-2">You're joining as a {initialUserType}</p>
              </>
            ) : (
              "Set up your profile"
            )}
          </CardTitle>
          
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 <= step ? 'bg-hooks-coral' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: User Type Selection - only show if no initial user type */}
          {step === 1 && !initialUserType && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Choose Your Experience</h3>
              </div>
              
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value })}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="creator" id="creator" />
                  <div className="flex-1">
                    <Label htmlFor="creator" className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-hooks-coral" />
                        <span className="font-medium">Content Creator</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Share exclusive content and earn from subscriptions
                      </p>
                    </Label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="consumer" id="consumer" />
                  <div className="flex-1">
                    <Label htmlFor="consumer" className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-hooks-coral" />
                        <span className="font-medium">Premium Member</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Discover and connect with amazing creators
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Basic Info + Avatar (adjusted step numbers) */}
          {((initialUserType && step === 2) || (!initialUserType && step === 2)) && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              </div>

              {/* Avatar Upload */}
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <Label htmlFor="avatar" className="absolute bottom-0 right-0 bg-hooks-coral text-white rounded-full p-2 cursor-pointer hover:bg-hooks-coral/80">
                    <Upload className="w-4 h-4" />
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Upload your profile picture</p>
                  {uploadedAvatarUrl && (
                    <p className="text-xs text-green-600 mt-1">✓ Avatar uploaded successfully</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="18+"
                    min="18"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Adjust remaining steps based on whether we have initial user type */}
          {((initialUserType && step === 3) || (!initialUserType && step === 3)) && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Preferences
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
                  <Label htmlFor="genderPreference">Interested In</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, genderPreference: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Men</SelectItem>
                      <SelectItem value="female">Women</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="locationState">State</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, locationState: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="locationCity">City</Label>
                  <Input
                    id="locationCity"
                    placeholder="Enter your city"
                    value={formData.locationCity}
                    onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {((initialUserType && step === 4) || (!initialUserType && step === 4)) && formData.userType === 'creator' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Creator Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="subscriptionFee">Monthly Subscription Fee (Keys)</Label>
                  <Input
                    id="subscriptionFee"
                    type="number"
                    placeholder="Minimum 100 Keys"
                    min="100"
                    value={formData.subscriptionFee}
                    onChange={(e) => setFormData({ ...formData, subscriptionFee: e.target.value })}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Set how much subscribers pay monthly to access your exclusive content
                  </p>
                </div>

                <div>
                  <Label htmlFor="servicesOffered">Services Offered</Label>
                  <Textarea
                    id="servicesOffered"
                    placeholder="Describe the content and services you offer..."
                    rows={3}
                    value={formData.servicesOffered}
                    onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === totalSteps && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Your Interests
                </h3>
                <p className="text-sm text-gray-600">
                  Select interests to help us connect you with like-minded people
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableInterests.map((interest) => (
                  <Button
                    key={interest}
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInterestToggle(interest)}
                    className="text-sm"
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-6">
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="w-full gradient-coral text-white"
                disabled={loading}
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="w-full gradient-coral text-white"
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProfileSetup;
