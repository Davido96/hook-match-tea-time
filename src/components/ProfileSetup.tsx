
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, X } from "lucide-react";

interface ProfileSetupProps {
  onComplete: () => void;
}

const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    bio: "",
    interests: [] as string[],
    photos: [] as string[]
  });

  const sampleInterests = [
    "Travel", "Photography", "Music", "Fitness", "Cooking", "Reading",
    "Art", "Dancing", "Hiking", "Movies", "Coffee", "Wine", "Gaming",
    "Yoga", "Running", "Dogs", "Cats", "Nature", "Fashion", "Technology"
  ];

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.name && profile.age;
      case 2:
        return profile.bio.length > 0;
      case 3:
        return profile.interests.length >= 3;
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
          <CardTitle>Create Your Profile</CardTitle>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
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
              <h3 className="text-lg font-semibold">Basic Info</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  placeholder="Enter your name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Upload your photos</p>
                <p className="text-xs text-gray-500">Add at least 2 photos</p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About You</h3>
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Interests</h3>
              <p className="text-sm text-gray-600">Select at least 3 interests</p>
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
              <p className="text-sm text-hooks-coral">
                Selected: {profile.interests.length} interests
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 gradient-coral text-white"
            >
              {currentStep === 3 ? 'Start Matching' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
