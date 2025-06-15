import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, Plus } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { nigerianStates } from "@/data/nigerianLocations";
import AvatarUpload from "./AvatarUpload";
import PinManagement from "./PinManagement";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    bio: '',
    location_state: '',
    location_city: '',
    interests: [] as string[],
    subscription_fee: 0,
    services_offered: '',
    avatar_url: ''
  });
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || 18,
        bio: profile.bio || '',
        location_state: profile.location_state || '',
        location_city: profile.location_city || '',
        interests: profile.interests || [],
        subscription_fee: profile.subscription_fee || 0,
        services_offered: profile.services_offered || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpdate = (url: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: url
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  const selectedState = nigerianStates.find(state => state.state === formData.location_state);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Profile</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-center">Profile Picture</h3>
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              userName={formData.name}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <Input
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 18)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  value={formData.location_state}
                  onChange={(e) => handleInputChange('location_state', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state.state} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <select
                  value={formData.location_city}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {selectedState?.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <h3 className="font-semibold">Interests</h3>
            
            <div className="flex space-x-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
              />
              <Button onClick={handleAddInterest} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Creator Settings */}
          {profile.user_type === 'creator' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-hooks-coral">Creator Settings</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Monthly Rate (Keys)
                  <span className="text-xs text-gray-500 block">This is just a suggested rate. You can create custom subscription plans with different durations and prices.</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.subscription_fee}
                  onChange={(e) => handleInputChange('subscription_fee', parseInt(e.target.value) || 0)}
                  placeholder="Default monthly subscription rate in Keys"
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Tip: Lower prices often lead to more subscribers
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Services Offered</label>
                <Textarea
                  value={formData.services_offered}
                  onChange={(e) => handleInputChange('services_offered', e.target.value)}
                  placeholder="Describe the services or content you offer..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {profile.user_type === 'creator' && (
            <PinManagement />
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 gradient-coral"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfileModal;
